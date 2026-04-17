<?php
// ============================================================
//  BTD Battles 1 – Player Profile API Proxy
//  File: api/player.php
//  URL: http://localhost/btd-battles/api/player.php?id=PLAYERID
// ============================================================

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/cache.php';

// ----------------------------------------------------------
// 1. SET RESPONSE HEADER
// ----------------------------------------------------------
header('Content-Type: application/json');

// ----------------------------------------------------------
// 2. ONLY ALLOW GET REQUESTS
// ----------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_error('Method not allowed.', 405);
}

// ----------------------------------------------------------
// 3. VALIDATE PLAYER ID PARAM
// ----------------------------------------------------------
if (empty($_GET['id'])) {
    send_error('Missing player ID. Use ?id=PLAYERID', 400);
}

$playerID  = sanitise_player_id(trim($_GET['id']));
$cacheFile = cache_player_path($playerID);

// ----------------------------------------------------------
// 4. OPTIONAL: ?refresh=1 to force bypass cache
// ----------------------------------------------------------
$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';

if ($forceRefresh) {
    cache_delete($cacheFile);
}

// ----------------------------------------------------------
// 5. BUILD PROFILE URL
// ----------------------------------------------------------
$profileURL = NK_PROFILE_BASE . $playerID . '/PublicProfile.save';

// ----------------------------------------------------------
// 6. FETCH PROFILE (cached or live)
// ----------------------------------------------------------
$raw = fetch_with_cache($profileURL, $cacheFile);

if (!$raw) {
    send_error('No profile data available for this player.', 503);
}

// ----------------------------------------------------------
// 7. DECODE + VALIDATE
// ----------------------------------------------------------
$decoded = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    send_error('Profile data is malformed: ' . json_last_error_msg(), 502);
}

// ----------------------------------------------------------
// 8. NORMALISE PROFILE DATA
//    Extract known fields — gracefully handle missing ones
// ----------------------------------------------------------

// -- Basic info --
$username    = $decoded['displayName']  ?? $decoded['username']   ?? $decoded['name']     ?? 'Unknown';
$avatarID    = $decoded['avatarURL']    ?? $decoded['avatar']     ?? null;
$level       = $decoded['xpLevel']      ?? $decoded['level']      ?? null;
$xp          = $decoded['xp']           ?? null;

// -- Battle stats --
$stats       = $decoded['battleStats']  ?? $decoded['stats']      ?? $decoded['gameStats'] ?? [];
$wins        = $stats['wins']           ?? $stats['totalWins']    ?? null;
$losses      = $stats['losses']         ?? $stats['totalLosses']  ?? null;
$medallions  = $decoded['medallions']   ?? $stats['medallions']   ?? null;
$rank        = $decoded['rank']         ?? $stats['rank']         ?? null;

// -- Win rate calculation --
$winRate = null;
if ($wins !== null && $losses !== null) {
    $total   = (int)$wins + (int)$losses;
    $winRate = $total > 0 ? round(((int)$wins / $total) * 100, 1) : 0;
}

// -- Clan info --
$clan        = $decoded['clanName']     ?? $decoded['clan']['name'] ?? null;
$clanID      = $decoded['clanID']       ?? $decoded['clan']['id']   ?? null;

// -- Towers / loadout (if available) --
$towers      = $decoded['towers']       ?? $decoded['loadout']     ?? null;

// ----------------------------------------------------------
// 9. SEND CLEAN RESPONSE
// ----------------------------------------------------------
echo json_encode([
    'success'   => true,
    'cached'    => cache_is_valid($cacheFile),
    'playerID'  => $playerID,
    'profile'   => [
        'username'   => $username,
        'avatarID'   => $avatarID,
        'level'      => $level,
        'xp'         => $xp,
        'medallions' => $medallions,
        'rank'       => $rank,
        'clan'       => $clan,
        'clanID'     => $clanID,
        'stats'      => [
            'wins'    => $wins,
            'losses'  => $losses,
            'winRate' => $winRate,
        ],
        'towers'     => $towers,
    ],
    'raw'       => DEV_MODE ? $decoded : null,
]);