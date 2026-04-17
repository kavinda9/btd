<?php
// ============================================================
//  BTD Battles 1 – Prestige Leaderboard API Proxy
//  File: api/prestige_leaderboard.php
// ============================================================

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/cache.php';

function parse_nk_leaderboard_entries(string $raw): array {
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

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_error('Method not allowed.', 405);
}

$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';
if ($forceRefresh) {
    cache_delete(CACHE_PRESTIGE);
}

$raw = fetch_with_cache(NK_PRESTIGE_URL, CACHE_PRESTIGE);
if (!$raw) {
    send_error('No prestige leaderboard data available.', 503);
}

$parsed = parse_nk_leaderboard_entries($raw);
$entries = $parsed['entries'];
$rankBase = (int) $parsed['rankBase'];

$players = [];

foreach ($entries as $index => $entry) {
    $playerID = $entry['userID'] ?? $entry['playerID'] ?? $entry['id'] ?? null;
    if (!$playerID) {
        continue;
    }

    $players[] = [
        'rank' => $rankBase + $index + 1,
        'playerID' => $playerID,
        'prestige' => (int) ($entry['score'] ?? $entry['value'] ?? 0),
        'username' => $entry['metadata'] ?? $entry['username'] ?? $entry['name'] ?? null,
    ];
}

echo json_encode([
    'success' => true,
    'cached' => cache_is_valid(CACHE_PRESTIGE),
    'count' => count($players),
    'players' => $players,
    'raw' => DEV_MODE ? $parsed['payload'] : null,
]);
