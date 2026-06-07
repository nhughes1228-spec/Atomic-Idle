// Active tap target UI layer.
// Clean interaction model:
// - The large active card is created once in a stable mount above the table.
// - The large active card counts taps immediately on pointerdown for rapid input.
// - Periodic table tiles keep their normal click behavior for selecting/unlocking.
// - No touchend blockers, pointer capture, or document-level tap cancellation.

(function setupActiveTapTarget() {
  if (typeof renderTable !== "function" || typeof unlockElement !== "function") return;

  const originalUnlockElement = unlockElement;
  const originalRenderTable = renderTable;
  const originalUpdateTableState = updateTableState;
  let activeTapButton = null;
  let activeTapMount = null;
  let lastPointerTapAt = 0;

  document.addEventListener("selectstart", event => {
    if (event.target.closest?.(".active-tap-target")) event.preventDefault();
  });

  document.addEventListener("dblclick", event => {
    if (!event.target.closest?.(".active-tap-target")) return;
    event.preventDefault();
    event.stopPropagation();
  }, { capture: true });

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
    ensureActiveTapTarget();
    updateActiveTapTarget();
  };

  updateTableState = function updateTableStateWithActiveTapTarget() {
    originalUpdateTableState();
    updateActiveTapTarget();
  };

  function ensureActiveTapMount() {
    if (activeTapMount?.isConnected) return activeTapMount;
    activeTapMount = document.getElementById("active-tap-mount");
    if (!activeTapMount) {
      activeTapMount = document.createElement("div");
      activeTapMount.id = "active-tap-mount";
      activeTapMount.className = "active-tap-mount";
      dom.periodicTable.parentElement?.insertBefore(activeTapMount, dom.periodicTable);
    }
    return activeTapMount;
  }

  function removeOrphanActiveTapTargets() {
    document.querySelectorAll(".active-tap-target").forEach(target => {
      if (target !== activeTapButton) target.remove();
    });
  }

  function useLightweightTapFeedback() {
    return window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth <= 760;
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

    if (useLightweightTapFeedback()) return;

    const ripple = document.createElement("span");
    ripple.className = "tap-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    activeTapButton.appendChild(ripple);
    setTimeout(() => ripple.remove(), 320);
  }

  function wireActiveTapButton() {
    activeTapButton.addEventListener("pointerdown", event => {
      event.preventDefault();
      const now = performance.now();
      if (now - lastPointerTapAt < 18) return;
      lastPointerTapAt = now;
      performActiveTap(event);
    });

    activeTapButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
    });
  }

  function ensureActiveTapTarget() {
    const mount = ensureActiveTapMount();
    if (activeTapButton?.isConnected) {
      if (activeTapButton.parentElement !== mount) mount.appendChild(activeTapButton);
      removeOrphanActiveTapTargets();
      return activeTapButton;
    }

    mount.querySelectorAll(".active-tap-target").forEach(target => target.remove());
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
    wireActiveTapButton();
    mount.appendChild(activeTapButton);
    removeOrphanActiveTapTargets();
    return activeTapButton;
  }

  function updateActiveTapTarget() {
    ensureActiveTapTarget();
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

  window.refreshActiveTapTarget = updateActiveTapTarget;

  renderFull();
})();
