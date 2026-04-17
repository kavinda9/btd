const weekInput = document.getElementById("weekInput");
const loadWeekBtn = document.getElementById("loadWeekBtn");
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

async function resolveMissingClanNames(clans) {
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
          `.js-past-guild-link[data-guild-id="${CSS.escape(guildID)}"]`,
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

function renderRows(clans) {
  if (!Array.isArray(clans) || clans.length === 0) {
    pastBody.innerHTML =
      "<tr><td colspan='3'>No clan overall data found for this week.</td></tr>";
    return;
  }

  pastBody.innerHTML = clans
    .map((clan) => {
      const rank = Number(clan.rank) || 0;
      const clanID = clan.clanID || "";
      const name = escapeHtml(clan.name || "Loading guild...");
      const medallions = formatNumber(clan.medallions);
      const guildHref = clanID
        ? `player.html?id=${encodeURIComponent(clanID)}`
        : null;
      const nameCell = guildHref
        ? `<a class="mini-link js-past-guild-link" data-guild-id="${escapeHtml(clanID)}" href="${guildHref}">${name}</a>`
        : name;

      return `
      <tr>
        <td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
        <td>${nameCell}</td>
        <td>${medallions}</td>
      </tr>
    `;
    })
    .join("");
}

async function loadClans(forceRefresh = false) {
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

  if (pastMeta) {
    pastMeta.textContent = "";
  }

  try {
    const data = await apiGet(`past_clan_overall.php?${params.toString()}`);
    const clans = data.clans || [];
    renderRows(clans);
    resolveMissingClanNames(clans);
    if (pastMeta) {
      pastMeta.textContent = "";
    }
  } catch (error) {
    if (pastMeta) {
      pastMeta.textContent = "";
    }
    pastError.textContent = error.message;
    pastError.hidden = false;
    pastBody.innerHTML =
      "<tr><td colspan='3'>Failed to load clan leaderboard.</td></tr>";
  }
}

if (loadWeekBtn) {
  loadWeekBtn.addEventListener("click", () => loadClans(false));
}

if (weekInput) {
  weekInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadClans(false);
    }
  });

  const initialWeek =
    sanitiseWeek(queryParam("week")) || sanitiseWeek(weekInput.value) || 569;
  weekInput.value = String(initialWeek);
}

loadClans(false);
