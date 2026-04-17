<?php
$raw = file_get_contents("new.txt");
$data = json_decode($raw, true);
echo "Keys: " . implode(", ", array_keys($data)) . "\n";
foreach ($data as $key => $value) {
    echo "Key: $key, Type: " . gettype($value) . "\n";
    if (is_array($value)) {
        echo "  Keys: " . implode(", ", array_keys($value)) . "\n";
    }
}
