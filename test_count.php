<?php $data = json_decode(file_get_contents("php://stdin"), true); $events = $data["events"] ?? []; echo count($events); ?>
