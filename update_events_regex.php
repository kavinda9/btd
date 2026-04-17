<?php
$raw = file_get_contents("new.txt");
$nowMs = time() * 1000;
$count = 0;

$pattern = '/"type":"btdb_limitedTimeArena"[^}]*}/';
$callback = function($matches) use ($nowMs, &$count) {
    $match = $matches[0];
    // Replace start and end times in this segment
    $match = preg_replace('/"start":\d+/', '"start":' . ($nowMs - 3600000), $match);
    $match = preg_replace('/"end":\d+/', '"end":' . ($nowMs + 3600000), $match);
    $count++;
    return $match;
};

$newRaw = preg_replace_callback($pattern, $callback, $raw);
file_put_contents("new.txt", $newRaw);
echo "Updated $count events via regex.\n";
?>
