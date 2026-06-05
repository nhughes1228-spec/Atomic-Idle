// Level landmark tuning.
// Adds a one-time automatic production landmark at Level 10 for each element.

(function tuneLevelLandmarks() {
  if (typeof BALANCE === "undefined" || typeof getElementLevelLandmarkMultiplier !== "function") return;

  BALANCE.production.levelTenMultiplier = 2;

  getElementLevelLandmarkMultiplier = function getElementLevelLandmarkMultiplierWithLevelTen(level) {
    const safeLevel = Math.max(0, level || 0);
    const levelTenBonus = safeLevel >= 10 ? BALANCE.production.levelTenMultiplier : 1;
    const twentyFiveBonuses = Math.floor(safeLevel / 25);
    const hundredBonuses = Math.floor(safeLevel / 100);
    const thousandBonuses = Math.floor(safeLevel / 1000);

    return levelTenBonus
      * Math.pow(BALANCE.production.everyTwentyFiveMultiplier, twentyFiveBonuses)
      * Math.pow(BALANCE.production.everyHundredMultiplier, hundredBonuses)
      * Math.pow(BALANCE.production.everyThousandMultiplier, thousandBonuses);
  };

  if (typeof renderFull === "function") renderFull();
})();
