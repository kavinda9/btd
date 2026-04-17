<?php
$data = json_decode(file_get_contents("c:\\xampp\\htdocs\\btd\\new.txt"), true);
if ($data === null) {
    die("Failed to decode JSON\n");
}

echo "--- Keys under settings.settings.roomSettings ---\n";
if (isset($data['settings']['settings']['roomSettings'])) {
    foreach ($data['settings']['settings']['roomSettings'] as $key => $value) {
        echo $key . "\n";
    }
} else {
    echo "Path settings.settings.roomSettings not found.\n";
}

echo "\n--- Searching for keywords ---\n";
$keywords = ["current", "active", "daily", "club", "arena", "rotation", "reset", "timestamp"];

function search($arr, $path = "", $keywords) {
    if (!is_array($arr)) return;
    foreach ($arr as $key => $value) {
        $newPath = $path ? "$path.$key" : $key;
        $match = false;
        foreach ($keywords as $kw) {
            if (stripos((string)$key, $kw) !== false) {
                $match = true;
                break;
            }
        }
        if ($match) {
            $type = gettype($value);
            $valStr = is_array($value) ? json_encode($value) : (string)$value;
            if (strlen($valStr) > 50) $valStr = substr($valStr, 0, 50) . "...";
            echo "$newPath : ($type) $valStr\n";
        }
        search($value, $newPath, $keywords);
    }
}

search($data, "", $keywords);
?>
