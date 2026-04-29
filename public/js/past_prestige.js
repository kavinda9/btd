const weekInput = document.getElementById("weekInput");
const loadWeekBtn = document.getElementById("loadWeekBtn");
const openPastWeekly = document.getElementById("openPastWeekly");
const openPastPrestige = document.getElementById("openPastPrestige");
const openPastClans = document.getElementById("openPastClans");
const pastMeta = document.getElementById("pastMeta");
const pastError = document.getElementById("pastError");
const pastBody = document.getElementById("pastBody");

const WEEK_SECONDS = 7 * 24 * 60 * 60;
const BIWEEK_SECONDS = 14 * 24 * 60 * 60;
const WEEKLY_RESET_BASE = new Date("2015-12-16T14:00:00+04:00").getTime();
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
function getNextWeeklyResetTime() {
  const now = Date.now();
  const cycles = Math.ceil((now - WEEKLY_RESET_BASE) / (WEEK_SECONDS * 1000));
  return new Date(WEEKLY_RESET_BASE + cycles * WEEK_SECONDS * 1000);
}

function padDay(value) {
  return String(Math.max(0, Number(value) || 0)).padStart(2, "0");
}

function formatPrestigeRange(startDate, endDate) {
  const startYear = startDate.getUTCFullYear();
  const endYear = endDate.getUTCFullYear();
  const startMonthName = MONTH_NAMES[startDate.getUTCMonth()];
  const endMonthName = MONTH_NAMES[endDate.getUTCMonth()];
  const startDay = padDay(startDate.getUTCDate());
  const endDay = padDay(endDate.getUTCDate());

  if (startYear === endYear && startMonthName === endMonthName) {
    return `${startYear} ${startMonthName} ${startDay} - ${endDay}`;
  }

  if (startYear === endYear) {
    return `${startYear} ${startMonthName} ${startDay} - ${endMonthName} ${endDay}`;
  }

  return `${startYear} ${startMonthName} ${startDay} - ${endYear} ${endMonthName} ${endDay}`;
}

function getPrestigePeriodByNumber(weekNumber) {
  const week = Number(weekNumber);
  if (!Number.isFinite(week) || week <= 0) {
    return null;
  }

  const currentWeekEnd = getNextWeeklyResetTime();
  const offsetWeeks = getCurrentWeekNumber() - week;
  // Prestige window starts one weekly cycle before the selected week's weekly window.
  const start = new Date(
    currentWeekEnd.getTime() - (offsetWeeks + 2) * WEEK_SECONDS * 1000,
  );
  const end = new Date(start.getTime() + BIWEEK_SECONDS * 1000);

  return { start, end };
}

function getPrestigeWeekLabel(weekNumber) {
  const period = getPrestigePeriodByNumber(weekNumber);
  return period ? formatPrestigeRange(period.start, period.end) : "";
}

function getPrestigeMetaText(weekNumber) {
  const range = getPrestigeWeekLabel(weekNumber);
  if (!range) {
    return "";
  }

  return `${range} prestige leaderboard show for week ${formatNumber(weekNumber)}.`;
}

function rankClass(rank) {
  if (rank === 1) return "rank-pill rank-1";
  if (rank === 2) return "rank-pill rank-2";
  if (rank === 3) return "rank-pill rank-3";
  return "rank-pill";
}

function rowColorClass(index, rank) {
  const resolvedRank = rank || index + 1;
  return resolvedRank % 2 === 1
    ? "lb-row-prestige-odd"
    : "lb-row-prestige-even";
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

function renderPrizeBadgeCell(fileName, rank) {
  if (!fileName) {
    return "<span class='muted'>-</span>";
  }

  const src = `images/badges/${encodeURIComponent(fileName)}.png`;
  const alt = `Prestige Prize T${formatNumber(rank)}`;
  return `<img class="prize-badge" src="${src}" alt="${escapeHtml(alt)}" title="${escapeHtml(alt)}" loading="lazy" />`;
}

function sanitiseWeek(value) {
  const week = Number.parseInt(String(value || "").trim(), 10);
  if (!Number.isFinite(week) || week <= 0) {
    return null;
  }
  return week;
}

function resolvePrestigeWeek(week) {
  const value = Number(week);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value % 2 === 0 ? value : value - 1;
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

function updatePastMeta(week, weekRange) {
  if (!pastMeta) {
    return;
  }

  if (!weekRange) {
    pastMeta.hidden = true;
    pastMeta.textContent = "";
    return;
  }

  pastMeta.hidden = false;
  pastMeta.textContent = weekRange;
}

function renderRows(players) {
  if (!Array.isArray(players) || players.length === 0) {
    pastBody.innerHTML =
      "<tr><td colspan='4'>No prestige data found for this week.</td></tr>";
    return;
  }

  pastBody.innerHTML = players
    .map((player, index) => {
      const rank = Number(player.rank) || 0;
      const username = escapeHtml(player.username || "-");
      const prestige = formatNumber(player.prestige);
      const prizeBadge = prizeBadgeForPrestige(rank);
      const rowClass = rowColorClass(index, rank);

      return `
      <tr class="${rowClass}">
        <td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
        <td class="prize-cell">${renderPrizeBadgeCell(prizeBadge, rank)}</td>
        <td><a class="mini-link" href="player.html?id=${encodeURIComponent(player.playerID || "")}">${username}</a></td>
        <td><span class="prestige-score">${prestige}</span></td>
      </tr>
    `;
    })
    .join("");
}

async function loadPrestige(forceRefresh = false) {
  pastError.hidden = true;

  const requestedWeek = sanitiseWeek(weekInput?.value);
  if (!requestedWeek) {
    pastError.textContent = "Please enter a valid week number.";
    pastError.hidden = false;
    return;
  }

  const week = resolvePrestigeWeek(requestedWeek);
  if (!week) {
    pastError.textContent = "Please enter a valid prestige week number.";
    pastError.hidden = false;
    return;
  }

  if (requestedWeek !== week) {
    const resolvedDate = getPrestigeWeekLabel(week);
    const baseMessage = `Prestige leaderboard is available only for even weeks. Showing week ${formatNumber(week)}.`;
    pastError.textContent = resolvedDate
      ? `${baseMessage} Date: ${resolvedDate}.`
      : baseMessage;
    pastError.hidden = false;
  }

  weekInput.value = String(week);
  applyWeekLinks(week);
  updateWeekQuery(week);

  const params = new URLSearchParams({ week: String(week) });
  if (forceRefresh) {
    params.set("refresh", "1");
  }

  try {
    const data = await apiGet(`past_prestige.php?${params.toString()}`);
    renderRows(data.players || []);
    const resolvedMeta = getPrestigeMetaText(week) || data.weekRange || "";
    updatePastMeta(week, resolvedMeta);
  } catch (error) {
    updatePastMeta(week, getPrestigeMetaText(week));
    pastError.textContent = error.message;
    pastError.hidden = false;
    pastBody.innerHTML =
      "<tr><td colspan='4'>Failed to load prestige leaderboard.</td></tr>";
  }
}

if (loadWeekBtn) {
  loadWeekBtn.addEventListener("click", () => loadPrestige(false));
}

if (weekInput) {
  weekInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadPrestige(false);
    }
  });

  const initialWeek =
    sanitiseWeek(queryParam("week")) ||
    sanitiseWeek(weekInput.value) ||
    getCurrentWeekNumber();
  weekInput.value = String(initialWeek);
}

loadPrestige(false);
