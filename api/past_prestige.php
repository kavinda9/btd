<?php
// ============================================================
//  BTD Battles 1 – Past Prestige Leaderboard API
//  File: api/past_prestige.php
// ============================================================

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/cache.php';

function parse_nk_entries_prestige(string $raw): array {
    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
        return ['payload' => [], 'entries' => [], 'rankBase' => 0];
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
        'payload' => $payload,
        'entries' => $entries,
        'rankBase' => $rankBase,
    ];
}

function derive_week_to_season_offset_prestige(): int {
    $weekRef = null;
    $seasonRef = null;

    if (preg_match('/WeeklyMedallions:(\d+)\.json/', NK_LEADERBOARD_URL, $m)) {
        $weekRef = (int) $m[1];
    }

    if (preg_match('/Season_(\d+):Rating\.json/', NK_PRESTIGE_URL, $m)) {
        $seasonRef = (int) $m[1];
    }

    if ($weekRef !== null && $seasonRef !== null) {
        return $weekRef - $seasonRef;
    }

    return 331;
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_error('Method not allowed.', 405);
}

$weekParam = isset($_GET['week']) ? trim((string) $_GET['week']) : '';
if ($weekParam === '' || !preg_match('/^\d{1,6}$/', $weekParam)) {
    send_error('Invalid week number.', 400);
}

$week = (int) $weekParam;
if ($week <= 0) {
    send_error('Invalid week number.', 400);
}

$offset = derive_week_to_season_offset_prestige();
$season = $week - $offset;
if ($season <= 0) {
    send_error('Week is too old to derive a valid prestige season.', 400);
}

$url = NK_BASE_URL . '/storage/static/appdocs/2/leaderboards/ladder:Season_' . $season . ':Rating.json';
$cacheFile = CACHE_DIR . 'past_prestige_' . $season . '.json';

$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';
if ($forceRefresh) {
    cache_delete($cacheFile);
}

$raw = fetch_with_cache_optional($url, $cacheFile);
if ($raw === false) {
    send_error('No prestige leaderboard data found for that week.', 404);
}

$parsed = parse_nk_entries_prestige($raw);
$players = [];

foreach ($parsed['entries'] as $index => $entry) {
    $playerID = $entry['userID'] ?? $entry['playerID'] ?? $entry['id'] ?? null;
    if (!$playerID) {
        continue;
    }

    $players[] = [
        'rank' => (int) $parsed['rankBase'] + $index + 1,
        'playerID' => $playerID,
        'prestige' => (int) ($entry['score'] ?? $entry['value'] ?? 0),
        'username' => $entry['metadata'] ?? $entry['username'] ?? $entry['name'] ?? null,
    ];
}

echo json_encode([
    'success' => true,
    'week' => $week,
    'season' => $season,
    'cached' => cache_is_valid($cacheFile),
    'count' => count($players),
    'players' => $players,
    'raw' => DEV_MODE ? $parsed['payload'] : null,
]);
