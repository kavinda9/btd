<?php
// ============================================================
//  BTD Battles 1 – Shared Footer
//  File: includes/footer.php
//  Usage: require_once __DIR__ . '/../includes/footer.php';
// ============================================================
?>

</main>
<!-- END .site-main (opened in header.php) -->

<!-- ========================================================
     SITE FOOTER
======================================================== -->
<footer class="site-footer">
    <div class="footer-inner">

        <!-- Footer Top Row -->
        <div class="footer-top">

            <!-- Branding -->
            <div class="footer-brand">
                <span class="logo-text">BTD <span class="logo-accent">Battles</span></span>
                <p class="footer-tagline">Unofficial stats tracker for Bloons TD Battles 1</p>
            </div>

            <!-- Quick Links -->
            <div class="footer-links">
                <h4 class="footer-heading">Pages</h4>
                <ul>
                    <li><a href="/btd-battles/public/index.html"><i class="fas fa-home"></i> Home</a></li>
                    <li><a href="/btd-battles/public/leaderboard.html"><i class="fas fa-trophy"></i> Leaderboard</a></li>
                    <li><a href="/btd-battles/public/player.html"><i class="fas fa-user"></i> Player Search</a></li>
                </ul>
            </div>

            <!-- Info -->
            <div class="footer-info">
                <h4 class="footer-heading">Info</h4>
                <ul>
                    <li><i class="fas fa-clock"></i> Data cached every 10 minutes</li>
                    <li><i class="fas fa-server"></i> Data source: Ninja Kiwi static API</li>
                    <li><i class="fas fa-code-branch"></i> Version <?= defined('SITE_VERSION') ? htmlspecialchars(SITE_VERSION) : '1.0.0' ?></li>
                </ul>
            </div>

        </div>

        <!-- Footer Bottom Row -->
        <div class="footer-bottom">
            <p class="footer-disclaimer">
                <i class="fas fa-exclamation-triangle"></i>
                This is an <strong>unofficial</strong> fan-made website. Not affiliated with or endorsed by
                <a href="https://ninjakiwi.com" target="_blank" rel="noopener">Ninja Kiwi</a>.
                BTD Battles is a trademark of Ninja Kiwi.
            </p>
            <p class="footer-copy">
                &copy; <?= date('Y') ?> BTD Battles Stats &mdash; Built with PHP, HTML, CSS &amp; JS
            </p>
        </div>

    </div>
</footer>

<!-- ========================================================
     GLOBAL JAVASCRIPT
======================================================== -->
<script src="/btd-battles/public/js/utils.js"></script>
<script src="/btd-battles/public/js/main.js"></script>

<!-- Page-specific JS (set $pageJs before including footer) -->
<?php if (!empty($pageJs)): ?>
    <script src="/btd-battles/public/js/<?= htmlspecialchars($pageJs) ?>"></script>
<?php endif; ?>

</body>
</html>