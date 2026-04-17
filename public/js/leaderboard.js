const leaderboardBody = document.getElementById("leaderboardBody");
const leaderboardMeta = document.getElementById("leaderboardMeta");
const leaderboardError = document.getElementById("leaderboardError");
const refreshBtn = document.getElementById("refreshBtn");
const countryFilter = document.getElementById("countryFilter");
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

const allowedCountries = new Set(["GLOBAL", "GB", "US", "SA"]);

function getSelectedCountry() {
  const raw = (countryFilter?.value || queryParam("country") || "GLOBAL")
    .toString()
    .trim()
    .toUpperCase();
  return allowedCountries.has(raw) ? raw : "GLOBAL";
}

function updateCountryQuery(country) {
  const url = new URL(window.location.href);
  if (country === "GLOBAL") {
    url.searchParams.delete("country");
  } else {
    url.searchParams.set("country", country);
  }
  window.history.replaceState({}, "", url);
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
      "<tr><td colspan='6'>No leaderboard entries found.</td></tr>";
    return;
  }

  leaderboardBody.innerHTML = players
    .map((player) => {
      const rank = Number(player.rank) || 0;
      const playerID = escapeHtml(player.playerID || "Unknown");
      const username = escapeHtml(player.username || "-");
      const medallions = formatNumber(player.medallions);
      const prestige = formatNumber(player.prestige);
      const prestigeRank =
        player.prestigeRank === null || player.prestigeRank === undefined
          ? "-"
          : `#${formatNumber(player.prestigeRank)}`;

      return `
			<tr>
				<td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
				<td>${playerID}</td>
				<td>${username}</td>
				<td>${medallions}</td>
        <td><span class="prestige-score">${prestige}</span><span class="cell-sub">${prestigeRank}</span></td>
				<td><a class="mini-link" href="player.html?id=${encodeURIComponent(player.playerID || "")}">Open</a></td>
			</tr>
		`;
    })
    .join("");
}

function renderPrestigeRows(players) {
  if (!Array.isArray(players) || players.length === 0) {
    prestigeLeaderboardBody.innerHTML =
      "<tr><td colspan='5'>No prestige leaderboard entries found.</td></tr>";
    return;
  }

  prestigeLeaderboardBody.innerHTML = players
    .map((player) => {
      const rank = Number(player.rank) || 0;
      const playerID = escapeHtml(player.playerID || "Unknown");
      const username = escapeHtml(player.username || "-");
      const prestige = formatNumber(player.prestige);

      return `
			<tr>
				<td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
				<td>${playerID}</td>
				<td>${username}</td>
				<td><span class="prestige-score">${prestige}</span></td>
				<td><a class="mini-link" href="player.html?id=${encodeURIComponent(player.playerID || "")}">Open</a></td>
			</tr>
		`;
    })
    .join("");
}

async function loadLeaderboard(forceRefresh = false) {
  leaderboardError.hidden = true;
  leaderboardMeta.textContent = "Loading...";

  const country = getSelectedCountry();
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
    leaderboardMeta.textContent = `Country: ${data.country || country} | Entries: ${formatNumber(data.count)} | Cached: ${data.cached ? "Yes" : "No"}`;
  } catch (error) {
    leaderboardBody.innerHTML =
      "<tr><td colspan='6'>Failed to load leaderboard.</td></tr>";
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
      "<tr><td colspan='5'>Failed to load prestige leaderboard.</td></tr>";
    prestigeLeaderboardMeta.textContent = "";
    prestigeLeaderboardError.textContent = error.message;
    prestigeLeaderboardError.hidden = false;
  }
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    loadLeaderboard(true);
  });
}

if (countryFilter) {
  const initialCountry = getSelectedCountry();
  countryFilter.value = initialCountry;

  countryFilter.addEventListener("change", () => {
    const selected = getSelectedCountry();
    countryFilter.value = selected;
    updateCountryQuery(selected);
    loadLeaderboard(false);
  });
}

if (prestigeRefreshBtn) {
  prestigeRefreshBtn.addEventListener("click", () => {
    loadPrestigeLeaderboard(true);
  });
}

updateCountryQuery(getSelectedCountry());
loadLeaderboard();
loadPrestigeLeaderboard();
