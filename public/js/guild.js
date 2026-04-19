function getQueryParam(param) {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent =
    value === null || value === undefined || value === "" ? "-" : String(value);
}

function createBadgePreview(name) {
  const initials = String(name || "")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return initials || "CL";
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
  if (!raw) return "";

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

async function renderGuildBadge(badgeEl, guildName, guild, rawGuild) {
  const symbol = extractGuildSymbol(guild, rawGuild);
  const shieldFile = normalizeClanLayerFile(symbol.shield);
  const iconFile = normalizeClanLayerFile(symbol.icon);

  if (!shieldFile || !iconFile) {
    badgeEl.textContent = createBadgePreview(guildName);
    return;
  }

  const shieldSrc = `images/clans/${encodeURIComponent(shieldFile)}`;
  const iconSrc = `images/clans/${encodeURIComponent(iconFile)}`;
  const composer = window.ClanBadgeComposer;

  if (!composer || typeof composer.mergeClanBadge !== "function") {
    badgeEl.innerHTML = `
      <span class="badge-composite" aria-label="${escapeHtml(guildName)} clan badge" role="img">
        <img class="badge-layer badge-layer--shield" src="${shieldSrc}" alt="${escapeHtml(guildName)} shield" />
        <img class="badge-layer badge-layer--icon" src="${iconSrc}" alt="${escapeHtml(guildName)} icon" />
      </span>
    `;
    return;
  }

  try {
    const mergedSrc = await composer.mergeClanBadge(shieldSrc, iconSrc);
    if (!mergedSrc) {
      badgeEl.textContent = createBadgePreview(guildName);
      return;
    }
    badgeEl.innerHTML = `<img class="badge-merged-image" src="${mergedSrc}" alt="${escapeHtml(guildName)} clan badge" loading="lazy" decoding="async" />`;
  } catch (_) {
    badgeEl.textContent = createBadgePreview(guildName);
  }
}

function makeOwnerLink(ownerId, ownerName) {
  if (!ownerId) {
    return ownerName || "-";
  }

  const safeName = escapeHtml(ownerName || ownerId);
  return `<a class="owner-link" href="player.html?id=${encodeURIComponent(ownerId)}">${safeName}</a>`;
}

async function fetchGuildInfo() {
  const guildID = getQueryParam("id");
  const clanNameEl = document.getElementById("clanName");
  const guildErrorEl = document.getElementById("guildError");

  if (!guildID) {
    clanNameEl.textContent = "No Guild ID provided";
    return;
  }

  try {
    const data = await apiGet(`guild.php?id=${encodeURIComponent(guildID)}`);
    const guild = data.guild || {};
    const rawGuild = data.raw || null;

    const guildName = guild.name || "Unknown Guild";
    clanNameEl.textContent = guildName;

    setText("guildID", guild.guildID || guildID);
    setText("status", guild.status || "-");

    const membersText = `${formatNumber(guild.numMembers || 0)}${guild.numMembersPending ? ` (+${formatNumber(guild.numMembersPending)} pending)` : ""}`;
    setText("members", membersText);
    setText("maxMembers", formatNumber(guild.maximumMembers || 0));
    setText("tagline", guild.tagline || "-");
    setText("shortcode", guild.shortcode || "-");
    setText(
      "chatEnabled",
      guild.chatEnabled === null || guild.chatEnabled === undefined
        ? "-"
        : guild.chatEnabled
          ? "Yes"
          : "No",
    );
    setText("country", guild.country || "-");

    const ownerEl = document.getElementById("owner");
    if (ownerEl) {
      ownerEl.innerHTML = makeOwnerLink(
        guild.owner,
        guild.ownerName || guild.owner,
      );
    }

    const badgeEl = document.getElementById("badgePreview");
    if (badgeEl) {
      await renderGuildBadge(badgeEl, guildName, guild, rawGuild);
    }
  } catch (error) {
    clanNameEl.textContent = "Failed to load guild info";
    if (guildErrorEl) {
      guildErrorEl.textContent = error.message;
      guildErrorEl.hidden = false;
    }
  }
}

fetchGuildInfo();
