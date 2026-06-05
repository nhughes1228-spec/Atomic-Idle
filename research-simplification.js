// Research simplification pass.
// For now, each Research adds a flat +5% to passive Particles/sec and click power.
// Research no longer grants discovery discounts, level discounts, offline cap, or future Research gain.

(function simplifyResearchEffects() {
  if (typeof BALANCE === "undefined") return;

  BALANCE.research.passivePerPoint = 0.05;
  BALANCE.research.clickPerPoint = 0.05;
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
    // Because the BALANCE research values above are already simplified before this runs,
    // the original rebuild starts with +5% click/global per Research, then applies all
    // purchased upgrade effects on top. Do not overwrite click/global after that point.
    originalRebuildDerivedEffects(current);

    // Keep only the non-click/non-production Research perks disabled.
    // These values are Research-specific and should not erase upgrade multipliers.
    current.bonuses.costReduction = 0;
    current.bonuses.offlineCapHours = 0;
    current.bonuses.researchGain = 1;
  };

  if (typeof state !== "undefined") rebuildDerivedEffects(state);
  if (typeof renderFull === "function") renderFull();
})();
