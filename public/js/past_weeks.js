const weekInput = document.getElementById("weekInput");
const loadWeekBtn = document.getElementById("loadWeekBtn");
const pastWeekMeta = document.getElementById("pastWeekMeta");
const pastWeekError = document.getElementById("pastWeekError");
const selectedWeekText = document.getElementById("selectedWeekText");
const openPastWeekly = document.getElementById("openPastWeekly");
const openPastPrestige = document.getElementById("openPastPrestige");
const openPastClans = document.getElementById("openPastClans");

const destinationButtons = [openPastWeekly, openPastPrestige, openPastClans].filter(Boolean);

function setActiveDestinationButton(activeButton) {
  for (const button of destinationButtons) {
    button.classList.toggle("btn-primary", button === activeButton);
    button.classList.toggle("btn-ghost", button !== activeButton);
  }
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
function applyWeekTargets() {
  pastWeekError.hidden = true;

  const week = sanitiseWeek(weekInput?.value);
  if (!week) {
    pastWeekError.textContent = "Please enter a valid week number.";
    pastWeekError.hidden = false;
    return null;
  }

  if (weekInput) {
    weekInput.value = String(week);
  }

  if (selectedWeekText) {
    selectedWeekText.textContent = String(week);
  }
  if (openPastWeekly) {
    openPastWeekly.href = `past_weekly.html?week=${encodeURIComponent(week)}`;
  }
  if (openPastPrestige) {
    openPastPrestige.href = `past_prestige.html?week=${encodeURIComponent(week)}`;
  }
  if (openPastClans) {
    openPastClans.href = `past_clan_overall.html?week=${encodeURIComponent(week)}`;
  }

  updateWeekQuery(week);
  pastWeekMeta.textContent = `Choose what to open for week ${formatNumber(week)}.`;

  return week;
}

if (loadWeekBtn) {
  loadWeekBtn.addEventListener("click", () => {
    applyWeekTargets();
  });
}

for (const button of destinationButtons) {
  button.addEventListener("click", () => {
    setActiveDestinationButton(button);
  });
}

if (weekInput) {
  weekInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      applyWeekTargets();
    }
  });

  const initialWeek =
    sanitiseWeek(queryParam("week")) || sanitiseWeek(weekInput.value) || 569;
  weekInput.value = String(initialWeek);
}

applyWeekTargets();
setActiveDestinationButton(null);
