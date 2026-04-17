<?php
// ============================================================
//  BTD Battles 1 – Available Arenas API
//  File: api/arenas.php
//  Shows Classic, Card, and TODAY'S AVAILABLE Limited-Time Arenas
// ============================================================

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/cache.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_error('Method not allowed.', 405);
}

$sourceFile = __DIR__ . '/../new.txt';
if (!is_file($sourceFile)) {
    send_error('Arena source file not found.', 404);
}

$cacheFile = CACHE_DIR . 'arenas.json';
$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';

if ($forceRefresh) {
    cache_delete($cacheFile);
}

if (cache_is_valid($cacheFile)) {
    $cached = cache_read($cacheFile);
    if (is_string($cached) && $cached !== '') {
        echo $cached;
        exit;
    }
}

$raw = file_get_contents($sourceFile);
if ($raw === false || $raw === '') {
    send_error('Failed to read arena source file.', 500);
}

$decoded = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
    send_error('Arena source file is malformed JSON.', 500);
}

$rooms = $decoded['settings']['settings']['Rooms'] ?? null;
if (!is_array($rooms)) {
    send_error('Rooms data not found in arena source.', 500);
}

// Event schedule is stored at settings.events in new.txt.
$events = $decoded['settings']['events'] ?? [];
if (!is_array($events) || $events === []) {
    // Backward compatibility for alternate payload shapes.
    $events = $decoded['events'] ?? [];
    if (!is_array($events)) {
        $events = [];
    }
}

$roomSettings = $decoded['settings']['settings']['roomSettings'] ?? [];
$clubCooldownHours = isset($roomSettings['freeClubEntryResetHours'])
    ? (int) $roomSettings['freeClubEntryResetHours']
    : null;

// Build room lookup by name (not ID)
$roomsByName = [];
foreach ($rooms as $room) {
    if (is_array($room) && isset($room['name'])) {
        $roomsByName[(string)$room['name']] = $room;
    }
}

$classicNames = [
    'Yellow',
    'White',
    'Lead',
    'Rainbow',
    'Ceramic',
    'MOAB',
    'BFB',
    'ZOMG',
];

$cardNames = [
    'CardBattle_Yellow',
    'CardBattle_White',
    'CardBattle_Lead',
    'CardBattle_Rainbow',
    'CardBattle_Ceramic',
    'CardBattle_MOAB',
    'CardBattle_BFB',
    'CardBattle_ZOMG',
];

$classicArenas = [];
$cardArenas = [];
$todaysArenas = [];
$limitedArenaEventCount = 0;
$activeLimitedArenaCount = 0;

// Get classic and card arenas from rooms
foreach ($rooms as $room) {
    if (!is_array($room)) {
        continue;
    }

    $gameMode = (string) ($room['gameMode'] ?? '');
    $enabled = (bool) ($room['enabled'] ?? false);
    $name = (string) ($room['name'] ?? '');

    if (!$enabled || $name === '') {
        continue;
    }

    $entry = [
        'name' => $name,
        'entryCost' => (int) ($room['entryCost'] ?? 0),
        'payout' => (int) ($room['payout'] ?? 0),
        'roomTypes' => isset($room['roomTypes']) && is_array($room['roomTypes'])
            ? array_values(array_map('strval', $room['roomTypes']))
            : [],
        'icon' => isset($room['Icon']) ? (string) $room['Icon'] : null,
        'watchAdToEnter' => (bool) ($room['WatchAdToEnter'] ?? false),
    ];

    if ($gameMode === 'Arena' && in_array($name, $classicNames, true)) {
        $classicArenas[] = $entry;
        continue;
    }

    if ($gameMode === 'CardBattle' && in_array($name, $cardNames, true)) {
        $cardArenas[] = $entry;
        continue;
    }
}

// Get TODAY'S available limited-time arenas from events
$nowMs = time() * 1000;
foreach ($events as $event) {
    if (!is_array($event)) {
        continue;
    }

    $type = (string) ($event['type'] ?? '');
    if ($type !== 'btdb_limitedTimeArena') {
        continue;
    }

    $limitedArenaEventCount++;

    $startMs = (int) ($event['start'] ?? 0);
    $endMs = (int) ($event['end'] ?? 0);

    // Check if event is currently active
    if ($nowMs < $startMs || $nowMs >= $endMs) {
        continue;
    }

    $activeLimitedArenaCount++;

    $metadata = $event['metadata'] ?? [];
    if (!is_array($metadata)) {
        continue;
    }

    $roomID = (string) ($metadata['roomID'] ?? '');
    $eventName = (string) ($event['name'] ?? '');

    if ($roomID === '' || $eventName === '') {
        continue;
    }

    // Look up the room in rooms array by name
    $room = $roomsByName[$roomID] ?? null;
    if (!is_array($room)) {
        continue;
    }

    $ruleSetID = (string) ($metadata['ruleSetID'] ?? '');
    $roomTypes = isset($metadata['roomTypes']) && is_array($metadata['roomTypes'])
        ? array_values(array_map('strval', $metadata['roomTypes']))
        : [];

    $todaysArenas[] = [
        'name' => $eventName,
        'roomID' => $roomID,
        'entryCost' => (int) ($room['entryCost'] ?? 0),
        'payout' => (int) ($room['payout'] ?? 0),
        'roomTypes' => $roomTypes,
        'ruleSet' => $ruleSetID !== '' ? $ruleSetID : null,
        'cooldownHours' => in_array('Club', $roomTypes, true) ? $clubCooldownHours : null,
        'watchAdToEnter' => (bool) ($room['WatchAdToEnter'] ?? false),
        'availableFrom' => $startMs,
        'availableUntil' => $endMs,
    ];
}

// Remove duplicate events by roomID + ruleSet to keep output stable.
$seenArenaKeys = [];
$todaysArenas = array_values(array_filter($todaysArenas, function (array $arena) use (&$seenArenaKeys): bool {
    $uniqueKey = ($arena['roomID'] ?? '') . '|' . ($arena['ruleSet'] ?? '');
    if (isset($seenArenaKeys[$uniqueKey])) {
        return false;
    }

    $seenArenaKeys[$uniqueKey] = true;
    return true;
}));

usort($classicArenas, function (array $a, array $b): int {
    if ($a['entryCost'] === $b['entryCost']) {
        return strcmp($a['name'], $b['name']);
    }
    return $a['entryCost'] <=> $b['entryCost'];
});

usort($cardArenas, function (array $a, array $b): int {
    if ($a['entryCost'] === $b['entryCost']) {
        return strcmp($a['name'], $b['name']);
    }
    return $a['entryCost'] <=> $b['entryCost'];
});

usort($todaysArenas, function (array $a, array $b): int {
    if ($a['entryCost'] === $b['entryCost']) {
        return strcmp($a['name'], $b['name']);
    }
    return $a['entryCost'] <=> $b['entryCost'];
});

$rotationWeek = (int) (floor($nowMs / 1000 / 604800) % 4) + 1;
$battlePitCycle = ['Ceramic', 'MOAB', 'BFB', 'ZOMG'];
$selectedBattlePit = $battlePitCycle[$rotationWeek - 1];

// Battle arena list follows a 4-week pit rotation and only includes
// free powerups / speed variants for the currently selected pit.
$battleArenas = array_values(array_filter($todaysArenas, function (array $arena) use ($selectedBattlePit): bool {
    $roomID = (string) ($arena['roomID'] ?? '');
    $ruleSet = (string) ($arena['ruleSet'] ?? '');

    if ($roomID === '' || stripos($roomID, $selectedBattlePit) === false) {
        return false;
    }

    if (stripos($roomID, 'CardBattle_') === 0) {
        return false;
    }

    $isFreePowerups = stripos($ruleSet, 'FreePowerups') === 0;
    $isSpeed = $ruleSet === 'R3_Speed';

    return $isFreePowerups || $isSpeed;
}));

$seenBattleNames = [];
$battleArenas = array_values(array_filter($battleArenas, function (array $arena) use (&$seenBattleNames): bool {
    $nameKey = strtolower((string) ($arena['name'] ?? ''));
    if ($nameKey === '' || isset($seenBattleNames[$nameKey])) {
        return false;
    }

    $seenBattleNames[$nameKey] = true;
    return true;
}));

$response = [
    'success' => true,
    'cached' => false,
    'count' => count($classicArenas) + count($cardArenas),
    'classicCount' => count($classicArenas),
    'cardCount' => count($cardArenas),
    'todaysCount' => count($todaysArenas),
    'battleCount' => count($battleArenas),
    'limitedArenaEventCount' => $limitedArenaEventCount,
    'activeLimitedArenaEventCount' => $activeLimitedArenaCount,
    'clubCooldownHours' => $clubCooldownHours,
    'rotation' => [
        'weeks' => 4,
        'currentWeek' => $rotationWeek,
        'battlePitCycle' => $battlePitCycle,
        'selectedBattlePit' => $selectedBattlePit,
    ],
    'currentTimeMs' => $nowMs,
    'classicArenas' => $classicArenas,
    'cardArenas' => $cardArenas,
    'todaysArenas' => $todaysArenas,
    'battleArenas' => $battleArenas,
];

$json = json_encode($response);
if ($json === false) {
    send_error('Failed to encode arena response.', 500);
}

cache_write($cacheFile, $json);

echo $json;


