const playerForm = document.getElementById("playerForm");
const playerInput = document.getElementById("playerId");
const playerError = document.getElementById("playerError");
const profileGrid = document.getElementById("profileGrid");

const avatarEl = document.getElementById("avatar");
const usernameEl = document.getElementById("username");
const playerIdLabel = document.getElementById("playerIdLabel");
const countryLabel = document.getElementById("countryLabel");
const clanIdLabel = document.getElementById("clanIdLabel");
const statsTableBody = document.getElementById("statsTableBody");
const featuredBadgeWrap = document.getElementById("featuredBadgeWrap");
const badgesWrap = document.getElementById("badgesWrap");
const featuredBadgeSection = featuredBadgeWrap
  ? featuredBadgeWrap.closest(".badges")
  : null;
const badgesSection = badgesWrap ? badgesWrap.closest(".badges") : null;
const clanJumpWrap = document.getElementById("clanJumpWrap");
const clanJumpLink = document.getElementById("clanJumpLink");

const LOCAL_BADGE_KEYS = new Set(["localbronze", "localsilver", "localgold"]);
const PRESTIGE_OVERLAY_CANDIDATE_PATHS = [
  "images/badges/prestige.png",
  "images/badges/prestge.png",
];

const BADGE_FILE_BY_KEY = {
  blackdiamond: "black_diamond",
  blackdiamondprestige: "black_diamond_prestige",
  bronzex1: "bronzex1",
  bronzeprestige: "bronze_prestige",
  bronzesilverprestige: "bronze_silver_prestige",
  diamond: "diamond",
  diamondprestige: "diamond_prestige",
  gold: "gold",
  goldblackdiamondprestige: "gold_black_diamond_prestige",
  golddiamondprestige: "gold_diamond_prestige",
  goldprestige: "gold_prestige",
  goldreddiamondprestige: "gold_red_diamond_prestige",
  localbronze: "local_bronze",
  localgold: "local_gold",
  localsilver: "local_silver",
  reddiamond: "red_diamond",
  reddiamondprestige: "red_diamond_prestige",
  silvergold: "silvergold",
  silverx1: "silverx1",
  silverx2: "silverx2",
  silvergoldprestige: "silver_gold_prestige",
  silverprestige: "silver_prestige",
};

const COUNTRY_FLAG_FILE_BY_KEY = {
  ar: "AR",
  argentina: "AR",
  au: "AU",
  australia: "AU",
  at: "AT",
  austria: "AT",
  be: "BE",
  belgium: "BE",
  br: "BR",
  brazil: "BR",
  bg: "BG",
  bulgaria: "BG",
  ca: "CA",
  canada: "CA",
  cl: "CL",
  chile: "CL",
  cn: "CN",
  china: "CN",
  co: "CO",
  colombia: "CO",
  hr: "HR",
  croatia: "HR",
  cz: "CZ",
  czechrepublic: "CZ",
  czechia: "CZ",
  dk: "DK",
  denmark: "DK",
  ee: "EE",
  estonia: "EE",
  fi: "FI",
  finland: "FI",
  fr: "FR",
  france: "FR",
  gb: "GB",
  uk: "GB",
  unitedkingdom: "GB",
  de: "DE",
  germany: "DE",
  gr: "GR",
  greece: "GR",
  hk: "HK",
  hongkong: "HK",
  hongkongsar: "HK",
  hu: "HU",
  hungary: "HU",
  in: "IN",
  india: "IN",
  id: "ID",
  indonesia: "ID",
  ie: "IE",
  ireland: "IE",
  il: "IL",
  israel: "IL",
  it: "IT",
  italy: "IT",
  jp: "JP",
  japan: "JP",
  lv: "LV",
  latvia: "LV",
  lt: "LT",
  lithuania: "LT",
  lithunia: "LT",
  my: "MY",
  malaysia: "MY",
  mx: "MX",
  mexico: "MX",
  nl: "NL",
  netherlands: "NL",
  nz: "NZ",
  newzealand: "NZ",
  no: "NO",
  norway: "NO",
  ph: "PH",
  philippines: "PH",
  pl: "PL",
  poland: "PL",
  pt: "PT",
  portugal: "PT",
  portugual: "PT",
  tw: "TW",
  taiwan: "TW",
  ro: "RO",
  romania: "RO",
  ru: "RU",
  russia: "RU",
  sa: "SA",
  saudiarabia: "SA",
  sg: "SG",
  singapore: "SG",
  si: "SI",
  slovenia: "SI",
  za: "ZA",
  southafrica: "ZA",
  kr: "KR",
  southkorea: "KR",
  es: "ES",
  spain: "ES",
  se: "SE",
  sweden: "SE",
  ch: "CH",
  switzerland: "CH",
  th: "TH",
  thailand: "TH",
  tr: "TR",
  turkey: "TR",
  ua: "UA",
  ukraine: "UA",
  ae: "AE",
  unitedarabemirates: "AE",
  us: "US",
  unitedstates: "US",
  vn: "VN",
  vietnam: "VN",
};

const COUNTRY_DISPLAY_NAME_BY_FILE = {
  AR: "Argentina",
  AU: "Australia",
  AT: "Austria",
  BE: "Belgium",
  BR: "Brazil",
  BG: "Bulgaria",
  CA: "Canada",
  CL: "Chile",
  CN: "China",
  CO: "Colombia",
  HR: "Croatia",
  CZ: "Czechia",
  DK: "Denmark",
  EE: "Estonia",
  FI: "Finland",
  FR: "France",
  GB: "United Kingdom",
  DE: "Germany",
  GR: "Greece",
  HK: "Hong-Kong",
  HU: "Hungary",
  IN: "India",
  ID: "Indonesia",
  IE: "Ireland",
  IL: "Israel",
  IT: "Italy",
  JP: "Japan",
  LV: "Latvia",
  LT: "Lithunia",
  MY: "Malaysia",
  MX: "Mexico",
  NL: "Netherlands",
  NZ: "New Zealand",
  NO: "Norway",
  PH: "Philippines",
  PL: "Poland",
  PT: "Portugual",
  TW: "Taiwan",
  RO: "Romania",
  RU: "Russia",
  SA: "Saudi Arabia",
  SG: "Singapore",
  SI: "Slovenia",
  ZA: "South Africa",
  KR: "South Korea",
  ES: "Spain",
  SE: "Sweden",
  CH: "Switzerland",
  TH: "Thailand",
  TR: "Turkey",
  UA: "Ukraine",
  AE: "United Arab Emirates",
  US: "United States",
  VN: "Vietnam",
};

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

let guildAvatarRequestToken = 0;
const badgeImageCache = new Map();
const badgeComposeCache = new Map();

function extractClanSymbolFromText(value) {
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
    const parsed = extractClanSymbolFromText(source);
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

async function composeGuildAvatarSrc(guild, rawGuild) {
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

function renderGuildAvatar(guildName, guild, rawGuild) {
  const requestToken = ++guildAvatarRequestToken;
  avatarEl.classList.remove("avatar--with-image");
  avatarEl.classList.remove("avatar--clan-composite");
  avatarEl.classList.add("avatar--with-clan-image");
  avatarEl.innerHTML = "";

  composeGuildAvatarSrc(guild, rawGuild).then((mergedSrc) => {
    if (requestToken !== guildAvatarRequestToken || !mergedSrc) {
      return;
    }

    avatarEl.classList.remove("avatar--with-clan-image");
    avatarEl.classList.add("avatar--clan-composite");
    avatarEl.innerHTML = `<img class="avatar-clan-image" src="${mergedSrc}" alt="${escapeHtml(guildName || "Clan")} badge" loading="lazy" decoding="async" />`;
  });
}

function renderTableRows(target, rows) {
  target.innerHTML = rows
    .map(
      (row) => `
		<tr>
			<th>${escapeHtml(row.label)}</th>
			<td>${escapeHtml(row.value)}</td>
		</tr>
	`,
    )
    .join("");
}

function createAvatarInitials(name) {
  const value = String(name || "").trim();
  if (!value) return "??";
  return value
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function normalizeAssetKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function resolveBadgeImagePath(badgeId) {
  const key = normalizeAssetKey(badgeId);
  const file = BADGE_FILE_BY_KEY[key];
  if (!file) {
    return null;
  }
  return `images/badges/${encodeURIComponent(file)}.png`;
}

function resolveCountryFlagPath(countryValue) {
  const key = normalizeAssetKey(countryValue);
  const file = COUNTRY_FLAG_FILE_BY_KEY[key];
  if (!file) {
    return null;
  }
  return `images/Country%20Flags/${encodeURIComponent(file)}.png`;
}

function resolveCountryMeta(countryValue) {
  const key = normalizeAssetKey(countryValue);
  const file = COUNTRY_FLAG_FILE_BY_KEY[key];
  if (!file) {
    return null;
  }

  const displayName = COUNTRY_DISPLAY_NAME_BY_FILE[file];
  if (!displayName) {
    return null;
  }

  return {
    displayName,
    flagPath: `images/Country%20Flags/${encodeURIComponent(file)}.png`,
  };
}

function resolveCountryFlagCandidatePaths(countryValue) {
  const rawValue = String(countryValue || "").trim();
  if (!rawValue) {
    return [];
  }

  const key = normalizeAssetKey(rawValue);
  const mapped = COUNTRY_FLAG_FILE_BY_KEY[key];
  const codeLike = rawValue.toUpperCase();

  const candidates = [mapped, rawValue, codeLike, codeLike.slice(0, 2)].filter(
    Boolean,
  );

  return [...new Set(candidates)].map(
    (name) => `images/Country%20Flags/${encodeURIComponent(name)}.png`,
  );
}

function isRegionalBadgeId(badgeId) {
  return LOCAL_BADGE_KEYS.has(normalizeAssetKey(badgeId));
}

function isPrestigeBadgeId(badgeId) {
  return normalizeAssetKey(badgeId).endsWith("prestige");
}

function loadBadgeImage(src) {
  if (!src) {
    return Promise.reject(new Error("Missing image source"));
  }

  if (badgeImageCache.has(src)) {
    return badgeImageCache.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });

  badgeImageCache.set(src, promise);
  return promise;
}

async function ensurePrestigeFontLoaded() {
  if (!document.fonts || typeof document.fonts.load !== "function") {
    return;
  }

  try {
    await document.fonts.load('24px "OETZTYP"');
  } catch (_) {
    // Fall back to whatever font is available.
  }
}

function drawPrestigeRank(ctx, width, height, rankText) {
  const text = String(rankText || "").trim();
  if (!text) {
    return;
  }

  const maxWidth = Math.round(width * 0.82);
  const minFontSize = Math.max(4, Math.round(height * 0.09));
  let fontSize = Math.max(minFontSize, Math.round(height * 0.18));

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  while (fontSize >= minFontSize) {
    ctx.font = `${fontSize}px "OETZTYP", sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      break;
    }
    fontSize -= 1;
  }

  const x = Math.round(width / 2);
  const y = Math.round(height * 0.86);
  ctx.fillText(text, x, y);
}

function shouldShowBadgeCountOverlay(imgEl) {
  const badgeType = String(imgEl?.getAttribute("data-badge-type") || "")
    .trim()
    .toUpperCase();
  const isPrestige = imgEl?.getAttribute("data-merge-prestige") === "1";
  const count = Number(imgEl?.getAttribute("data-badge-count") || 0);

  if (isPrestige) {
    return false;
  }

  if (badgeType !== "WORLD" && badgeType !== "REGION") {
    return false;
  }

  return Number.isFinite(count) && count > 1;
}

async function mergeBadgeCountOverlay(baseSrc, countText, options) {
  const opts = options || {};
  const fontScale = Number(opts.fontScale) || 1;
  const text = String(countText || "").trim();
  if (!baseSrc || !text) {
    return null;
  }

  const key = JSON.stringify(["count", baseSrc, text, fontScale]);
  if (badgeComposeCache.has(key)) {
    return badgeComposeCache.get(key);
  }

  const promise = (async () => {
    const baseImg = await loadBadgeImage(baseSrc);
    await ensurePrestigeFontLoaded();

    const width = Math.max(1, baseImg.naturalWidth || baseImg.width || 64);
    const height = Math.max(1, baseImg.naturalHeight || baseImg.height || 64);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return null;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(baseImg, 0, 0, width, height);

    const maxWidth = Math.round(width * 0.42);
    const minFontSize = Math.max(7, Math.round(height * 0.12 * fontScale));
    let fontSize = Math.max(minFontSize, Math.round(height * 0.24 * fontScale));

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    while (fontSize >= minFontSize) {
      ctx.font = `${fontSize}px "OETZTYP", sans-serif`;
      if (ctx.measureText(text).width <= maxWidth) {
        break;
      }
      fontSize -= 1;
    }

    const x = Math.round(width * 0.95);
    const y = Math.round(height * 0.88);
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.2));
    ctx.strokeText(text, x, y);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, x, y);

    return canvas.toDataURL("image/png");
  })();

  badgeComposeCache.set(key, promise);
  return promise;
}

async function applyBadgeCountToImage(imgEl) {
  if (!imgEl || !shouldShowBadgeCountOverlay(imgEl)) {
    return;
  }

  const count = Number(imgEl.getAttribute("data-badge-count") || 0);
  const badgeType = String(imgEl.getAttribute("data-badge-type") || "")
    .trim()
    .toUpperCase();
  const countText = `x${Math.trunc(count)}`;
  const baseForCount =
    imgEl.getAttribute("data-count-base-src") ||
    imgEl.getAttribute("data-base-src") ||
    imgEl.src;

  if (!baseForCount) {
    return;
  }

  const mergedSrc = await mergeBadgeCountOverlay(baseForCount, countText, {
    fontScale: badgeType === "REGION" ? 1.35 : badgeType === "WORLD" ? 1.1 : 1,
  });
  if (mergedSrc) {
    imgEl.src = mergedSrc;
  }
}

function enhanceBadgeCountOverlays() {
  const imageNodes = document.querySelectorAll(".js-badge-count-image");
  imageNodes.forEach((node) => {
    applyBadgeCountToImage(node).catch(() => {
      // Keep base badge image if count overlay fails.
    });
  });
}

async function mergeBadgeOverlay(baseSrc, overlaySrc, options) {
  const opts = options || {};
  const offsetY = Number(opts.offsetY) || 0;
  const scale = Number(opts.scale) || 1;
  const rankText = String(opts.rankText || "").trim();
  const key = JSON.stringify([baseSrc, overlaySrc, offsetY, scale, rankText]);
  if (badgeComposeCache.has(key)) {
    return badgeComposeCache.get(key);
  }

  const promise = (async () => {
    const [baseImg, overlayImg] = await Promise.all([
      loadBadgeImage(baseSrc),
      loadBadgeImage(overlaySrc),
    ]);

    await ensurePrestigeFontLoaded();

    const baseW = Math.max(1, baseImg.naturalWidth || baseImg.width || 64);
    const baseH = Math.max(1, baseImg.naturalHeight || baseImg.height || 64);
    const overlayW =
      Math.max(1, overlayImg.naturalWidth || overlayImg.width || 64) * scale;
    const overlayH =
      Math.max(1, overlayImg.naturalHeight || overlayImg.height || 64) * scale;

    const width = Math.max(baseW, overlayW);
    const height = Math.max(baseH, overlayH) + Math.max(0, Math.round(offsetY));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return null;
    }

    const baseX = Math.round((width - baseW) / 2);
    const baseY = height - baseH;
    const overlayX = Math.round((width - overlayW) / 2);
    const overlayY = height - overlayH + Math.round(offsetY);

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(baseImg, baseX, baseY, baseW, baseH);
    ctx.drawImage(overlayImg, overlayX, overlayY, overlayW, overlayH);

    drawPrestigeRank(ctx, width, height, rankText);

    return canvas.toDataURL("image/png");
  })();

  badgeComposeCache.set(key, promise);
  return promise;
}

async function mergeBadgeOverlayWithFallback(
  baseSrc,
  candidateOverlaySources,
  options,
) {
  const uniqueCandidates = [
    ...new Set((candidateOverlaySources || []).filter(Boolean)),
  ];

  for (const overlaySrc of uniqueCandidates) {
    try {
      const merged = await mergeBadgeOverlay(baseSrc, overlaySrc, options);
      if (merged) {
        return merged;
      }
    } catch (_) {
      // Try next candidate path.
    }
  }

  return null;
}

async function applyPrestigeMergeToImage(imgEl) {
  if (!imgEl) {
    return;
  }

  const shouldMerge = imgEl.getAttribute("data-merge-prestige") === "1";
  const baseSrc = imgEl.getAttribute("data-base-src") || "";
  if (!shouldMerge || !baseSrc) {
    return;
  }

  const rankValue = imgEl.getAttribute("data-prestige-rank") || "";

  const mergedSrc = await mergeBadgeOverlayWithFallback(
    baseSrc,
    PRESTIGE_OVERLAY_CANDIDATE_PATHS,
    {
      offsetY: 4,
      scale: 1.2,
      rankText:
        Number.isFinite(Number(rankValue)) && Number(rankValue) > 0
          ? formatNumber(Number(rankValue))
          : "",
    },
  );

  if (mergedSrc) {
    imgEl.src = mergedSrc;
  }
}

function enhancePrestigeBadges() {
  const imageNodes = document.querySelectorAll(".js-prestige-badge-image");
  imageNodes.forEach((node) => {
    applyPrestigeMergeToImage(node).catch(() => {
      // Keep base badge image if merge fails.
    });
  });
}

function getRegionalMergeOptions(badgeId, countryValue) {
  const cfg = window.RegionalBadgePositionConfig || {};
  const defaults = cfg.defaults || {};
  const badgeKey = normalizeAssetKey(badgeId);
  const byBadge = (cfg.byBadge && cfg.byBadge[badgeKey]) || {};

  const countryCode = String(countryValue || "")
    .trim()
    .toUpperCase();
  const byBadgeCountryMap =
    (cfg.byBadgeCountry && cfg.byBadgeCountry[badgeKey]) || {};
  const byBadgeCountry = (countryCode && byBadgeCountryMap[countryCode]) || {};

  return {
    flagScale: Number(defaults.flagScale) || 1.2,
    offsetX:
      Number(byBadgeCountry.offsetX ?? byBadge.offsetX ?? defaults.offsetX) ||
      0,
    offsetY:
      Number(byBadgeCountry.offsetY ?? byBadge.offsetY ?? defaults.offsetY) ||
      0,
  };
}

async function applyRegionalMergeToImage(imgEl, fallbackCountryValue) {
  if (!imgEl) {
    return;
  }

  const composer = window.RegionalBadgeComposer;
  if (
    !composer ||
    typeof composer.mergeRegionalBadgeWithFallback !== "function"
  ) {
    return;
  }

  const baseSrc = imgEl.getAttribute("data-base-src") || "";
  const badgeId = imgEl.getAttribute("data-badge-id") || "";
  if (!baseSrc || !isRegionalBadgeId(badgeId)) {
    return;
  }

  const perBadgeCountry = imgEl.getAttribute("data-country") || "";
  const countryForBadge = perBadgeCountry || fallbackCountryValue;
  const flagCandidates = resolveCountryFlagCandidatePaths(countryForBadge);
  const mergeOptions = getRegionalMergeOptions(badgeId, countryForBadge);
  if (!flagCandidates.length) {
    const badgeEl = imgEl.closest(".badge");
    if (badgeEl) {
      badgeEl.remove();
    }
    return;
  }

  const mergedSrc = await composer.mergeRegionalBadgeWithFallback(
    baseSrc,
    flagCandidates,
    mergeOptions,
  );

  if (mergedSrc) {
    imgEl.setAttribute("data-count-base-src", mergedSrc);
    imgEl.src = mergedSrc;
    applyBadgeCountToImage(imgEl).catch(() => {
      // Keep merged badge image if count overlay fails.
    });
    return;
  }

  const badgeEl = imgEl.closest(".badge");
  if (badgeEl) {
    badgeEl.remove();
  }
}

function enhanceRegionalBadges(fallbackCountryValue) {
  const imageNodes = document.querySelectorAll(".js-regional-badge-image");
  imageNodes.forEach((node) => {
    applyRegionalMergeToImage(node, fallbackCountryValue).catch(() => {
      // Keep base badge image if merge fails.
    });
  });
}

function renderCountryLabel(countryValue) {
  if (!countryLabel) {
    return;
  }

  const value = String(countryValue || "").trim();
  const countryMeta = resolveCountryMeta(value);

  if (!countryMeta) {
    countryLabel.textContent = "Country - N/A";
    return;
  }

  countryLabel.textContent = "Country: ";
  const countryMetaEl = document.createElement("span");
  countryMetaEl.className = "country-meta";

  const nameEl = document.createElement("span");
  nameEl.textContent = countryMeta.displayName;

  const flagEl = document.createElement("img");
  flagEl.src = countryMeta.flagPath;
  flagEl.alt = countryMeta.displayName;
  flagEl.className = "country-badge-image";
  flagEl.loading = "lazy";
  flagEl.addEventListener("error", () => {
    countryLabel.textContent = "Country - N/A";
  });

  countryMetaEl.append(nameEl, flagEl);
  countryLabel.appendChild(countryMetaEl);
}

function renderBadges(rawProfile, countryValue) {
  const source = rawProfile || {};
  const featured = source.FeaturedBadge || null;
  const badges = Array.isArray(source.Badges) ? source.Badges : [];

  if (featured && featured.id && featuredBadgeWrap) {
    const featuredIsPrestige = isPrestigeBadgeId(featured.id);
    const rawScore = Number(featured.score) || 0;
    const score = featuredIsPrestige ? rawScore / 10 : rawScore;
    const featuredImg = resolveBadgeImagePath(featured.id);
    const featuredAttr = escapeHtml(featured.id);
    const featuredType = String(featured.type || "")
      .trim()
      .toUpperCase();
    const featuredCount = Number(featured.count) || 0;
    const featuredPrestigeRankRaw =
      Number.isFinite(Number(featured.rank)) && Number(featured.rank) > 0
        ? String(Math.trunc(Number(featured.rank)) + 1)
        : "";

    const featuredCountry = String(featured.cc || "").trim();

    featuredBadgeWrap.innerHTML = `
      <span class="badge" title="${escapeHtml(featured.id)} (Rank: ${formatNumber((Number(featured.rank) || 0) + 1)}, Score: ${formatNumber(score)})">
        ${featuredImg ? `<img src="${featuredImg}" data-base-src="${featuredImg}" data-count-base-src="${featuredImg}" data-badge-id="${featuredAttr}" data-badge-type="${escapeHtml(featuredType)}" data-badge-count="${escapeHtml(String(featuredCount))}" data-country="${escapeHtml(featuredCountry)}" data-merge-prestige="${featuredIsPrestige ? "1" : "0"}" data-prestige-rank="${escapeHtml(featuredPrestigeRankRaw)}" alt="${escapeHtml(featured.id)}" class="badge-image js-regional-badge-image js-prestige-badge-image js-badge-count-image" loading="lazy" />` : `<span>${escapeHtml(featured.id)}</span>`}
      </span>
    `;
  } else if (featuredBadgeWrap) {
    featuredBadgeWrap.innerHTML =
      "<span class='muted'>No featured badge.</span>";
  }

  if (!badgesWrap) {
    return;
  }

  if (!badges.length) {
    badgesWrap.innerHTML = "<span class='muted'>No badges found.</span>";
    return;
  }

  badgesWrap.innerHTML = badges
    .map((badge) => {
      const badgeId = String(badge.id || "");
      const badgeIsPrestige = isPrestigeBadgeId(badgeId);
      const rawScore = Number(badge.score) || 0;
      const score = badgeIsPrestige ? rawScore / 10 : rawScore;
      const rank = (Number(badge.rank) || 0) + 1;
      const badgeImg = resolveBadgeImagePath(badgeId);
      const badgeAttr = escapeHtml(badgeId);
      const badgeType = String(badge.type || "")
        .trim()
        .toUpperCase();
      const badgeCount = Number(badge.count) || 0;
      const badgeCountry = String(badge.cc || "").trim();
      const badgePrestigeRankRaw =
        Number.isFinite(Number(badge.rank)) && Number(badge.rank) > 0
          ? String(Math.trunc(Number(badge.rank)) + 1)
          : "";

      return `
        <span class="badge" title="${escapeHtml(badgeId)} (Rank: ${formatNumber(rank)}, Score: ${formatNumber(score)})">
          ${badgeImg ? `<img src="${badgeImg}" data-base-src="${badgeImg}" data-count-base-src="${badgeImg}" data-badge-id="${badgeAttr}" data-badge-type="${escapeHtml(badgeType)}" data-badge-count="${escapeHtml(String(badgeCount))}" data-country="${escapeHtml(badgeCountry)}" data-merge-prestige="${badgeIsPrestige ? "1" : "0"}" data-prestige-rank="${escapeHtml(badgePrestigeRankRaw)}" alt="${escapeHtml(badgeId)}" class="badge-image js-regional-badge-image js-prestige-badge-image js-badge-count-image" loading="lazy" />` : `<span>${escapeHtml(badgeId)}</span>`}
        </span>
      `;
    })
    .join("");

  enhancePrestigeBadges();
  enhanceBadgeCountOverlays();
  enhanceRegionalBadges(countryValue);
}

function renderPlayerProfile(data) {
  const profile = data.profile || {};
  const stats = profile.stats || {};
  const leaderboards = profile.leaderboards || {};
  const weekly = leaderboards.weekly || {};
  const prestige = leaderboards.prestige || {};
  const rawProfile = data.raw || {};
  const tournamentWinsRaw = Number(rawProfile.TournamentWins);
  const tournamentLossesRaw = Number(rawProfile.TournamentLosses);
  const hasTournamentWins = Number.isFinite(tournamentWinsRaw);
  const hasTournamentLosses = Number.isFinite(tournamentLossesRaw);
  const tournamentWins = hasTournamentWins ? tournamentWinsRaw : null;
  const tournamentLosses = hasTournamentLosses ? tournamentLossesRaw : null;
  const tournamentPlayed =
    hasTournamentWins || hasTournamentLosses
      ? (hasTournamentWins ? tournamentWinsRaw : 0) +
        (hasTournamentLosses ? tournamentLossesRaw : 0)
      : null;

  usernameEl.textContent = profile.username || "Unknown";
  playerIdLabel.textContent = `Player ID: ${data.playerID || "Unknown"}`;
  renderCountryLabel(rawProfile.CountryCode);
  clanIdLabel.textContent = `Guild ID: ${profile.clanID || "None"}`;
  guildAvatarRequestToken += 1;
  avatarEl.classList.remove("avatar--with-clan-image");
  avatarEl.classList.remove("avatar--clan-composite");
  avatarEl.classList.add("avatar--with-image");
  avatarEl.innerHTML = "";

  renderTableRows(statsTableBody, [
    {
      label: "Win Rate",
      value: `${formatNumber(stats.wins)}/${formatNumber(stats.losses)} (${stats.winRate === null || stats.winRate === undefined ? "0.0" : stats.winRate}%)`,
    },
    {
      label: "Current Win Streak",
      value: formatNumber(rawProfile.CurrentWinStreak),
    },
    { label: "Best Win Streak", value: formatNumber(rawProfile.BestWinStreak) },
    { label: "Battlescore", value: formatNumber(profile.xp) },
    { label: "Medallions", value: formatNumber(profile.medallions) },
    {
      label: "Total Medallions from Wins",
      value: formatNumber(rawProfile.MedallionWinsTotal),
    },
    {
      label: "Medallions this Week",
      value: formatNumber(rawProfile.MedallionWinsWeekly),
    },
    { label: "Tournament Played", value: formatNumber(tournamentPlayed) },
    { label: "Tournament Wins", value: formatNumber(tournamentWins) },
    { label: "Tournament Losses", value: formatNumber(tournamentLosses) },
    { label: "Clan", value: profile.clan || "-" },
    {
      label: "Weekly Leaderboard",
      value:
        weekly.rank === null || weekly.rank === undefined
          ? "-"
          : `#${formatNumber(weekly.rank)} (${formatNumber(weekly.score)})`,
    },
    {
      label: "Prestige Leaderboard",
      value:
        prestige.rank === null || prestige.rank === undefined
          ? "-"
          : `#${formatNumber(prestige.rank)} (${formatNumber(prestige.score)})`,
    },
  ]);

  renderBadges(rawProfile, rawProfile.CountryCode);

  if (featuredBadgeSection) {
    featuredBadgeSection.hidden = false;
  }

  if (badgesSection) {
    badgesSection.hidden = false;
  }

  if (profile.clanID && clanJumpWrap && clanJumpLink) {
    clanJumpLink.href = `clans_v2.html?v=20260419t&clanID=${encodeURIComponent(profile.clanID)}`;
    clanJumpWrap.hidden = false;
  } else if (clanJumpWrap) {
    clanJumpWrap.hidden = true;
  }

  profileGrid.hidden = false;
}

function renderGuildProfile(data) {
  const guild = data.guild || {};
  const rawGuild = data.raw || null;
  const guildID = guild.guildID || data.guildID || "Unknown";
  const guildName = guild.name || "Unknown Guild";

  usernameEl.textContent = guildName;
  playerIdLabel.textContent = `Guild ID: ${guildID}`;
  renderCountryLabel(guild.country);
  clanIdLabel.textContent = `Owner: ${guild.ownerName || guild.owner || "-"}`;
  renderGuildAvatar(guildName, guild, rawGuild);

  renderTableRows(statsTableBody, [
    { label: "Owner", value: guild.ownerName || guild.owner || "-" },
    { label: "Status", value: guild.status || "-" },
    {
      label: "Members",
      value: `${formatNumber(guild.numMembers || 0)}${guild.numMembersPending ? ` (+${formatNumber(guild.numMembersPending)} pending)` : ""}`,
    },
    { label: "Max Members", value: formatNumber(guild.maximumMembers || 0) },
    { label: "Tagline", value: guild.tagline || "-" },
    { label: "Shortcode", value: guild.shortcode || "-" },
    {
      label: "Chat Enabled",
      value:
        guild.chatEnabled === null || guild.chatEnabled === undefined
          ? "-"
          : guild.chatEnabled
            ? "Yes"
            : "No",
    },
    { label: "Cached", value: data.cached ? "Yes" : "No" },
  ]);

  if (featuredBadgeSection) {
    featuredBadgeSection.hidden = true;
  }

  if (badgesSection) {
    badgesSection.hidden = true;
  }

  if (clanJumpWrap) {
    clanJumpWrap.hidden = true;
  }

  profileGrid.hidden = false;
}

async function loadLookup(rawId, forceRefresh = false) {
  playerError.hidden = true;
  profileGrid.hidden = true;

  const lookupId = String(rawId || "").trim();
  if (!lookupId) {
    playerError.textContent = "Please enter an ID.";
    playerError.hidden = false;
    return;
  }

  const query = new URLSearchParams({ id: lookupId });
  if (forceRefresh) query.set("refresh", "1");

  try {
    const data = await apiGet(`player.php?${query.toString()}`);

    const profile = data?.profile || {};
    const hasClanName =
      typeof profile.clan === "string" && profile.clan.trim().length > 0;

    if (!hasClanName && profile.clanID) {
      try {
        const guildData = await apiGet(
          `guild.php?id=${encodeURIComponent(profile.clanID)}`,
        );
        const guildName = guildData?.guild?.name;
        if (typeof guildName === "string" && guildName.trim().length > 0) {
          data.profile.clan = guildName.trim();
        }
      } catch (_) {
        // Keep existing fallback when guild lookup fails.
      }
    }

    renderPlayerProfile(data);

    const url = new URL(window.location.href);
    url.searchParams.set("id", lookupId);
    url.searchParams.delete("kind");
    window.history.replaceState({}, "", url);
  } catch (error) {
    try {
      const guildData = await apiGet(
        `guild.php?id=${encodeURIComponent(lookupId)}${forceRefresh ? "&refresh=1" : ""}`,
      );
      renderGuildProfile(guildData);

      const url = new URL(window.location.href);
      url.searchParams.set("id", lookupId);
      url.searchParams.set("kind", "clan");
      window.history.replaceState({}, "", url);
      return;
    } catch (guildError) {
      playerError.textContent = error.message || guildError.message;
      playerError.hidden = false;
    }
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

    loadLookup(value);
  });

  const paramId = queryParam("id");
  if (paramId) {
    playerInput.value = paramId;
    loadLookup(paramId);
  }
}
