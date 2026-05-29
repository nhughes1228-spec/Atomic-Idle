// Lightweight browser-only validation for Atomic Idle.
// This intentionally warns in the console instead of blocking the game.

(function runAtomicIdleDevChecks() {
  const failures = [];
  const warn = message => failures.push(message);

  if (!Array.isArray(window.elements || elements)) return;

  const elementList = window.elements || elements;
  const upgradeList = window.upgrades || upgrades;
  const balance = window.BALANCE || BALANCE;

  const symbols = new Set();
  const atomicNumbers = new Set();
  for (const element of elementList) {
    if (!element.symbol) warn(`Element missing symbol: ${JSON.stringify(element)}`);
    if (symbols.has(element.symbol)) warn(`Duplicate element symbol: ${element.symbol}`);
    symbols.add(element.symbol);

    if (atomicNumbers.has(element.atomicNumber)) warn(`Duplicate atomic number: ${element.atomicNumber}`);
    atomicNumbers.add(element.atomicNumber);

    if (!Number.isInteger(element.row) || element.row < 1) warn(`${element.symbol} has invalid row.`);
    if (!Number.isInteger(element.col) || element.col < 1 || element.col > 18) warn(`${element.symbol} has invalid column.`);
    if (!Number.isFinite(element.baseCost) || element.baseCost <= 0) warn(`${element.symbol} has invalid baseCost.`);
    if (!Number.isFinite(element.baseProduction) || element.baseProduction < 0) warn(`${element.symbol} has invalid baseProduction.`);
  }

  const upgradeIds = new Set();
  for (const upgrade of upgradeList) {
    if (!upgrade.id) warn(`Upgrade missing id: ${upgrade.name || "unnamed"}`);
    if (upgradeIds.has(upgrade.id)) warn(`Duplicate upgrade id: ${upgrade.id}`);
    upgradeIds.add(upgrade.id);

    if (upgrade.element && !symbols.has(upgrade.element)) warn(`${upgrade.id} references missing element ${upgrade.element}.`);
    if (!Number.isFinite(upgrade.cost) || upgrade.cost < 0) warn(`${upgrade.id} has invalid cost.`);
    if (typeof upgrade.requires !== "function") warn(`${upgrade.id} is missing requires().`);
    if (typeof upgrade.effect !== "function") warn(`${upgrade.id} is missing effect().`);
  }

  for (const element of elementList) {
    for (const level of balance.milestones.levels) {
      const expected = upgradeList.some(upgrade => upgrade.element === element.symbol && upgrade.level === level);
      if (!expected) warn(`${element.symbol} is missing Lv. ${level} milestone upgrade.`);
    }
  }

  const fresh = defaultState();
  for (const element of elementList) {
    if (!fresh.elements[element.symbol]) warn(`defaultState() missing ${element.symbol}.`);
    if (!Object.prototype.hasOwnProperty.call(fresh.elementMultipliers, element.symbol)) warn(`defaultState() missing multiplier for ${element.symbol}.`);
  }

  if (!Object.prototype.hasOwnProperty.call(fresh, "publishedCount")) warn("defaultState() missing publishedCount.");
  if (!Number.isFinite(fresh.publishedCount)) warn("defaultState().publishedCount is not numeric.");

  const formatSamples = [0, 0.1, 999, 1000, 1e9, 1e30, 1e63, 1e90];
  for (const sample of formatSamples) {
    const formatted = formatNumber(sample);
    if (typeof formatted !== "string" || !formatted.length) warn(`formatNumber failed for ${sample}.`);
  }

  if (failures.length) {
    console.warn(`Atomic Idle dev checks found ${failures.length} issue(s):`, failures);
  } else {
    console.info(`Atomic Idle dev checks passed: ${elementList.length} elements, ${upgradeList.length} upgrades.`);
  }
})();
