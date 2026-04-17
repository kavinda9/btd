<?php
// ============================================================
//  BTD Battles 1 – Player Profile API Proxy
//  File: api/player.php
//  URL: http://localhost/btd-battles/api/player.php?id=PLAYERID
// ============================================================

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/cache.php';

function parse_nk_entries(string $raw): array {
    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
        return ['entries' => [], 'rankBase' => 0];
    }

    $payload = $decoded;

    if (isset($decoded['data']) && is_string($decoded['data'])) {
        $inner = json_decode($decoded['data'], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($inner)) {
            $payload = $inner;
        }
    } elseif (isset($decoded['data']) && is_array($decoded['data'])) {
        $payload = $decoded['data'];
    }

    $entries = [];
    $rankBase = 0;

    if (isset($payload['scores']['equal']) && is_array($payload['scores']['equal'])) {
        $entries = $payload['scores']['equal'];
        $rankBase = isset($payload['scores']['above']) && is_array($payload['scores']['above'])
            ? count($payload['scores']['above'])
            : 0;
    } elseif (isset($payload['scores']) && is_array($payload['scores'])) {
        $entries = $payload['scores'];
    }

    return [
        'entries' => $entries,
        'rankBase' => $rankBase,
    ];
}

function find_ranked_score(array $parsed, string $targetId): array {
    foreach ($parsed['entries'] as $index => $entry) {
        $entryId = (string) ($entry['userID'] ?? $entry['playerID'] ?? $entry['clanID'] ?? $entry['id'] ?? '');
        if ($entryId === $targetId) {
            return [
                'rank' => (int)$parsed['rankBase'] + $index + 1,
                'score' => (int)($entry['score'] ?? $entry['value'] ?? 0),
            ];
        }
    }

    return [
        'rank' => null,
        'score' => null,
    ];
}

function normalize_prestige_score($rawScore): int {
    return intdiv((int) ($rawScore ?? 0), 10);
}

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

// NK profile responses can arrive in different wrappers.
$profileData = $decoded;

if (isset($decoded['data']) && is_string($decoded['data'])) {
    $inner = json_decode($decoded['data'], true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($inner)) {
        $profileData = $inner;
    }
}

if (isset($profileData['']) && is_array($profileData[''])) {
    $profileData = $profileData[''];
}

// ----------------------------------------------------------
// 8. NORMALISE PROFILE DATA
//    Extract known fields — gracefully handle missing ones
// ----------------------------------------------------------

// -- Basic info --
$username    = $profileData['displayName'] ?? $profileData['username'] ?? $profileData['name'] ?? $profileData['Name'] ?? 'Unknown';
$avatarID    = $profileData['avatarURL']   ?? $profileData['avatar']   ?? $profileData['Avatar'] ?? null;
$level       = $profileData['xpLevel']     ?? $profileData['level']    ?? $profileData['Level']  ?? null;
$xp          = $profileData['xp']          ?? $profileData['XP']       ?? $profileData['Battlescore'] ?? null;

// -- Battle stats --
$stats       = $profileData['battleStats'] ?? $profileData['stats'] ?? $profileData['gameStats'] ?? [];
$wins        = $stats['wins'] ?? $stats['totalWins'] ?? $profileData['Wins'] ?? null;
$losses      = $stats['losses'] ?? $stats['totalLosses'] ?? $profileData['Losses'] ?? null;
$medallions  = $profileData['medallions'] ?? $stats['medallions'] ?? $profileData['MedallionsCurrent'] ?? $profileData['MedallionWinsWeekly'] ?? null;
$rank        = $profileData['rank'] ?? $stats['rank'] ?? null;

// -- Win rate calculation --
$winRate = null;
if ($wins !== null && $losses !== null) {
    $total   = (int)$wins + (int)$losses;
    $winRate = $total > 0 ? round(((int)$wins / $total) * 100, 1) : 0;
}

// -- Clan info --
$clan        = $profileData['clanName'] ?? ($profileData['clan']['name'] ?? null);
$clanID      = $profileData['clanID']   ?? ($profileData['clan']['id'] ?? null) ?? ($profileData['GuildID'] ?? null);

// -- Towers / loadout (if available) --
$towers      = $profileData['towers']   ?? $profileData['loadout'] ?? null;

// -- Optional leaderboard enrichments --
$weeklyStanding = ['rank' => null, 'score' => null];
$prestigeStanding = ['rank' => null, 'score' => null];
$clanStanding = ['rank' => null, 'score' => null];

$rawWeekly = fetch_with_cache_optional(NK_LEADERBOARD_URL, CACHE_LEADERBOARD);
if (is_string($rawWeekly) && $rawWeekly !== '') {
    $weeklyStanding = find_ranked_score(parse_nk_entries($rawWeekly), $playerID);
}

$rawPrestige = fetch_with_cache_optional(NK_PRESTIGE_URL, CACHE_PRESTIGE);
if (is_string($rawPrestige) && $rawPrestige !== '') {
    $prestigeStanding = find_ranked_score(parse_nk_entries($rawPrestige), $playerID);
    $prestigeStanding['score'] = normalize_prestige_score($prestigeStanding['score']);
}

if (!empty($clanID)) {
    $rawClan = fetch_with_cache_optional(NK_CLAN_URL, CACHE_CLAN);
    if (is_string($rawClan) && $rawClan !== '') {
        $clanStanding = find_ranked_score(parse_nk_entries($rawClan), (string)$clanID);
    }
}

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
        'leaderboards' => [
            'weekly' => [
                'rank' => $weeklyStanding['rank'],
                'score' => $weeklyStanding['score'],
            ],
            'prestige' => [
                'rank' => $prestigeStanding['rank'],
                'score' => $prestigeStanding['score'],
            ],
            'clan' => [
                'rank' => $clanStanding['rank'],
                'score' => $clanStanding['score'],
            ],
        ],
        'towers'     => $towers,
    ],
    'raw'       => DEV_MODE ? $profileData : null,
]);