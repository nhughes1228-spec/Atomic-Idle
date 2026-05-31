// Active tap target UI layer.
// Periodic table tiles select/discover elements; the large center tile is the intentional particle tap zone.

(function setupActiveTapTarget() {
  if (typeof renderTable !== "function" || typeof unlockElement !== "function") return;

  const originalUnlockElement = unlockElement;
  const originalRenderTable = renderTable;
  const originalUpdateTableState = updateTableState;
  let activeTapButton = null;
  let activePointerId = null;

  document.addEventListener("selectstart", event => {
    if (event.target.closest?.(".app-shell")) event.preventDefault();
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
    originalRenderTable();
    renderActiveTapTarget();
    updateActiveTapTarget();
  };

  updateTableState = function updateTableStateWithActiveTapTarget() {
    originalUpdateTableState();
    updateActiveTapTarget();
  };

  function suppressSelectionGesture(event) {
    event.preventDefault();
  }

  function setPressed(isPressed) {
    if (!activeTapButton) return;
    activeTapButton.classList.toggle("is-pressed", isPressed);
  }

  function isInsideActiveTapTarget(event) {
    if (!activeTapButton) return false;
    const rect = activeTapButton.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  }

  function performActiveTap(event) {
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
    activeTapButton.addEventListener("contextmenu", suppressSelectionGesture);
    activeTapButton.addEventListener("dragstart", suppressSelectionGesture);
    activeTapButton.addEventListener("touchstart", event => event.preventDefault(), { passive: false });
    activeTapButton.addEventListener("pointerdown", event => {
      event.preventDefault();
      activePointerId = event.pointerId;
      activeTapButton.setPointerCapture?.(event.pointerId);
      setPressed(true);
    });
    activeTapButton.addEventListener("pointerup", event => {
      event.preventDefault();
      if (activePointerId !== null && event.pointerId !== activePointerId) return;
      activeTapButton.releasePointerCapture?.(event.pointerId);
      activePointerId = null;
      setPressed(false);
      if (isInsideActiveTapTarget(event)) performActiveTap(event);
    });
    activeTapButton.addEventListener("pointercancel", event => {
      activeTapButton.releasePointerCapture?.(event.pointerId);
      activePointerId = null;
      setPressed(false);
    });
    activeTapButton.addEventListener("pointerleave", () => setPressed(false));
    activeTapButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
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
