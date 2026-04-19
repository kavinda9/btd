const clanLeaderboardBody = document.getElementById("clanLeaderboardBody");
const clanLeaderboardMeta = document.getElementById("clanLeaderboardMeta");
const clanLeaderboardError = document.getElementById("clanLeaderboardError");
const clanRefreshBtn = document.getElementById("clanRefreshBtn");
const clanTypeSelect = document.getElementById("clanType");
const guildDetailCache = new Map();
const guildDetailPending = new Map();
const guildHydrationFailures = new Set();

function removeClanTableHeader() {
  const table = clanLeaderboardBody
    ? clanLeaderboardBody.closest("table")
    : null;
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

async function composeClanBadgeSrc(guild, rawGuild) {
  const symbol = extractGuildSymbol(guild, rawGuild);
  const shieldFile = normalizeClanLayerFile(symbol.shield);
  const iconFile = normalizeClanLayerFile(symbol.icon);
  if (!shieldFile || !iconFile) {
    return "";
  }

  const shieldSrc = `images/clans/${encodeURIComponent(shieldFile)}`;
  const iconSrc = `images/clans/${encodeURIComponent(iconFile)}`;
  const composer = window.ClanBadgeComposer;
  if (!composer || typeof composer.mergeClanBadge !== "function") {
    return "";
  }

  try {
    const mergedSrc = await composer.mergeClanBadge(shieldSrc, iconSrc);
    return typeof mergedSrc === "string" ? mergedSrc : "";
  } catch (_) {
    return "";
  }
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

function queryElementsByGuildId(className, guildID) {
  return Array.from(
    document.querySelectorAll(`.${className}[data-guild-id]`),
  ).filter((el) => String(el.getAttribute("data-guild-id") || "") === guildID);
}

async function fetchGuildDetailCached(guildID, options = {}) {
  const id = String(guildID || "").trim();
  if (!id) {
    return null;
  }

  const forceRefresh = options && options.forceRefresh === true;

  if (!forceRefresh && guildDetailCache.has(id)) {
    return guildDetailCache.get(id);
  }

  if (!forceRefresh && guildDetailPending.has(id)) {
    return guildDetailPending.get(id);
  }

  const request = (async () => {
    try {
      let data = null;
      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          const refreshQuery = forceRefresh ? "&refresh=1" : "";
          data = await apiGet(
            `guild.php?id=${encodeURIComponent(id)}&lite=1${refreshQuery}`,
          );
          break;
        } catch (error) {
          if (attempt >= 3) {
            throw error;
          }

          const waitMs =
            160 * Math.pow(2, attempt) + Math.floor(Math.random() * 80);
          await new Promise((resolve) => {
            window.setTimeout(resolve, waitMs);
          });
        }
      }

      const guild = data?.guild || {};
      const rawGuild = data?.raw || null;
      const mergedBadgeSrc = await composeClanBadgeSrc(guild, rawGuild);
      const layers = resolveClanBadgeLayers(guild, rawGuild);

      const details = {
        guild,
        rawGuild,
        mergedBadgeSrc,
        shieldSrc: layers.shieldSrc,
        iconSrc: layers.iconSrc,
      };

      if (!forceRefresh) {
        guildDetailCache.set(id, details);
      }
      guildHydrationFailures.delete(id);
      return details;
    } catch (_) {
      guildHydrationFailures.add(id);
      return null;
    } finally {
      if (!forceRefresh) {
        guildDetailPending.delete(id);
      }
    }
  })();

  if (!forceRefresh) {
    guildDetailPending.set(id, request);
  }
  return request;
}

function rankClass(rank) {
  if (rank === 1) return "rank-pill rank-1";
  if (rank === 2) return "rank-pill rank-2";
  if (rank === 3) return "rank-pill rank-3";
  return "rank-pill";
}

function renderClanRows(clans, targetClanID = null) {
  removeClanTableHeader();

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
        ? `player.html?id=${encodeURIComponent(clanID)}&kind=clan`
        : null;
      const nameCell = guildHref
        ? `<a class="mini-link js-guild-link" data-guild-id="${escapeHtml(clanID)}" data-has-name="${hasName ? "1" : "0"}" href="${guildHref}">${name}</a>`
        : name;
      const highlighted =
        targetClanID && clanID === targetClanID
          ? " style='background: rgba(34, 211, 238, 0.14);'"
          : "";
      const badgeCell = clanID
        ? `<span class="clan-badge-slot js-clan-badge-slot" data-guild-id="${escapeHtml(clanID)}" aria-hidden="true"></span>`
        : "";

      return `
      <tr${highlighted} class="js-clan-row" data-guild-id="${escapeHtml(clanID)}">
        <td><span class="${rankClass(rank)}">${formatNumber(rank)}</span></td>
        <td><span class="clan-name-wrap">${badgeCell}<span class="clan-name-text">${nameCell}</span></span></td>
        <td>${medallions}</td>
      </tr>
    `;
    })
    .join("");
}

async function hydrateClanRows(options = {}) {
  const forceRefresh = options && options.forceRefresh === true;
  const retryMissingOnly = options && options.retryMissingOnly === true;

  const rows = Array.from(
    document.querySelectorAll(".js-clan-row[data-guild-id]"),
  );
  if (!rows.length) {
    return;
  }

  const concurrency = 2;
  for (let i = 0; i < rows.length; i += concurrency) {
    const batch = rows.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (row) => {
        const guildID = String(row.getAttribute("data-guild-id") || "").trim();
        if (!guildID) {
          return;
        }

        if (retryMissingOnly) {
          const slots = queryElementsByGuildId("js-clan-badge-slot", guildID);
          const hasRenderedBadge = slots.some(
            (slot) => slot.childElementCount > 0,
          );
          if (hasRenderedBadge) {
            return;
          }
        }

        const details = await fetchGuildDetailCached(guildID, { forceRefresh });
        if (!details || !details.guild) {
          return;
        }

        const guildName = String(details.guild.name || "").trim();
        if (guildName) {
          const links = queryElementsByGuildId("js-guild-link", guildID);
          links.forEach((link) => {
            link.textContent = guildName;
          });
        }

        const slots = queryElementsByGuildId("js-clan-badge-slot", guildID);
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

async function hydrateFailedClanRows() {
  const failedIds = Array.from(guildHydrationFailures);
  if (!failedIds.length) {
    return;
  }

  for (const guildID of failedIds) {
    const details = await fetchGuildDetailCached(guildID, {
      forceRefresh: true,
    });
    if (!details || !details.guild) {
      continue;
    }

    const guildName = String(details.guild.name || "").trim();
    if (guildName) {
      const links = queryElementsByGuildId("js-guild-link", guildID);
      links.forEach((link) => {
        link.textContent = guildName;
      });
    }

    const slots = queryElementsByGuildId("js-clan-badge-slot", guildID);
    slots.forEach((slot) => {
      if (details.mergedBadgeSrc) {
        slot.innerHTML = `<img class="clan-badge-image" src="${details.mergedBadgeSrc}" alt="${escapeHtml(guildName || "Clan")} badge" loading="lazy" decoding="async" />`;
        return;
      }

      if (details.shieldSrc && details.iconSrc) {
        slot.innerHTML = `<span class="clan-badge-composite" aria-hidden="true"><img class="clan-badge-layer clan-badge-layer--shield" src="${details.shieldSrc}" alt="" loading="lazy" decoding="async" /><img class="clan-badge-layer clan-badge-layer--icon" src="${details.iconSrc}" alt="" loading="lazy" decoding="async" /></span>`;
      }
    });
  }
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
    await hydrateClanRows();

    const hasEmptyBadgeSlots = Array.from(
      document.querySelectorAll(".js-clan-badge-slot[data-guild-id]"),
    ).some((slot) => slot.childElementCount === 0);

    if (hasEmptyBadgeSlots) {
      await hydrateClanRows({ forceRefresh: true, retryMissingOnly: true });
    }

    if (guildHydrationFailures.size) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 280);
      });
      await hydrateFailedClanRows();
    }

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
removeClanTableHeader();
