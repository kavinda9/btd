<?php
$raw = file_get_contents("new.txt");
$p1 = strpos($raw, "\"events\"");
echo "Position of \"events\": $p1\n";
echo "Substring: " . substr($raw, $p1, 50) . "\n";
?>
