<?php
$raw = file_get_contents(__DIR__ . "/new.txt");
$data = json_decode($raw, true);
$events = $data["events"] ?? [];
$now = time() * 1000;
foreach ($events as $event) {
    if (!is_array($event)) continue;
    $type = (string)($event["type"] ?? "N/A");
    $name = (string)($event["name"] ?? "N/A");
    if (strpos($type, "Arena") !== false || strpos($name, "Arena") !== false) {
        echo "Type: $type | Name: $name\n";
    }
}
echo "Total events: " . count($events) . "\n";
