<?php
$raw = file_get_contents("new.txt");
$data = json_decode($raw, true);
echo "Keys: " . implode(", ", array_keys($data)) . "\n";
echo "Events Type: " . gettype($data["events"]) . "\n";
if (is_array($data["events"])) {
    echo "Count: " . count($data["events"]) . "\n";
    print_r($data["events"][0]);
}
