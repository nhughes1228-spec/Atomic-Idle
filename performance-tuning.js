// Performance tuning for mobile Safari and high-frequency tapping.
// Keeps production math accurate while reducing unnecessary DOM work.

(function setupPerformanceTuning() {
  const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window);
  const nativeQuerySelector = Document.prototype.querySelector;
  const nativeQuerySelectorAll = Document.prototype.querySelectorAll;
  const LIVE_LOOP_INTERVAL_MS = 200;

  // Main.js schedules gameLoop through requestAnimationFrame. The game loop uses wall-clock
  // elapsed time, so throttling its redraw cadence does not change production balance.
  window.requestAnimationFrame = function requestAnimationFrameWithGameLoopThrottle(callback) {
    if (callback?.name === "gameLoop") {
      return window.setTimeout(() => callback(performance.now()), LIVE_LOOP_INTERVAL_MS);
    }
    return nativeRequestAnimationFrame(callback);
  };

  function isAchievementPanelVisible() {
    const overlay = nativeQuerySelector.call(document, "#game-menu-overlay");
    const panel = nativeQuerySelector.call(document, '[data-menu-panel="achievements"]');
    return Boolean(panel?.classList.contains("active") && overlay?.getAttribute("aria-hidden") === "false");
  }

  // Achievements can be numerous. When the menu is hidden, skip expensive per-card DOM lookups
  // triggered by every tap; achievement state still records and rewards correctly.
  Document.prototype.querySelector = function querySelectorWithHiddenAchievementFastPath(selector) {
    if (this === document && typeof selector === "string" && selector.startsWith('[data-achievement-id="') && !isAchievementPanelVisible()) {
      return null;
    }
    return nativeQuerySelector.call(this, selector);
  };

  Document.prototype.querySelectorAll = function querySelectorAllWithHiddenAchievementFastPath(selector) {
    if (this === document && selector === ".achievement-element-group" && !isAchievementPanelVisible()) {
      return [];
    }
    return nativeQuerySelectorAll.call(this, selector);
  };

  function installLightweightLiveUi() {
    if (typeof updateLiveUI !== "function" || typeof state === "undefined" || typeof dom === "undefined") {
      window.setTimeout(installLightweightLiveUi, 0);
      return;
    }

    window.updateLiveUIFull = updateLiveUI;

    updateLiveUI = function updateLightweightLiveUI() {
      const pps = getParticlesPerSecond();
      const clickPower = getClickPower();
      dom.particlesDisplay.textContent = formatNumber(state.particles);
      dom.ppsDisplay.textContent = formatNumber(pps);
      dom.clickDisplay.textContent = formatNumber(clickPower);
      dom.researchDisplay.textContent = formatNumber(state.research);

      if (typeof updateUpgradeState === "function") updateUpgradeState();
      if (typeof window.refreshActiveTapTarget === "function") window.refreshActiveTapTarget();
    };
  }

  window.setTimeout(installLightweightLiveUi, 0);
})();
