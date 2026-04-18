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
    imgEl.src = mergedSrc;
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
    const rawScore = Number(featured.score) || 0;
    const score = String(featured.id).toLowerCase().includes("prestige")
      ? rawScore / 10
      : rawScore;
    const featuredImg = resolveBadgeImagePath(featured.id);
    const featuredAttr = escapeHtml(featured.id);

    const featuredCountry = String(featured.cc || "").trim();

    featuredBadgeWrap.innerHTML = `
      <span class="badge" title="${escapeHtml(featured.id)} (Rank: ${formatNumber((Number(featured.rank) || 0) + 1)}, Score: ${formatNumber(score)})">
        ${featuredImg ? `<img src="${featuredImg}" data-base-src="${featuredImg}" data-badge-id="${featuredAttr}" data-country="${escapeHtml(featuredCountry)}" alt="${escapeHtml(featured.id)}" class="badge-image js-regional-badge-image" loading="lazy" />` : `<span>${escapeHtml(featured.id)}</span>`}
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
      const rawScore = Number(badge.score) || 0;
      const score = badgeId.toLowerCase().includes("prestige")
        ? rawScore / 10
        : rawScore;
      const rank = (Number(badge.rank) || 0) + 1;
      const badgeImg = resolveBadgeImagePath(badgeId);
      const badgeAttr = escapeHtml(badgeId);
      const badgeCountry = String(badge.cc || "").trim();

      return `
        <span class="badge" title="${escapeHtml(badgeId)} (Rank: ${formatNumber(rank)}, Score: ${formatNumber(score)})">
          ${badgeImg ? `<img src="${badgeImg}" data-base-src="${badgeImg}" data-badge-id="${badgeAttr}" data-country="${escapeHtml(badgeCountry)}" alt="${escapeHtml(badgeId)}" class="badge-image js-regional-badge-image" loading="lazy" />` : `<span>${escapeHtml(badgeId)}</span>`}
        </span>
      `;
    })
    .join("");

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
  avatarEl.classList.remove("avatar--with-clan-image");
  avatarEl.classList.add("avatar--with-image");
  avatarEl.textContent = "";

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
    clanJumpLink.href = `clans.html?clanID=${encodeURIComponent(profile.clanID)}`;
    clanJumpWrap.hidden = false;
  } else if (clanJumpWrap) {
    clanJumpWrap.hidden = true;
  }

  profileGrid.hidden = false;
}

function renderGuildProfile(data) {
  const guild = data.guild || {};
  const guildID = guild.guildID || data.guildID || "Unknown";
  const guildName = guild.name || "Unknown Guild";

  usernameEl.textContent = guildName;
  playerIdLabel.textContent = `Guild ID: ${guildID}`;
  renderCountryLabel(guild.country);
  clanIdLabel.textContent = `Owner: ${guild.ownerName || guild.owner || "-"}`;
  avatarEl.classList.remove("avatar--with-image");
  avatarEl.classList.add("avatar--with-clan-image");
  avatarEl.textContent = "";

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
