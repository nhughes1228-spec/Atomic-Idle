// Active tap target UI layer.
// Periodic table tiles select/discover elements; the large center tile is the intentional particle tap zone.

(function setupActiveTapTarget() {
  if (typeof renderTable !== "function" || typeof unlockElement !== "function") return;

  const originalUnlockElement = unlockElement;
  const originalRenderTable = renderTable;
  const originalUpdateTableState = updateTableState;
  let activeTapButton = null;

  document.addEventListener("selectstart", event => {
    if (event.target.closest?.(".active-tap-target")) event.preventDefault();
  });

  unlockElement = function unlockOrSelectElement(symbol, event) {
    event?.preventDefault?.();
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
    removeExistingActiveTapTargets();
    originalRenderTable();
    renderActiveTapTarget();
    updateActiveTapTarget();
  };

  updateTableState = function updateTableStateWithActiveTapTarget() {
    originalUpdateTableState();
    updateActiveTapTarget();
  };

  function removeExistingActiveTapTargets() {
    document.querySelectorAll(".active-tap-target").forEach(target => target.remove());
    activeTapButton = null;
  }

  function isMobileTableLayout() {
    return window.matchMedia?.("(max-width: 760px)").matches;
  }

  function performActiveTap(event) {
    event?.preventDefault?.();
    triggerTapFeedback(event);
    if (!state.hasStarted) return activateLabFromHydrogen(event);
    return clickActiveElement(event);
  }

  function triggerTapFeedback(event) {
    if (!activeTapButton) return;
    const rect = activeTapButton.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, (event?.clientX || rect.left + rect.width / 2) - rect.left));
    const y = Math.max(0, Math.min(rect.height, (event?.clientY || rect.top + rect.height / 2) - rect.top));

    activeTapButton.style.setProperty("--tap-x", `${x}px`);
    activeTapButton.style.setProperty("--tap-y", `${y}px`);
    activeTapButton.classList.remove("tap-pop");
    void activeTapButton.offsetWidth;
    activeTapButton.classList.add("tap-pop");

    const ripple = document.createElement("span");
    ripple.className = "tap-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    activeTapButton.appendChild(ripple);
    setTimeout(() => ripple.remove(), 420);
  }

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
    activeTapButton.addEventListener("click", performActiveTap);

    if (isMobileTableLayout()) {
      activeTapButton.classList.add("active-tap-docked");
      dom.periodicTable.parentElement?.insertBefore(activeTapButton, dom.periodicTable);
    } else {
      dom.periodicTable.appendChild(activeTapButton);
    }
  }

  function updateActiveTapTarget() {
    if (!activeTapButton) return;
    const element = state.hasStarted ? getActiveElement() : elements[0];
    const elementState = getElementState(state, element.symbol);
    const mobileClass = activeTapButton.classList.contains("active-tap-docked") ? " active-tap-docked" : "";

    activeTapButton.className = `active-tap-target category-${element.category}${mobileClass}`;
    activeTapButton.querySelector('[data-role="active-number"]').textContent = element.atomicNumber;
    activeTapButton.querySelector('[data-role="active-level"]').textContent = state.hasStarted ? `Lv. ${elementState.level}` : "Start";
    activeTapButton.querySelector('[data-role="active-symbol"]').textContent = element.symbol;
    activeTapButton.querySelector('[data-role="active-name"]').textContent = state.hasStarted ? `${element.name} tap target` : "Click Hydrogen to begin";
    activeTapButton.querySelector('[data-role="active-click"]').textContent = `${formatNumber(getClickPower())} / tap`;
    activeTapButton.querySelector('[data-role="active-production"]').textContent = state.hasStarted ? `${formatNumber(getElementProduction(element))} / sec` : "0 / sec";
  }

  renderFull();
})();
