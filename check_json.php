<?php
$raw = file_get_contents("new.txt");
$decoded = json_decode($raw, true);
if ($decoded === null) {
    echo "Decode failed: " . json_last_error_msg() . "\n";
    exit;
}
echo "Keys: " . implode(", ", array_keys($decoded)) . "\n";
?>
