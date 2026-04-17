<?php
// ============================================================
//  BTD Battles 1 – Past Clan Overall Leaderboard API
//  File: api/past_clan_overall.php
// ============================================================

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/cache.php';

function parse_nk_entries_clan(string $raw): array {
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

$weekParam = isset($_GET['week']) ? trim((string) $_GET['week']) : '';
if ($weekParam === '' || !preg_match('/^\d{1,6}$/', $weekParam)) {
    send_error('Invalid week number.', 400);
}

$week = (int) $weekParam;
if ($week <= 0) {
    send_error('Invalid week number.', 400);
}

$url = NK_BASE_URL . '/storage/static/appdocs/2/leaderboards/guild:compiled:WeeklyMedallions:' . $week . '.json';
$cacheFile = CACHE_DIR . 'past_clan_overall_' . $week . '.json';

$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';
if ($forceRefresh) {
    cache_delete($cacheFile);
}

$raw = fetch_with_cache_optional($url, $cacheFile);
if ($raw === false) {
    send_error('No clan overall leaderboard data found for that week.', 404);
}

$parsed = parse_nk_entries_clan($raw);
$clans = [];

foreach ($parsed['entries'] as $index => $entry) {
    $clanID = $entry['userID'] ?? $entry['clanID'] ?? $entry['id'] ?? null;
    if (!$clanID) {
        continue;
    }

    $clans[] = [
        'rank' => (int) $parsed['rankBase'] + $index + 1,
        'clanID' => $clanID,
        'name' => $entry['metadata'] ?? $entry['name'] ?? null,
        'medallions' => (int) ($entry['score'] ?? $entry['value'] ?? 0),
    ];
}

echo json_encode([
    'success' => true,
    'week' => $week,
    'cached' => cache_is_valid($cacheFile),
    'count' => count($clans),
    'clans' => $clans,
    'raw' => DEV_MODE ? $parsed['payload'] : null,
]);
