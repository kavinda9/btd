<?php
// ============================================================
//  BTD Battles 1 – Leaderboard API Proxy
//  File: api/leaderboard.php
//  URL: http://localhost/btd-battles/api/leaderboard.php
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
// 3. OPTIONAL: ?refresh=1 to force bypass cache
// ----------------------------------------------------------
$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';

if ($forceRefresh) {
    cache_delete(CACHE_LEADERBOARD);
}

// ----------------------------------------------------------
// 4. FETCH LEADERBOARD (cached or live)
// ----------------------------------------------------------
$raw = fetch_with_cache(NK_LEADERBOARD_URL, CACHE_LEADERBOARD);

if (!$raw) {
    send_error('No leaderboard data available.', 503);
}

// ----------------------------------------------------------
// 5. DECODE + VALIDATE JSON
// ----------------------------------------------------------
$decoded = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    send_error('Leaderboard data is malformed: ' . json_last_error_msg(), 502);
}

// ----------------------------------------------------------
// 6. NORMALISE THE DATA
//    NK returns different structures — we flatten it into
//    a clean array of { rank, playerID, medallions }
// ----------------------------------------------------------
$players = [];

// Try common NK leaderboard structures
$entries = [];

if (isset($decoded['scores'])) {
    $entries = $decoded['scores'];
} elseif (isset($decoded['leaderboard'])) {
    $entries = $decoded['leaderboard'];
} elseif (isset($decoded['data'])) {
    $entries = $decoded['data'];
} elseif (is_array($decoded)) {
    $entries = $decoded;
}

foreach ($entries as $index => $entry) {
    $rank       = $index + 1;
    $playerID   = $entry['userID']   ?? $entry['playerID'] ?? $entry['id']   ?? null;
    $medallions = $entry['score']    ?? $entry['medallions'] ?? $entry['value'] ?? 0;
    $username   = $entry['username'] ?? $entry['name']       ?? null;

    if (!$playerID) continue;

    $players[] = [
        'rank'       => $rank,
        'playerID'   => $playerID,
        'medallions' => (int) $medallions,
        'username'   => $username,   // may be null — fetched separately from profile
    ];
}

// ----------------------------------------------------------
// 7. SEND CLEAN RESPONSE
// ----------------------------------------------------------
echo json_encode([
    'success'   => true,
    'cached'    => cache_is_valid(CACHE_LEADERBOARD),
    'count'     => count($players),
    'players'   => $players,
    'raw'       => DEV_MODE ? $decoded : null,   // show raw only in dev mode
]);