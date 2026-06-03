// Research simplification pass.
// For now, Research only improves passive Particles/sec and click power.

(function simplifyResearchEffects() {
  if (typeof BALANCE === "undefined") return;

  BALANCE.research.discoveryDiscountPerPoint = 0;
  BALANCE.research.maxDiscoveryDiscount = 0;
  BALANCE.research.levelDiscountPerPoint = 0;
  BALANCE.research.maxLevelDiscount = 0;
  BALANCE.research.offlineHoursPerPoint = 0;
  BALANCE.research.futureResearchPerPoint = 0;

  if (typeof getResearchDiscoveryDiscount === "function") getResearchDiscoveryDiscount = () => 0;
  if (typeof getResearchLevelDiscount === "function") getResearchLevelDiscount = () => 0;

  const originalRebuildDerivedEffects = rebuildDerivedEffects;
  rebuildDerivedEffects = function rebuildDerivedEffectsWithSimpleResearch(current) {
    originalRebuildDerivedEffects(current);
    current.bonuses.costReduction = 0;
    current.bonuses.offlineCapHours = 0;
    current.bonuses.researchGain = 1;
  };

  if (typeof state !== "undefined") rebuildDerivedEffects(state);
  if (typeof renderFull === "function") renderFull();
})();
