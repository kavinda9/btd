(function initNavigation() {
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
