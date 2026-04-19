<?php
// ============================================================
//  BTD Battles 1 – Cache Helper
//  File: api/cache.php
// ============================================================

require_once __DIR__ . '/../includes/config.php';

// ----------------------------------------------------------
// 0. CLEANUP – remove expired cache files
//    Deletes any .json cache older than CACHE_TTL.
// ----------------------------------------------------------
function cache_cleanup_expired(): int {
    $files = glob(CACHE_DIR . '*.json');
    if ($files === false) {
        return 0;
    }

    $deleted = 0;
    $now = time();

    foreach ($files as $file) {
        if (!is_file($file)) {
            continue;
        }

        $mtime = filemtime($file);
        if ($mtime === false) {
            continue;
        }

        if (($now - $mtime) >= CACHE_TTL) {
            if (@unlink($file)) {
                $deleted++;
            }
        }
    }

    return $deleted;
}

// ----------------------------------------------------------
// 0b. CLEANUP ONCE – run cleanup at most once per request
// ----------------------------------------------------------
function cache_cleanup_expired_once(): void {
    static $didCleanup = false;
    if ($didCleanup) {
        return;
    }

    cache_cleanup_expired();
    $didCleanup = true;
}

// ----------------------------------------------------------
// 1. CHECK – is a cached file still valid?
// ----------------------------------------------------------
function cache_is_valid(string $cacheFile): bool {
    cache_cleanup_expired_once();

    if (!file_exists($cacheFile)) {
        return false;
    }

    $age = time() - filemtime($cacheFile);
    return $age < CACHE_TTL;
}

// ----------------------------------------------------------
// 2. READ – get contents of a cache file
// ----------------------------------------------------------
function cache_read(string $cacheFile): string|false {
    if (!file_exists($cacheFile)) {
        return false;
    }

    return file_get_contents($cacheFile);
}

// ----------------------------------------------------------
// 3. WRITE – save data to a cache file
// ----------------------------------------------------------
function cache_write(string $cacheFile, string $data): bool {
    // Make sure cache directory exists
    $dir = dirname($cacheFile);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $bytes = file_put_contents($cacheFile, $data, LOCK_EX);
    return $bytes !== false;
}

// ----------------------------------------------------------
// 4. DELETE – remove a specific cache file
// ----------------------------------------------------------
function cache_delete(string $cacheFile): bool {
    if (file_exists($cacheFile)) {
        return unlink($cacheFile);
    }
    return true;
}

// ----------------------------------------------------------
// 5. CLEAR – remove ALL files in the cache directory
// ----------------------------------------------------------
function cache_clear_all(): int {
    $count = 0;
    $files = glob(CACHE_DIR . '*.json');

    if ($files) {
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
                $count++;
            }
        }
    }

    return $count; // returns number of files deleted
}

// ----------------------------------------------------------
// 6. GET CACHE FILE PATH – for player profiles (dynamic)
//    Each player gets their own cache file by ID
// ----------------------------------------------------------
function cache_player_path(string $playerId): string {
    return CACHE_DIR . 'player_' . $playerId . '.json';
}

// ----------------------------------------------------------
// 7. FETCH – fetch from URL with caching built in
//    Pass a cache file path and a URL.
//    Returns the JSON string (from cache or live fetch).
// ----------------------------------------------------------
function fetch_with_cache(string $url, string $cacheFile): string {

    // Keep cache directory tidy by deleting expired cache files.
    cache_cleanup_expired_once();

    // Return cached version if still fresh
    if (cache_is_valid($cacheFile)) {
        return cache_read($cacheFile);
    }

    // Otherwise fetch from remote
    $context = stream_context_create([
        'http' => [
            'timeout'        => HTTP_TIMEOUT,
            'ignore_errors'  => true,
            'method'         => 'GET',
            'header'         => "User-Agent: BTDBattlesStats/1.0\r\n",
        ],
    ]);

    $data = @file_get_contents($url, false, $context);

    // Check HTTP response code
    $httpCode = 0;
    if (isset($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (preg_match('/HTTP\/\d\.\d\s+(\d+)/', $header, $matches)) {
                $httpCode = (int) $matches[1];
            }
        }
    }

    if ($data === false || $httpCode >= 400) {
        // If fetch fails but we have a stale cache, return it anyway
        $stale = cache_read($cacheFile);
        if ($stale !== false) {
            return $stale;
        }
        send_error('Failed to fetch data from Ninja Kiwi server. HTTP ' . $httpCode, 502);
    }

    // Save fresh data to cache
    cache_write($cacheFile, $data);

    return $data;
}

// ----------------------------------------------------------
// 8. FETCH OPTIONAL – same cache flow, but do not exit on error
//    Returns false if remote + stale cache are unavailable.
// ----------------------------------------------------------
function fetch_with_cache_optional(string $url, string $cacheFile): string|false {

    // Keep cache directory tidy by deleting expired cache files.
    cache_cleanup_expired_once();

    if (cache_is_valid($cacheFile)) {
        return cache_read($cacheFile);
    }

    $context = stream_context_create([
        'http' => [
            'timeout'        => HTTP_TIMEOUT,
            'ignore_errors'  => true,
            'method'         => 'GET',
            'header'         => "User-Agent: BTDBattlesStats/1.0\r\n",
        ],
    ]);

    $data = @file_get_contents($url, false, $context);

    $httpCode = 0;
    if (isset($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (preg_match('/HTTP\/\d\.\d\s+(\d+)/', $header, $matches)) {
                $httpCode = (int) $matches[1];
            }
        }
    }

    if ($data === false || $httpCode >= 400) {
        $stale = cache_read($cacheFile);
        return $stale !== false ? $stale : false;
    }

    cache_write($cacheFile, $data);
    return $data;
}