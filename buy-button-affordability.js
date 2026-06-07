// Live affordability states for element level buy buttons.
// Keeps Buy 1 / Buy 10 / Buy Max visually synchronized with current Particles.

(function setupBuyButtonAffordability() {
  function getSelectedElementForBuyButtons() {
    if (typeof getActiveElement !== "function" || typeof state === "undefined") return null;
    return getActiveElement();
  }

  function getBuyButtonCost(element, value) {
    if (!element || typeof getLevelCost !== "function" || typeof getBuyMaxQuantity !== "function") return { cost: Infinity, quantity: 0 };
    if (value === "max") {
      const max = getBuyMaxQuantity(element);
      return { cost: max.cost || Infinity, quantity: max.quantity || 0 };
    }
    const quantity = Number(value);
    return { cost: getLevelCost(element, quantity), quantity };
  }

  function updateLevelBuyButtonAffordability() {
    if (typeof state === "undefined" || !state.hasStarted) return;
    const element = getSelectedElementForBuyButtons();
    if (!element) return;

    document.querySelectorAll(".buy-button[data-buy]").forEach(button => {
      const value = button.dataset.buy;
      const { cost, quantity } = getBuyButtonCost(element, value);
      const affordable = quantity > 0 && state.particles >= cost;
      button.disabled = !affordable;
      button.classList.toggle("affordable", affordable);
      button.classList.toggle("unaffordable", !affordable);
      button.setAttribute("aria-disabled", String(!affordable));
    });
  }

  window.updateLevelBuyButtonAffordability = updateLevelBuyButtonAffordability;

  function installHooks() {
    if (typeof renderDetails !== "function" || typeof updateLiveUI !== "function") {
      window.setTimeout(installHooks, 0);
      return;
    }

    const originalRenderDetails = renderDetails;
    renderDetails = function renderDetailsWithBuyButtonAffordability() {
      const result = originalRenderDetails();
      updateLevelBuyButtonAffordability();
      return result;
    };

    const originalUpdateLiveUI = updateLiveUI;
    updateLiveUI = function updateLiveUIWithBuyButtonAffordability() {
      const result = originalUpdateLiveUI();
      updateLevelBuyButtonAffordability();
      return result;
    };

    updateLevelBuyButtonAffordability();
  }

  window.setTimeout(installHooks, 0);
})();
