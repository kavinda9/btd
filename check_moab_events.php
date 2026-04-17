<?php
$raw = file_get_contents(__DIR__ . '/new.txt');
$data = json_decode($raw, true);

$events = $data['events'] ?? [];
$now = time() * 1000; // current time in ms

$count = 0;
foreach ($events as $event) {
    if (!is_array($event)) continue;
    
    $type = (string)($event['type'] ?? '');
    $name = (string)($event['name'] ?? '');
    
    if ($type !== 'btdb_limitedTimeArena') continue;
    if (strpos($name, 'MOAB') === false) continue;
    
    $start = (int)($event['start'] ?? 0);
    $end = (int)($event['end'] ?? 0);
    $active = ($now >= $start && $now < $end) ? 'YES' : 'NO';
    
    echo "Name: $name\n";
    echo "Start: " . date('Y-m-d H:i:s', $start/1000) . " ({$start})\n";
    echo "End: " . date('Y-m-d H:i:s', $end/1000) . " ({$end})\n";
    echo "Now: " . date('Y-m-d H:i:s', $now/1000) . " ({$now})\n";
    echo "Active: $active\n";
    echo "---\n";
    
    if ($count++ >= 5) break;
}

echo "\nTotal MOAB limited-time events: $count\n";
echo "\nTotal events in file: " . count($events) . "\n";

// Check if any are active
$active_count = 0;
foreach ($events as $event) {
    if (!is_array($event)) continue;
    $type = (string)($event['type'] ?? '');
    if ($type !== 'btdb_limitedTimeArena') continue;
    
    $start = (int)($event['start'] ?? 0);
    $end = (int)($event['end'] ?? 0);
    if ($now >= $start && $now < $end) {
        $active_count++;
    }
}

echo "Total active limited-time arenas NOW: $active_count\n";
