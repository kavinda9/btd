<?php
// ============================================================
//  BTD Battles 1 - Guild Details API Proxy
//  File: api/guild.php
// ============================================================

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/cache.php';

function parse_nk_payload(string $raw): array {
    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
        return [];
    }

    $payload = $decoded;

    if (isset($decoded['data']) && is_string($decoded['data'])) {
        $inner = json_decode($decoded['data'], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($inner)) {
            $payload = $inner;
        }
    } elseif (isset($decoded['data']) && is_array($decoded['data'])) {
        $payload = $decoded['data'];
    }

    if (isset($payload['']) && is_array($payload[''])) {
        $payload = $payload[''];
    }

    return is_array($payload) ? $payload : [];
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_error('Method not allowed.', 405);
}

if (empty($_GET['id'])) {
    send_error('Missing guild ID. Use ?id=GUILDID', 400);
}

$guildID = sanitise_player_id(trim($_GET['id']));
$cacheFile = CACHE_DIR . 'guild_' . $guildID . '.json';

$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';
if ($forceRefresh) {
    cache_delete($cacheFile);
}

$guildUrl = NK_BASE_URL . '/storage/static/appdocs/2/guilds/' . $guildID;
$raw = fetch_with_cache($guildUrl, $cacheFile);

if (!$raw) {
    send_error('No guild data available for this guild.', 503);
}

$guild = parse_nk_payload($raw);
if (empty($guild)) {
    send_error('Guild data is malformed.', 502);
}

$ownerId = (string) ($guild['owner'] ?? $guild['ownerID'] ?? '');
$ownerName = $ownerId !== '' ? $ownerId : null;

if ($ownerId !== '') {
    $ownerProfileUrl = NK_PROFILE_BASE . $ownerId . '/PublicProfile.save';
    $ownerCache = cache_player_path($ownerId);
    $ownerRaw = fetch_with_cache_optional($ownerProfileUrl, $ownerCache);
    if (is_string($ownerRaw) && $ownerRaw !== '') {
        $ownerData = parse_nk_payload($ownerRaw);
        $ownerName = $ownerData['displayName']
            ?? $ownerData['username']
            ?? $ownerData['name']
            ?? $ownerData['Name']
            ?? $ownerName;
    }
}

$tagline = $guild['tagline'] ?? null;
if (is_string($tagline) && $tagline !== '') {
    $taglineDecoded = json_decode($tagline, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($taglineDecoded)) {
        $tagline = $taglineDecoded['Tagline'] ?? $taglineDecoded['tagline'] ?? $tagline;
    }
}

$status = $guild['status'] ?? $guild['guildStatus'] ?? null;
$numMembers = (int) ($guild['numMembers'] ?? $guild['members'] ?? 0);
$numMembersPending = (int) ($guild['numMembersPending'] ?? 0);
$maximumMembers = (int) ($guild['maximumMembers'] ?? $guild['maxMembers'] ?? 0);
$chatEnabled = isset($guild['chatEnabled']) ? (bool) $guild['chatEnabled'] : null;
$country = $guild['country'] ?? $guild['countryCode'] ?? null;

$guildName = $guild['name'] ?? $guild['guildName'] ?? 'Unknown Guild';

$normalized = [
    'guildID' => $guild['guildID'] ?? $guild['id'] ?? $guildID,
    'name' => $guildName,
    'owner' => $ownerId !== '' ? $ownerId : null,
    'ownerName' => $ownerName,
    'status' => $status,
    'numMembers' => $numMembers,
    'numMembersPending' => $numMembersPending,
    'maximumMembers' => $maximumMembers,
    'tagline' => $tagline,
    'shortcode' => $guild['shortcode'] ?? null,
    'chatEnabled' => $chatEnabled,
    'country' => $country,
];

echo json_encode([
    'success' => true,
    'cached' => cache_is_valid($cacheFile),
    'guild' => $normalized,
    'raw' => DEV_MODE ? $guild : null,
]);
