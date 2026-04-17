const leaderboardBody = document.getElementById("leaderboardBody");
const leaderboardMeta = document.getElementById("leaderboardMeta");
const leaderboardError = document.getElementById("leaderboardError");
const refreshBtn = document.getElementById("refreshBtn");

function rankClass(rank) {
  if (rank === 1) return "rank-pill rank-1";
  if (rank === 2) return "rank-pill rank-2";
  if (rank === 3) return "rank-pill rank-3";
  return "rank-pill";
}

function renderRows(players) {
  if (!Array.isArray(players) || players.length === 0) {
    leaderboardBody.innerHTML =
      "<tr><td colspan='5'>No leaderboard entries found.</td></tr>";
    return;
  }

  leaderboardBody.innerHTML = players
    .map((player) => {
      const rank = Number(player.rank) || 0;
      const playerID = escapeHtml(player.playerID || "Unknown");
      const username = escapeHtml(player.username || "-");
      const medallions = formatNumber(player.medallions);

      return `
			<tr>
				<td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
				<td>${playerID}</td>
				<td>${username}</td>
				<td>${medallions}</td>
				<td><a class="mini-link" href="player.html?id=${encodeURIComponent(player.playerID || "")}">Open</a></td>
			</tr>
		`;
    })
    .join("");
}

async function loadLeaderboard(forceRefresh = false) {
  leaderboardError.hidden = true;
  leaderboardMeta.textContent = "Loading...";

  const path = forceRefresh ? "leaderboard.php?refresh=1" : "leaderboard.php";

  try {
    const data = await apiGet(path);
    const players = data.players || [];
    renderRows(players);
    leaderboardMeta.textContent = `Entries: ${formatNumber(data.count)} | Cached: ${data.cached ? "Yes" : "No"}`;
  } catch (error) {
    leaderboardBody.innerHTML =
      "<tr><td colspan='5'>Failed to load leaderboard.</td></tr>";
    leaderboardMeta.textContent = "";
    leaderboardError.textContent = error.message;
    leaderboardError.hidden = false;
  }
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    loadLeaderboard(true);
  });
}

loadLeaderboard();
