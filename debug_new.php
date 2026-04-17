<?php
$raw = file_get_contents("new.txt");
echo "Raw length: " . strlen($raw) . "\n";
$decoded = json_decode($raw, true);
if ($decoded === null) {
    echo "Decode error: " . json_last_error_msg() . "\n";
} else {
    echo "Top level keys: " . implode(", ", array_keys($decoded)) . "\n";
    if (isset($decoded["events"])) {
        echo "Events count: " . count($decoded["events"]) . "\n";
    } else {
        echo "Events key NOT found\n";
    }
}
?>
