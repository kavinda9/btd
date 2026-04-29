const weekInput = document.getElementById("weekInput");
const loadWeekBtn = document.getElementById("loadWeekBtn");
const openPastWeekly = document.getElementById("openPastWeekly");
const openPastPrestige = document.getElementById("openPastPrestige");
const openPastClans = document.getElementById("openPastClans");
const pastError = document.getElementById("pastError");
const pastBody = document.getElementById("pastBody");
const pastWeekInfo = document.getElementById("pastWeekInfo");
const pastWeeklyCountryCache = new Map();
const pastWeeklyCountryPending = new Map();

const WEEKLY_RESET_BASE = new Date("2015-12-16T14:00:00+04:00").getTime();
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
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

function pad2(value) {
  return String(Math.max(0, Number(value) || 0)).padStart(2, "0");
}

function normalizeModeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getNextWeeklyResetTime() {
  const now = Date.now();
  const cycles = Math.ceil((now - WEEKLY_RESET_BASE) / WEEK_MS);
  return new Date(WEEKLY_RESET_BASE + cycles * WEEK_MS);
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

function renderWeekInfoCard(weekNumber, weekName) {
  const period = getWeekPeriodByNumber(weekNumber);
  const modeName = weekName || getWeeklyModeName(weekNumber) || "-";
  const range = period ? formatWeeklyRange(period.start, period.end) : "";
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
      ${range ? `<span class="week-info-date">${escapeHtml(range)}</span>` : ""}
      <span class="week-info-mode">( ${escapeHtml(modeName)} )</span>
    </span>
  `;
}

function formatWeeklyRange(startDate, endDate) {
  const startYear = startDate.getUTCFullYear();
  const endYear = endDate.getUTCFullYear();
  const startMonthName = MONTH_NAMES[startDate.getUTCMonth()];
  const endMonthName = MONTH_NAMES[endDate.getUTCMonth()];
  const startDay = pad2(startDate.getUTCDate());
  const endDay = pad2(endDate.getUTCDate());

  if (startYear === endYear && startMonthName === endMonthName) {
    return `${startYear} ${startMonthName} ${startDay} - ${endDay}`;
  }

  if (startYear === endYear) {
    return `${startYear} ${startMonthName} ${startDay} - ${endMonthName} ${endDay}`;
  }

  return `${startYear} ${startMonthName} ${startDay} - ${endYear} ${endMonthName} ${endDay}`;
}

function getWeekPeriodByNumber(weekNumber) {
  const week = Number(weekNumber);
  if (!Number.isFinite(week) || week <= 0) {
    return null;
  }

  const currentWeekEnd = getNextWeeklyResetTime();
  const offsetWeeks = getCurrentWeekNumber() - week;
  const end = new Date(currentWeekEnd.getTime() - offsetWeeks * WEEK_MS);
  const start = new Date(end.getTime() - WEEK_MS);

  return { start, end };
}

function updateWeekInfoText(weekNumber, weekName) {
  if (!pastWeekInfo) {
    return;
  }

  pastWeekInfo.innerHTML = renderWeekInfoCard(weekNumber, weekName);
}

function rankClass(rank) {
  if (rank === 1) return "rank-pill rank-1";
  if (rank === 2) return "rank-pill rank-2";
  if (rank === 3) return "rank-pill rank-3";
  return "rank-pill";
}

function rowColorClass(index, rank) {
  return index % 2 === 0 ? "lb-row-alt-a" : "lb-row-alt-b";
}

function prizeBadgeForWeekly(rank) {
  if (rank === 1) return "black_diamond";
  if (rank === 2) return "red_diamond";
  if (rank === 3) return "diamond";
  if (rank <= 100) return "gold";
  if (rank <= 1000) return "silvergold";
  if (rank <= 10000) return "silverx2";
  return "silverx1";
}

function renderPrizeBadgeCell(fileName, rank) {
  if (!fileName) {
    return "<span class='muted'>-</span>";
  }

  const src = `images/badges/${encodeURIComponent(fileName)}.png`;
  const alt = `Weekly Prize T${formatNumber(rank)}`;
  return `<img class="prize-badge" src="${src}" alt="${escapeHtml(alt)}" title="${escapeHtml(alt)}" loading="lazy" />`;
}

function normalizeCountryCode(value) {
  const code = String(value || "")
    .trim()
    .toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

async function fetchPastWeeklyCountryCode(playerID) {
  const id = String(playerID || "").trim();
  if (!id) {
    return null;
  }

  if (pastWeeklyCountryCache.has(id)) {
    return pastWeeklyCountryCache.get(id);
  }

  if (pastWeeklyCountryPending.has(id)) {
    return pastWeeklyCountryPending.get(id);
  }

  const request = (async () => {
    try {
      const data = await apiGet(`player.php?id=${encodeURIComponent(id)}`);
      const code = normalizeCountryCode(data?.profile?.countryCode);
      pastWeeklyCountryCache.set(id, code);
      return code;
    } catch (_) {
      pastWeeklyCountryCache.set(id, null);
      return null;
    } finally {
      pastWeeklyCountryPending.delete(id);
    }
  })();

  pastWeeklyCountryPending.set(id, request);
  return request;
}

async function hydratePastWeeklyFlags() {
  const nodes = Array.from(document.querySelectorAll(".js-past-weekly-flag"));
  if (!nodes.length) {
    return;
  }

  const concurrency = 8;
  for (let i = 0; i < nodes.length; i += concurrency) {
    const batch = nodes.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (node) => {
        const playerID = node.getAttribute("data-player-id") || "";
        const code = await fetchPastWeeklyCountryCode(playerID);
        if (!code) {
          return;
        }

        node.src = `images/Country%20Flags/${encodeURIComponent(code)}.png`;
        node.alt = code;
        node.style.display = "";
        node.classList.remove("js-past-weekly-flag");
      }),
    );
  }
}

function sanitiseWeek(value) {
  const week = Number.parseInt(String(value || "").trim(), 10);
  if (!Number.isFinite(week) || week <= 0) {
    return null;
  }
  return week;
}

function updateWeekQuery(week) {
  const url = new URL(window.location.href);
  url.searchParams.set("week", String(week));
  window.history.replaceState({}, "", url);
}

function applyWeekLinks(week) {
  if (openPastWeekly) {
    openPastWeekly.href = `past_weekly.html?week=${encodeURIComponent(week)}`;
  }
  if (openPastPrestige) {
    openPastPrestige.href = `past_prestige.html?week=${encodeURIComponent(week)}`;
  }
  if (openPastClans) {
    openPastClans.href = `past_clan_overall.html?v=20260419c&week=${encodeURIComponent(week)}`;
  }
}

function renderRows(players) {
  if (!Array.isArray(players) || players.length === 0) {
    pastBody.innerHTML =
      "<tr><td colspan='5'>No weekly data found for this week.</td></tr>";
    return;
  }

  pastBody.innerHTML = players
    .map((player, index) => {
      const rank = Number(player.rank) || 0;
      const username = escapeHtml(player.username || "-");
      const countryCode = normalizeCountryCode(player.countryCode);
      const flagHtml = countryCode
        ? `<img class="name-flag-image" src="images/Country%20Flags/${encodeURIComponent(countryCode)}.png" alt="${escapeHtml(countryCode)}" loading="lazy" onerror="this.style.display='none'" />`
        : player.playerID
          ? `<img class="name-flag-image js-past-weekly-flag" data-player-id="${escapeHtml(player.playerID || "")}" src="" alt="" loading="lazy" style="display:none" onerror="this.style.display='none'" />`
          : "";
      const medallions = formatNumber(player.medallions);
      const prizeBadge = prizeBadgeForWeekly(rank);
      const rowClass = rowColorClass(index, rank);

      return `
      <tr class="${rowClass}">
        <td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
        <td class="prize-cell">${renderPrizeBadgeCell(prizeBadge, rank)}</td>
        <td class="country-flag-cell">${flagHtml}</td>
        <td><a class="mini-link" href="player.html?id=${encodeURIComponent(player.playerID || "")}">${username}</a></td>
        <td>${medallions}</td>
      </tr>
    `;
    })
    .join("");

  hydratePastWeeklyFlags().catch(() => {
    // Keep flag cell empty if country lookup fails.
  });
}

async function loadWeekly(forceRefresh = false) {
  pastError.hidden = true;

  const week = sanitiseWeek(weekInput?.value);
  if (!week) {
    pastError.textContent = "Please enter a valid week number.";
    pastError.hidden = false;
    return;
  }

  weekInput.value = String(week);
  applyWeekLinks(week);
  updateWeekQuery(week);

  const params = new URLSearchParams({ week: String(week) });
  if (forceRefresh) {
    params.set("refresh", "1");
  }

  updateWeekInfoText(week, "");

  try {
    const data = await apiGet(`past_weekly.php?${params.toString()}`);
    renderRows(data.players || []);
    updateWeekInfoText(data.week || week, data.weekName || "");
  } catch (error) {
    updateWeekInfoText(week, "");
    pastError.textContent = error.message;
    pastError.hidden = false;
    pastBody.innerHTML =
      "<tr><td colspan='5'>Failed to load weekly leaderboard.</td></tr>";
  }
}

if (loadWeekBtn) {
  loadWeekBtn.addEventListener("click", () => loadWeekly(false));
}

if (weekInput) {
  weekInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadWeekly(false);
    }
  });

  const initialWeek =
    sanitiseWeek(queryParam("week")) ||
    sanitiseWeek(weekInput.value) ||
    getCurrentWeekNumber();
  weekInput.value = String(initialWeek);
  updateWeekInfoText(initialWeek, "");
}

loadWeekly(false);
