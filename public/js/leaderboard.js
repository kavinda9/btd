const leaderboardBody = document.getElementById("leaderboardBody");
const leaderboardMeta = document.getElementById("leaderboardMeta");
const leaderboardError = document.getElementById("leaderboardError");
const refreshBtn = document.getElementById("refreshBtn");
const globalViewBtn = document.getElementById("globalViewBtn");
const prestigeViewBtn = document.getElementById("prestigeViewBtn");
const regionViewBtn = document.getElementById("regionViewBtn");
const weeklySection = document.getElementById("weeklySection");
const prestigeSection = document.getElementById("prestigeSection");
const regionModal = document.getElementById("regionModal");
const regionModalClose = document.getElementById("regionModalClose");
const regionFlagsGrid = document.getElementById("regionFlagsGrid");
const prestigeLeaderboardBody = document.getElementById(
  "prestigeLeaderboardBody",
);
const prestigeLeaderboardMeta = document.getElementById(
  "prestigeLeaderboardMeta",
);
const prestigeLeaderboardError = document.getElementById(
  "prestigeLeaderboardError",
);
const prestigeRefreshBtn = document.getElementById("prestigeRefreshBtn");

const COUNTRY_OPTIONS = [
  { code: "AR", flag: "🇦🇷" },
  { code: "AU", flag: "🇦🇺" },
  { code: "AT", flag: "🇦🇹" },
  { code: "BE", flag: "🇧🇪" },
  { code: "BR", flag: "🇧🇷" },
  { code: "BG", flag: "🇧🇬" },
  { code: "CA", flag: "🇨🇦" },
  { code: "CL", flag: "🇨🇱" },
  { code: "CN", flag: "🇨🇳" },
  { code: "CO", flag: "🇨🇴" },
  { code: "HR", flag: "🇭🇷" },
  { code: "CZ", flag: "🇨🇿" },
  { code: "DK", flag: "🇩🇰" },
  { code: "EE", flag: "🇪🇪" },
  { code: "FI", flag: "🇫🇮" },
  { code: "FR", flag: "🇫🇷" },
  { code: "DE", flag: "🇩🇪" },
  { code: "GR", flag: "🇬🇷" },
  { code: "HK", flag: "🇭🇰" },
  { code: "HU", flag: "🇭🇺" },
  { code: "IN", flag: "🇮🇳" },
  { code: "ID", flag: "🇮🇩" },
  { code: "IE", flag: "🇮🇪" },
  { code: "IL", flag: "🇮🇱" },
  { code: "IT", flag: "🇮🇹" },
  { code: "JP", flag: "🇯🇵" },
  { code: "LV", flag: "🇱🇻" },
  { code: "LT", flag: "🇱🇹" },
  { code: "MY", flag: "🇲🇾" },
  { code: "MX", flag: "🇲🇽" },
  { code: "NL", flag: "🇳🇱" },
  { code: "NZ", flag: "🇳🇿" },
  { code: "NO", flag: "🇳🇴" },
  { code: "PH", flag: "🇵🇭" },
  { code: "PL", flag: "🇵🇱" },
  { code: "PT", flag: "🇵🇹" },
  { code: "RO", flag: "🇷🇴" },
  { code: "RU", flag: "🇷🇺" },
  { code: "SA", flag: "🇸🇦" },
  { code: "SG", flag: "🇸🇬" },
  { code: "SI", flag: "🇸🇮" },
  { code: "ZA", flag: "🇿🇦" },
  { code: "KR", flag: "🇰🇷" },
  { code: "ES", flag: "🇪🇸" },
  { code: "SE", flag: "🇸🇪" },
  { code: "CH", flag: "🇨🇭" },
  { code: "TW", flag: "🇹🇼" },
  { code: "TH", flag: "🇹🇭" },
  { code: "TR", flag: "🇹🇷" },
  { code: "UA", flag: "🇺🇦" },
  { code: "AE", flag: "🇦🇪" },
  { code: "GB", flag: "🇬🇧" },
  { code: "US", flag: "🇺🇸" },
  { code: "VN", flag: "🇻🇳" },
];

const allowedCountries = new Set([
  "GLOBAL",
  ...COUNTRY_OPTIONS.map((c) => c.code),
]);

let currentView = "global";
let currentCountry = "GLOBAL";

function getSelectedCountry() {
  const raw = (queryParam("country") || "GLOBAL")
    .toString()
    .trim()
    .toUpperCase();
  return allowedCountries.has(raw) ? raw : "GLOBAL";
}

function updateStateQuery() {
  const url = new URL(window.location.href);
  if (currentCountry === "GLOBAL") {
    url.searchParams.delete("country");
  } else {
    url.searchParams.set("country", currentCountry);
  }

  url.searchParams.set("view", currentView);
  window.history.replaceState({}, "", url);
}

function setActiveButton(activeId) {
  const entries = [
    [globalViewBtn, "globalViewBtn"],
    [prestigeViewBtn, "prestigeViewBtn"],
    [regionViewBtn, "regionViewBtn"],
  ];

  entries.forEach(([btn, id]) => {
    if (!btn) return;
    btn.classList.toggle("btn-primary", id === activeId);
    btn.classList.toggle("btn-ghost", id !== activeId);
  });
}

function showView(view) {
  currentView = view;
  const showPrestige = view === "prestige";

  if (weeklySection) {
    weeklySection.hidden = showPrestige;
  }

  if (prestigeSection) {
    prestigeSection.hidden = !showPrestige;
  }

  if (view === "global") {
    setActiveButton("globalViewBtn");
  } else if (view === "prestige") {
    setActiveButton("prestigeViewBtn");
  } else {
    setActiveButton("regionViewBtn");
  }

  updateStateQuery();
}

function openRegionModal() {
  if (!regionModal) return;
  regionModal.hidden = false;
}

function closeRegionModal() {
  if (!regionModal) return;
  regionModal.hidden = true;
}

function renderRegionFlags() {
  if (!regionFlagsGrid) return;

  regionFlagsGrid.innerHTML = COUNTRY_OPTIONS.map((entry) => {
    const lowerCode = entry.code.toLowerCase();
    const flagUrl = `https://flagcdn.com/w80/${lowerCode}.png`;
    return `
      <button class="flag-btn" type="button" data-country="${entry.code}" aria-label="${entry.code}" title="${entry.code}">
        <img
          class="flag-icon"
          src="${flagUrl}"
          alt="${entry.code}"
          loading="lazy"
          decoding="async"
          onerror="this.hidden=true; this.nextElementSibling.hidden=false;"
        />
        <span class="flag-emoji-fallback" hidden>${entry.flag}</span>
      </button>
    `;
  }).join("");

  regionFlagsGrid.querySelectorAll(".flag-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const code = (btn.getAttribute("data-country") || "GLOBAL").toUpperCase();
      currentCountry = allowedCountries.has(code) ? code : "GLOBAL";
      showView("region");
      closeRegionModal();
      loadLeaderboard(false);
    });
  });
}

function rankClass(rank) {
  if (rank === 1) return "rank-pill rank-1";
  if (rank === 2) return "rank-pill rank-2";
  if (rank === 3) return "rank-pill rank-3";
  return "rank-pill";
}

function renderRows(players) {
  if (!Array.isArray(players) || players.length === 0) {
    leaderboardBody.innerHTML =
      "<tr><td colspan='3'>No leaderboard entries found.</td></tr>";
    return;
  }

  leaderboardBody.innerHTML = players
    .map((player) => {
      const rank = Number(player.rank) || 0;
      const username = escapeHtml(player.username || "-");
      const medallions = formatNumber(player.medallions);

      return `
			<tr>
				<td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
        <td><a class="mini-link" href="player.html?id=${encodeURIComponent(player.playerID || "")}">${username}</a></td>
				<td>${medallions}</td>
			</tr>
		`;
    })
    .join("");
}

function renderPrestigeRows(players) {
  if (!Array.isArray(players) || players.length === 0) {
    prestigeLeaderboardBody.innerHTML =
      "<tr><td colspan='3'>No prestige leaderboard entries found.</td></tr>";
    return;
  }

  prestigeLeaderboardBody.innerHTML = players
    .map((player) => {
      const rank = Number(player.rank) || 0;
      const username = escapeHtml(player.username || "-");
      const prestige = formatNumber(player.prestige);

      return `
			<tr>
				<td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
        <td><a class="mini-link" href="player.html?id=${encodeURIComponent(player.playerID || "")}">${username}</a></td>
				<td><span class="prestige-score">${prestige}</span></td>
			</tr>
		`;
    })
    .join("");
}

async function loadLeaderboard(forceRefresh = false) {
  leaderboardError.hidden = true;
  leaderboardMeta.textContent = "Loading...";

  const country = currentCountry;
  const params = new URLSearchParams();
  if (country !== "GLOBAL") {
    params.set("country", country);
  }
  if (forceRefresh) {
    params.set("refresh", "1");
  }
  const path = `leaderboard.php${params.toString() ? `?${params.toString()}` : ""}`;

  try {
    const data = await apiGet(path);
    const players = data.players || [];
    renderRows(players);
    const regionLabel = country === "GLOBAL" ? "GLOBAL" : `REGION ${country}`;
    leaderboardMeta.textContent = `${regionLabel} | Entries: ${formatNumber(data.count)} | Cached: ${data.cached ? "Yes" : "No"}`;
  } catch (error) {
    leaderboardBody.innerHTML =
      "<tr><td colspan='3'>Failed to load leaderboard.</td></tr>";
    leaderboardMeta.textContent = "";
    leaderboardError.textContent = error.message;
    leaderboardError.hidden = false;
  }
}

async function loadPrestigeLeaderboard(forceRefresh = false) {
  if (
    !prestigeLeaderboardBody ||
    !prestigeLeaderboardMeta ||
    !prestigeLeaderboardError
  ) {
    return;
  }

  prestigeLeaderboardError.hidden = true;
  prestigeLeaderboardMeta.textContent = "Loading...";

  const path = forceRefresh
    ? "prestige_leaderboard.php?refresh=1"
    : "prestige_leaderboard.php";

  try {
    const data = await apiGet(path);
    renderPrestigeRows(data.players || []);
    prestigeLeaderboardMeta.textContent = `Entries: ${formatNumber(data.count)} | Cached: ${data.cached ? "Yes" : "No"}`;
  } catch (error) {
    prestigeLeaderboardBody.innerHTML =
      "<tr><td colspan='3'>Failed to load prestige leaderboard.</td></tr>";
    prestigeLeaderboardMeta.textContent = "";
    prestigeLeaderboardError.textContent = error.message;
    prestigeLeaderboardError.hidden = false;
  }
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    if (currentView === "prestige") {
      loadPrestigeLeaderboard(true);
      return;
    }

    loadLeaderboard(true);
  });
}

if (globalViewBtn) {
  globalViewBtn.addEventListener("click", () => {
    currentCountry = "GLOBAL";
    showView("global");
    loadLeaderboard(false);
  });
}

if (prestigeViewBtn) {
  prestigeViewBtn.addEventListener("click", () => {
    showView("prestige");
    loadPrestigeLeaderboard(false);
  });
}

if (regionViewBtn) {
  regionViewBtn.addEventListener("click", () => {
    openRegionModal();
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (target.closest("#regionViewBtn")) {
    openRegionModal();
  }
});

if (regionModal) {
  regionModal.addEventListener("click", (event) => {
    if (event.target === regionModal) {
      closeRegionModal();
    }
  });
}

if (regionModalClose) {
  regionModalClose.addEventListener("click", () => {
    closeRegionModal();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeRegionModal();
  }
});

if (prestigeRefreshBtn) {
  prestigeRefreshBtn.addEventListener("click", () => {
    loadPrestigeLeaderboard(true);
  });
}

renderRegionFlags();

const initialView = (queryParam("view") || "global").toString().toLowerCase();
currentCountry = getSelectedCountry();

if (initialView === "prestige") {
  showView("prestige");
  loadPrestigeLeaderboard();
} else if (initialView === "region" && currentCountry !== "GLOBAL") {
  showView("region");
  loadLeaderboard();
} else {
  currentCountry = "GLOBAL";
  showView("global");
  loadLeaderboard();
}
