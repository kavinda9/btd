<?php
$raw = file_get_contents("new.txt");
$decoded = json_decode($raw, true);
$keys = array_keys($decoded);
foreach ($keys as $key) {
    echo "Key: '$key' (Length: " . strlen($key) . ")\n";
    foreach (str_split($key) as $char) {
        echo ord($char) . " ";
    }
    echo "\n";
}
?>
