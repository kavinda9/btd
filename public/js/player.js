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
  au: "Australia",
  australia: "Australia",
  at: "Austria",
  austria: "Austria",
  be: "Belgium",
  belgium: "Belgium",
  br: "Brazil",
  brazil: "Brazil",
  bg: "Bulgaria",
  bulgaria: "Bulgaria",
  ca: "Canada",
  canada: "Canada",
  cl: "Chile",
  chile: "Chile",
  cn: "China",
  china: "China",
  co: "Colombia",
  colombia: "Colombia",
  hr: "Croatia",
  croatia: "Croatia",
  cz: "CzechRepublic",
  czechrepublic: "CzechRepublic",
  dk: "Denmark",
  denmark: "Denmark",
  ee: "Estonia",
  estonia: "Estonia",
  fi: "Finland",
  finland: "Finland",
  fr: "France",
  france: "France",
  gb: "GB",
  uk: "GB",
  unitedkingdom: "GB",
  de: "Germany",
  germany: "Germany",
  gr: "Greece",
  greece: "Greece",
  hk: "HongKong",
  hongkong: "HongKong",
  hu: "Hungary",
  hungary: "Hungary",
  id: "Indonesia",
  indonesia: "Indonesia",
  ie: "Ireland",
  ireland: "Ireland",
  il: "Israel",
  israel: "Israel",
  it: "Italy",
  italy: "Italy",
  ci: "IvoryCoast",
  ivorycoast: "IvoryCoast",
  cotedivoire: "IvoryCoast",
  jp: "Japan",
  japan: "Japan",
  lv: "Latvia",
  latvia: "Latvia",
  lt: "Lithuania",
  lithuania: "Lithuania",
  my: "Malaysia",
  malaysia: "Malaysia",
  mx: "Mexico",
  mexico: "Mexico",
  nl: "Netherlands",
  netherlands: "Netherlands",
  nz: "NewZealand",
  newzealand: "NewZealand",
  no: "Norway",
  norway: "Norway",
  ph: "Philippines",
  philippines: "Philippines",
  pl: "Poland",
  poland: "Poland",
  pt: "Portugal",
  portugal: "Portugal",
  tw: "RepublicOfChina",
  republicofchina: "RepublicOfChina",
  ro: "Romania",
  romania: "Romania",
  ru: "Russia",
  russia: "Russia",
  sa: "SaudiArabia",
  saudiarabia: "SaudiArabia",
  sg: "Singapore",
  singapore: "Singapore",
  si: "Slovenia",
  slovenia: "Slovenia",
  za: "SouthAfrica",
  southafrica: "SouthAfrica",
  kr: "SouthKorea",
  southkorea: "SouthKorea",
  es: "Spain",
  spain: "Spain",
  se: "Sweden",
  sweden: "Sweden",
  ch: "Switzerland",
  switzerland: "Switzerland",
  th: "Thailand",
  thailand: "Thailand",
  tr: "Turkey",
  turkey: "Turkey",
  ua: "Ukraine",
  ukraine: "Ukraine",
  ae: "UnitedArabEmirates",
  unitedarabemirates: "UnitedArabEmirates",
  us: "US",
  unitedstates: "US",
  vn: "Vietnam",
  vietnam: "Vietnam",
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
  if (!flagCandidates.length) {
    return;
  }

  const mergedSrc = await composer.mergeRegionalBadgeWithFallback(
    baseSrc,
    flagCandidates,
    { flagScale: 0.44, padding: 1 },
  );

  if (mergedSrc) {
    imgEl.src = mergedSrc;
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

  const value = String(countryValue || "").trim() || "N/A";
  const flagPath = resolveCountryFlagPath(value);

  if (!flagPath) {
    countryLabel.textContent = `Country: ${value}`;
    return;
  }

  countryLabel.innerHTML = `Country: <span class="country-meta"><img src="${flagPath}" alt="${escapeHtml(value)}" class="country-badge-image" loading="lazy" /> ${escapeHtml(value)}</span>`;
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
  const clan = leaderboards.clan || {};
  const rawProfile = data.raw || {};

  usernameEl.textContent = profile.username || "Unknown";
  playerIdLabel.textContent = `Player ID: ${data.playerID || "Unknown"}`;
  renderCountryLabel(rawProfile.CountryCode);
  clanIdLabel.textContent = `Guild ID: ${profile.clanID || "None"}`;
  avatarEl.textContent = createAvatarInitials(profile.username || "Unknown");

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
    { label: "Clan", value: profile.clan || "-" },
    {
      label: "Clan Leaderboard",
      value:
        clan.rank === null || clan.rank === undefined
          ? "-"
          : `#${formatNumber(clan.rank)} (${formatNumber(clan.score)})`,
    },
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
    { label: "Cached", value: data.cached ? "Yes" : "No" },
  ]);

  renderBadges(rawProfile, rawProfile.CountryCode);

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
  avatarEl.textContent = createAvatarInitials(guildName);

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
    { label: "Country", value: guild.country || "-" },
    { label: "Cached", value: data.cached ? "Yes" : "No" },
  ]);

  if (featuredBadgeWrap) {
    featuredBadgeWrap.innerHTML =
      "<span class='muted'>No featured badge.</span>";
  }

  if (badgesWrap) {
    badgesWrap.innerHTML = "<span class='muted'>No badges found.</span>";
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
