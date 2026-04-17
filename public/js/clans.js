const clanLeaderboardBody = document.getElementById("clanLeaderboardBody");
const clanLeaderboardMeta = document.getElementById("clanLeaderboardMeta");
const clanLeaderboardError = document.getElementById("clanLeaderboardError");
const clanRefreshBtn = document.getElementById("clanRefreshBtn");
const clanTypeSelect = document.getElementById("clanType");

async function resolveMissingGuildNames(clans) {
  if (!Array.isArray(clans) || clans.length === 0) {
    return;
  }

  const missingIds = [
    ...new Set(
      clans
        .filter((clan) => !clan.name && clan.clanID)
        .map((clan) => clan.clanID),
    ),
  ];

  if (missingIds.length === 0) {
    return;
  }

  await Promise.allSettled(
    missingIds.map(async (guildID) => {
      try {
        const data = await apiGet(
          `guild.php?id=${encodeURIComponent(guildID)}`,
        );
        const guildName = data?.guild?.name;
        if (!guildName) return;

        const links = document.querySelectorAll(
          `.js-guild-link[data-guild-id="${CSS.escape(guildID)}"]`,
        );
        links.forEach((link) => {
          link.textContent = guildName;
        });
      } catch (_) {
        // Keep fallback text if guild lookup fails.
      }
    }),
  );
}

function rankClass(rank) {
  if (rank === 1) return "rank-pill rank-1";
  if (rank === 2) return "rank-pill rank-2";
  if (rank === 3) return "rank-pill rank-3";
  return "rank-pill";
}

function renderClanRows(clans, targetClanID = null) {
  if (!Array.isArray(clans) || clans.length === 0) {
    clanLeaderboardBody.innerHTML =
      "<tr><td colspan='3'>No clan leaderboard entries found.</td></tr>";
    return;
  }

  clanLeaderboardBody.innerHTML = clans
    .map((clan) => {
      const rank = Number(clan.rank) || 0;
      const clanID = clan.clanID || "";
      const hasName = Boolean(clan.name);
      const name = escapeHtml(clan.name || "Loading guild...");
      const medallions = formatNumber(clan.medallions);
      const guildHref = clanID
        ? `guild.html?id=${encodeURIComponent(clanID)}`
        : null;
      const nameCell = guildHref
        ? `<a class="mini-link js-guild-link" data-guild-id="${escapeHtml(clanID)}" data-has-name="${hasName ? "1" : "0"}" href="${guildHref}">${name}</a>`
        : name;
      const highlighted =
        targetClanID && clanID === targetClanID
          ? " style='background: rgba(34, 211, 238, 0.14);'"
          : "";

      return `
      <tr${highlighted}>
        <td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
        <td>${nameCell}</td>
        <td>${medallions}</td>
      </tr>
    `;
    })
    .join("");
}

async function loadClanLeaderboard(forceRefresh = false) {
  clanLeaderboardError.hidden = true;
  clanLeaderboardMeta.textContent = "Loading...";

  const selectedType =
    clanTypeSelect && clanTypeSelect.value
      ? clanTypeSelect.value
      : queryParam("type") || "overall";

  const params = new URLSearchParams({ type: selectedType });
  if (forceRefresh) {
    params.set("refresh", "1");
  }

  const path = `clan_leaderboard.php?${params.toString()}`;

  try {
    const data = await apiGet(path);
    const clans = data.clans || [];
    const targetClanID = queryParam("clanID");

    renderClanRows(clans, targetClanID);
    resolveMissingGuildNames(clans);
    clanLeaderboardMeta.textContent = `Type: ${String(data.type || selectedType).toUpperCase()} | Entries: ${formatNumber(data.count)} | Cached: ${data.cached ? "Yes" : "No"}`;

    const url = new URL(window.location.href);
    url.searchParams.set("type", selectedType);
    window.history.replaceState({}, "", url);
  } catch (error) {
    clanLeaderboardBody.innerHTML =
      "<tr><td colspan='3'>Failed to load clan leaderboard.</td></tr>";
    clanLeaderboardMeta.textContent = "";
    clanLeaderboardError.textContent = error.message;
    clanLeaderboardError.hidden = false;
  }
}

if (clanRefreshBtn) {
  clanRefreshBtn.addEventListener("click", () => {
    loadClanLeaderboard(true);
  });
}

if (clanTypeSelect) {
  const initialType = queryParam("type") || "overall";
  clanTypeSelect.value = ["overall", "club", "standard", "card"].includes(
    initialType,
  )
    ? initialType
    : "overall";

  clanTypeSelect.addEventListener("change", () => {
    loadClanLeaderboard(false);
  });
}

loadClanLeaderboard();
