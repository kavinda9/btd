<?php
$raw = file_get_contents("new.txt");
$decoded = json_decode($raw, true);
if (isset($decoded["events"])) {
    foreach ($decoded["events"] as $i => $event) {
        echo "Event $i type: " . ($event["type"] ?? "N/A") . "\n";
        if ($i > 5) break;
    }
}
?>
