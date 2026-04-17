const playerForm = document.getElementById("playerForm");
const playerInput = document.getElementById("playerId");
const playerError = document.getElementById("playerError");
const profileGrid = document.getElementById("profileGrid");

const usernameEl = document.getElementById("username");
const playerIdLabel = document.getElementById("playerIdLabel");
const topStats = document.getElementById("topStats");
const battleStats = document.getElementById("battleStats");
const metaStats = document.getElementById("metaStats");

function renderStatList(target, rows) {
  target.innerHTML = rows
    .map(
      (row) => `
		<dt>${escapeHtml(row.label)}</dt>
		<dd>${escapeHtml(row.value)}</dd>
	`,
    )
    .join("");
}

function renderProfile(data) {
  const profile = data.profile || {};
  const stats = profile.stats || {};

  usernameEl.textContent = profile.username || "Unknown";
  playerIdLabel.textContent = `Player ID: ${data.playerID || "Unknown"}`;

  topStats.innerHTML = [
    `Level: ${formatNumber(profile.level)}`,
    `Medallions: ${formatNumber(profile.medallions)}`,
    `Rank: ${formatNumber(profile.rank)}`,
  ]
    .map((item) => `<span class="chip">${escapeHtml(item)}</span>`)
    .join("");

  renderStatList(battleStats, [
    { label: "Wins", value: formatNumber(stats.wins) },
    { label: "Losses", value: formatNumber(stats.losses) },
    {
      label: "Win Rate",
      value:
        stats.winRate === null || stats.winRate === undefined
          ? "-"
          : `${stats.winRate}%`,
    },
  ]);

  renderStatList(metaStats, [
    { label: "Clan", value: profile.clan || "-" },
    { label: "Clan ID", value: profile.clanID || "-" },
    { label: "XP", value: formatNumber(profile.xp) },
    { label: "Cached", value: data.cached ? "Yes" : "No" },
  ]);

  profileGrid.hidden = false;
}

async function loadPlayer(playerId, forceRefresh = false) {
  playerError.hidden = true;
  profileGrid.hidden = true;

  const query = new URLSearchParams({ id: playerId });
  if (forceRefresh) {
    query.set("refresh", "1");
  }

  try {
    const data = await apiGet(`player.php?${query.toString()}`);
    renderProfile(data);

    const url = new URL(window.location.href);
    url.searchParams.set("id", playerId);
    window.history.replaceState({}, "", url);
  } catch (error) {
    playerError.textContent = error.message;
    playerError.hidden = false;
  }
}

if (playerForm && playerInput) {
  playerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = playerInput.value.trim();
    if (!value) {
      playerError.textContent = "Please enter a player ID.";
      playerError.hidden = false;
      return;
    }

    loadPlayer(value);
  });

  const paramId = queryParam("id");
  if (paramId) {
    playerInput.value = paramId;
    loadPlayer(paramId);
  }
}
