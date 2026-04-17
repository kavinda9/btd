<?php
$raw = file_get_contents(__DIR__ . "/new.txt");
echo "Raw length: " . strlen($raw) . "\n";
$data = json_decode($raw, true);
if ($data === null) {
    echo "JSON Error: " . json_last_error_msg() . "\n";
} else {
    echo "Top-level keys: " . implode(", ", array_keys($data)) . "\n";
    if (isset($data["events"])) {
        echo "Events count: " . count($data["events"]) . "\n";
    }
}
