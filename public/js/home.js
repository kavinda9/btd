(function initHomeWeeklyArenaSchedule() {
  const titleEl = document.getElementById("currentArenaTitle");
  const metaEl = document.getElementById("currentArenaMeta");
  const scheduleEl = document.getElementById("currentArenaSchedule");
  const imageWrapEl = document.getElementById("currentArenaImageWrap");
  const imageEl = document.getElementById("currentArenaImage");
  const discordButtonEl = document.querySelector(
    ".hero-button-group:first-child .hero-image-btn",
  );
  const supportButtonEl = document.querySelector(
    ".hero-button-group-offset .hero-image-btn",
  );
  if (!titleEl || !metaEl || !scheduleEl || !imageWrapEl || !imageEl) {
    return;
  }

  const WEEKLY_NEW_MODE_ROTATION = [
    "R3 Speed Bananza ZOMG",
    "Speed Bananza ZOMG",
    "Speed Bananza Boosts Only",
    "Speed With Fire ZOMG",
  ];
  const NEW_ROTATION_START_WEEK = 423;
  const WEEKLY_RESET_BASE = new Date("2015-12-16T14:00:00+04:00").getTime();
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const LIVE_WEEK_NUMBER = 569;
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
  const WEEKLY_ARENA_ADVANCE_MS = 2 * 60 * 60 * 1000;
  const WEEKLY_ARENA_START_LABEL = "Wed.";

  const SCHEDULE_BY_MODE = {
    speedwithfirezomg: [
      ["Wed.", "Moab pit free powerups + speed megaboosts"],
      ["Thur.", "Moab pit free powerups + BFB boosts only"],
      ["Fri.", "Moab pit free powerups + BFB R3 spananza + ZOMG free powerups"],
      [
        "Sat.",
        "Moab pit boosts only + BFB free powerups + BFB R3 speed + ZOMG boosts only",
      ],
      ["Sun.", "Moab pit speed + BFB boosts only + ZOMG speed with fire"],
      ["Mon.", "Moab pit free powerups"],
      ["Tue.", "Boss"],
    ],
    speedbananzaboostsonly: [
      ["Wed.", "Moab pit free powerups + BFB boosts only"],
      ["Thur.", "Moab pit free powerups + speed with fire"],
      [
        "Fri.",
        "Moab pit free powerups + BFB spananza boosts only + ZOMG boosts only",
      ],
      ["Sat.", "Moab pit R3 megaboosts + BFB boosts only + ZOMG free powerups"],
      ["Sun.", "Moab pit boosts only + BFB R3 spananza + ZOMG boosts only"],
      ["Mon.", "Moab pit free powerups + BFB boosts only"],
      ["Tue.", "Boss"],
    ],
    r3speedbananzazomg: [
      ["Wed.", "Moab pit free powerups + BFB boosts only"],
      ["Thur.", "Moab pit free powerups + R3 speed"],
      [
        "Fri.",
        "Moab pit spananza (no cobra) + free powerups + BFB boosts only + ZOMG free powerup",
      ],
      ["Sat.", "Moab pit free powerups + BFB boosts only + ZOMG R3 spananza"],
      ["Sun.", "Moab pit boosts only + BFB R3 speed megaboosts + boosts only"],
      ["Mon.", "Moab pit free powerups + BFB speed"],
      ["Tue.", "Boss"],
    ],
    speedbananzazomg: [
      ["Wed.", "Moab pit boosts only + R3 speed with fire"],
      ["Thur.", "Moab pit free powerups + BFB R3 spananza"],
      [
        "Fri.",
        "Moab pit free powerups + BFB free powerups + BFB R3 speed megaboosts",
      ],
      ["Sat.", "Moab pit speed + BFB R3 + ZOMG free powerups"],
      ["Sun.", "Moab pit free powerups + BFB boosts only + ZOMG spananza"],
      ["Mon.", "Moab pit free powerups + BFB boosts only"],
      ["Tue.", "Boss"],
    ],
  };

  const normalizeModeName = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const getWeeklyArenaImageFile = (weekNumber, weekName) => {
    const resolvedName = weekName || getWeeklyModeName(weekNumber);
    const key = normalizeModeName(resolvedName);
    return WEEKLY_ARENA_IMAGE_FILES[key] || "";
  };

  const getWeeklyModeName = (weekNumber) => {
    const week = Number(weekNumber);
    if (!Number.isFinite(week) || week <= 0) {
      return "";
    }

    if (week >= NEW_ROTATION_START_WEEK) {
      const index = (week - 1) % WEEKLY_NEW_MODE_ROTATION.length;
      return WEEKLY_NEW_MODE_ROTATION[index] || "";
    }

    return "";
  };

  const getNextWeeklyResetTime = () => {
    const now = Date.now();
    const cycles = Math.ceil((now - WEEKLY_RESET_BASE) / WEEK_MS);
    return new Date(WEEKLY_RESET_BASE + cycles * WEEK_MS);
  };

  const getWeekPeriodByNumber = (weekNumber, currentWeekEnd) => {
    const week = Number(weekNumber);
    if (
      !Number.isFinite(week) ||
      week <= 0 ||
      !(currentWeekEnd instanceof Date)
    ) {
      return null;
    }

    const offsetWeeks = LIVE_WEEK_NUMBER - week;
    const end = new Date(currentWeekEnd.getTime() - offsetWeeks * WEEK_MS);
    const start = new Date(end.getTime() - WEEK_MS);
    return { start, end };
  };

  const getArenaPresentationWeek = (weekNumber) => {
    const week = Number(weekNumber);
    const currentWeekEnd = getNextWeeklyResetTime();
    const remainingMs = currentWeekEnd.getTime() - Date.now();
    const shouldAdvanceEarly =
      week === baselineWeekNumber &&
      remainingMs > 0 &&
      remainingMs <= WEEKLY_ARENA_ADVANCE_MS;

    return {
      weekNumber: shouldAdvanceEarly ? week + 1 : week,
      highlightDay: shouldAdvanceEarly ? WEEKLY_ARENA_START_LABEL : null,
      currentWeekEnd,
    };
  };

  const formatWeekRange = (startDate, endDate) => {
    const startYear = startDate.getUTCFullYear();
    const endYear = endDate.getUTCFullYear();
    const startMonth = MONTH_NAMES[startDate.getUTCMonth()];
    const endMonth = MONTH_NAMES[endDate.getUTCMonth()];
    const startDay = startDate.getUTCDate();
    const endDay = endDate.getUTCDate();

    if (startYear === endYear && startMonth === endMonth) {
      return `${startYear} ${startMonth} ${startDay} - ${endDay}`;
    }

    if (startYear === endYear) {
      return `${startYear} ${startMonth} ${startDay} - ${endMonth} ${endDay}`;
    }

    return `${startYear} ${startMonth} ${startDay} - ${endYear} ${endMonth} ${endDay}`;
  };

  const applyScheduleColors = (listEl, weekNumber, highlightDay = null) => {
    const lines = Array.from(listEl.querySelectorAll(".arena-line"));
    if (!lines.length) {
      return;
    }

    const colorClasses = [
      "arena-line--moab",
      "arena-line--bfb",
      "arena-line--zomg-a",
      "arena-line--zomg-b",
    ];

    const getHighestArena = (text) => {
      const upper = String(text || "").toUpperCase();
      if (upper.includes("ZOMG")) return "zomg";
      if (upper.includes("BFB")) return "bfb";
      if (upper.includes("MOAB PIT")) return "moab";
      return "moab";
    };

    const dayLookup = ["Sun.", "Mon.", "Tue.", "Wed.", "Thur.", "Fri.", "Sat."];
    const todayLabel = highlightDay || dayLookup[new Date().getUTCDay()] || "";
    const isCurrentWeek = weekNumber === baselineWeekNumber;

    let useZomgA = true;
    lines.forEach((line) => {
      line.classList.remove(...colorClasses);
      line.classList.remove("arena-line--today");
      const dayEl = line.querySelector("strong");
      if (dayEl && isCurrentWeek) {
        const lineDay = String(dayEl.textContent || "").trim();
        if (lineDay === todayLabel) {
          line.classList.add("arena-line--today");
        }
      }
      const highest = getHighestArena(line.textContent);

      if (highest === "zomg") {
        line.classList.add(
          useZomgA ? "arena-line--zomg-a" : "arena-line--zomg-b",
        );
        useZomgA = !useZomgA;
        return;
      }

      if (highest === "bfb") {
        line.classList.add("arena-line--bfb");
        return;
      }

      line.classList.add("arena-line--moab");
    });
  };

  const renderSchedule = (modeName, weekNumber, highlightDay = null) => {
    const normalized = normalizeModeName(modeName);
    const schedule = SCHEDULE_BY_MODE[normalized] || null;

    const imageFile = getWeeklyArenaImageFile(weekNumber, modeName);
    if (imageFile) {
      imageEl.src = `images/arenas/${encodeURIComponent(imageFile)}`;
      imageEl.alt = `${modeName || "Arena"} arena`;
      imageWrapEl.hidden = false;
    } else {
      imageWrapEl.hidden = true;
      imageEl.src = "";
      imageEl.alt = "";
    }

    if (!schedule) {
      titleEl.textContent = modeName || "Current week mode unavailable";
      metaEl.textContent = Number.isFinite(Number(weekNumber))
        ? `Week ${formatNumber(weekNumber)}`
        : "Current week";
      scheduleEl.innerHTML =
        '<p class="arena-line">Schedule not available for this mode.</p>';
      applyScheduleColors(scheduleEl, weekNumber, highlightDay);
      return;
    }

    titleEl.textContent = modeName;
    if (Number.isFinite(Number(weekNumber))) {
      const currentWeekEnd = getNextWeeklyResetTime();
      const period = getWeekPeriodByNumber(weekNumber, currentWeekEnd);
      if (period) {
        metaEl.textContent = `Week ${formatNumber(weekNumber)} (${formatWeekRange(period.start, period.end)})`;
      } else {
        metaEl.textContent = `Week ${formatNumber(weekNumber)}`;
      }
    } else {
      metaEl.textContent = "Current week";
    }

    scheduleEl.innerHTML = schedule
      .map(
        ([day, text]) =>
          `<p class="arena-line"><strong>${escapeHtml(day)}</strong> ${escapeHtml(text)}</p>`,
      )
      .join("");

    applyScheduleColors(scheduleEl, weekNumber, highlightDay);
  };

  const renderUnavailable = (message) => {
    titleEl.textContent = "Current week arena unavailable";
    metaEl.textContent = "Could not load weekly leaderboard data.";
    imageWrapEl.hidden = true;
    imageEl.src = "";
    imageEl.alt = "";
    scheduleEl.innerHTML = `<p class="arena-line">${escapeHtml(message)}</p>`;
    applyScheduleColors(scheduleEl, baselineWeekNumber);
  };

  let baselineWeekNumber = LIVE_WEEK_NUMBER;
  let selectedWeekNumber = LIVE_WEEK_NUMBER;
  let baselineModeName = "";

  const prevWeekBtn = document.getElementById("arenaPrevWeekBtn");
  const nextWeekBtn = document.getElementById("arenaNextWeekBtn");

  const spinButton = (buttonEl) => {
    if (!buttonEl) {
      return;
    }

    const wasSpinning = buttonEl.classList.contains("is-spinning");
    buttonEl.classList.remove("is-spinning");
    if (wasSpinning) {
      void buttonEl.offsetWidth;
    }
    buttonEl.classList.add("is-spinning");
    window.setTimeout(() => {
      buttonEl.classList.remove("is-spinning");
    }, 1000);
  };

  const startButtonSpinLoop = () => {
    if (!discordButtonEl || !supportButtonEl) {
      return;
    }

    const runDiscord = () => {
      spinButton(discordButtonEl);
      window.setTimeout(runSupport, 3000);
    };

    const runSupport = () => {
      spinButton(supportButtonEl);
      window.setTimeout(runDiscord, 3000);
    };

    runDiscord();
  };

  const updateWeekNavigationState = () => {
    if (prevWeekBtn) {
      prevWeekBtn.disabled = selectedWeekNumber <= 1;
    }
    if (nextWeekBtn) {
      nextWeekBtn.disabled = false;
    }
  };

  const renderSelectedWeek = () => {
    const presentation = getArenaPresentationWeek(selectedWeekNumber);
    const modeName =
      getWeeklyModeName(presentation.weekNumber) || baselineModeName || "";
    renderSchedule(
      modeName,
      presentation.weekNumber,
      presentation.highlightDay,
    );
    updateWeekNavigationState();
  };

  if (prevWeekBtn) {
    prevWeekBtn.addEventListener("click", () => {
      if (selectedWeekNumber > 1) {
        selectedWeekNumber--;
        renderSelectedWeek();
      }
    });
  }

  if (nextWeekBtn) {
    nextWeekBtn.addEventListener("click", () => {
      selectedWeekNumber++;
      renderSelectedWeek();
    });
  }

  (async () => {
    try {
      const data = await apiGet("leaderboard.php");
      const weekNumber = Number(data.weekNumber);
      const modeName = data.weekName || getWeeklyModeName(weekNumber) || "";
      baselineWeekNumber = weekNumber;
      selectedWeekNumber = weekNumber;
      baselineModeName = modeName;
      renderSelectedWeek();
      startButtonSpinLoop();
    } catch (error) {
      renderUnavailable(
        error instanceof Error ? error.message : "Request failed.",
      );
    }
  })();
})();
