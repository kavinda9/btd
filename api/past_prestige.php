<?php
// ============================================================
//  BTD Battles 1 – Past Prestige Leaderboard API
//  File: api/past_prestige.php
// ============================================================

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/cache.php';

const WEEK_SECONDS = 7 * 24 * 60 * 60;
const BIWEEK_SECONDS = 14 * 24 * 60 * 60;
const WEEKLY_RESET_BASE_UTC = '2015-12-16T10:00:00+00:00';
const PRESTIGE_RESET_BASE_UTC = '2017-02-15T10:00:00+00:00';

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

function normalize_prestige_score($rawScore): int {
    return intdiv((int) ($rawScore ?? 0), 10);
}

function format_range_from_timestamps(int $startTimestamp, int $endTimestamp): string {
    $startYear = gmdate('Y', $startTimestamp);
    $endYear = gmdate('Y', $endTimestamp);
    $startMonth = gmdate('F', $startTimestamp);
    $endMonth = gmdate('F', $endTimestamp);
    $startDay = gmdate('d', $startTimestamp);
    $endDay = gmdate('d', $endTimestamp);

    if ($startYear === $endYear && $startMonth === $endMonth) {
        return $startYear . ' ' . $startMonth . ' ' . $startDay . ' - ' . $endDay;
    }

    if ($startYear === $endYear) {
        return $startYear . ' ' . $startMonth . ' ' . $startDay . ' - ' . $endMonth . ' ' . $endDay;
    }

    return $startYear . ' ' . $startMonth . ' ' . $startDay . ' - ' . $endYear . ' ' . $endMonth . ' ' . $endDay;
}

function get_current_week_number(): int {
    $base = (new DateTimeImmutable(WEEKLY_RESET_BASE_UTC))->getTimestamp();
    $current = time();

    return max(1, (int) ceil(($current - $base) / WEEK_SECONDS));
}

function get_current_week_start(): int {
    $base = (new DateTimeImmutable(WEEKLY_RESET_BASE_UTC))->getTimestamp();
    $currentWeek = get_current_week_number();

    return $base + (($currentWeek - 1) * WEEK_SECONDS);
}

function get_prestige_week_range(int $week): string {
    $currentWeek = get_current_week_number();
    $currentWeekStart = get_current_week_start();
    $offsetWeeks = $week - $currentWeek;
    $start = $currentWeekStart + ($offsetWeeks * BIWEEK_SECONDS);
    $end = $start + BIWEEK_SECONDS;

    return format_range_from_timestamps($start, $end);
}

function get_current_prestige_reset_end(): int {
    $base = (new DateTimeImmutable(PRESTIGE_RESET_BASE_UTC))->getTimestamp();
    $current = time();
    $cycles = (int) ceil(($current - $base) / BIWEEK_SECONDS);

    return $base + ($cycles * BIWEEK_SECONDS);
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
        'prestige' => normalize_prestige_score($entry['score'] ?? $entry['value'] ?? 0),
        'username' => $entry['metadata'] ?? $entry['username'] ?? $entry['name'] ?? null,
    ];
}

echo json_encode([
    'success' => true,
    'type' => 'prestige',
    'week' => $week,
    'season' => $season,
    'weekRange' => get_prestige_week_range($week),
    'cached' => cache_is_valid($cacheFile),
    'count' => count($players),
    'players' => $players,
    'raw' => DEV_MODE ? $parsed['payload'] : null,
]);
