<?php
$data = json_decode(file_get_contents("new.txt"), true);
echo "Top-level keys: " . implode(", ", array_keys($data)) . "\n";
echo "settings.events exists: " . (isset($data["settings"]["events"]) ? "Yes" : "No") . "\n";
echo "root events exists: " . (isset($data["events"]) ? "Yes" : "No") . "\n";

foreach ($data["settings"]["events"] as $event) {
    if (isset($event["type"]) && $event["type"] === "btdb_limitedTimeArena") {
        echo "First btdb_limitedTimeArena event keys: " . implode(", ", array_keys($event)) . "\n";
        if (isset($event["metadata"])) {
            echo "Metadata keys: " . implode(", ", array_keys($event["metadata"])) . "\n";
        }
        break;
    }
}
?>
