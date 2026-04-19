<?php
// ============================================================
//  BTD Battles 1 – Past Week Aggregated API Proxy
//  File: api/past_week.php
// ============================================================

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/cache.php';

function parse_nk_entries(string $raw): array {
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

function normalize_prestige_score($rawScore): int {
    return intdiv((int) ($rawScore ?? 0), 10);
}

function derive_week_to_season_offset(): int {
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

$offset = derive_week_to_season_offset();
$season = $week - $offset;

if ($season <= 0) {
    send_error('Week is too old to derive a valid prestige season.', 400);
}

$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';

$weeklyUrl = NK_BASE_URL . '/storage/static/appdocs/2/leaderboards/WeeklyMedallions:' . $week . '.json';
$prestigeUrl = NK_BASE_URL . '/storage/static/appdocs/2/leaderboards/ladder:Season_' . $season . ':Rating.json';
$clanOverallUrl = NK_BASE_URL . '/storage/static/appdocs/2/leaderboards/guild:compiled:WeeklyMedallions:' . $week . '.json';

$weeklyCache = CACHE_DIR . 'past_weekly_' . $week . '.json';
$prestigeCache = CACHE_DIR . 'past_prestige_' . $season . '.json';
$clanCache = CACHE_DIR . 'past_clan_overall_' . $week . '.json';

if ($forceRefresh) {
    cache_delete($weeklyCache);
    cache_delete($prestigeCache);
    cache_delete($clanCache);
}

$rawWeekly = fetch_with_cache_optional($weeklyUrl, $weeklyCache);
$rawPrestige = fetch_with_cache_optional($prestigeUrl, $prestigeCache);
$rawClan = fetch_with_cache_optional($clanOverallUrl, $clanCache);

if ($rawWeekly === false && $rawPrestige === false && $rawClan === false) {
    send_error('No data found for that week.', 404);
}

$weeklyPlayers = [];
$prestigePlayers = [];
$clans = [];

$weeklyAvailable = is_string($rawWeekly) && $rawWeekly !== '';
$prestigeAvailable = is_string($rawPrestige) && $rawPrestige !== '';
$clanAvailable = is_string($rawClan) && $rawClan !== '';

$weeklyParsed = ['payload' => null, 'entries' => [], 'rankBase' => 0];
$prestigeParsed = ['payload' => null, 'entries' => [], 'rankBase' => 0];
$clanParsed = ['payload' => null, 'entries' => [], 'rankBase' => 0];

if ($weeklyAvailable) {
    $weeklyParsed = parse_nk_entries($rawWeekly);
    foreach ($weeklyParsed['entries'] as $index => $entry) {
        $playerID = $entry['userID'] ?? $entry['playerID'] ?? $entry['id'] ?? null;
        if (!$playerID) {
            continue;
        }

        $weeklyPlayers[] = [
            'rank' => (int) $weeklyParsed['rankBase'] + $index + 1,
            'playerID' => $playerID,
            'medallions' => (int) ($entry['score'] ?? $entry['medallions'] ?? $entry['value'] ?? 0),
            'username' => $entry['username'] ?? $entry['name'] ?? $entry['metadata'] ?? null,
        ];
    }
}

if ($prestigeAvailable) {
    $prestigeParsed = parse_nk_entries($rawPrestige);
    foreach ($prestigeParsed['entries'] as $index => $entry) {
        $playerID = $entry['userID'] ?? $entry['playerID'] ?? $entry['id'] ?? null;
        if (!$playerID) {
            continue;
        }

        $prestigePlayers[] = [
            'rank' => (int) $prestigeParsed['rankBase'] + $index + 1,
            'playerID' => $playerID,
            'prestige' => normalize_prestige_score($entry['score'] ?? $entry['value'] ?? 0),
            'username' => $entry['metadata'] ?? $entry['username'] ?? $entry['name'] ?? null,
        ];
    }
}

if ($clanAvailable) {
    $clanParsed = parse_nk_entries($rawClan);
    foreach ($clanParsed['entries'] as $index => $entry) {
        $clanID = $entry['userID'] ?? $entry['clanID'] ?? $entry['id'] ?? null;
        if (!$clanID) {
            continue;
        }

        $clans[] = [
            'rank' => (int) $clanParsed['rankBase'] + $index + 1,
            'clanID' => $clanID,
            'name' => $entry['metadata'] ?? $entry['name'] ?? null,
            'medallions' => (int) ($entry['score'] ?? $entry['value'] ?? 0),
        ];
    }
}

echo json_encode([
    'success' => true,
    'week' => $week,
    'season' => $season,
    'weekToSeasonOffset' => $offset,
    'available' => [
        'weekly' => $weeklyAvailable,
        'prestige' => $prestigeAvailable,
        'clanOverall' => $clanAvailable,
    ],
    'cached' => [
        'weekly' => cache_is_valid($weeklyCache),
        'prestige' => cache_is_valid($prestigeCache),
        'clanOverall' => cache_is_valid($clanCache),
    ],
    'weekly' => [
        'count' => count($weeklyPlayers),
        'players' => $weeklyPlayers,
    ],
    'prestige' => [
        'count' => count($prestigePlayers),
        'players' => $prestigePlayers,
    ],
    'clanOverall' => [
        'count' => count($clans),
        'clans' => $clans,
    ],
    'raw' => DEV_MODE ? [
        'weekly' => $weeklyParsed['payload'],
        'prestige' => $prestigeParsed['payload'],
        'clanOverall' => $clanParsed['payload'],
    ] : null,
]);
