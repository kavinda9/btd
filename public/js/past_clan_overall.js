const weekInput = document.getElementById("weekInput");
const loadWeekBtn = document.getElementById("loadWeekBtn");
const openPastWeekly = document.getElementById("openPastWeekly");
const openPastPrestige = document.getElementById("openPastPrestige");
const openPastClans = document.getElementById("openPastClans");
const pastInfoCard = document.getElementById("pastInfoCard");
const pastMeta = document.getElementById("pastMeta");
const pastError = document.getElementById("pastError");
const pastBody = document.getElementById("pastBody");
const pastWeekInfo = document.getElementById("pastWeekInfo");
const pastGuildDetailCache = new Map();
const pastGuildDetailPending = new Map();

const WEEKLY_RESET_BASE = new Date("2015-12-16T14:00:00+04:00").getTime();
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
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

function removePastClanTableHeader() {
  const table = pastBody ? pastBody.closest("table") : null;
  if (!table) {
    return;
  }

  const thead = table.querySelector("thead");
  if (thead) {
    thead.remove();
  }
}

const CLAN_ICON_FILE_BY_NUMBER = {
  "01": "Icon_01_ODS.png",
  "02": "Icon_02_Regen.png",
  "03": "Icon_03_Bloonjitsu.png",
  "04": "Icon_04_Sungod.png",
  "05": "Icon_05_Assassin.png",
  "06": "Icon_06_BFB.png",
  "07": "Icon_07_Blue.png",
  "08": "Icon_08_Bomb.png",
  "09": "Icon_09_Darts.png",
  10: "Icon_10_DartMonkey.png",
  11: "Icon_11_Mauler.png",
  12: "Icon_12_MOAB.png",
  13: "Icon_13_Pineapple.png",
  14: "Icon_14_Red.png",
  15: "Icon_15_Rockets.png",
  16: "Icon_16_Shurikens.png",
  17: "Icon_17_TechTerror.png",
  18: "Icon_18_ZOMG.png",
  19: "Icon_19_Buccaneer.png",
  20: "Icon_20_Sub.png",
  21: "Icon_21_SuperMonkey.png",
  22: "Icon_22_NKLogo.png",
  23: "Icon_23_NKLogoGold.png",
  24: "Icon_24_Bombs.png",
  25: "Icon_25_Sniper.png",
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

function extractSymbolFromText(value) {
  const text = String(value || "");
  if (!text) {
    return { shield: "", icon: "" };
  }

  const shieldMatch = text.match(/Shield_\d+/i);
  const iconMatch = text.match(/Icon_\d+(?:_[A-Za-z0-9]+)?/i);

  return {
    shield: shieldMatch ? shieldMatch[0] : "",
    icon: iconMatch ? iconMatch[0] : "",
  };
}

function extractGuildSymbol(guild, rawGuild) {
  const directShield = String(guild?.symbol?.shield || "").trim();
  const directIcon = String(guild?.symbol?.icon || "").trim();
  if (directShield && directIcon) {
    return { shield: directShield, icon: directIcon };
  }

  const sources = [
    guild?.tagline,
    rawGuild?.tagline,
    rawGuild ? JSON.stringify(rawGuild) : "",
  ];
  for (const source of sources) {
    const parsed = extractSymbolFromText(source);
    if (parsed.shield && parsed.icon) {
      return parsed;
    }
  }

  return { shield: directShield, icon: directIcon };
}

function normalizeClanLayerFile(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  const name = raw.replace(/\.png$/i, "");
  const shieldMatch = name.match(/^shield_(\d{1,2})$/i);
  if (shieldMatch) {
    return `Shield_${shieldMatch[1].padStart(2, "0")}.png`;
  }

  const iconMatch = name.match(/^icon_(\d{1,2})(?:_.+)?$/i);
  if (iconMatch) {
    const num = iconMatch[1].padStart(2, "0");
    return CLAN_ICON_FILE_BY_NUMBER[num] || `Icon_${num}.png`;
  }

  return /\.png$/i.test(raw) ? raw : `${raw}.png`;
}

function resolveClanBadgeLayers(guild, rawGuild) {
  const symbol = extractGuildSymbol(guild, rawGuild);
  const shieldFile = normalizeClanLayerFile(symbol.shield);
  const iconFile = normalizeClanLayerFile(symbol.icon);
  if (!shieldFile || !iconFile) {
    return { shieldSrc: "", iconSrc: "" };
  }

  return {
    shieldSrc: `images/clans/${encodeURIComponent(shieldFile)}`,
    iconSrc: `images/clans/${encodeURIComponent(iconFile)}`,
  };
}

async function composeClanBadgeSrc(guild, rawGuild) {
  const layers = resolveClanBadgeLayers(guild, rawGuild);
  if (!layers.shieldSrc || !layers.iconSrc) {
    return "";
  }

  const composer = window.ClanBadgeComposer;
  if (!composer || typeof composer.mergeClanBadge !== "function") {
    return "";
  }

  try {
    const mergedSrc = await composer.mergeClanBadge(
      layers.shieldSrc,
      layers.iconSrc,
    );
    return typeof mergedSrc === "string" ? mergedSrc : "";
  } catch (_) {
    return "";
  }
}

function queryPastElementsByGuildId(className, guildID) {
  return Array.from(
    document.querySelectorAll(`.${className}[data-guild-id]`),
  ).filter((el) => String(el.getAttribute("data-guild-id") || "") === guildID);
}

async function fetchPastGuildDetailCached(guildID) {
  const id = String(guildID || "").trim();
  if (!id) {
    return null;
  }

  if (pastGuildDetailCache.has(id)) {
    return pastGuildDetailCache.get(id);
  }

  if (pastGuildDetailPending.has(id)) {
    return pastGuildDetailPending.get(id);
  }

  const request = (async () => {
    try {
      const data = await apiGet(
        `guild.php?id=${encodeURIComponent(id)}&lite=1`,
      );
      const guild = data?.guild || {};
      const rawGuild = data?.raw || null;
      const mergedBadgeSrc = await composeClanBadgeSrc(guild, rawGuild);
      const layers = resolveClanBadgeLayers(guild, rawGuild);

      const details = {
        guild,
        mergedBadgeSrc,
        shieldSrc: layers.shieldSrc,
        iconSrc: layers.iconSrc,
      };

      pastGuildDetailCache.set(id, details);
      return details;
    } catch (_) {
      return null;
    } finally {
      pastGuildDetailPending.delete(id);
    }
  })();

  pastGuildDetailPending.set(id, request);
  return request;
}

async function hydratePastClanDetails(clans) {
  if (!Array.isArray(clans) || !clans.length) {
    return;
  }

  const ids = [...new Set(clans.map((clan) => clan.clanID).filter(Boolean))];
  const concurrency = 3;

  for (let i = 0; i < ids.length; i += concurrency) {
    const batch = ids.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (guildID) => {
        const details = await fetchPastGuildDetailCached(guildID);
        if (!details || !details.guild) {
          return;
        }

        const guildName = String(details.guild.name || "").trim();
        if (guildName) {
          const links = queryPastElementsByGuildId(
            "js-past-guild-link",
            guildID,
          );
          links.forEach((link) => {
            link.textContent = guildName;
          });
        }

        const slots = queryPastElementsByGuildId(
          "js-past-clan-badge-slot",
          guildID,
        );
        slots.forEach((slot) => {
          if (details.mergedBadgeSrc) {
            slot.innerHTML = `<img class="clan-badge-image" src="${details.mergedBadgeSrc}" alt="${escapeHtml(guildName || "Clan")} badge" loading="lazy" decoding="async" />`;
            return;
          }

          if (details.shieldSrc && details.iconSrc) {
            slot.innerHTML = `<span class="clan-badge-composite" aria-hidden="true"><img class="clan-badge-layer clan-badge-layer--shield" src="${details.shieldSrc}" alt="" loading="lazy" decoding="async" /><img class="clan-badge-layer clan-badge-layer--icon" src="${details.iconSrc}" alt="" loading="lazy" decoding="async" /></span>`;
          }
        });
      }),
    );
  }
}

function renderRows(clans) {
  removePastClanTableHeader();

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
        ? `player.html?id=${encodeURIComponent(clanID)}&kind=clan`
        : null;
      const badgeCell = clanID
        ? `<span class="clan-badge-slot js-past-clan-badge-slot" data-guild-id="${escapeHtml(clanID)}" aria-hidden="true"></span>`
        : "";
      const nameCell = guildHref
        ? `<a class="mini-link js-past-guild-link" data-guild-id="${escapeHtml(clanID)}" href="${guildHref}">${name}</a>`
        : name;

      return `
      <tr>
        <td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
        <td><span class="clan-name-wrap">${badgeCell}<span class="clan-name-text">${nameCell}</span></span></td>
        <td>${medallions}</td>
      </tr>
    `;
    })
    .join("");
}

async function loadClans(forceRefresh = false) {
  if (pastError) {
    pastError.hidden = true;
  }
  if (pastInfoCard) {
    pastInfoCard.hidden = true;
  }

  const week = sanitiseWeek(weekInput?.value);
  if (!week) {
    if (pastError) {
      pastError.textContent = "Please enter a valid week number.";
      pastError.hidden = false;
    }
    if (pastInfoCard) {
      pastInfoCard.hidden = false;
    }
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
  updateWeekInfoText(week, "");

  try {
    const data = await apiGet(`past_clan_overall.php?${params.toString()}`);
    const clans = data.clans || [];
    renderRows(clans);
    await hydratePastClanDetails(clans);
    updateWeekInfoText(data.week || week, "");
    if (pastMeta) {
      pastMeta.textContent = "";
    }
  } catch (error) {
    updateWeekInfoText(week, "");
    if (pastMeta) {
      pastMeta.textContent = "";
    }
    if (pastError) {
      pastError.textContent = error.message;
      pastError.hidden = false;
    }
    if (pastInfoCard) {
      pastInfoCard.hidden = false;
    }
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
  updateWeekInfoText(initialWeek, "");
}

loadClans(false);
removePastClanTableHeader();
