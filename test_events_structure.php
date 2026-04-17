<?php
$raw = file_get_contents(__DIR__ . '/new.txt');
$data = json_decode($raw, true);

if (!$data) {
    echo "Failed to decode JSON\n";
    exit;
}

echo "Top-level keys: " . implode(', ', array_keys($data)) . "\n";

if (isset($data['events']) && is_array($data['events'])) {
    echo "Events array exists with " . count($data['events']) . " items\n";
    
    if (count($data['events']) > 0) {
        $first = $data['events'][0];
        echo "\nFirst event keys: " . implode(', ', array_keys($first)) . "\n";
        echo "First event type: " . ($first['type'] ?? 'N/A') . "\n";
        echo "First event name: " . ($first['name'] ?? 'N/A') . "\n";
    }
} else {
    echo "No events array found or it's not an array\n";
}
