<?php
// ============================================================
//  BTD Battles 1 – Leaderboard API Proxy
//  File: api/leaderboard.php
//  URL: http://localhost/btd-battles/api/leaderboard.php
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
    } elseif (isset($payload['leaderboard']) && is_array($payload['leaderboard'])) {
        $entries = $payload['leaderboard'];
    } elseif (isset($payload['data']) && is_array($payload['data'])) {
        $entries = $payload['data'];
    } elseif (is_array($payload)) {
        $entries = $payload;
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

function get_week_rotation_name(?int $weekNumber): ?string {
    if (!$weekNumber || $weekNumber < 1) {
        return null;
    }

    $newRotation = [
        'R3 Speed Bananza ZOMG',
        'Speed Bananza ZOMG',
        'Speed Bananza Boosts Only',
        'Speed With Fire ZOMG',
    ];

    $oldRotation = [
        'Speed With Fire Cards',
        'Speed With Fire',
        'Speed Bananza',
        'Speed Mega Boost Cards',
    ];

    if ($weekNumber >= 423) {
        $index = ($weekNumber - 1) % count($newRotation);
        return $newRotation[$index];
    }

    $oldAnchorWeek = 419;
    $index = ($weekNumber - $oldAnchorWeek) % count($oldRotation);
    if ($index < 0) {
        $index += count($oldRotation);
    }

    return $oldRotation[$index];
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
// 3. OPTIONAL: ?refresh=1 to force bypass cache
// ----------------------------------------------------------
$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';

$country = isset($_GET['country']) ? strtoupper(trim((string)$_GET['country'])) : '';
if ($country === 'GLOBAL') {
    $country = '';
}

if ($country !== '' && !preg_match('/^[A-Z]{2}$/', $country)) {
    send_error('Invalid country code. Use ISO 2-letter format (example: GB, US, SA).', 400);
}

$leaderboardUrl = NK_BASE_URL . '/storage/static/appdocs/2/leaderboards/WeeklyMedallions:569'
    . ($country !== '' ? ':' . $country : '')
    . '.json';

$weekNumber = null;
if (preg_match('/WeeklyMedallions:(\d+)/', $leaderboardUrl, $matches) === 1) {
    $weekNumber = (int)$matches[1];
}
$weekName = get_week_rotation_name($weekNumber);

$leaderboardCacheFile = CACHE_DIR . 'leaderboard_' . ($country !== '' ? strtolower($country) : 'global') . '.json';

if ($forceRefresh) {
    cache_delete($leaderboardCacheFile);
    cache_delete(CACHE_PRESTIGE);
}

// ----------------------------------------------------------
// 4. FETCH LEADERBOARD (cached or live)
// ----------------------------------------------------------
$raw = fetch_with_cache($leaderboardUrl, $leaderboardCacheFile);
$rawPrestige = fetch_with_cache_optional(NK_PRESTIGE_URL, CACHE_PRESTIGE);

if (!$raw) {
    send_error('No leaderboard data available.', 503);
}

// ----------------------------------------------------------
// 5. DECODE + VALIDATE JSON
// ----------------------------------------------------------
$parsedWeekly = parse_nk_leaderboard_entries($raw);

if (!is_array($parsedWeekly['entries'])) {
    send_error('Leaderboard data is malformed.', 502);
}

$parsedPrestige = ['payload' => null, 'entries' => [], 'rankBase' => 0];
if (is_string($rawPrestige) && $rawPrestige !== '') {
    $parsedPrestige = parse_nk_leaderboard_entries($rawPrestige);
}

// ----------------------------------------------------------
// 6. NORMALISE THE DATA
//    NK returns different structures — we flatten it into
//    a clean array of { rank, playerID, medallions }
// ----------------------------------------------------------
$players = [];
$weeklyEntries = $parsedWeekly['entries'];
$weeklyRankBase = (int) $parsedWeekly['rankBase'];

$prestigeByPlayer = [];
if (is_array($parsedPrestige['entries'])) {
    foreach ($parsedPrestige['entries'] as $index => $entry) {
        $id = $entry['userID'] ?? $entry['playerID'] ?? $entry['id'] ?? null;
        if (!$id) {
            continue;
        }

        $prestigeByPlayer[$id] = [
            'score' => normalize_prestige_score($entry['score'] ?? $entry['value'] ?? 0),
            'rank'  => (int) $parsedPrestige['rankBase'] + $index + 1,
            'name'  => $entry['metadata'] ?? $entry['username'] ?? $entry['name'] ?? null,
        ];
    }
}

foreach ($weeklyEntries as $index => $entry) {
    $rank       = $weeklyRankBase + $index + 1;
    $playerID   = $entry['userID']   ?? $entry['playerID'] ?? $entry['id']   ?? null;
    $medallions = $entry['score']    ?? $entry['medallions'] ?? $entry['value'] ?? 0;
    $username   = $entry['username'] ?? $entry['name'] ?? $entry['metadata'] ?? null;
    $countryRaw = $entry['cc'] ?? $entry['countryCode'] ?? $entry['country'] ?? null;

    $countryCode = null;
    if (is_string($countryRaw)) {
        $candidate = strtoupper(trim($countryRaw));
        if (preg_match('/^[A-Z]{2}$/', $candidate) === 1) {
            $countryCode = $candidate;
        }
    }

    if (!$playerID) continue;

    $players[] = [
        'rank'       => $rank,
        'playerID'   => $playerID,
        'medallions' => (int) $medallions,
        'prestige'   => isset($prestigeByPlayer[$playerID]) ? (int)$prestigeByPlayer[$playerID]['score'] : null,
        'prestigeRank' => isset($prestigeByPlayer[$playerID]) ? (int)$prestigeByPlayer[$playerID]['rank'] : null,
        'username'   => $username,   // may be null — fetched separately from profile
        'countryCode' => $countryCode,
    ];
}

// ----------------------------------------------------------
// 7. SEND CLEAN RESPONSE
// ----------------------------------------------------------
echo json_encode([
    'success'   => true,
    'cached'    => cache_is_valid($leaderboardCacheFile),
    'cachedPrestige' => cache_is_valid(CACHE_PRESTIGE),
    'country'   => $country !== '' ? $country : 'GLOBAL',
    'weekNumber' => $weekNumber,
    'weekName'  => $weekName,
    'count'     => count($players),
    'players'   => $players,
    'raw'       => DEV_MODE ? [
        'weekly' => $parsedWeekly['payload'],
        'prestige' => $parsedPrestige['payload'],
    ] : null,
]);