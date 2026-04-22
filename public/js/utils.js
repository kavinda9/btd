const API_BASE =
  window.BTD_API_BASE ||
  "https://priority-static-api.nkstatic.com/storage/static";

const NK_DECLARED_CURRENT_WEEK = 570;
const NK_SEASON_ANCHOR_WEEK = 569;
const NK_SEASON_ANCHOR_VALUE = 238;
const NK_WEEK_TO_SEASON_OFFSET = NK_SEASON_ANCHOR_WEEK - NK_SEASON_ANCHOR_VALUE;
const NK_WEEK_SECONDS = 7 * 24 * 60 * 60;
const NK_BIWEEK_SECONDS = 14 * 24 * 60 * 60;
const NK_WEEKLY_RESET_BASE_UNIX =
  new Date("2015-12-16T10:00:00+00:00").getTime() / 1000;
const NK_CACHE_TTL_MS = 60 * 1000;

const nkRequestCache = new Map();

function buildApiUrl(path) {
  return `${String(API_BASE || "").replace(/\/+$/, "")}/${String(path || "").replace(/^\/+/, "")}`;
}

function getWeeklyModeName(weekNumber) {
  const week = Number(weekNumber);
  if (!Number.isFinite(week) || week <= 0) {
    return null;
  }

  const newRotation = [
    "R3 Speed Bananza ZOMG",
    "Speed Bananza ZOMG",
    "Speed Bananza Boosts Only",
    "Speed With Fire ZOMG",
  ];

  const oldRotation = [
    "Speed With Fire Cards",
    "Speed With Fire",
    "Speed Bananza",
    "Speed Mega Boost Cards",
  ];

  if (week >= 423) {
    return newRotation[(week - 1) % newRotation.length] || null;
  }

  const anchor = 419;
  const size = oldRotation.length;
  const index = (((week - anchor) % size) + size) % size;
  return oldRotation[index] || null;
}

function parseJsonStrict(text, contextLabel) {
  try {
    return JSON.parse(text);
  } catch (_) {
    throw new Error(`${contextLabel} returned non-JSON data.`);
  }
}

function unwrapNkPayload(decoded) {
  if (!decoded || typeof decoded !== "object") {
    return {};
  }

  let payload = decoded;

  if (typeof decoded.data === "string") {
    const inner = parseJsonStrict(decoded.data, "NinjaKiwi payload");
    if (inner && typeof inner === "object") {
      payload = inner;
    }
  } else if (decoded.data && typeof decoded.data === "object") {
    payload = decoded.data;
  }

  if (
    payload &&
    typeof payload === "object" &&
    payload[""] &&
    typeof payload[""] === "object"
  ) {
    payload = payload[""];
  }

  return payload && typeof payload === "object" ? payload : {};
}

function parseNkEntries(decoded) {
  const payload = unwrapNkPayload(decoded);
  let entries = [];
  let rankBase = 0;

  if (
    payload.scores &&
    payload.scores.equal &&
    Array.isArray(payload.scores.equal)
  ) {
    entries = payload.scores.equal;
    rankBase =
      payload.scores.above && Array.isArray(payload.scores.above)
        ? payload.scores.above.length
        : 0;
  } else if (payload.scores && Array.isArray(payload.scores)) {
    entries = payload.scores;
  } else if (Array.isArray(payload.leaderboard)) {
    entries = payload.leaderboard;
  } else if (Array.isArray(payload.data)) {
    entries = payload.data;
  } else if (Array.isArray(payload)) {
    entries = payload;
  }

  return {
    payload,
    entries,
    rankBase,
  };
}

function normalizeCountryCode(value) {
  const code = String(value || "")
    .trim()
    .toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

function normalizePrestigeScore(rawScore) {
  return Math.floor(Number(rawScore || 0) / 10);
}

function findRankedScore(parsed, targetId) {
  if (!parsed || !Array.isArray(parsed.entries)) {
    return { rank: null, score: null };
  }

  const target = String(targetId || "");
  if (!target) {
    return { rank: null, score: null };
  }

  for (let i = 0; i < parsed.entries.length; i++) {
    const entry = parsed.entries[i] || {};
    const entryId = String(
      entry.userID || entry.playerID || entry.clanID || entry.id || "",
    );
    if (entryId === target) {
      return {
        rank: Number(parsed.rankBase || 0) + i + 1,
        score: Number(entry.score ?? entry.value ?? 0),
      };
    }
  }

  return { rank: null, score: null };
}

async function nkGet(path, options = {}) {
  const bust = options && options.bust === true;
  const cacheKey = String(path || "");
  const now = Date.now();

  if (!bust) {
    const cached = nkRequestCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.promise;
    }
  }

  const promise = (async () => {
    const response = await fetch(buildApiUrl(path), {
      headers: { Accept: "application/json" },
    });

    const text = await response.text();
    const json = parseJsonStrict(text, "NinjaKiwi endpoint");

    if (!response.ok) {
      throw new Error(`Request failed (${response.status}).`);
    }

    if (json && typeof json === "object" && json.error) {
      throw new Error(String(json.error));
    }

    return json;
  })();

  nkRequestCache.set(cacheKey, {
    expiresAt: now + NK_CACHE_TTL_MS,
    promise,
  });

  try {
    return await promise;
  } catch (error) {
    nkRequestCache.delete(cacheKey);
    throw error;
  }
}

async function nkGetOptional(path, options = {}) {
  try {
    return await nkGet(path, options);
  } catch (_) {
    return null;
  }
}

function parseEndpoint(path) {
  const value = String(path || "");
  const [rawEndpoint, rawQuery = ""] = value.split("?");
  const endpoint = rawEndpoint.replace(/^\/+/, "").split("/").pop() || "";
  const params = new URLSearchParams(rawQuery);
  return { endpoint, params };
}

function formatRangeFromTimestamps(startTimestamp, endTimestamp) {
  const start = new Date(startTimestamp * 1000);
  const end = new Date(endTimestamp * 1000);

  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  const monthNames = [
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

  const startMonth = monthNames[start.getUTCMonth()];
  const endMonth = monthNames[end.getUTCMonth()];
  const startDay = String(start.getUTCDate()).padStart(2, "0");
  const endDay = String(end.getUTCDate()).padStart(2, "0");

  if (startYear === endYear && startMonth === endMonth) {
    return `${startYear} ${startMonth} ${startDay} - ${endDay}`;
  }

  if (startYear === endYear) {
    return `${startYear} ${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }

  return `${startYear} ${startMonth} ${startDay} - ${endYear} ${endMonth} ${endDay}`;
}

function getCurrentWeekNumber() {
  const now = Math.floor(Date.now() / 1000);
  const calculatedWeek = Math.max(
    1,
    Math.ceil((now - NK_WEEKLY_RESET_BASE_UNIX) / NK_WEEK_SECONDS),
  );
  return Math.max(NK_DECLARED_CURRENT_WEEK, calculatedWeek);
}

function getCurrentSeasonNumber(weekNumber = getCurrentWeekNumber()) {
  return getSeasonNumberFromWeek(weekNumber);
}

function getSeasonNumberFromWeek(weekNumber) {
  const week = Number(weekNumber);
  if (!Number.isFinite(week) || week <= 0) {
    return 1;
  }

  const seasonsDelta = Math.floor((week - NK_SEASON_ANCHOR_WEEK) / 2);
  return Math.max(1, NK_SEASON_ANCHOR_VALUE + seasonsDelta);
}

function getCurrentWeekStartTimestamp() {
  const currentWeek = getCurrentWeekNumber();
  return NK_WEEKLY_RESET_BASE_UNIX + (currentWeek - 1) * NK_WEEK_SECONDS;
}

function getPrestigeWeekRange(weekNumber) {
  const week = Number(weekNumber);
  if (!Number.isFinite(week) || week <= 0) {
    return "";
  }

  const anchorSeasonStart =
    NK_WEEKLY_RESET_BASE_UNIX + (NK_SEASON_ANCHOR_WEEK - 1) * NK_WEEK_SECONDS;
  const targetSeason = getSeasonNumberFromWeek(week);
  const seasonsDelta = targetSeason - NK_SEASON_ANCHOR_VALUE;
  const start = anchorSeasonStart + seasonsDelta * NK_BIWEEK_SECONDS;
  const end = start + NK_BIWEEK_SECONDS;

  return formatRangeFromTimestamps(start, end);
}

function validateWeekParam(params) {
  const value = String(params.get("week") || "").trim();
  if (!/^\d{1,6}$/.test(value)) {
    throw new Error("Invalid week number.");
  }

  const week = Number(value);
  if (!Number.isFinite(week) || week <= 0) {
    throw new Error("Invalid week number.");
  }

  return week;
}

async function getGuildNormalized(guildID, options = {}) {
  const id = String(guildID || "").trim();
  if (!id) {
    throw new Error("Missing guild ID.");
  }

  const payload = unwrapNkPayload(
    await nkGet(`appdocs/2/guilds/${encodeURIComponent(id)}`, options),
  );

  if (!payload || typeof payload !== "object" || !Object.keys(payload).length) {
    throw new Error("Guild data is malformed.");
  }

  const ownerId = String(payload.owner || payload.ownerID || "");
  let ownerName = ownerId || null;
  const skipOwnerLookup = options && options.skipOwnerLookup === true;

  if (ownerId && !skipOwnerLookup) {
    const ownerPayload = unwrapNkPayload(
      await nkGetOptional(
        `2/${encodeURIComponent(ownerId)}/PublicProfile.save`,
        options,
      ),
    );
    ownerName =
      ownerPayload.displayName ||
      ownerPayload.username ||
      ownerPayload.name ||
      ownerPayload.Name ||
      ownerName;
  }

  let tagline = payload.tagline || null;
  let symbolShield = null;
  let symbolIcon = null;
  let symbolLayers = [];

  const collectSymbolFromValue = (value) => {
    const text = String(value || "");
    if (!text) {
      return;
    }

    const matches = text.match(/Shield_\d+|Icon_\d+(?:_[A-Za-z0-9]+)?/gi);
    if (!Array.isArray(matches) || !matches.length) {
      return;
    }

    matches.forEach((layer) => {
      if (!layer) {
        return;
      }

      symbolLayers.push(layer);
      if (!symbolShield && /^Shield_\d+/i.test(layer)) {
        symbolShield = layer;
        return;
      }

      if (!symbolIcon && /^Icon_\d+/i.test(layer)) {
        symbolIcon = layer;
      }
    });
  };

  if (typeof tagline === "string" && tagline) {
    try {
      const decoded = JSON.parse(tagline);
      if (decoded && typeof decoded === "object") {
        const layers = decoded.Symbol?.Layers;
        if (Array.isArray(layers)) {
          layers.forEach((layer) => collectSymbolFromValue(layer));
        } else if (typeof layers === "string") {
          collectSymbolFromValue(layers);
        }
        collectSymbolFromValue(JSON.stringify(decoded));
        tagline = decoded.Tagline || decoded.tagline || tagline;
      }
    } catch (_) {
      // Keep the original string when tagline is not JSON.
      collectSymbolFromValue(tagline);
    }
  }

  symbolLayers = [...new Set(symbolLayers)];

  return {
    guildID: payload.guildID || payload.id || id,
    name: payload.name || payload.guildName || "Unknown Guild",
    owner: ownerId || null,
    ownerName,
    status: payload.status || payload.guildStatus || null,
    numMembers: Number(payload.numMembers ?? payload.members ?? 0),
    numMembersPending: Number(payload.numMembersPending ?? 0),
    maximumMembers: Number(payload.maximumMembers ?? payload.maxMembers ?? 0),
    tagline,
    shortcode: payload.shortcode || null,
    chatEnabled:
      payload.chatEnabled === undefined ? null : Boolean(payload.chatEnabled),
    country: payload.country || payload.countryCode || null,
    symbol: {
      shield: symbolShield,
      icon: symbolIcon,
      layers: symbolLayers,
    },
  };
}

async function mapLeaderboardWeekly(week, country, options = {}) {
  const countryCode = normalizeCountryCode(country || "");
  const weeklyPath = `appdocs/2/leaderboards/WeeklyMedallions:${week}${countryCode ? `:${countryCode}` : ""}.json`;
  const prestigeSeason = getCurrentSeasonNumber(week);
  const prestigePath = `appdocs/2/leaderboards/ladder:Season_${prestigeSeason}:Rating.json`;

  const [rawWeekly, rawPrestige] = await Promise.all([
    nkGet(weeklyPath, options),
    nkGetOptional(prestigePath, options),
  ]);

  const parsedWeekly = parseNkEntries(rawWeekly);
  const parsedPrestige = rawPrestige
    ? parseNkEntries(rawPrestige)
    : { payload: {}, entries: [], rankBase: 0 };

  const prestigeByPlayer = new Map();
  parsedPrestige.entries.forEach((entry, index) => {
    const playerID = String(entry.userID || entry.playerID || entry.id || "");
    if (!playerID) {
      return;
    }

    prestigeByPlayer.set(playerID, {
      score: normalizePrestigeScore(entry.score ?? entry.value ?? 0),
      rank: Number(parsedPrestige.rankBase || 0) + index + 1,
      name: entry.metadata || entry.username || entry.name || null,
    });
  });

  const players = [];

  parsedWeekly.entries.forEach((entry, index) => {
    const playerID = String(entry.userID || entry.playerID || entry.id || "");
    if (!playerID) {
      return;
    }

    const regional = prestigeByPlayer.get(playerID) || null;
    players.push({
      rank: Number(parsedWeekly.rankBase || 0) + index + 1,
      playerID,
      medallions: Number(entry.score ?? entry.medallions ?? entry.value ?? 0),
      prestige: regional ? Number(regional.score) : null,
      prestigeRank: regional ? Number(regional.rank) : null,
      username: entry.username || entry.name || entry.metadata || null,
      countryCode: normalizeCountryCode(
        entry.cc || entry.countryCode || entry.country,
      ),
    });
  });

  return {
    success: true,
    cached: false,
    cachedPrestige: false,
    country: countryCode || "GLOBAL",
    weekNumber: week,
    weekName: getWeeklyModeName(week),
    count: players.length,
    players,
    raw: null,
  };
}

async function mapPrestigeLeaderboard(season, options = {}) {
  const raw = await nkGet(
    `appdocs/2/leaderboards/ladder:Season_${season}:Rating.json`,
    options,
  );
  const parsed = parseNkEntries(raw);

  const players = [];
  parsed.entries.forEach((entry, index) => {
    const playerID = String(entry.userID || entry.playerID || entry.id || "");
    if (!playerID) {
      return;
    }

    players.push({
      rank: Number(parsed.rankBase || 0) + index + 1,
      playerID,
      prestige: normalizePrestigeScore(entry.score ?? entry.value ?? 0),
      username: entry.metadata || entry.username || entry.name || null,
    });
  });

  return {
    success: true,
    cached: false,
    count: players.length,
    players,
    raw: null,
  };
}

async function mapPlayerProfile(playerID, options = {}) {
  const id = String(playerID || "").trim();
  if (!id) {
    throw new Error("Missing player ID. Use ?id=PLAYERID");
  }

  const rawProfile = unwrapNkPayload(
    await nkGet(`2/${encodeURIComponent(id)}/PublicProfile.save`, options),
  );

  if (!rawProfile || !Object.keys(rawProfile).length) {
    throw new Error("No profile data available for this player.");
  }

  const username =
    rawProfile.displayName ||
    rawProfile.username ||
    rawProfile.name ||
    rawProfile.Name ||
    "Unknown";

  const avatarID =
    rawProfile.avatarURL || rawProfile.avatar || rawProfile.Avatar || null;
  const level =
    rawProfile.xpLevel || rawProfile.level || rawProfile.Level || null;
  const xp = rawProfile.xp || rawProfile.XP || rawProfile.Battlescore || null;

  const stats =
    rawProfile.battleStats || rawProfile.stats || rawProfile.gameStats || {};
  const wins = stats.wins ?? stats.totalWins ?? rawProfile.Wins ?? null;
  const losses = stats.losses ?? stats.totalLosses ?? rawProfile.Losses ?? null;
  const medallions =
    rawProfile.medallions ??
    stats.medallions ??
    rawProfile.MedallionsCurrent ??
    rawProfile.MedallionWinsWeekly ??
    null;
  const rank = rawProfile.rank ?? stats.rank ?? null;

  let winRate = null;
  if (wins !== null && losses !== null) {
    const total = Number(wins) + Number(losses);
    winRate = total > 0 ? Math.round((Number(wins) / total) * 1000) / 10 : 0;
  }

  const clan =
    rawProfile.clanName || (rawProfile.clan && rawProfile.clan.name) || null;
  const clanID =
    rawProfile.clanID ||
    (rawProfile.clan && rawProfile.clan.id) ||
    rawProfile.GuildID ||
    null;
  const countryCode =
    rawProfile.CountryCode ||
    rawProfile.countryCode ||
    rawProfile.country ||
    null;
  const towers = rawProfile.towers || rawProfile.loadout || null;

  const currentWeek = getCurrentWeekNumber();
  const currentSeason = getCurrentSeasonNumber(currentWeek);

  const weeklyRaw = await nkGetOptional(
    `appdocs/2/leaderboards/WeeklyMedallions:${currentWeek}.json`,
    options,
  );
  const prestigeRaw = await nkGetOptional(
    `appdocs/2/leaderboards/ladder:Season_${currentSeason}:Rating.json`,
    options,
  );
  const clanRaw = clanID
    ? await nkGetOptional(
        `appdocs/2/leaderboards/guild:compiled:WeeklyMedallions:${currentWeek}:Club.json`,
        options,
      )
    : null;

  const weeklyStanding = weeklyRaw
    ? findRankedScore(parseNkEntries(weeklyRaw), id)
    : { rank: null, score: null };
  const prestigeStanding = prestigeRaw
    ? findRankedScore(parseNkEntries(prestigeRaw), id)
    : { rank: null, score: null };
  if (prestigeStanding.score !== null) {
    prestigeStanding.score = normalizePrestigeScore(prestigeStanding.score);
  }

  const clanStanding = clanRaw
    ? findRankedScore(parseNkEntries(clanRaw), String(clanID || ""))
    : { rank: null, score: null };

  return {
    success: true,
    cached: false,
    playerID: id,
    profile: {
      username,
      avatarID,
      level,
      xp,
      medallions,
      rank,
      clan,
      clanID,
      countryCode,
      stats: {
        wins,
        losses,
        winRate,
      },
      leaderboards: {
        weekly: {
          rank: weeklyStanding.rank,
          score: weeklyStanding.score,
        },
        prestige: {
          rank: prestigeStanding.rank,
          score: prestigeStanding.score,
        },
        clan: {
          rank: clanStanding.rank,
          score: clanStanding.score,
        },
      },
      towers,
    },
    // Keep raw always present for badge/country rendering on player page.
    raw: rawProfile,
  };
}

async function mapClanLeaderboard(type, options = {}) {
  const allowed = new Set(["overall", "club", "standard", "card"]);
  const normalizedType = String(type || "overall")
    .trim()
    .toLowerCase();
  if (!allowed.has(normalizedType)) {
    throw new Error(
      "Invalid clan leaderboard type. Allowed: overall, club, standard, card.",
    );
  }

  const typeSuffix =
    normalizedType === "overall"
      ? ""
      : normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);

  const path =
    normalizedType === "overall"
      ? `appdocs/2/leaderboards/guild:compiled:WeeklyMedallions:${getCurrentWeekNumber()}.json`
      : `appdocs/2/leaderboards/guild:compiled:WeeklyMedallions:${getCurrentWeekNumber()}:${typeSuffix}.json`;

  const parsed = parseNkEntries(await nkGet(path, options));
  const clans = [];

  parsed.entries.forEach((entry, index) => {
    const clanID = String(entry.userID || entry.clanID || entry.id || "");
    if (!clanID) {
      return;
    }

    clans.push({
      rank: Number(parsed.rankBase || 0) + index + 1,
      clanID,
      name: entry.metadata || entry.name || null,
      medallions: Number(entry.score ?? entry.value ?? 0),
    });
  });

  return {
    success: true,
    type: normalizedType,
    cached: false,
    count: clans.length,
    clans,
    raw: null,
  };
}

async function mapPastWeekly(week, options = {}) {
  const parsed = parseNkEntries(
    await nkGet(
      `appdocs/2/leaderboards/WeeklyMedallions:${week}.json`,
      options,
    ),
  );

  const players = [];
  parsed.entries.forEach((entry, index) => {
    const playerID = String(entry.userID || entry.playerID || entry.id || "");
    if (!playerID) {
      return;
    }

    players.push({
      rank: Number(parsed.rankBase || 0) + index + 1,
      playerID,
      medallions: Number(entry.score ?? entry.medallions ?? entry.value ?? 0),
      username: entry.username || entry.name || entry.metadata || null,
      countryCode: normalizeCountryCode(
        entry.cc || entry.countryCode || entry.country,
      ),
    });
  });

  return {
    success: true,
    week,
    weekName: getWeeklyModeName(week),
    cached: false,
    count: players.length,
    players,
    raw: null,
  };
}

async function mapPastPrestige(week, options = {}) {
  const season = getSeasonNumberFromWeek(week);
  if (season <= 0) {
    throw new Error("Week is too old to derive a valid prestige season.");
  }

  const parsed = parseNkEntries(
    await nkGet(
      `appdocs/2/leaderboards/ladder:Season_${season}:Rating.json`,
      options,
    ),
  );

  const players = [];
  parsed.entries.forEach((entry, index) => {
    const playerID = String(entry.userID || entry.playerID || entry.id || "");
    if (!playerID) {
      return;
    }

    players.push({
      rank: Number(parsed.rankBase || 0) + index + 1,
      playerID,
      prestige: normalizePrestigeScore(entry.score ?? entry.value ?? 0),
      username: entry.metadata || entry.username || entry.name || null,
    });
  });

  return {
    success: true,
    type: "prestige",
    week,
    season,
    weekRange: getPrestigeWeekRange(week),
    cached: false,
    count: players.length,
    players,
    raw: null,
  };
}

async function mapPastClanOverall(week, options = {}) {
  const parsed = parseNkEntries(
    await nkGet(
      `appdocs/2/leaderboards/guild:compiled:WeeklyMedallions:${week}.json`,
      options,
    ),
  );

  const clans = [];
  parsed.entries.forEach((entry, index) => {
    const clanID = String(entry.userID || entry.clanID || entry.id || "");
    if (!clanID) {
      return;
    }

    clans.push({
      rank: Number(parsed.rankBase || 0) + index + 1,
      clanID,
      name: entry.metadata || entry.name || null,
      medallions: Number(entry.score ?? entry.value ?? 0),
    });
  });

  return {
    success: true,
    week,
    cached: false,
    count: clans.length,
    clans,
    raw: null,
  };
}

async function mapPastCombined(week, options = {}) {
  const season = getSeasonNumberFromWeek(week);
  if (season <= 0) {
    throw new Error("Week is too old to derive a valid prestige season.");
  }

  const [weekly, prestige, clanOverall] = await Promise.all([
    mapPastWeekly(week, options),
    mapPastPrestige(week, options),
    mapPastClanOverall(week, options),
  ]);

  return {
    success: true,
    week,
    season,
    weekToSeasonOffset: NK_WEEK_TO_SEASON_OFFSET,
    available: {
      weekly: true,
      prestige: true,
      clanOverall: true,
    },
    cached: {
      weekly: false,
      prestige: false,
      clanOverall: false,
    },
    weekly: {
      count: weekly.count,
      players: weekly.players,
    },
    prestige: {
      count: prestige.count,
      players: prestige.players,
    },
    clanOverall: {
      count: clanOverall.count,
      clans: clanOverall.clans,
    },
    raw: null,
  };
}

async function tryNkCompatibility(path) {
  const { endpoint, params } = parseEndpoint(path);
  const forceRefresh = params.get("refresh") === "1";
  const options = { bust: forceRefresh };

  if (endpoint === "leaderboard.php") {
    const country = params.get("country") || "";
    return mapLeaderboardWeekly(getCurrentWeekNumber(), country, options);
  }

  if (endpoint === "prestige_leaderboard.php") {
    return mapPrestigeLeaderboard(getCurrentSeasonNumber(), options);
  }

  if (endpoint === "player.php") {
    return mapPlayerProfile(params.get("id") || "", options);
  }

  if (endpoint === "guild.php") {
    const skipOwnerLookup = params.get("lite") === "1";
    const guild = await getGuildNormalized(params.get("id") || "", {
      ...options,
      skipOwnerLookup,
    });
    return {
      success: true,
      cached: false,
      guild,
      raw: null,
    };
  }

  if (endpoint === "clan_leaderboard.php") {
    return mapClanLeaderboard(params.get("type") || "overall", options);
  }

  if (endpoint === "past_weekly.php") {
    return mapPastWeekly(validateWeekParam(params), options);
  }

  if (endpoint === "past_prestige.php") {
    return mapPastPrestige(validateWeekParam(params), options);
  }

  if (endpoint === "past_clan_overall.php") {
    return mapPastClanOverall(validateWeekParam(params), options);
  }

  if (endpoint === "past_week.php") {
    return mapPastCombined(validateWeekParam(params), options);
  }

  return null;
}

async function apiGet(path) {
  const mapped = await tryNkCompatibility(path);
  if (mapped) {
    return mapped;
  }

  const response = await fetch(buildApiUrl(path), {
    headers: {
      Accept: "application/json",
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    const message =
      data && data.error ? data.error : `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (data && data.success === false) {
    throw new Error(data.error || "Unexpected API response.");
  }

  return data;
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const num = Number(value);
  if (Number.isNaN(num)) {
    return String(value);
  }

  return new Intl.NumberFormat().format(num);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function queryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
