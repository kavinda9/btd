<?php
$raw = file_get_contents(__DIR__ . "/new.txt");
$data = json_decode($raw, true);
$events = $data["events"] ?? [];
$now = time() * 1000;
$count = 0;
foreach ($events as $event) {
    if (!is_array($event)) continue;
    $type = (string)($event["type"] ?? "N/A");
    $name = (string)($event["name"] ?? "N/A");
    echo "Type: $type | Name: $name\n";
    if ($count++ > 20) break;
}
echo "Total events: " . count($events) . "\n";
