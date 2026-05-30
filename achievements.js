// Achievement system for Atomic Idle.
// Tracks player taps and grants modest production rewards.

(function setupAchievements() {
  if (typeof state === "undefined" || typeof elements === "undefined" || typeof getActiveElement !== "function") return;

  const TAP_TIERS = [100, 1000, 10000, 100000, 1000000];
  const TAP_REWARD_MULTIPLIERS = {
    100: 1.05,
    1000: 1.08,
    10000: 1.12,
    100000: 1.18,
    1000000: 1.25
  };

  const achievementDefinitions = buildAchievementDefinitions();
  let achievementToastTimer = null;
  let tapSaveCounter = 0;

  function buildAchievementDefinitions() {
    const definitions = [];
    for (const element of elements) {
      for (const target of TAP_TIERS) {
        definitions.push({
          id: `tap_${element.symbol.toLowerCase()}_${target}`,
          type: "element_taps",
          element: element.symbol,
          target,
          name: `${element.name} Taps ${formatNumber(target)}`,
          description: `Tap ${element.name} ${formatNumber(target)} times.`,
          reward: `${element.symbol} production x${TAP_REWARD_MULTIPLIERS[target].toFixed(2)}`,
          multiplier: TAP_REWARD_MULTIPLIERS[target]
        });
      }
    }
    return definitions;
  }

  function ensureAchievementState() {
    if (!state.achievementStats) state.achievementStats = {};
    if (!state.achievementStats.elementTaps) state.achievementStats.elementTaps = {};
    if (!Array.isArray(state.unlockedAchievements)) state.unlockedAchievements = [];
    for (const element of elements) {
      if (!Number.isFinite(state.achievementStats.elementTaps[element.symbol])) state.achievementStats.elementTaps[element.symbol] = 0;
    }
  }

  function getUnlockedAchievementSet() {
    ensureAchievementState();
    return new Set(state.unlockedAchievements);
  }

  function getAchievementProgress(definition) {
    ensureAchievementState();
    if (definition.type === "element_taps") return state.achievementStats.elementTaps[definition.element] || 0;
    return 0;
  }

  function applyAchievementRewards() {
    ensureAchievementState();
    const unlocked = getUnlockedAchievementSet();
    for (const definition of achievementDefinitions) {
      if (!unlocked.has(definition.id)) continue;
      if (definition.type === "element_taps" && state.elementMultipliers?.[definition.element]) {
        state.elementMultipliers[definition.element] *= definition.multiplier;
      }
    }
  }

  function checkAchievements() {
    ensureAchievementState();
    const unlocked = getUnlockedAchievementSet();
    let earnedAny = false;

    for (const definition of achievementDefinitions) {
      if (unlocked.has(definition.id)) continue;
      const progress = getAchievementProgress(definition);
      if (progress < definition.target) continue;

      state.unlockedAchievements.push(definition.id);
      unlocked.add(definition.id);
      earnedAny = true;
      showAchievementToast(definition);
    }

    if (earnedAny) {
      rebuildDerivedEffects(state);
      saveGame(false);
      renderFull();
    }

    return earnedAny;
  }

  function recordElementTap(symbol) {
    ensureAchievementState();
    state.achievementStats.elementTaps[symbol] = (state.achievementStats.elementTaps[symbol] || 0) + 1;
    const earnedAny = checkAchievements();
    updateAchievementProgressDisplay(symbol);

    tapSaveCounter += 1;
    if (!earnedAny && tapSaveCounter >= 25) {
      tapSaveCounter = 0;
      saveGame(false);
    }
  }

  function showAchievementToast(definition) {
    let toast = document.getElementById("achievement-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "achievement-toast";
      toast.className = "achievement-toast";
      document.body.appendChild(toast);
    }

    toast.innerHTML = `<span>Achievement Unlocked</span><strong>${definition.name}</strong><p>${definition.reward}</p>`;
    toast.classList.add("show");
    clearTimeout(achievementToastTimer);
    achievementToastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function renderAchievementsPanel() {
    ensureAchievementState();
    const list = document.getElementById("achievement-list");
    const count = document.getElementById("achievement-count");
    const boost = document.getElementById("achievement-boost-summary");
    if (!list) return;

    const unlocked = getUnlockedAchievementSet();
    const unlockedCount = unlocked.size;
    if (count) count.textContent = `${unlockedCount} / ${achievementDefinitions.length}`;
    if (boost) boost.textContent = summarizeAchievementBoosts();

    list.innerHTML = "";
    for (const definition of achievementDefinitions) {
      const card = document.createElement("article");
      card.className = "achievement-card";
      card.dataset.achievementId = definition.id;
      card.innerHTML = `
        <div class="achievement-meta"><span>${definition.element}</span><span data-role="achievement-progress-text">0 / ${formatNumber(definition.target)}</span></div>
        <h4>${definition.name}</h4>
        <p>${definition.description}</p>
        <div class="achievement-progress" aria-hidden="true"><span data-role="achievement-progress-fill" class="achievement-progress-fill" style="--achievement-progress:0%"></span></div>
        <span class="achievement-reward">${definition.reward}</span>
      `;
      list.appendChild(card);
    }

    updateAllAchievementProgressDisplays();
  }

  function updateAllAchievementProgressDisplays() {
    const count = document.getElementById("achievement-count");
    const boost = document.getElementById("achievement-boost-summary");
    const unlocked = getUnlockedAchievementSet();
    if (count) count.textContent = `${unlocked.size} / ${achievementDefinitions.length}`;
    if (boost) boost.textContent = summarizeAchievementBoosts();
    for (const definition of achievementDefinitions) updateAchievementCard(definition, unlocked);
  }

  function updateAchievementProgressDisplay(symbol) {
    const unlocked = getUnlockedAchievementSet();
    const count = document.getElementById("achievement-count");
    const boost = document.getElementById("achievement-boost-summary");
    if (count) count.textContent = `${unlocked.size} / ${achievementDefinitions.length}`;
    if (boost) boost.textContent = summarizeAchievementBoosts();
    for (const definition of achievementDefinitions) {
      if (definition.element === symbol) updateAchievementCard(definition, unlocked);
    }
  }

  function updateAchievementCard(definition, unlocked = getUnlockedAchievementSet()) {
    const card = document.querySelector(`[data-achievement-id="${definition.id}"]`);
    if (!card) return;
    const progress = getAchievementProgress(definition);
    const percent = Math.min(100, (progress / definition.target) * 100);
    const isUnlocked = unlocked.has(definition.id);
    card.classList.toggle("unlocked", isUnlocked);
    const progressText = card.querySelector('[data-role="achievement-progress-text"]');
    const progressFill = card.querySelector('[data-role="achievement-progress-fill"]');
    if (progressText) progressText.textContent = isUnlocked ? `Unlocked · ${formatNumber(progress)} taps` : `${formatNumber(Math.min(progress, definition.target))} / ${formatNumber(definition.target)}`;
    if (progressFill) progressFill.style.setProperty("--achievement-progress", `${percent}%`);
  }

  function summarizeAchievementBoosts() {
    const unlocked = getUnlockedAchievementSet();
    const boostedElements = new Map();
    for (const definition of achievementDefinitions) {
      if (!unlocked.has(definition.id)) continue;
      boostedElements.set(definition.element, (boostedElements.get(definition.element) || 1) * definition.multiplier);
    }
    if (!boostedElements.size) return "No achievement boosts yet.";
    return Array.from(boostedElements.entries())
      .map(([symbol, multiplier]) => `${symbol} x${multiplier.toFixed(2)}`)
      .join(" · ");
  }

  const originalClickActiveElement = clickActiveElement;
  clickActiveElement = function clickActiveElementWithAchievements(event) {
    const element = getActiveElement();
    originalClickActiveElement(event);
    if (state.hasStarted && element) recordElementTap(element.symbol);
  };

  const originalActivateLabFromHydrogen = activateLabFromHydrogen;
  activateLabFromHydrogen = function activateLabFromHydrogenWithAchievements(event) {
    originalActivateLabFromHydrogen(event);
    recordElementTap("H");
  };

  const originalRebuildDerivedEffects = rebuildDerivedEffects;
  rebuildDerivedEffects = function rebuildDerivedEffectsWithAchievements(current) {
    originalRebuildDerivedEffects(current);
    if (current === state) applyAchievementRewards();
  };

  const originalRenderFull = renderFull;
  renderFull = function renderFullWithAchievements() {
    ensureAchievementState();
    originalRenderFull();
    renderAchievementsPanel();
  };

  ensureAchievementState();
  applyAchievementRewards();
  renderAchievementsPanel();
})();
