// Economy tuning for milestone upgrades.
// Milestone upgrade prices should feel proportional to the cost of reaching the required element level.

(function tuneMilestoneUpgradeCosts() {
  if (typeof elements === "undefined" || typeof upgrades === "undefined" || typeof BALANCE === "undefined") return;

  const milestoneCostRatios = {
    10: 0.85,
    25: 1.05,
    50: 1.30,
    100: 1.65
  };

  function getCumulativeCostToReachLevel(element, targetLevel) {
    let total = 0;
    const startingLevel = element.symbol === "H" ? 1 : 1;
    for (let level = startingLevel; level < targetLevel; level += 1) {
      total += element.baseCost * Math.pow(BALANCE.levelCosts.growth, level);
    }
    return total;
  }

  for (const upgrade of upgrades) {
    if (!upgrade.element || !upgrade.level || !milestoneCostRatios[upgrade.level]) continue;
    const element = elements.find(item => item.symbol === upgrade.element);
    if (!element) continue;

    const levelInvestment = getCumulativeCostToReachLevel(element, upgrade.level);
    const tunedCost = Math.ceil(levelInvestment * milestoneCostRatios[upgrade.level]);
    upgrade.cost = Math.max(upgrade.cost || 0, tunedCost);
  }

  if (typeof renderFull === "function") renderFull();
})();
