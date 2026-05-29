// Atomic Idle balance overrides
// Keeps element production mostly linear by level, with clear landmark jumps.

(function applyAtomicIdleBalance() {
  if (typeof elements === "undefined" || typeof state === "undefined") return;

  const hydrogen = elements.find(element => element.symbol === "H");
  if (hydrogen) hydrogen.baseProduction = 0.1;

  function getElementLevelLandmarkMultiplier(level) {
    const safeLevel = Math.max(0, level || 0);
    const twentyFiveBonuses = Math.floor(safeLevel / 25);
    const hundredBonuses = Math.floor(safeLevel / 100);
    const thousandBonuses = Math.floor(safeLevel / 1000);

    // Inspired by Clicker Heroes: mostly linear hero/element levels,
    // then big step bonuses at milestone levels.
    return Math.pow(2, twentyFiveBonuses) * Math.pow(3, hundredBonuses) * Math.pow(10, thousandBonuses);
  }

  window.getElementLevelLandmarkMultiplier = getElementLevelLandmarkMultiplier;

  window.getElementProduction = function getElementProduction(element, current = state) {
    const elementState = getElementState(current, element.symbol);
    if (!current.hasStarted || !elementState?.unlocked) return 0;

    const level = elementState.level || 0;
    const linearProduction = element.baseProduction * level;

    return linearProduction
      * getElementLevelLandmarkMultiplier(level)
      * current.elementMultipliers[element.symbol]
      * getGlobalMultiplier(current);
  };

  const previousRenderDetails = window.renderDetails;
  window.renderDetails = function renderDetails() {
    const element = getActiveElement();
    const elementState = getElementState(state, element.symbol);
    dom.selectedName.textContent = state.hasStarted ? `${element.name} · Lv. ${elementState.level}` : element.name;
    if (!state.hasStarted) {
      dom.elementDetails.innerHTML = `<div class="compact-card" style="padding: 14px;"><strong>Table inactive.</strong></div>`;
      return;
    }

    const cost1 = getLevelCost(element, 1);
    const cost10 = getLevelCost(element, 10);
    const max = getBuyMaxQuantity(element);
    const milestoneMultiplier = getElementLevelLandmarkMultiplier(elementState.level);

    dom.elementDetails.innerHTML = `
      <div class="detail-row"><span>Production</span><strong>${formatNumber(getElementProduction(element))}/sec</strong></div>
      <div class="detail-row"><span>Level Bonus</span><strong>${formatNumber(milestoneMultiplier)}x</strong></div>
      <div class="buy-row">
        <button class="buy-button" data-buy="1">Buy 1<br><small>${formatNumber(cost1)}</small></button>
        <button class="buy-button" data-buy="10">Buy 10<br><small>${formatNumber(cost10)}</small></button>
        <button class="buy-button" data-buy="max">Buy Max<br><small>${max.quantity ? `${max.quantity} levels` : "—"}</small></button>
      </div>
    `;

    dom.elementDetails.querySelectorAll("[data-buy]").forEach(button => {
      const value = button.dataset.buy;
      button.addEventListener("click", () => buyLevels(element.symbol, value === "max" ? "max" : Number(value)));
    });
  };

  if (typeof rebuildDerivedEffects === "function") rebuildDerivedEffects(state);
  if (typeof renderFull === "function") renderFull();
})();
