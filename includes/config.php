<?php
// ============================================================
//  BTD Battles 1 – Central Configuration
//  File: includes/config.php
// ============================================================

// ----------------------------------------------------------
// 1. NINJA KIWI STATIC API – BASE URL
// ----------------------------------------------------------
define('NK_BASE_URL',        'https://priority-static-api.nkstatic.com');
define('NK_LEADERBOARD_URL', NK_BASE_URL . '/storage/static/appdocs/2/leaderboards/WeeklyMedallions:569.json');
define('NK_PRESTIGE_URL',    NK_BASE_URL . '/storage/static/appdocs/2/leaderboards/ladder:Season_238:Rating.json');
define('NK_CLAN_WEEKLY_ID',  '567');
define('NK_CLAN_URL',        NK_BASE_URL . '/storage/static/appdocs/2/leaderboards/guild:compiled:WeeklyMedallions:' . NK_CLAN_WEEKLY_ID . ':Club.json');
define('NK_PROFILE_BASE',    NK_BASE_URL . '/storage/static/2/');   // append {playerID}/PublicProfile.save

// ----------------------------------------------------------
// 2. CACHE SETTINGS
// ----------------------------------------------------------
define('CACHE_DIR',          __DIR__ . '/../cache/');   // writable cache folder
define('CACHE_LEADERBOARD',  CACHE_DIR . 'leaderboard.json');
define('CACHE_PRESTIGE',     CACHE_DIR . 'leaderboard_prestige.json');
define('CACHE_CLAN',         CACHE_DIR . 'leaderboard_clan.json');
define('CACHE_TTL',          600);                      // seconds (10 minutes)

// ----------------------------------------------------------
// 3. SITE SETTINGS
// ----------------------------------------------------------
define('SITE_NAME',    'BTD Battles Stats');
define('SITE_VERSION', '1.0.0');
define('SITE_URL',     '');          // leave empty for relative paths, or set full URL

// ----------------------------------------------------------
// 4. REQUEST SETTINGS
// ----------------------------------------------------------
define('HTTP_TIMEOUT',    10);    // seconds before giving up on NK server
define('MAX_ID_LENGTH',   64);    // max chars allowed in a player ID param

// ----------------------------------------------------------
// 5. ERROR REPORTING (set to false on production)
// ----------------------------------------------------------
define('DEV_MODE', true);

if (DEV_MODE) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}

// ----------------------------------------------------------
// 6. CORS HEADERS
// ----------------------------------------------------------
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// ----------------------------------------------------------
// 7. HELPER – send a JSON error response and exit
// ----------------------------------------------------------
function send_error(string $message, int $httpCode = 500): void {
    http_response_code($httpCode);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error'   => $message,
    ]);
    exit;
}

// ----------------------------------------------------------
// 8. HELPER – sanitise a player ID from user input
// ----------------------------------------------------------
function sanitise_player_id(string $id): string {
    // Allow only hex characters and hyphens (typical NK player IDs)
    $clean = preg_replace('/[^a-fA-F0-9\-]/', '', $id);

    if (strlen($clean) === 0 || strlen($clean) > MAX_ID_LENGTH) {
        send_error('Invalid player ID.', 400);
    }

    return $clean;
}