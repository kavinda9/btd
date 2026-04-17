const clanNameEl = document.getElementById("clanName");
const guildErrorEl = document.getElementById("guildError");

function setText(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent =
    value === null || value === undefined || value === "" ? "-" : String(value);
}

async function fetchGuildInfo() {
  const guildID = queryParam("id");
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
    const ownerName = escapeHtml(guild.ownerName || guild.owner || "-");
    if (ownerEl) {
      if (guild.owner) {
        ownerEl.innerHTML = `<a class="mini-link" href="player.html?id=${encodeURIComponent(guild.owner)}">${ownerName}</a>`;
      } else {
        ownerEl.textContent = ownerName;
      }
    }

    const badgeEl = document.getElementById("badgePreview");
    if (badgeEl) {
      badgeEl.textContent = guildName;
    }
  } catch (error) {
    clanNameEl.textContent = "Failed to load guild info";
    guildErrorEl.textContent = error.message;
    guildErrorEl.hidden = false;
  }
}

fetchGuildInfo();
