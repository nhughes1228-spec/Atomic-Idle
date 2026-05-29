// Menu and conditional UI visibility layer.

(function setupUIShell() {
  if (typeof state === "undefined" || typeof dom === "undefined") return;

  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const menuOverlay = document.getElementById("game-menu-overlay");
  const menuButtons = Array.from(document.querySelectorAll("[data-menu-tab]"));
  const menuPanels = Array.from(document.querySelectorAll("[data-menu-panel]"));
  const researchCard = document.querySelector(".research-card");
  const researchTabButton = document.querySelector(".research-tab-button");
  const prestigePanel = document.querySelector(".prestige-panel");

  const menuStats = {
    lifetime: document.getElementById("menu-lifetime-particles"),
    highest: document.getElementById("menu-highest-element"),
    published: document.getElementById("menu-published-count"),
    upgrades: document.getElementById("menu-upgrades-bought"),
    research: document.getElementById("menu-research-total"),
    discount: document.getElementById("menu-discovery-discount")
  };

  function hasPrestiged() {
    return (state.publishedCount || 0) > 0 || (state.research || 0) > 0;
  }

  function canPrestige() {
    return typeof isUnlocked === "function" && isUnlocked(state, "Ne");
  }

  function setMenuOpen(isOpen) {
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle?.setAttribute("aria-expanded", String(isOpen));
  }

  function setActiveTab(tabName) {
    if (tabName === "research" && !hasPrestiged()) tabName = "stats";
    for (const button of menuButtons) button.classList.toggle("active", button.dataset.menuTab === tabName);
    for (const panel of menuPanels) panel.classList.toggle("active", panel.dataset.menuPanel === tabName);
  }

  function syncConditionalUI() {
    const prestigeUnlocked = hasPrestiged();
    researchCard?.classList.toggle("ui-hidden", !prestigeUnlocked);
    researchTabButton?.classList.toggle("ui-hidden", !prestigeUnlocked);
    prestigePanel?.classList.toggle("ui-hidden", !canPrestige());
    if (!prestigeUnlocked && document.querySelector('[data-menu-tab="research"]')?.classList.contains("active")) setActiveTab("stats");
  }

  function updateMenuStats() {
    if (!menuStats.lifetime) return;
    const newest = typeof getNewestUnlockedElement === "function" ? getNewestUnlockedElement(state) : null;
    menuStats.lifetime.textContent = formatNumber(state.lifetimeParticles || 0);
    menuStats.highest.textContent = newest ? `${newest.symbol} · ${newest.name}` : "Hydrogen";
    menuStats.published.textContent = formatNumber(state.publishedCount || 0);
    menuStats.upgrades.textContent = `${state.purchasedUpgrades?.length || 0} / ${upgrades?.length || 0}`;
    menuStats.research.textContent = formatNumber(state.research || 0);
    menuStats.discount.textContent = `${formatNumber((getResearchDiscoveryDiscount?.(state) || 0) * 100)}%`;
  }

  const originalRenderFull = window.renderFull || renderFull;
  const originalUpdateLiveUI = window.updateLiveUI || updateLiveUI;

  renderFull = function renderFullWithShell() {
    originalRenderFull();
    syncConditionalUI();
    updateMenuStats();
  };

  updateLiveUI = function updateLiveUIWithShell() {
    originalUpdateLiveUI();
    syncConditionalUI();
    updateMenuStats();
  };

  menuToggle?.addEventListener("click", () => {
    updateMenuStats();
    setMenuOpen(true);
  });
  menuClose?.addEventListener("click", () => setMenuOpen(false));
  menuOverlay?.addEventListener("click", event => {
    if (event.target === menuOverlay) setMenuOpen(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setMenuOpen(false);
  });
  for (const button of menuButtons) button.addEventListener("click", () => setActiveTab(button.dataset.menuTab));

  setActiveTab("stats");
  syncConditionalUI();
  updateMenuStats();
})();
