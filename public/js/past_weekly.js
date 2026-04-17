const weekInput = document.getElementById("weekInput");
const loadWeekBtn = document.getElementById("loadWeekBtn");
const refreshWeekBtn = document.getElementById("refreshWeekBtn");
const openPastWeekly = document.getElementById("openPastWeekly");
const openPastPrestige = document.getElementById("openPastPrestige");
const openPastClans = document.getElementById("openPastClans");
const pastMeta = document.getElementById("pastMeta");
const pastError = document.getElementById("pastError");
const pastBody = document.getElementById("pastBody");
const pastWeekInfo = document.getElementById("pastWeekInfo");

const WEEKLY_RESET_BASE = new Date("2015-12-16T14:00:00+04:00").getTime();
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const LIVE_WEEK_NUMBER = 569;
const WEEKLY_MODE_ROTATION = [
  "R3 Speed Bananza ZOMG",
  "Speed Bananza ZOMG",
  "Speed Bananza Boosts Only",
  "Speed With Fire ZOMG",
];
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

function pad2(value) {
  return String(Math.max(0, Number(value) || 0)).padStart(2, "0");
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

  const index = (week - 1) % WEEKLY_MODE_ROTATION.length;
  return WEEKLY_MODE_ROTATION[index] || "";
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
  const offsetWeeks = LIVE_WEEK_NUMBER - week;
  const end = new Date(currentWeekEnd.getTime() - offsetWeeks * WEEK_MS);
  const start = new Date(end.getTime() - WEEK_MS);

  return { start, end };
}

function updateWeekInfoText(weekNumber, weekName) {
  if (!pastWeekInfo) {
    return;
  }

  const period = getWeekPeriodByNumber(weekNumber);
  const modeName = weekName || getWeeklyModeName(weekNumber) || "-";
  if (!period) {
    pastWeekInfo.textContent = `( ${modeName} )`;
    return;
  }

  const range = formatWeeklyRange(period.start, period.end);
  pastWeekInfo.textContent = `${range}\n( ${modeName} )`;
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
    openPastClans.href = `past_clan_overall.html?week=${encodeURIComponent(week)}`;
  }
}

function renderRows(players) {
  if (!Array.isArray(players) || players.length === 0) {
    pastBody.innerHTML =
      "<tr><td colspan='4'>No weekly data found for this week.</td></tr>";
    return;
  }

  pastBody.innerHTML = players
    .map((player, index) => {
      const rank = Number(player.rank) || 0;
      const username = escapeHtml(player.username || "-");
      const medallions = formatNumber(player.medallions);
      const prizeBadge = prizeBadgeForWeekly(rank);
      const rowClass = rowColorClass(index, rank);

      return `
      <tr class="${rowClass}">
        <td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
        <td class="prize-cell">${renderPrizeBadgeCell(prizeBadge, rank)}</td>
        <td><a class="mini-link" href="player.html?id=${encodeURIComponent(player.playerID || "")}">${username}</a></td>
        <td>${medallions}</td>
      </tr>
    `;
    })
    .join("");
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
    if (pastMeta) {
      pastMeta.textContent = "";
    }
  } catch (error) {
    updateWeekInfoText(week, "");
    if (pastMeta) {
      pastMeta.textContent = "";
    }
    pastError.textContent = error.message;
    pastError.hidden = false;
    pastBody.innerHTML =
      "<tr><td colspan='4'>Failed to load weekly leaderboard.</td></tr>";
  }
}

if (loadWeekBtn) {
  loadWeekBtn.addEventListener("click", () => loadWeekly(false));
}

if (refreshWeekBtn) {
  refreshWeekBtn.addEventListener("click", () => loadWeekly(true));
}

if (weekInput) {
  weekInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadWeekly(false);
    }
  });

  const initialWeek =
    sanitiseWeek(queryParam("week")) || sanitiseWeek(weekInput.value) || 569;
  weekInput.value = String(initialWeek);
  updateWeekInfoText(initialWeek, "");
}

loadWeekly(false);
