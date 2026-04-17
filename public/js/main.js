(function initNavigation() {
  const menuBtn = document.getElementById("menuBtn");
  const siteNav = document.getElementById("siteNav");

  if (!menuBtn || !siteNav) {
    return;
  }

  menuBtn.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();

(async function initHomeQuickStats() {
  const statCount = document.getElementById("statCount");
  const statTop = document.getElementById("statTop");

  if (!statCount || !statTop) {
    return;
  }

  try {
    const data = await apiGet("leaderboard.php");
    const players = Array.isArray(data.players) ? data.players : [];
    const top = players.length > 0 ? players[0].medallions : null;

    statCount.textContent = formatNumber(players.length);
    statTop.textContent =
      top === null ? "-" : `${formatNumber(top)} medallions`;
  } catch (_) {
    statCount.textContent = "Unavailable";
    statTop.textContent = "Unavailable";
  }
})();
