<?php
$raw = file_get_contents("new.txt");
$data = json_decode($raw, true);
if (isset($data["settings"]["events"])) {
    $events = $data["settings"]["events"];
    echo "Events in settings found. Type: " . gettype($events) . "\n";
    if (is_array($events)) {
        echo "Count: " . count($events) . "\n";
        if (count($events) > 0) {
            print_r(array_keys($events[0]));
            print_r($events[0]);
        }
    }
} else {
    echo "Events not found in settings.\n";
}
