<?php
$raw = file_get_contents("new.txt");
$nowMs = time() * 1000;
$count = 0;

// Update "start" separately
$newRaw = preg_replace_callback('/"start":\d+/', function($m) use ($nowMs, &$count) {
    return '"start":' . ($nowMs - 3600000);
}, $raw);

// Update "end" separately
$newRaw = preg_replace_callback('/"end":\d+/', function($m) use ($nowMs, &$count) {
    return '"end":' . ($nowMs + 3600000);
}, $newRaw);

file_put_contents("new.txt", $newRaw);
echo "Updated all start/end times.\n";
?>
