const leaderboardBody = document.getElementById("leaderboardBody");
const leaderboardMeta = document.getElementById("leaderboardMeta");
const leaderboardError = document.getElementById("leaderboardError");
const globalViewBtn = document.getElementById("globalViewBtn");
const prestigeViewBtn = document.getElementById("prestigeViewBtn");
const regionViewBtn = document.getElementById("regionViewBtn");
const weeklySection = document.getElementById("weeklySection");
const prestigeSection = document.getElementById("prestigeSection");
const regionModal = document.getElementById("regionModal");
const regionModalClose = document.getElementById("regionModalClose");
const regionFlagsGrid = document.getElementById("regionFlagsGrid");
const leaderboardWeekInfo = document.getElementById("leaderboardWeekInfo");
const weeklyPageEyebrow = document.querySelector(".page-head .eyebrow");
const weeklyPageTitle = document.querySelector(".page-head h1");
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
const leaderboardTimer = document.getElementById("leaderboardTimer");

const WEEKLY_RESET_BASE = new Date("2015-12-16T14:00:00+04:00").getTime();
const PRESTIGE_RESET_BASE = Date.UTC(2017, 1, 15, 10, 0, 0);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const BIWEEK_MS = 14 * 24 * 60 * 60 * 1000;
const LIVE_WEEK_NUMBER = 569;
const WEEKLY_NEW_MODE_ROTATION = [
  "R3 Speed Bananza ZOMG",
  "Speed Bananza ZOMG",
  "Speed Bananza Boosts Only",
  "Speed With Fire ZOMG",
];
const WEEKLY_OLD_MODE_ROTATION = [
  "Speed With Fire Cards",
  "Speed With Fire",
  "Speed Bananza",
  "Speed Mega Boost Cards",
];
const OLD_ROTATION_ANCHOR_WEEK = 419;
const NEW_ROTATION_START_WEEK = 423;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKLY_ARENA_IMAGE_FILES = {
  r3speedbananzazomg: "4.png",
  speedbananzazomg: "1.png",
  speedbananzaboostsonly: "2.png",
  speedwithfirezomg: "5.png",
  speedwithfirecards: "3.png",
  speedwithfire: "5.png",
  speedbananza: "1.png",
  speedmegaboostcards: "6.png",
};

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

const COUNTRY_NAME_BY_CODE = {
  AR: "Argentina",
  AU: "Australia",
  AT: "Austria",
  BE: "Belgium",
  BR: "Brazil",
  BG: "Bulgaria",
  CA: "Canada",
  CL: "Chile",
  CN: "China",
  CO: "Colombia",
  HR: "Croatia",
  CZ: "Czech Republic",
  DK: "Denmark",
  EE: "Estonia",
  FI: "Finland",
  FR: "France",
  DE: "Germany",
  GR: "Greece",
  HK: "Hong Kong",
  HU: "Hungary",
  IN: "India",
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
  NZ: "New Zealand",
  NO: "Norway",
  PH: "Philippines",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  RU: "Russia",
  SA: "Saudi Arabia",
  SG: "Singapore",
  SI: "Slovenia",
  ZA: "South Africa",
  KR: "South Korea",
  ES: "Spain",
  SE: "Sweden",
  CH: "Switzerland",
  TW: "Taiwan",
  TH: "Thailand",
  TR: "Turkey",
  UA: "Ukraine",
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  US: "United States",
  VN: "Vietnam",
};

const allowedCountries = new Set([
  "GLOBAL",
  ...COUNTRY_OPTIONS.map((c) => c.code),
]);

let currentView = "global";
let currentCountry = "GLOBAL";
let currentWeeklyRotationLabel = "";
let currentWeeklyNumber = null;
const globalNameFlagCountryCache = new Map();
const globalNameFlagPending = new Map();

function padTimerValue(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function normalizeModeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getWeeklyModeName(weekNumber) {
  const week = Number(weekNumber);
  if (!Number.isFinite(week) || week <= 0) {
    return "";
  }

  if (week >= NEW_ROTATION_START_WEEK) {
    const index = (week - 1) % WEEKLY_NEW_MODE_ROTATION.length;
    return WEEKLY_NEW_MODE_ROTATION[index] || "";
  }

  const size = WEEKLY_OLD_MODE_ROTATION.length;
  const index = (((week - OLD_ROTATION_ANCHOR_WEEK) % size) + size) % size;
  return WEEKLY_OLD_MODE_ROTATION[index] || "";
}

function getWeeklyArenaImageFile(weekNumber, weekName) {
  const resolvedName = weekName || getWeeklyModeName(weekNumber);
  const key = normalizeModeName(resolvedName);
  return WEEKLY_ARENA_IMAGE_FILES[key] || "";
}

function renderWeekInfoCard(weekNumber, weekName, currentWeekEnd) {
  const period = getWeekPeriodByNumber(weekNumber, currentWeekEnd);
  const modeName = weekName || getWeeklyModeName(weekNumber) || "-";
  const dateRange = period ? formatWeeklyRange(period.start, period.end) : "";
  const imageFile = getWeeklyArenaImageFile(weekNumber, modeName);
  const imageSrc = imageFile
    ? `images/arenas/${encodeURIComponent(imageFile)}`
    : "";

  return `
    ${
      imageSrc
        ? `
      <span class="week-info-image-wrap">
        <img class="week-info-image" src="${imageSrc}" alt="${escapeHtml(modeName)} arena" loading="lazy" decoding="async" />
      </span>
    `
        : ""
    }
    <span class="week-info-copy">
      ${dateRange ? `<span class="week-info-date">${escapeHtml(dateRange)}</span>` : ""}
      <span class="week-info-mode">( ${escapeHtml(modeName)} )</span>
    </span>
  `;
}

function formatWeeklyRange(startDate, endDate) {
  const startYear = startDate.getUTCFullYear();
  const endYear = endDate.getUTCFullYear();
  const startMonthName = MONTH_NAMES[startDate.getUTCMonth()];
  const endMonthName = MONTH_NAMES[endDate.getUTCMonth()];
  const startDay = padTimerValue(startDate.getUTCDate());
  const endDay = padTimerValue(endDate.getUTCDate());

  if (startYear === endYear && startMonthName === endMonthName) {
    return `${startYear} ${startMonthName} ${startDay} - ${endDay}`;
  }

  if (startYear === endYear) {
    return `${startYear} ${startMonthName} ${startDay} - ${endMonthName} ${endDay}`;
  }

  return `${startYear} ${startMonthName} ${startDay} - ${endYear} ${endMonthName} ${endDay}`;
}

function getWeekPeriodByNumber(weekNumber, currentWeekEnd) {
  const week = Number(weekNumber);
  if (
    !Number.isFinite(week) ||
    week <= 0 ||
    !(currentWeekEnd instanceof Date)
  ) {
    return null;
  }

  const offsetWeeks = LIVE_WEEK_NUMBER - week;
  const end = new Date(currentWeekEnd.getTime() - offsetWeeks * WEEK_MS);
  const start = new Date(end.getTime() - WEEK_MS);

  return { start, end };
}

function getNextResetTime(mode) {
  const now = Date.now();

  if (mode === "prestige") {
    const cycles = Math.ceil((now - PRESTIGE_RESET_BASE) / BIWEEK_MS);
    return new Date(PRESTIGE_RESET_BASE + cycles * BIWEEK_MS);
  }

  const cycles = Math.ceil((now - WEEKLY_RESET_BASE) / WEEK_MS);
  return new Date(WEEKLY_RESET_BASE + cycles * WEEK_MS);
}

function formatTimerCountdown(endTime) {
  const diff = Math.max(0, endTime.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${padTimerValue(days)}:${padTimerValue(hours)}:${padTimerValue(minutes)}:${padTimerValue(seconds)}`;
}

function updateLeaderboardTimer() {
  if (!leaderboardTimer) {
    return;
  }

  const mode = currentView === "prestige" ? "prestige" : "weekly";
  const endTime = getNextResetTime(mode);
  const showWeeklyLabel =
    currentView === "global" &&
    currentCountry === "GLOBAL" &&
    currentWeeklyRotationLabel &&
    Number.isFinite(Number(currentWeeklyNumber));

  if (leaderboardWeekInfo) {
    leaderboardWeekInfo.hidden = !showWeeklyLabel;
  }

  if (!showWeeklyLabel) {
    leaderboardTimer.textContent = `Ends in: ${formatTimerCountdown(endTime)}`;
    if (leaderboardWeekInfo) {
      leaderboardWeekInfo.innerHTML = "";
    }
    return;
  }

  leaderboardTimer.textContent = `Ends in: ${formatTimerCountdown(endTime)}`;
  if (leaderboardWeekInfo) {
    leaderboardWeekInfo.innerHTML = renderWeekInfoCard(
      currentWeeklyNumber,
      currentWeeklyRotationLabel,
      endTime,
    );
  }
}

setInterval(updateLeaderboardTimer, 1000);

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

function getCountryDisplayName(countryCode) {
  const code = String(countryCode || "")
    .trim()
    .toUpperCase();

  if (!code || code === "GLOBAL") {
    return "Global";
  }

  return COUNTRY_NAME_BY_CODE[code] || code;
}

function updateWeeklyHeading() {
  if (!weeklyPageEyebrow || !weeklyPageTitle) {
    return;
  }

  if (currentView === "region" && currentCountry !== "GLOBAL") {
    weeklyPageEyebrow.hidden = true;
    weeklyPageTitle.textContent = `Leaderboard (${getCountryDisplayName(currentCountry)})`;
    return;
  }

  weeklyPageEyebrow.hidden = false;
  weeklyPageEyebrow.textContent = "Weekly Medallions";
  weeklyPageTitle.textContent = "Leaderboard";
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

  updateWeeklyHeading();
  updateStateQuery();
  updateLeaderboardTimer();
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

function prestigeRowColorClass(rank) {
  return rank % 2 === 1 ? "lb-row-prestige-odd" : "lb-row-prestige-even";
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

function normalizeCountryCode(value) {
  const code = String(value || "")
    .trim()
    .toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

async function fetchGlobalCountryCode(playerID) {
  const id = String(playerID || "").trim();
  if (!id) {
    return null;
  }

  if (globalNameFlagCountryCache.has(id)) {
    return globalNameFlagCountryCache.get(id);
  }

  if (globalNameFlagPending.has(id)) {
    return globalNameFlagPending.get(id);
  }

  const request = (async () => {
    try {
      const data = await apiGet(`player.php?id=${encodeURIComponent(id)}`);
      const code = normalizeCountryCode(data?.profile?.countryCode);
      globalNameFlagCountryCache.set(id, code);
      return code;
    } catch (_) {
      globalNameFlagCountryCache.set(id, null);
      return null;
    } finally {
      globalNameFlagPending.delete(id);
    }
  })();

  globalNameFlagPending.set(id, request);
  return request;
}

async function hydrateGlobalNameFlags() {
  if (currentCountry !== "GLOBAL") {
    return;
  }

  const nodes = Array.from(document.querySelectorAll(".js-global-name-flag"));
  if (!nodes.length) {
    return;
  }

  const concurrency = 8;
  for (let i = 0; i < nodes.length; i += concurrency) {
    const batch = nodes.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (node) => {
        const playerID = node.getAttribute("data-player-id") || "";
        const code = await fetchGlobalCountryCode(playerID);
        if (!code || currentCountry !== "GLOBAL") {
          return;
        }

        node.src = `images/Country%20Flags/${encodeURIComponent(code)}.png`;
        node.alt = code;
        node.style.display = "";
        node.classList.remove("js-global-name-flag");
      }),
    );
  }
}

function renderRows(players) {
  if (!Array.isArray(players) || players.length === 0) {
    leaderboardBody.innerHTML =
      "<tr><td colspan='5'>No leaderboard entries found.</td></tr>";
    return;
  }

  leaderboardBody.innerHTML = players
    .map((player, index) => {
      const rank = Number(player.rank) || 0;
      const username = escapeHtml(player.username || "-");
      const countryCode = String(player.countryCode || "")
        .trim()
        .toUpperCase();
      const showNameFlag =
        currentCountry === "GLOBAL" && /^[A-Z]{2}$/.test(countryCode);
      const needsAsyncFlag =
        currentCountry === "GLOBAL" && !showNameFlag && !!player.playerID;
      const countryFlagHtml = showNameFlag
        ? `<img class="name-flag-image" src="images/Country%20Flags/${encodeURIComponent(countryCode)}.png" alt="${escapeHtml(countryCode)}" loading="lazy" onerror="this.style.display='none'" />`
        : needsAsyncFlag
          ? `<img class="name-flag-image js-global-name-flag" data-player-id="${escapeHtml(player.playerID || "")}" src="" alt="" loading="lazy" style="display:none" onerror="this.style.display='none'" />`
          : "";
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
        <td class="country-flag-cell">${countryFlagHtml}</td>
        <td><a class="mini-link" href="player.html?id=${encodeURIComponent(player.playerID || "")}">${username}</a></td>
				<td>${medallions}</td>
			</tr>
		`;
    })
    .join("");

  if (currentCountry !== "GLOBAL") {
    enhanceRegionalPrizeBadges();
    return;
  }

  hydrateGlobalNameFlags().catch(() => {
    // Leave names without flags if country lookup fails.
  });
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
      const rowClass = prestigeRowColorClass(rank || index + 1);

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
  leaderboardMeta.textContent = "";
  updateLeaderboardTimer();

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
    if (country === "GLOBAL") {
      const weekNumber = Number(data.weekNumber);
      currentWeeklyNumber = Number.isFinite(weekNumber) ? weekNumber : null;
      currentWeeklyRotationLabel =
        data.weekName || getWeeklyModeName(currentWeeklyNumber) || "";
    } else {
      currentWeeklyRotationLabel = "";
      currentWeeklyNumber = null;
    }

    updateLeaderboardTimer();
    renderRows(players);
    leaderboardMeta.textContent = "";
  } catch (error) {
    currentWeeklyRotationLabel = "";
    currentWeeklyNumber = null;
    updateLeaderboardTimer();
    leaderboardBody.innerHTML =
      "<tr><td colspan='5'>Failed to load leaderboard.</td></tr>";
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
  prestigeLeaderboardMeta.textContent = "";
  updateLeaderboardTimer();

  const path = forceRefresh
    ? "prestige_leaderboard.php?refresh=1"
    : "prestige_leaderboard.php";

  try {
    const data = await apiGet(path);
    renderPrestigeRows(data.players || []);
    prestigeLeaderboardMeta.textContent = "";
  } catch (error) {
    prestigeLeaderboardBody.innerHTML =
      "<tr><td colspan='4'>Failed to load prestige leaderboard.</td></tr>";
    prestigeLeaderboardMeta.textContent = "";
    prestigeLeaderboardError.textContent = error.message;
    prestigeLeaderboardError.hidden = false;
  }
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
