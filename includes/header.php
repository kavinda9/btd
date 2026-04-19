<?php
// ============================================================
//  BTD Battles 1 – Shared Header / Navigation
//  File: includes/header.php
//  Usage: require_once __DIR__ . '/../includes/header.php';
// ============================================================

// Allow each page to set its own title before including this
$pageTitle = isset($pageTitle) ? $pageTitle . ' | ' . SITE_NAME : SITE_NAME;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="BTD Battles 1 stats tracker – leaderboards, player profiles and more." />
    <title><?= htmlspecialchars($pageTitle) ?></title>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Exo+2:wght@300;400;600;800&display=swap" rel="stylesheet" />

    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

    <!-- Global CSS -->
    <link rel="stylesheet" href="/btd-battles/public/css/main.css" />

    <!-- Page-specific CSS (set $pageCss before including header) -->
    <?php if (!empty($pageCss)): ?>
        <link rel="stylesheet" href="/btd-battles/public/css/<?= htmlspecialchars($pageCss) ?>" />
    <?php endif; ?>

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/btd-battles/public/images/icons/favicon.png" />
</head>
<body>

<!-- ========================================================
     TOP NAVIGATION BAR
======================================================== -->
<header class="site-header">
    <div class="header-inner">

        <!-- Logo -->
        <a href="/btd-battles/public/index.html" class="site-logo">
            <img src="/btd-battles/public/images/icons/logo.png"
                 alt="BTD Battles"
                 class="logo-img"
                 onerror="this.style.display='none'" />
            <span class="logo-text">BTD <span class="logo-accent">Battles</span></span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="main-nav" id="mainNav">
            <ul class="nav-list">
                <li>
                    <a href="/btd-battles/public/index.html"
                       class="nav-link <?= (basename($_SERVER['PHP_SELF']) === 'index.php' || basename($_SERVER['PHP_SELF']) === 'index.html') ? 'active' : '' ?>">
                        <i class="fas fa-home"></i> Home
                    </a>
                </li>
                <li>
                    <a href="/btd-battles/public/leaderboard.html"
                       class="nav-link <?= (basename($_SERVER['PHP_SELF']) === 'leaderboard.php' || basename($_SERVER['PHP_SELF']) === 'leaderboard.html') ? 'active' : '' ?>">
                        <i class="fas fa-trophy"></i> Leaderboard
                    </a>
                </li>
                <li>
                    <a href="/btd-battles/public/player.html"
                       class="nav-link <?= (basename($_SERVER['PHP_SELF']) === 'player.php' || basename($_SERVER['PHP_SELF']) === 'player.html') ? 'active' : '' ?>">
                        <i class="fas fa-user"></i> Player Search
                    </a>
                </li>
            </ul>
        </nav>

        <!-- Mobile hamburger button -->
        <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
        </button>

    </div>
</header>

<!-- Mobile nav drawer -->
<div class="mobile-nav-overlay" id="mobileOverlay"></div>
<nav class="mobile-nav" id="mobileNav">
    <ul class="mobile-nav-list">
        <li>
            <a href="/btd-battles/public/index.html" class="mobile-nav-link">
                <i class="fas fa-home"></i> Home
            </a>
        </li>
        <li>
            <a href="/btd-battles/public/leaderboard.html" class="mobile-nav-link">
                <i class="fas fa-trophy"></i> Leaderboard
            </a>
        </li>
        <li>
            <a href="/btd-battles/public/player.html" class="mobile-nav-link">
                <i class="fas fa-user"></i> Player Search
            </a>
        </li>
    </ul>
</nav>

<!-- ========================================================
     MAIN CONTENT WRAPPER (closed in footer.php)
======================================================== -->
<main class="site-main">