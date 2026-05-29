// Economy tuning for milestone upgrades.
// Milestone upgrade prices should feel proportional to the final level that unlocked the milestone,
// not the total cumulative cost of reaching that milestone.

(function tuneMilestoneUpgradeCosts() {
  if (typeof elements === "undefined" || typeof upgrades === "undefined" || typeof BALANCE === "undefined") return;

  const milestoneFinalLevelCostMultiplier = 1.5;

  function getFinalRequiredLevelCost(element, targetLevel) {
    const finalRequiredLevel = Math.max(1, targetLevel - 1);
    return element.baseCost * Math.pow(BALANCE.levelCosts.growth, finalRequiredLevel);
  }

  for (const upgrade of upgrades) {
    if (!upgrade.element || !upgrade.level) continue;
    if (!BALANCE.milestones.levels.includes(upgrade.level)) continue;

    const element = elements.find(item => item.symbol === upgrade.element);
    if (!element) continue;

    const finalLevelCost = getFinalRequiredLevelCost(element, upgrade.level);
    const tunedCost = Math.ceil(finalLevelCost * milestoneFinalLevelCostMultiplier);

    // Keep hand-authored upgrades from becoming cheaper than their original authored value,
    // but stop pricing them as if the player must repay the full leveling journey.
    upgrade.cost = Math.max(upgrade.cost || 0, tunedCost);
  }

  if (typeof renderFull === "function") renderFull();
})();
