<?php
// ============================================================
//  BTD Battles 1 – Clan Leaderboard API Proxy
//  File: api/clan_leaderboard.php
// ============================================================

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/cache.php';

function parse_nk_clan_entries(string $raw): array {
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

$type = strtolower(trim($_GET['type'] ?? 'overall'));
$allowedTypes = ['overall', 'club', 'standard', 'card'];

if (!in_array($type, $allowedTypes, true)) {
    send_error('Invalid clan leaderboard type. Allowed: overall, club, standard, card.', 400);
}

$typeSuffix = ucfirst($type);
$leaderboardUrl = $type === 'overall'
    ? NK_BASE_URL . '/storage/static/appdocs/2/leaderboards/guild:compiled:WeeklyMedallions:569.json'
    : NK_BASE_URL . '/storage/static/appdocs/2/leaderboards/guild:compiled:WeeklyMedallions:' . NK_CLAN_WEEKLY_ID . ':' . $typeSuffix . '.json';
$cacheFile = CACHE_DIR . 'leaderboard_clan_' . $type . '.json';

$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';
if ($forceRefresh) {
    cache_delete($cacheFile);
}

$raw = fetch_with_cache($leaderboardUrl, $cacheFile);
if (!$raw) {
    send_error('No clan leaderboard data available.', 503);
}

$parsed = parse_nk_clan_entries($raw);
$entries = $parsed['entries'];
$rankBase = (int) $parsed['rankBase'];

$clans = [];

foreach ($entries as $index => $entry) {
    $clanID = $entry['userID'] ?? $entry['clanID'] ?? $entry['id'] ?? null;
    if (!$clanID) {
        continue;
    }

    $clans[] = [
        'rank' => $rankBase + $index + 1,
        'clanID' => $clanID,
        'name' => $entry['metadata'] ?? $entry['name'] ?? null,
        'medallions' => (int) ($entry['score'] ?? $entry['value'] ?? 0),
    ];
}

echo json_encode([
    'success' => true,
    'type' => $type,
    'cached' => cache_is_valid($cacheFile),
    'count' => count($clans),
    'clans' => $clans,
    'raw' => DEV_MODE ? $parsed['payload'] : null,
]);
