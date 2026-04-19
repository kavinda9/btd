(function initNavigation() {
  const CANONICAL_CLANS_URL = "clans_v2.html?v=20260419t";

  const buildClansUrl = (clanID, withNonce = false) => {
    let url = CANONICAL_CLANS_URL;
    if (clanID) {
      url += `&clanID=${encodeURIComponent(clanID)}`;
    }
    if (withNonce) {
      url += `&navts=${Date.now()}`;
    }
    return url;
  };

  const normalizeClanHref = (href) => {
    const raw = String(href || "").trim();
    if (!raw || !/clans(?:_v2)?\.html/i.test(raw)) {
      return "";
    }

    try {
      const parsed = new URL(raw, window.location.href);
      const clanID = parsed.searchParams.get("clanID");
      return buildClansUrl(clanID, false);
    } catch (_) {
      return buildClansUrl("", false);
    }
  };

  const syncClanLinks = () => {
    const links = Array.from(
      document.querySelectorAll(
        "a[href*='clans.html'], a[href*='clans_v2.html']",
      ),
    );
    links.forEach((link) => {
      const normalized = normalizeClanHref(link.getAttribute("href"));
      if (!normalized) {
        return;
      }

      link.setAttribute("href", normalized);
      link.addEventListener("click", () => {
        const currentHref = String(link.getAttribute("href") || "");
        let clanID = "";

        try {
          const parsed = new URL(
            currentHref || CANONICAL_CLANS_URL,
            window.location.href,
          );
          clanID = String(parsed.searchParams.get("clanID") || "").trim();
        } catch (_) {
          clanID = "";
        }

        link.setAttribute("href", buildClansUrl(clanID, true));
      });
    });
  };

  syncClanLinks();

  const menuBtn = document.getElementById("menuBtn");
  const siteNav = document.getElementById("siteNav");
  if (!menuBtn || !siteNav) {
    return;
  }

  menuBtn.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
})();
