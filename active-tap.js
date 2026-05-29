// Active tap target UI layer.
// Periodic table tiles select/discover elements; the large center tile is the intentional particle tap zone.

(function setupActiveTapTarget() {
  if (typeof renderTable !== "function" || typeof unlockElement !== "function") return;

  const originalUnlockElement = unlockElement;
  const originalRenderTable = renderTable;
  const originalUpdateTableState = updateTableState;
  let activeTapButton = null;

  unlockElement = function unlockOrSelectElement(symbol, event) {
    catchUpProgress(false);
    const element = elements.find(item => item.symbol === symbol);
    if (!element) return;
    const elementState = getElementState(state, symbol);

    if (!state.hasStarted && symbol === "H") return activateLabFromHydrogen(event);
    if (!state.hasStarted) return;

    if (elementState.unlocked) {
      state.selectedSymbol = symbol;
      renderFull();
      return;
    }

    return originalUnlockElement(symbol, event);
  };

  renderTable = function renderTableWithActiveTapTarget() {
    originalRenderTable();
    renderActiveTapTarget();
    updateActiveTapTarget();
  };

  updateTableState = function updateTableStateWithActiveTapTarget() {
    originalUpdateTableState();
    updateActiveTapTarget();
  };

  function renderActiveTapTarget() {
    if (!dom.periodicTable) return;
    activeTapButton = document.createElement("button");
    activeTapButton.type = "button";
    activeTapButton.className = "active-tap-target category-nonmetal";
    activeTapButton.setAttribute("aria-label", "Tap active element for Particles");
    activeTapButton.innerHTML = `
      <span class="active-tap-header">
        <span class="active-tap-number" data-role="active-number"></span>
        <span class="active-tap-level" data-role="active-level"></span>
      </span>
      <span class="active-tap-symbol" data-role="active-symbol"></span>
      <span class="active-tap-name" data-role="active-name"></span>
      <span class="active-tap-stats">
        <span class="active-tap-chip" data-role="active-click"></span>
        <span class="active-tap-chip" data-role="active-production"></span>
      </span>
    `;
    activeTapButton.addEventListener("click", event => {
      if (!state.hasStarted) return activateLabFromHydrogen(event);
      return clickActiveElement(event);
    });
    dom.periodicTable.appendChild(activeTapButton);
  }

  function updateActiveTapTarget() {
    if (!activeTapButton) return;
    const element = state.hasStarted ? getActiveElement() : elements[0];
    const elementState = getElementState(state, element.symbol);

    activeTapButton.className = `active-tap-target category-${element.category}`;
    activeTapButton.querySelector('[data-role="active-number"]').textContent = element.atomicNumber;
    activeTapButton.querySelector('[data-role="active-level"]').textContent = state.hasStarted ? `Lv. ${elementState.level}` : "Start";
    activeTapButton.querySelector('[data-role="active-symbol"]').textContent = element.symbol;
    activeTapButton.querySelector('[data-role="active-name"]').textContent = state.hasStarted ? `${element.name} tap target` : "Click Hydrogen to begin";
    activeTapButton.querySelector('[data-role="active-click"]').textContent = `${formatNumber(getClickPower())} / tap`;
    activeTapButton.querySelector('[data-role="active-production"]').textContent = state.hasStarted ? `${formatNumber(getElementProduction(element))} / sec` : "0 / sec";
  }

  renderFull();
})();
