<?php
$raw = file_get_contents("new.txt");
$decoded = json_decode($raw, true);
$nowMs = time() * 1000;
$count = 0;
if (isset($decoded["events"])) {
    foreach ($decoded["events"] as &$event) {
        if (isset($event["type"]) && $event["type"] === "btdb_limitedTimeArena") {
            $event["start"] = $nowMs - 3600000;
            $event["end"] = $nowMs + 3600000;
            $count++;
        }
    }
}
file_put_contents("new.txt", json_encode($decoded));
echo "Updated $count events.\n";
?>
