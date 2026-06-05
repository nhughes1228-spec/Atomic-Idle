// Element tap achievement tuning.
// Keeps the global tap achievements untouched while replacing per-element tap tiers
// with a smoother, earlier progression: 100, 500, 1,000, 2,500, 5,000, 10,000.

(function tuneElementTapAchievements() {
  if (typeof state === "undefined" || typeof elements === "undefined") return;

  const NEW_TIERS = [100, 500, 1000, 2500, 5000, 10000];
  const LEGACY_TIERS_TO_DISABLE = [100000, 1000000];
  const NEW_MULTIPLIERS = {
    100: 1.03,
    500: 1.035,
    1000: 1.04,
    2500: 1.045,
    5000: 1.05,
    10000: 1.06
  };

  function ensureAchievementState() {
    if (!state.achievementStats) state.achievementStats = {};
    if (!state.achievementStats.elementTaps) state.achievementStats.elementTaps = {};
    if (!Array.isArray(state.unlockedAchievements)) state.unlockedAchievements = [];
    for (const element of elements) {
      if (!Number.isFinite(state.achievementStats.elementTaps[element.symbol])) state.achievementStats.elementTaps[element.symbol] = 0;
    }
  }

  function legacyAchievementId(symbol, tier) {
    return `tap_${symbol.toLowerCase()}_${tier}`;
  }

  function tunedAchievementId(symbol, tier) {
    return `retuned_tap_${symbol.toLowerCase()}_${tier}`;
  }

  function disableLegacyHighTiers() {
    const unlocked = new Set(state.unlockedAchievements || []);
    for (const element of elements) {
      for (const tier of LEGACY_TIERS_TO_DISABLE) unlocked.add(legacyAchievementId(element.symbol, tier));
    }
    state.unlockedAchievements = Array.from(unlocked);
  }

  function applyRetunedElementTapRewards() {
    ensureAchievementState();
    const unlocked = new Set(state.unlockedAchievements || []);
    for (const element of elements) {
      for (const tier of NEW_TIERS) {
        if (!unlocked.has(tunedAchievementId(element.symbol, tier))) continue;
        if (state.elementMultipliers?.[element.symbol]) state.elementMultipliers[element.symbol] *= NEW_MULTIPLIERS[tier];
      }
    }
  }

  function checkRetunedElementTapAchievements() {
    ensureAchievementState();
    disableLegacyHighTiers();

    const unlocked = new Set(state.unlockedAchievements || []);
    let earnedAny = false;

    for (const element of elements) {
      const taps = state.achievementStats.elementTaps[element.symbol] || 0;
      for (const tier of NEW_TIERS) {
        const id = tunedAchievementId(element.symbol, tier);
        if (unlocked.has(id) || taps < tier) continue;
        unlocked.add(id);
        earnedAny = true;
        if (typeof showToast === "function") showToast(`Achievement: ${element.name} ${tier.toLocaleString()} taps — ${element.symbol} production x${NEW_MULTIPLIERS[tier].toFixed(3)}`);
      }
    }

    if (earnedAny) {
      state.unlockedAchievements = Array.from(unlocked);
      if (typeof rebuildDerivedEffects === "function") rebuildDerivedEffects(state);
      if (typeof saveGame === "function") saveGame(false);
      if (typeof renderFull === "function") renderFull();
    } else {
      state.unlockedAchievements = Array.from(unlocked);
    }
  }

  const originalRebuildDerivedEffects = rebuildDerivedEffects;
  rebuildDerivedEffects = function rebuildDerivedEffectsWithRetunedTapAchievements(current) {
    originalRebuildDerivedEffects(current);
    if (current === state) applyRetunedElementTapRewards();
  };

  const originalRenderFull = renderFull;
  renderFull = function renderFullWithRetunedTapAchievements() {
    originalRenderFull();
    checkRetunedElementTapAchievements();
  };

  ensureAchievementState();
  disableLegacyHighTiers();
  checkRetunedElementTapAchievements();
})();
