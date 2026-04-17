<?php $data = json_decode(file_get_contents("php://stdin"), true); echo json_encode(array_keys($data)); ?>
