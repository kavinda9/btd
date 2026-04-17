<?php
$raw = file_get_contents("new.txt");
$decoded = json_decode($raw, true);
echo "Type of events: " . gettype($decoded["events"]) . "\n";
var_dump($decoded["events"]);
?>
