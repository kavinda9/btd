<?php
$raw = file_get_contents("new.txt");
$decoded = json_decode($raw, true);
$keys = array_keys($decoded);
foreach ($keys as $key) {
    if (trim($key) === "events") {
        echo "Found events with value type: " . gettype($decoded[$key]) . "\n";
    }
}
?>
