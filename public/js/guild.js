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
      badgeEl.textContent = createBadgePreview(guildName);
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
