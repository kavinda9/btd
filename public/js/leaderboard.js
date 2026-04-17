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

function rowColorClass(index, rank, enabled) {
  if (!enabled) {
    return "";
  }

  return index % 2 === 0 ? "lb-row-alt-a" : "lb-row-alt-b";
}

function normalizeAssetKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getRegionFlagFileName(countryCode) {
  const byCode = {
    FI: "Finland",
    FR: "France",
    DE: "Germany",
    GR: "Greece",
    HK: "HongKong",
    HU: "Hungary",
    ID: "Indonesia",
    IE: "Ireland",
    IL: "Israel",
    IT: "Italy",
    JP: "Japan",
    LV: "Latvia",
    LT: "Lithuania",
    MY: "Malaysia",
    MX: "Mexico",
    NL: "Netherlands",
    NZ: "NewZealand",
    NO: "Norway",
    PH: "Philippines",
    PL: "Poland",
    PT: "Portugal",
    TW: "RepublicOfChina",
    RO: "Romania",
    RU: "Russia",
    SA: "SaudiArabia",
    SG: "Singapore",
    SI: "Slovenia",
    ZA: "SouthAfrica",
    KR: "SouthKorea",
    ES: "Spain",
    SE: "Sweden",
    CH: "Switzerland",
    TH: "Thailand",
    TR: "Turkey",
    UA: "Ukraine",
    AE: "UnitedArabEmirates",
    VN: "Vietnam",
  };

  const code = String(countryCode || "")
    .trim()
    .toUpperCase();
  if (!code) return null;
  return byCode[code] || code;
}

function getRegionFlagCandidatePaths(countryCode) {
  const code = String(countryCode || "")
    .trim()
    .toUpperCase();
  if (!code) {
    return [];
  }

  const mapped = getRegionFlagFileName(code);
  const candidates = [mapped, code].filter(Boolean);
  return [...new Set(candidates)].map(
    (name) => `images/Country%20Flags/${encodeURIComponent(name)}.png`,
  );
}

function getRegionalMergeOptions(badgeId, countryValue) {
  const cfg = window.RegionalBadgePositionConfig || {};
  const defaults = cfg.defaults || {};
  const badgeKey = normalizeAssetKey(badgeId);
  const byBadge = (cfg.byBadge && cfg.byBadge[badgeKey]) || {};

  const countryCode = String(countryValue || "")
    .trim()
    .toUpperCase();
  const byBadgeCountryMap =
    (cfg.byBadgeCountry && cfg.byBadgeCountry[badgeKey]) || {};
  const byBadgeCountry = (countryCode && byBadgeCountryMap[countryCode]) || {};

  return {
    flagScale: Number(defaults.flagScale) || 1.2,
    offsetX:
      Number(byBadgeCountry.offsetX ?? byBadge.offsetX ?? defaults.offsetX) ||
      0,
    offsetY:
      Number(byBadgeCountry.offsetY ?? byBadge.offsetY ?? defaults.offsetY) ||
      0,
  };
}

async function applyRegionalPrizeMerge(imgEl) {
  if (!imgEl) {
    return;
  }

  const composer = window.RegionalBadgeComposer;
  if (
    !composer ||
    typeof composer.mergeRegionalBadgeWithFallback !== "function"
  ) {
    return;
  }

  const badgeId = imgEl.getAttribute("data-badge-id") || "";
  const countryCode = imgEl.getAttribute("data-country") || "";
  const baseSrc = imgEl.getAttribute("data-base-src") || "";
  if (!badgeId || !countryCode || !baseSrc) {
    return;
  }

  const flagCandidates = getRegionFlagCandidatePaths(countryCode);
  if (!flagCandidates.length) {
    return;
  }

  const mergeOptions = getRegionalMergeOptions(badgeId, countryCode);
  const mergedSrc = await composer.mergeRegionalBadgeWithFallback(
    baseSrc,
    flagCandidates,
    mergeOptions,
  );

  if (mergedSrc) {
    imgEl.src = mergedSrc;
  }
}

function enhanceRegionalPrizeBadges() {
  const nodes = document.querySelectorAll(".js-regional-prize-badge");
  nodes.forEach((node) => {
    applyRegionalPrizeMerge(node).catch(() => {
      // Keep base image as fallback.
    });
  });
}

function prizeBadgeForWeekly(rank) {
  if (currentCountry !== "GLOBAL") {
    if (rank === 1) return "local_gold";
    if (rank === 2) return "local_silver";
    if (rank === 3) return "local_bronze";
    return null;
  }

  if (rank === 1) return "black_diamond";
  if (rank === 2) return "red_diamond";
  if (rank === 3) return "diamond";
  if (rank <= 100) return "gold";
  if (rank <= 1000) return "silvergold";
  if (rank <= 10000) return "silverx2";
  return "silverx1";
}

function prizeBadgeForPrestige(rank) {
  if (rank === 1) return "black_diamond_prestige";
  if (rank === 2) return "red_diamond_prestige";
  if (rank === 3) return "diamond_prestige";
  if (rank <= 10) return "gold_black_diamond_prestige";
  if (rank <= 25) return "gold_red_diamond_prestige";
  if (rank <= 100) return "gold_diamond_prestige";
  if (rank <= 500) return "diamond_prestige";
  if (rank <= 2000) return "gold_prestige";
  if (rank <= 5000) return "silver_gold_prestige";
  if (rank <= 15000) return "silver_prestige";
  return "bronze_prestige";
}

function renderPrizeBadgeCell(fileName, rank, label) {
  if (!fileName) {
    return "<span class='muted'>-</span>";
  }

  const src = `images/badges/${encodeURIComponent(fileName)}.png`;
  const alt = `${label} T${formatNumber(rank)}`;
  const isRegionPrize =
    currentCountry !== "GLOBAL" && fileName.startsWith("local_");
  const regionAttrs = isRegionPrize
    ? ` data-base-src="${src}" data-badge-id="${escapeHtml(fileName)}" data-country="${escapeHtml(currentCountry)}" class="prize-badge js-regional-prize-badge"`
    : ` class="prize-badge"`;

  return `<img${regionAttrs} src="${src}" alt="${escapeHtml(alt)}" title="${escapeHtml(alt)}" loading="lazy" />`;
}

function renderRows(players) {
  if (!Array.isArray(players) || players.length === 0) {
    leaderboardBody.innerHTML =
      "<tr><td colspan='4'>No leaderboard entries found.</td></tr>";
    return;
  }

  leaderboardBody.innerHTML = players
    .map((player, index) => {
      const rank = Number(player.rank) || 0;
      const username = escapeHtml(player.username || "-");
      const medallions = formatNumber(player.medallions);
      const prizeBadge = prizeBadgeForWeekly(rank);
      const prizeLabel =
        currentCountry === "GLOBAL"
          ? "Global Prize"
          : `Region ${currentCountry} Prize`;
      const rowClass = rowColorClass(index, rank, currentCountry === "GLOBAL");

      return `
			<tr class="${rowClass}">
				<td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
        <td class="prize-cell">${renderPrizeBadgeCell(prizeBadge, rank, prizeLabel)}</td>
        <td><a class="mini-link" href="player.html?id=${encodeURIComponent(player.playerID || "")}">${username}</a></td>
				<td>${medallions}</td>
			</tr>
		`;
    })
    .join("");

  if (currentCountry !== "GLOBAL") {
    enhanceRegionalPrizeBadges();
  }
}

function renderPrestigeRows(players) {
  if (!Array.isArray(players) || players.length === 0) {
    prestigeLeaderboardBody.innerHTML =
      "<tr><td colspan='4'>No prestige leaderboard entries found.</td></tr>";
    return;
  }

  prestigeLeaderboardBody.innerHTML = players
    .map((player, index) => {
      const rank = Number(player.rank) || 0;
      const username = escapeHtml(player.username || "-");
      const prestige = formatNumber(player.prestige);
      const prizeBadge = prizeBadgeForPrestige(rank);
      const rowClass = rowColorClass(index, rank, true);

      return `
			<tr class="${rowClass}">
				<td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
        <td class="prize-cell">${renderPrizeBadgeCell(prizeBadge, rank, "Prestige Prize")}</td>
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
      "<tr><td colspan='4'>Failed to load leaderboard.</td></tr>";
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
      "<tr><td colspan='4'>Failed to load prestige leaderboard.</td></tr>";
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
