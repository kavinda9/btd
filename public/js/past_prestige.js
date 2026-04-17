const weekInput = document.getElementById("weekInput");
const loadWeekBtn = document.getElementById("loadWeekBtn");
const refreshWeekBtn = document.getElementById("refreshWeekBtn");
const openPastWeekly = document.getElementById("openPastWeekly");
const openPastPrestige = document.getElementById("openPastPrestige");
const openPastClans = document.getElementById("openPastClans");
const pastMeta = document.getElementById("pastMeta");
const pastError = document.getElementById("pastError");
const pastBody = document.getElementById("pastBody");

function rankClass(rank) {
  if (rank === 1) return "rank-pill rank-1";
  if (rank === 2) return "rank-pill rank-2";
  if (rank === 3) return "rank-pill rank-3";
  return "rank-pill";
}

function rowColorClass(index, rank) {
  return index % 2 === 0 ? "lb-row-alt-a" : "lb-row-alt-b";
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

  pastMeta.textContent = "Loading prestige leaderboard...";

  try {
    const data = await apiGet(`past_prestige.php?${params.toString()}`);
    renderRows(data.players || []);
    pastMeta.textContent = `Week: ${formatNumber(data.week)} | Season: ${formatNumber(data.season)} | Entries: ${formatNumber(data.count)} | Cached: ${data.cached ? "Yes" : "No"}`;
  } catch (error) {
    pastMeta.textContent = "";
    pastError.textContent = error.message;
    pastError.hidden = false;
    pastBody.innerHTML =
      "<tr><td colspan='4'>Failed to load prestige leaderboard.</td></tr>";
  }
}

if (loadWeekBtn) {
  loadWeekBtn.addEventListener("click", () => loadPrestige(false));
}

if (refreshWeekBtn) {
  refreshWeekBtn.addEventListener("click", () => loadPrestige(true));
}

if (weekInput) {
  weekInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadPrestige(false);
    }
  });

  const initialWeek =
    sanitiseWeek(queryParam("week")) || sanitiseWeek(weekInput.value) || 569;
  weekInput.value = String(initialWeek);
}

loadPrestige(false);
