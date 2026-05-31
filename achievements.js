// Achievement system for Atomic Idle.
// Tracks taps and broad progression, then grants modest production rewards.

(function setupAchievements() {
  if (typeof state === "undefined" || typeof elements === "undefined" || typeof getActiveElement !== "function") return;

  const TAP_TIERS = [100, 1000, 10000, 100000, 1000000];
  const ELEMENT_TAP_REWARD_MULTIPLIERS = {
    100: 1.05,
    1000: 1.08,
    10000: 1.12,
    100000: 1.18,
    1000000: 1.25
  };

  const GLOBAL_ACHIEVEMENT_REWARDS = {
    tiny: 1.01,
    small: 1.02,
    medium: 1.035,
    large: 1.05,
    huge: 1.075
  };

  const FAMILY_REWARD_MULTIPLIER = 1.08;
  const ALL_ACHIEVEMENTS_TAB = "All";
  let activeAchievementCategory = ALL_ACHIEVEMENTS_TAB;

  const elementFamilies = [
    { id: "noble_gases", name: "Noble Gases", categories: ["noble-gas"] },
    { id: "halogens", name: "Halogens", categories: ["halogen"] },
    { id: "alkali_metals", name: "Alkali Metals", categories: ["alkali-metal"] },
    { id: "alkaline_earths", name: "Alkaline Earth Metals", categories: ["alkaline-earth"] },
    { id: "transition_metals", name: "Transition Metals", categories: ["transition-metal"] },
    { id: "metalloids", name: "Metalloids", categories: ["metalloid"] },
    { id: "nonmetals", name: "Nonmetals", categories: ["nonmetal", "diatomic-nonmetal"] }
  ];

  const achievementDefinitions = buildAchievementDefinitions();
  let achievementToastTimer = null;
  let tapSaveCounter = 0;

  function buildAchievementDefinitions() {
    const definitions = [];

    for (const element of elements) {
      for (const target of TAP_TIERS) {
        definitions.push({
          id: `tap_${element.symbol.toLowerCase()}_${target}`,
          category: "Element Taps",
          type: "element_taps",
          element: element.symbol,
          target,
          name: `${element.name} Taps ${formatNumber(target)}`,
          description: `Tap ${element.name} ${formatNumber(target)} times.`,
          reward: `${element.symbol} production x${ELEMENT_TAP_REWARD_MULTIPLIERS[target].toFixed(2)}`,
          rewardType: "element",
          multiplier: ELEMENT_TAP_REWARD_MULTIPLIERS[target]
        });
      }
    }

    addTieredGlobal(definitions, "total_taps", "Total Taps", "Tap the active element {target} total times.", [1000, 10000, 100000, 1000000], ["tiny", "small", "medium", "large"], current => current.achievementStats.totalTaps || 0, "Total Taps");
    addTieredGlobal(definitions, "discoveries", "Discoveries", "Discover {target} elements.", [2, 5, 10, 18, 36], ["tiny", "small", "medium", "large", "huge"], current => getUnlockedElements(current).length, "Discoveries");
    addTieredGlobal(definitions, "level_landmark", "Level Landmarks", "Reach Lv. {target} on any element.", [25, 50, 100, 250, 500], ["tiny", "small", "medium", "large", "huge"], current => Math.max(...elements.map(element => getElementState(current, element.symbol)?.level || 0)), "Level Landmarks");
    addTieredGlobal(definitions, "prestige", "Published Research", "Publish Research {target} times.", [1, 3, 5, 10, 25], ["small", "medium", "large", "huge", "huge"], current => current.publishedCount || 0, "Prestige");
    addTieredGlobal(definitions, "lifetime_particles", "Particle Hoard", "Earn {target} lifetime Particles.", [1000000, 1000000000, 1000000000000, 1000000000000000], ["tiny", "small", "medium", "large"], current => current.lifetimeParticles || 0, "Lifetime Particles");

    for (const family of elementFamilies) {
      const familyElements = getFamilyElements(family);
      if (!familyElements.length) continue;
      definitions.push({
        id: `family_${family.id}`,
        category: "Element Families",
        type: "family_unlock",
        familyId: family.id,
        familyName: family.name,
        elementSymbols: familyElements.map(element => element.symbol),
        target: familyElements.length,
        name: `${family.name} Complete`,
        description: `Discover every ${family.name.toLowerCase()} element currently in the table.`,
        reward: `${family.name} production x${FAMILY_REWARD_MULTIPLIER.toFixed(2)}`,
        rewardType: "family",
        multiplier: FAMILY_REWARD_MULTIPLIER,
        progress: current => familyElements.filter(element => isUnlocked(current, element.symbol)).length
      });
    }

    return definitions;
  }

  function addTieredGlobal(definitions, idPrefix, namePrefix, descriptionTemplate, targets, rewardKeys, progressFn, category = "Global Progress") {
    targets.forEach((target, index) => {
      const rewardKey = rewardKeys[index] || rewardKeys.at(-1) || "small";
      const multiplier = GLOBAL_ACHIEVEMENT_REWARDS[rewardKey];
      definitions.push({
        id: `${idPrefix}_${target}`,
        category,
        type: idPrefix,
        target,
        name: `${namePrefix}: ${formatNumber(target)}`,
        description: descriptionTemplate.replace("{target}", formatNumber(target)),
        reward: `Global production x${multiplier.toFixed(3)}`,
        rewardType: "global",
        multiplier,
        progress: progressFn
      });
    });
  }

  function getFamilyElements(family) {
    return elements.filter(element => family.categories.includes(element.category));
  }

  function getAchievementCategories() {
    return [ALL_ACHIEVEMENTS_TAB, ...Array.from(new Set(achievementDefinitions.map(definition => definition.category)))];
  }

  function getVisibleAchievementDefinitions() {
    if (activeAchievementCategory === ALL_ACHIEVEMENTS_TAB) return achievementDefinitions;
    return achievementDefinitions.filter(definition => definition.category === activeAchievementCategory);
  }

  function ensureAchievementState() {
    if (!state.achievementStats) state.achievementStats = {};
    if (!state.achievementStats.elementTaps) state.achievementStats.elementTaps = {};
    if (!Number.isFinite(state.achievementStats.totalTaps)) {
      state.achievementStats.totalTaps = Object.values(state.achievementStats.elementTaps).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
    }
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
    if (typeof definition.progress === "function") return definition.progress(state);
    return 0;
  }

  function applyAchievementRewards() {
    ensureAchievementState();
    const unlocked = getUnlockedAchievementSet();
    for (const definition of achievementDefinitions) {
      if (!unlocked.has(definition.id)) continue;
      if (definition.rewardType === "element" && state.elementMultipliers?.[definition.element]) {
        state.elementMultipliers[definition.element] *= definition.multiplier;
      }
      if (definition.rewardType === "family" && Array.isArray(definition.elementSymbols)) {
        for (const symbol of definition.elementSymbols) {
          if (state.elementMultipliers?.[symbol]) state.elementMultipliers[symbol] *= definition.multiplier;
        }
      }
      if (definition.rewardType === "global") {
        state.multipliers.global *= definition.multiplier;
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
    state.achievementStats.totalTaps = (state.achievementStats.totalTaps || 0) + 1;
    const earnedAny = checkAchievements();
    updateAllAchievementProgressDisplays();

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

  function renderAchievementCategoryTabs() {
    const list = document.getElementById("achievement-list");
    if (!list) return;
    let tabs = document.getElementById("achievement-category-tabs");
    if (!tabs) {
      tabs = document.createElement("div");
      tabs.id = "achievement-category-tabs";
      tabs.className = "achievement-category-tabs";
      list.before(tabs);
    }

    tabs.innerHTML = "";
    for (const category of getAchievementCategories()) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `achievement-category-tab ${category === activeAchievementCategory ? "active" : ""}`;
      button.textContent = category;
      button.addEventListener("click", () => {
        activeAchievementCategory = category;
        renderAchievementsPanel();
      });
      tabs.appendChild(button);
    }
  }

  function renderAchievementsPanel() {
    ensureAchievementState();
    const list = document.getElementById("achievement-list");
    const count = document.getElementById("achievement-count");
    const boost = document.getElementById("achievement-boost-summary");
    if (!list) return;

    const unlocked = getUnlockedAchievementSet();
    if (count) count.textContent = `${unlocked.size} / ${achievementDefinitions.length}`;
    if (boost) boost.textContent = summarizeAchievementBoosts();

    renderAchievementCategoryTabs();
    list.innerHTML = "";
    for (const definition of getVisibleAchievementDefinitions()) {
      const card = document.createElement("article");
      card.className = "achievement-card";
      card.dataset.achievementId = definition.id;
      card.innerHTML = `
        <div class="achievement-meta"><span>${definition.category}</span><span data-role="achievement-progress-text">0 / ${formatNumber(definition.target)}</span></div>
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
    for (const definition of getVisibleAchievementDefinitions()) updateAchievementCard(definition, unlocked);
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
    if (progressText) progressText.textContent = isUnlocked ? `Unlocked · ${formatProgress(progress, definition)}` : `${formatProgress(Math.min(progress, definition.target), definition)} / ${formatProgress(definition.target, definition)}`;
    if (progressFill) progressFill.style.setProperty("--achievement-progress", `${percent}%`);
  }

  function formatProgress(value, definition) {
    if (definition.type === "element_taps" || definition.type === "total_taps") return `${formatNumber(value)} taps`;
    if (definition.type === "prestige") return `${formatNumber(value)} prestiges`;
    if (definition.type === "discoveries" || definition.type === "family_unlock") return `${formatNumber(value)} elements`;
    if (definition.type === "level_landmark") return `Lv. ${formatNumber(value)}`;
    return formatNumber(value);
  }

  function summarizeAchievementBoosts() {
    const unlocked = getUnlockedAchievementSet();
    let globalMultiplier = 1;
    const boostedElements = new Map();
    for (const definition of achievementDefinitions) {
      if (!unlocked.has(definition.id)) continue;
      if (definition.rewardType === "global") globalMultiplier *= definition.multiplier;
      if (definition.rewardType === "element") boostedElements.set(definition.element, (boostedElements.get(definition.element) || 1) * definition.multiplier);
      if (definition.rewardType === "family") {
        for (const symbol of definition.elementSymbols || []) boostedElements.set(symbol, (boostedElements.get(symbol) || 1) * definition.multiplier);
      }
    }
    const parts = [];
    if (globalMultiplier > 1) parts.push(`Global x${globalMultiplier.toFixed(3)}`);
    for (const [symbol, multiplier] of boostedElements.entries()) parts.push(`${symbol} x${multiplier.toFixed(2)}`);
    return parts.length ? parts.join(" · ") : "No achievement boosts yet.";
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

  const originalUnlockElement = unlockElement;
  unlockElement = function unlockElementWithAchievementCheck(symbol, event) {
    const before = isUnlocked(state, symbol);
    const result = originalUnlockElement(symbol, event);
    const after = isUnlocked(state, symbol);
    if (!before || after) checkAchievements();
    return result;
  };

  const originalBuyLevels = buyLevels;
  buyLevels = function buyLevelsWithAchievementCheck(symbol, quantity) {
    const result = originalBuyLevels(symbol, quantity);
    checkAchievements();
    return result;
  };

  const originalPublishResearch = publishResearch;
  publishResearch = function publishResearchWithAchievementCheck() {
    const beforeCount = state.publishedCount || 0;
    const result = originalPublishResearch();
    if ((state.publishedCount || 0) > beforeCount) checkAchievements();
    return result;
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
    checkAchievements();
    renderAchievementsPanel();
  };

  ensureAchievementState();
  applyAchievementRewards();
  checkAchievements();
  renderAchievementsPanel();
})();
