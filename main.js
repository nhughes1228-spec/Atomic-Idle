const SAVE_KEY = "atomic-idle-save-v2";
const LEGACY_SAVE_KEYS = ["atomic-idle-save-v1"];
const SAVE_VERSION = 2;
const SAVE_INTERVAL_MS = 8000;
const OFFLINE_CAP_SECONDS = 60 * 60 * 4;
const MAX_REALTIME_CATCHUP_SECONDS = 60 * 60 * 4;

const BALANCE = {
  numberUnits: ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Ocd", "Nd"],
  research: {
    passivePerPoint: 0.08,
    clickPerPoint: 0.06,
    discoveryDiscountPerPoint: 0.0035,
    maxDiscoveryDiscount: 0.25,
    levelDiscountPerPoint: 0.006,
    maxLevelDiscount: 0.35,
    offlineHoursPerPoint: 1 / 8,
    futureResearchPerPoint: 0.015
  },
  unlocks: {
    earlyCurve: 1.14,
    postNeonCurve: 1.26,
    postArgonCurve: 1.12
  },
  levelCosts: {
    growth: 1.18,
    maxBuyCap: 1000
  },
  production: {
    everyTwentyFiveMultiplier: 2,
    everyHundredMultiplier: 3,
    everyThousandMultiplier: 10
  },
  milestones: {
    levels: [10, 25, 50, 100],
    costFactors: { 10: 4, 25: 18, 50: 70, 100: 260 },
    multipliers: { 10: 1.6, 25: 2, 50: 2.6, 100: 3.5 }
  }
};

const elements = [
  { atomicNumber: 1, symbol: "H", name: "Hydrogen", category: "nonmetal", row: 1, col: 1, unlockCost: 0, baseCost: 18, baseProduction: 0.1, role: "Particle foundation and basic chamber calibration." },
  { atomicNumber: 2, symbol: "He", name: "Helium", category: "noble-gas", row: 1, col: 18, unlockCost: 350, baseCost: 145, baseProduction: 0.42, role: "Stable passive production and offline continuity." },
  { atomicNumber: 3, symbol: "Li", name: "Lithium", category: "alkali-metal", row: 2, col: 1, unlockCost: 3200, baseCost: 1050, baseProduction: 1.8, role: "Reactive bursts that reward rebuilding momentum." },
  { atomicNumber: 4, symbol: "Be", name: "Beryllium", category: "alkaline-earth", row: 2, col: 2, unlockCost: 22000, baseCost: 7200, baseProduction: 7.5, role: "Structural lab improvements and stronger automation." },
  { atomicNumber: 5, symbol: "B", name: "Boron", category: "metalloid", row: 2, col: 13, unlockCost: 145000, baseCost: 48000, baseProduction: 28, role: "Efficiency upgrades and level cost reduction." },
  { atomicNumber: 6, symbol: "C", name: "Carbon", category: "nonmetal", row: 2, col: 14, unlockCost: 920000, baseCost: 300000, baseProduction: 105, role: "Compound framework preview and broad scaling." },
  { atomicNumber: 7, symbol: "N", name: "Nitrogen", category: "diatomic-nonmetal", row: 2, col: 15, unlockCost: 6200000, baseCost: 1900000, baseProduction: 390, role: "Research modeling and prestige preparation." },
  { atomicNumber: 8, symbol: "O", name: "Oxygen", category: "diatomic-nonmetal", row: 2, col: 16, unlockCost: 43000000, baseCost: 12200000, baseProduction: 1500, role: "Reaction multipliers and compound activation." },
  { atomicNumber: 9, symbol: "F", name: "Fluorine", category: "halogen", row: 2, col: 17, unlockCost: 285000000, baseCost: 77000000, baseProduction: 6100, role: "High reactivity and large late-run multipliers." },
  { atomicNumber: 10, symbol: "Ne", name: "Neon", category: "noble-gas", row: 2, col: 18, unlockCost: 1800000000, baseCost: 480000000, baseProduction: 25000, role: "Prestige gateway and lab illumination." },
  { atomicNumber: 11, symbol: "Na", name: "Sodium", category: "alkali-metal", row: 3, col: 1, unlockCost: 1.15e10, baseCost: 3.07e9, baseProduction: 1.05e5, role: "Alkali metal scaling and post-Neon run extension." },
  { atomicNumber: 12, symbol: "Mg", name: "Magnesium", category: "alkaline-earth", row: 3, col: 2, unlockCost: 7.4e10, baseCost: 1.97e10, baseProduction: 4.4e5, role: "Stable structural production after Sodium." },
  { atomicNumber: 13, symbol: "Al", name: "Aluminum", category: "post-transition-metal", row: 3, col: 13, unlockCost: 4.8e11, baseCost: 1.28e11, baseProduction: 1.85e6, role: "Light metal production bridge." },
  { atomicNumber: 14, symbol: "Si", name: "Silicon", category: "metalloid", row: 3, col: 14, unlockCost: 3.1e12, baseCost: 8.27e11, baseProduction: 7.8e6, role: "Metalloid efficiency and future technology foundation." },
  { atomicNumber: 15, symbol: "P", name: "Phosphorus", category: "nonmetal", row: 3, col: 15, unlockCost: 2.0e13, baseCost: 5.33e12, baseProduction: 3.3e7, role: "Reactive nonmetal production." },
  { atomicNumber: 16, symbol: "S", name: "Sulfur", category: "nonmetal", row: 3, col: 16, unlockCost: 1.3e14, baseCost: 3.47e13, baseProduction: 1.4e8, role: "Dense nonmetal output." },
  { atomicNumber: 17, symbol: "Cl", name: "Chlorine", category: "halogen", row: 3, col: 17, unlockCost: 8.4e14, baseCost: 2.24e14, baseProduction: 5.9e8, role: "Halogen reactivity spike." },
  { atomicNumber: 18, symbol: "Ar", name: "Argon", category: "noble-gas", row: 3, col: 18, unlockCost: 5.4e15, baseCost: 1.44e15, baseProduction: 2.5e9, role: "Noble gas stability checkpoint." },
  { atomicNumber: 19, symbol: "K", name: "Potassium", category: "alkali-metal", row: 4, col: 1, unlockCost: 3.5e16, baseCost: 9.33e15, baseProduction: 1.05e10, role: "Period four alkali surge." },
  { atomicNumber: 20, symbol: "Ca", name: "Calcium", category: "alkaline-earth", row: 4, col: 2, unlockCost: 2.3e17, baseCost: 6.13e16, baseProduction: 4.4e10, role: "Durable alkaline earth scaling." },
  { atomicNumber: 21, symbol: "Sc", name: "Scandium", category: "transition-metal", row: 4, col: 3, unlockCost: 1.5e18, baseCost: 4.0e17, baseProduction: 1.85e11, role: "First transition-metal frontier." },
  { atomicNumber: 22, symbol: "Ti", name: "Titanium", category: "transition-metal", row: 4, col: 4, unlockCost: 9.7e18, baseCost: 2.59e18, baseProduction: 7.8e11, role: "Transition-metal production frame." },
  { atomicNumber: 23, symbol: "V", name: "Vanadium", category: "transition-metal", row: 4, col: 5, unlockCost: 6.3e19, baseCost: 1.68e19, baseProduction: 3.3e12, role: "High-density transition output." },
  { atomicNumber: 24, symbol: "Cr", name: "Chromium", category: "transition-metal", row: 4, col: 6, unlockCost: 4.1e20, baseCost: 1.09e20, baseProduction: 1.4e13, role: "Polished late-period production." },
  { atomicNumber: 25, symbol: "Mn", name: "Manganese", category: "transition-metal", row: 4, col: 7, unlockCost: 2.7e21, baseCost: 7.2e20, baseProduction: 5.9e13, role: "Transition-metal compounding." },
  { atomicNumber: 26, symbol: "Fe", name: "Iron", category: "transition-metal", row: 4, col: 8, unlockCost: 1.8e22, baseCost: 4.8e21, baseProduction: 2.5e14, role: "Heavy lab infrastructure scaling." },
  { atomicNumber: 27, symbol: "Co", name: "Cobalt", category: "transition-metal", row: 4, col: 9, unlockCost: 1.2e23, baseCost: 3.2e22, baseProduction: 1.05e15, role: "Magnetic production growth." },
  { atomicNumber: 28, symbol: "Ni", name: "Nickel", category: "transition-metal", row: 4, col: 10, unlockCost: 7.8e23, baseCost: 2.08e23, baseProduction: 4.4e15, role: "Sturdy transition-metal checkpoint." },
  { atomicNumber: 29, symbol: "Cu", name: "Copper", category: "transition-metal", row: 4, col: 11, unlockCost: 5.0e24, baseCost: 1.33e24, baseProduction: 1.85e16, role: "Conductive late-run production." },
  { atomicNumber: 30, symbol: "Zn", name: "Zinc", category: "transition-metal", row: 4, col: 12, unlockCost: 3.3e25, baseCost: 8.8e24, baseProduction: 7.8e16, role: "Transition-metal completion point." },
  { atomicNumber: 31, symbol: "Ga", name: "Gallium", category: "post-transition-metal", row: 4, col: 13, unlockCost: 2.2e26, baseCost: 5.87e25, baseProduction: 3.3e17, role: "Soft metal production bridge." },
  { atomicNumber: 32, symbol: "Ge", name: "Germanium", category: "metalloid", row: 4, col: 14, unlockCost: 1.4e27, baseCost: 3.73e26, baseProduction: 1.4e18, role: "Metalloid systems scaling." },
  { atomicNumber: 33, symbol: "As", name: "Arsenic", category: "metalloid", row: 4, col: 15, unlockCost: 9.2e27, baseCost: 2.45e27, baseProduction: 5.9e18, role: "Metalloid reaction modeling." },
  { atomicNumber: 34, symbol: "Se", name: "Selenium", category: "nonmetal", row: 4, col: 16, unlockCost: 6.0e28, baseCost: 1.6e28, baseProduction: 2.5e19, role: "Nonmetal late-run pressure." },
  { atomicNumber: 35, symbol: "Br", name: "Bromine", category: "halogen", row: 4, col: 17, unlockCost: 3.9e29, baseCost: 1.04e29, baseProduction: 1.05e20, role: "High-reactivity halogen spike." },
  { atomicNumber: 36, symbol: "Kr", name: "Krypton", category: "noble-gas", row: 4, col: 18, unlockCost: 2.5e30, baseCost: 6.67e29, baseProduction: 4.4e20, role: "Noble gas endpoint for the expanded table." }
];

const handAuthoredUpgrades = [
  { id: "focused_chamber", element: "H", level: 10, name: "Focused Chamber", description: "Doubles Particle gain from clicking the active element.", cost: 90, requires: () => true, effect: current => { current.multipliers.click *= 2; } },
  { id: "hydrogen_containment", element: "H", level: 25, name: "Hydrogen Containment", description: "Hydrogen production x2. The first element stays relevant longer.", cost: 260, requires: current => getElementState(current, "H").level >= 8, effect: current => { current.elementMultipliers.H *= 2; } },
  { id: "pipette_array", element: "H", level: 50, name: "Pipette Array", description: "Active element clicks are 35% stronger.", cost: 520, requires: current => getElementState(current, "H").level >= 12, effect: current => { current.multipliers.click *= 1.35; } },
  { id: "hydrogen_manifold", element: "H", level: 100, name: "Hydrogen Manifold", description: "Hydrogen production +50% and element level costs -3%.", cost: 780, requires: current => getElementState(current, "H").level >= 16, effect: current => { current.elementMultipliers.H *= 1.5; current.bonuses.costReduction += 0.03; } },
  { id: "magnetic_lens", element: "He", level: 10, name: "Magnetic Lens", description: "Element clicks gain +10% of total passive production.", cost: 850, requires: current => isUnlocked(current, "He"), effect: current => { current.bonuses.clickFromPassive += 0.10; } },
  { id: "helium_cooling", element: "He", level: 25, name: "Helium Cooling Loop", description: "All passive Particle production +25% and offline cap +1 hour.", cost: 2400, requires: current => getElementState(current, "He").level >= 5, effect: current => { current.multipliers.global *= 1.25; current.bonuses.offlineCapHours += 1; } },
  { id: "noble_gas_buffer", element: "He", level: 50, name: "Noble Gas Buffer", description: "Helium production x2.", cost: 3600, requires: current => getElementState(current, "He").level >= 8, effect: current => { current.elementMultipliers.He *= 2; } },
  { id: "helium_recapture", element: "He", level: 100, name: "Helium Recapture", description: "Helium production +75% and offline cap +1 hour.", cost: 7600, requires: current => getElementState(current, "He").level >= 12, effect: current => { current.elementMultipliers.He *= 1.75; current.bonuses.offlineCapHours += 1; } },
  { id: "lab_assistant", element: "Li", level: 10, name: "Lab Assistant", description: "Adds a steady +1 virtual click from your newest element per second.", cost: 9500, requires: current => isUnlocked(current, "Li"), effect: current => { current.bonuses.autoClicksPerSecond += 1; } },
  { id: "lithium_channels", element: "Li", level: 25, name: "Lithium Channels", description: "Lithium production x2 and active element clicks +20%.", cost: 14500, requires: current => getElementState(current, "Li").level >= 4, effect: current => { current.elementMultipliers.Li *= 2; current.multipliers.click *= 1.2; } },
  { id: "ion_exchange", element: "Li", level: 50, name: "Ion Exchange Rack", description: "Every discovered element adds +2% global production.", cost: 21500, requires: current => isUnlocked(current, "Li"), effect: current => { current.bonuses.perElementGlobal += 0.02; } },
  { id: "alkali_boost", element: "Li", level: 100, name: "Alkali Boost", description: "Lithium production +80% and level costs -4%.", cost: 33500, requires: current => getElementState(current, "Li").level >= 8, effect: current => { current.elementMultipliers.Li *= 1.8; current.bonuses.costReduction += 0.04; } },
  { id: "beryllium_frame", element: "Be", level: 10, name: "Beryllium Frame", description: "Element level costs are reduced by 8%.", cost: 65000, requires: current => isUnlocked(current, "Be"), effect: current => { current.bonuses.costReduction += 0.08; } },
  { id: "beryllium_lattice", element: "Be", level: 25, name: "Beryllium Lattice", description: "Beryllium production x2 and all production +12%.", cost: 92000, requires: current => getElementState(current, "Be").level >= 3, effect: current => { current.elementMultipliers.Be *= 2; current.multipliers.global *= 1.12; } },
  { id: "precision_balancer", element: "Be", level: 50, name: "Precision Balancer", description: "Active element clicks +40%.", cost: 128000, requires: current => isUnlocked(current, "Be"), effect: current => { current.multipliers.click *= 1.4; } },
  { id: "structural_scaffold", element: "Be", level: 100, name: "Structural Scaffold", description: "Beryllium production +75% and every discovered element adds +2% production.", cost: 185000, requires: current => getElementState(current, "Be").level >= 7, effect: current => { current.elementMultipliers.Be *= 1.75; current.bonuses.perElementGlobal += 0.02; } },
  { id: "boron_efficiency", element: "B", level: 10, name: "Boron Efficiency Matrix", description: "All unlocked elements produce 40% more Particles.", cost: 380000, requires: current => getElementState(current, "B").level >= 3, effect: current => { current.multipliers.global *= 1.4; } },
  { id: "semiconductor_grid", element: "B", level: 25, name: "Semiconductor Grid", description: "Boron production x2 and level costs -5%.", cost: 540000, requires: current => isUnlocked(current, "B"), effect: current => { current.elementMultipliers.B *= 2; current.bonuses.costReduction += 0.05; } },
  { id: "boron_doping", element: "B", level: 50, name: "Boron Doping", description: "Active and virtual clicks gain +6% of passive production.", cost: 780000, requires: current => getElementState(current, "B").level >= 5, effect: current => { current.bonuses.clickFromPassive += 0.06; } },
  { id: "carbon_lattice", element: "C", level: 10, name: "Carbon Lattice", description: "Every discovered element adds +4% global production.", cost: 2400000, requires: current => isUnlocked(current, "C"), effect: current => { current.bonuses.perElementGlobal += 0.04; } },
  { id: "carbon_chains", element: "C", level: 25, name: "Carbon Chains", description: "Carbon production x2 and all production +15%.", cost: 3600000, requires: current => getElementState(current, "C").level >= 3, effect: current => { current.elementMultipliers.C *= 2; current.multipliers.global *= 1.15; } },
  { id: "compound_modeling", element: "C", level: 50, name: "Compound Modeling", description: "Active element clicks +50% and level costs -5%.", cost: 5200000, requires: current => isUnlocked(current, "C"), effect: current => { current.multipliers.click *= 1.5; current.bonuses.costReduction += 0.05; } },
  { id: "nitrogen_modeling", element: "N", level: 10, name: "Nitrogen Modeling", description: "Future Research gains are increased by 25%.", cost: 16500000, requires: current => isUnlocked(current, "N"), effect: current => { current.bonuses.researchGain *= 1.25; } },
  { id: "pressure_vessel", element: "N", level: 25, name: "Pressure Vessel", description: "Nitrogen production x2 and all production +20%.", cost: 24500000, requires: current => getElementState(current, "N").level >= 3, effect: current => { current.elementMultipliers.N *= 2; current.multipliers.global *= 1.2; } },
  { id: "reaction_forecasting", element: "N", level: 50, name: "Reaction Forecasting", description: "Active and virtual clicks gain +8% of passive production.", cost: 36000000, requires: current => isUnlocked(current, "N"), effect: current => { current.bonuses.clickFromPassive += 0.08; } },
  { id: "oxygen_reaction_web", element: "O", level: 10, name: "Oxygen Reaction Web", description: "Unlocks a simulated water-cycle bonus: all production x1.75.", cost: 110000000, requires: current => isUnlocked(current, "O") && isUnlocked(current, "H"), effect: current => { current.multipliers.global *= 1.75; } },
  { id: "oxidation_cycle", element: "O", level: 25, name: "Oxidation Cycle", description: "Oxygen production x2 and level costs -6%.", cost: 165000000, requires: current => getElementState(current, "O").level >= 3, effect: current => { current.elementMultipliers.O *= 2; current.bonuses.costReduction += 0.06; } },
  { id: "catalyst_cloud", element: "O", level: 50, name: "Catalyst Cloud", description: "All production +30% and virtual newest-element clicks +1/sec.", cost: 230000000, requires: current => isUnlocked(current, "O"), effect: current => { current.multipliers.global *= 1.3; current.bonuses.autoClicksPerSecond += 1; } },
  { id: "fluorine_catalyst", element: "F", level: 10, name: "Fluorine Catalyst", description: "Click power and passive production both increase by 65%.", cost: 720000000, requires: current => isUnlocked(current, "F"), effect: current => { current.multipliers.global *= 1.65; current.multipliers.click *= 1.65; } },
  { id: "halogen_surge", element: "F", level: 25, name: "Halogen Surge", description: "Fluorine production x2 and active element clicks +50%.", cost: 1100000000, requires: current => getElementState(current, "F").level >= 3, effect: current => { current.elementMultipliers.F *= 2; current.multipliers.click *= 1.5; } },
  { id: "neon_tube_array", element: "Ne", level: 10, name: "Neon Tube Array", description: "Neon production x2 and all production +35%.", cost: 2900000000, requires: current => isUnlocked(current, "Ne"), effect: current => { current.elementMultipliers.Ne *= 2; current.multipliers.global *= 1.35; } },
  { id: "publication_pipeline", element: "Ne", level: 25, name: "Publication Pipeline", description: "Future Research gains +35% before publishing.", cost: 5200000000, requires: current => isUnlocked(current, "Ne"), effect: current => { current.bonuses.researchGain *= 1.35; } }
];

const upgrades = buildUpgrades();

function buildUpgrades() {
  const result = [];
  const assigned = new Set();

  for (const upgrade of handAuthoredUpgrades) {
    const normalized = normalizeMilestoneUpgrade(upgrade);
    result.push(normalized);
    assigned.add(milestoneKey(normalized.element, normalized.level));
  }

  for (const element of elements) {
    for (const level of BALANCE.milestones.levels) {
      const key = milestoneKey(element.symbol, level);
      if (assigned.has(key)) continue;
      result.push(createGeneratedMilestoneUpgrade(element, level));
      assigned.add(key);
    }
  }

  return result;
}

function milestoneKey(symbol, level) { return `${symbol}:${level}`; }
function getMilestoneUpgradeCost(element, level) { return Math.ceil(element.baseCost * BALANCE.milestones.costFactors[level]); }

function normalizeMilestoneUpgrade(upgrade) {
  const originalRequires = upgrade.requires || (() => true);
  return {
    ...upgrade,
    milestoneSymbol: upgrade.element,
    milestoneLevel: upgrade.level,
    requires: current => isUnlocked(current, upgrade.element) && getElementState(current, upgrade.element).level >= upgrade.level && originalRequires(current),
    description: `${upgrade.element} Lv. ${upgrade.level} milestone. ${upgrade.description}`
  };
}

function createGeneratedMilestoneUpgrade(element, level) {
  const multiplier = BALANCE.milestones.multipliers[level];
  return {
    id: `milestone_${element.symbol.toLowerCase()}_${level}`,
    element: element.symbol,
    level,
    milestoneSymbol: element.symbol,
    milestoneLevel: level,
    name: `${element.name} Lv. ${level}`,
    description: `${element.symbol} Lv. ${level} milestone. ${element.name} production x${multiplier}.`,
    cost: getMilestoneUpgradeCost(element, level),
    requires: current => isUnlocked(current, element.symbol) && getElementState(current, element.symbol).level >= level,
    effect: current => { current.elementMultipliers[element.symbol] *= multiplier; }
  };
}

function defaultState() {
  return {
    version: SAVE_VERSION,
    hasStarted: false,
    particles: 0,
    lifetimeParticles: 0,
    research: 0,
    publishedCount: 0,
    selectedSymbol: "H",
    lastSaved: Date.now(),
    discoveredHighest: 1,
    purchasedUpgrades: [],
    multipliers: { click: 1, global: 1 },
    elementMultipliers: Object.fromEntries(elements.map(element => [element.symbol, 1])),
    bonuses: { autoClicksPerSecond: 0, clickFromPassive: 0, costReduction: 0, offlineCapHours: 0, perElementGlobal: 0, researchGain: 1 },
    elements: Object.fromEntries(elements.map(element => [element.symbol, { unlocked: element.symbol === "H", level: element.symbol === "H" ? 1 : 0 }]))
  };
}

let state = loadGame();
let toastTimeout = null;
let lastWallClock = Date.now();
let pendingLiveUpdate = false;
let floatToggle = 0;
let saveTimer = null;
const tileRefs = new Map();
const upgradeRefs = new Map();

const dom = {
  particlesDisplay: document.getElementById("particles-display"),
  ppsDisplay: document.getElementById("pps-display"),
  clickDisplay: document.getElementById("click-display"),
  researchDisplay: document.getElementById("research-display"),
  periodicTable: document.getElementById("periodic-table"),
  selectedName: document.getElementById("selected-name"),
  elementDetails: document.getElementById("element-details"),
  upgradesList: document.getElementById("upgrades-list"),
  prestigeButton: document.getElementById("prestige-button"),
  prestigeCopy: document.getElementById("prestige-copy"),
  researchEffectsGrid: document.getElementById("research-effects-grid"),
  saveButton: document.getElementById("save-button"),
  exportButton: document.getElementById("export-button"),
  importButton: document.getElementById("import-button"),
  resetButton: document.getElementById("reset-button"),
  floatLayer: document.getElementById("float-layer"),
  toast: document.getElementById("toast")
};

function loadGame() {
  const fresh = defaultState();
  try {
    const raw = localStorage.getItem(SAVE_KEY) || LEGACY_SAVE_KEYS.map(key => localStorage.getItem(key)).find(Boolean);
    if (!raw) return fresh;
    const saved = JSON.parse(raw);
    const merged = deepMerge(fresh, migrateSave(saved));
    normalizeState(merged);
    rebuildDerivedEffects(merged);
    applyOfflineProgress(merged);
    return merged;
  } catch (error) {
    console.warn("Could not load save", error);
    return fresh;
  }
}

function migrateSave(saved) {
  return { ...saved, version: SAVE_VERSION, publishedCount: Number.isFinite(saved.publishedCount) ? saved.publishedCount : 0 };
}

function deepMerge(base, saved) {
  for (const [key, value] of Object.entries(saved || {})) {
    if (value && typeof value === "object" && !Array.isArray(value) && base[key] && typeof base[key] === "object" && !Array.isArray(base[key])) {
      base[key] = deepMerge(base[key], value);
    } else {
      base[key] = value;
    }
  }
  return base;
}

function normalizeState(current) {
  current.version = SAVE_VERSION;
  current.particles = sanitizeNumber(current.particles, 0);
  current.lifetimeParticles = sanitizeNumber(current.lifetimeParticles, 0);
  current.research = sanitizeNumber(current.research, 0);
  current.publishedCount = sanitizeNumber(current.publishedCount, 0);
  current.discoveredHighest = sanitizeNumber(current.discoveredHighest, 1);
  current.purchasedUpgrades = Array.isArray(current.purchasedUpgrades) ? [...new Set(current.purchasedUpgrades.filter(id => upgrades.some(upgrade => upgrade.id === id)))] : [];

  for (const element of elements) {
    if (!current.elements[element.symbol]) current.elements[element.symbol] = { unlocked: false, level: 0 };
    current.elements[element.symbol].unlocked = Boolean(current.elements[element.symbol].unlocked);
    current.elements[element.symbol].level = Math.max(0, Math.floor(sanitizeNumber(current.elements[element.symbol].level, 0)));
    if (!current.elementMultipliers[element.symbol]) current.elementMultipliers[element.symbol] = 1;
  }

  current.elements.H.unlocked = true;
  current.elements.H.level = Math.max(1, current.elements.H.level || 1);
  current.selectedSymbol = current.elements[current.selectedSymbol]?.unlocked ? current.selectedSymbol : getNewestUnlockedElement(current).symbol;
  if (typeof current.hasStarted !== "boolean") current.hasStarted = Boolean(current.lifetimeParticles || current.particles || current.purchasedUpgrades.length || current.discoveredHighest > 1);
}

function sanitizeNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function rebuildDerivedEffects(current) {
  current.multipliers = {
    click: 1 + current.research * BALANCE.research.clickPerPoint,
    global: 1 + current.research * BALANCE.research.passivePerPoint
  };
  current.elementMultipliers = Object.fromEntries(elements.map(element => [element.symbol, 1]));
  current.bonuses = {
    autoClicksPerSecond: 0,
    clickFromPassive: 0,
    costReduction: getResearchLevelDiscount(current),
    offlineCapHours: Math.floor(current.research * BALANCE.research.offlineHoursPerPoint),
    perElementGlobal: 0,
    researchGain: 1 + current.research * BALANCE.research.futureResearchPerPoint
  };
  for (const upgradeId of current.purchasedUpgrades) {
    const upgrade = upgrades.find(item => item.id === upgradeId);
    if (upgrade) upgrade.effect(current);
  }
}

function applyOfflineProgress(current) {
  const elapsedSeconds = Math.max(0, (Date.now() - (current.lastSaved || Date.now())) / 1000);
  const cap = OFFLINE_CAP_SECONDS + (current.bonuses?.offlineCapHours || 0) * 3600;
  const effectiveSeconds = Math.min(elapsedSeconds, cap);
  if (!current.hasStarted || effectiveSeconds < 5) {
    current.lastSaved = Date.now();
    return;
  }
  const offlineGain = getParticlesPerSecond(current) * effectiveSeconds * 0.65;
  if (offlineGain > 1) {
    current.particles += offlineGain;
    current.lifetimeParticles += offlineGain;
    setTimeout(() => showToast(`Offline lab report: +${formatNumber(offlineGain)} Particles collected.`), 400);
  }
  current.lastSaved = Date.now();
}

function catchUpProgress(showMessage = false) {
  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - lastWallClock) / 1000);
  lastWallClock = now;
  if (!state.hasStarted || elapsedSeconds <= 0) return 0;
  const effectiveSeconds = Math.min(elapsedSeconds, MAX_REALTIME_CATCHUP_SECONDS);
  const gain = getParticlesPerSecond() * effectiveSeconds;
  if (gain > 0) {
    addParticles(gain);
    if (showMessage && effectiveSeconds >= 5) showToast(`Background lab time: +${formatNumber(gain)} Particles.`);
  }
  return gain;
}

function saveGame(showMessage = false) {
  catchUpProgress(false);
  state.version = SAVE_VERSION;
  state.lastSaved = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  for (const key of LEGACY_SAVE_KEYS) localStorage.removeItem(key);
  if (showMessage) showToast("Experiment saved.");
}

function getElementState(current, symbol) { return current.elements[symbol]; }
function isUnlocked(current, symbol) { return Boolean(getElementState(current, symbol)?.unlocked); }
function getUnlockedElements(current = state) { return elements.filter(element => isUnlocked(current, element.symbol)); }
function getNewestUnlockedElement(current = state) { return getUnlockedElements(current).at(-1) || elements[0]; }
function getGlobalMultiplier(current = state) { return current.multipliers.global * (1 + getUnlockedElements(current).length * current.bonuses.perElementGlobal); }
function getActiveElement() { return elements.find(element => element.symbol === state.selectedSymbol) || getNewestUnlockedElement(); }
function getElementTapWeight(element) { return Math.pow(element.baseProduction / elements[0].baseProduction, 0.5); }

function getElementLevelLandmarkMultiplier(level) {
  const safeLevel = Math.max(0, level || 0);
  const twentyFiveBonuses = Math.floor(safeLevel / 25);
  const hundredBonuses = Math.floor(safeLevel / 100);
  const thousandBonuses = Math.floor(safeLevel / 1000);
  return Math.pow(BALANCE.production.everyTwentyFiveMultiplier, twentyFiveBonuses)
    * Math.pow(BALANCE.production.everyHundredMultiplier, hundredBonuses)
    * Math.pow(BALANCE.production.everyThousandMultiplier, thousandBonuses);
}

function getElementProduction(element, current = state) {
  const elementState = getElementState(current, element.symbol);
  if (!current.hasStarted || !elementState?.unlocked) return 0;
  const level = elementState.level || 0;
  return element.baseProduction
    * level
    * getElementLevelLandmarkMultiplier(level)
    * current.elementMultipliers[element.symbol]
    * getGlobalMultiplier(current);
}

function getParticlesPerSecond(current = state) {
  if (!current.hasStarted) return 0;
  const elementProduction = elements.reduce((sum, element) => sum + getElementProduction(element, current), 0);
  const autoClickProduction = getAutoClickPower(current) * current.bonuses.autoClicksPerSecond;
  return elementProduction + autoClickProduction;
}

function getElementClickPower(element, current = state) {
  const elementState = getElementState(current, element.symbol);
  const activeLevel = elementState?.level || 1;
  const hydrogenLevel = getElementState(current, "H")?.level || 1;
  const levelContribution = 1 + Math.floor(hydrogenLevel / 8) + Math.floor(activeLevel / 10);
  const elementTapWeight = getElementTapWeight(element);
  return (levelContribution * elementTapWeight * current.multipliers.click) + (getParticlesPerSecondWithoutClickShare(current) * current.bonuses.clickFromPassive);
}

function getClickPower(current = state) {
  const activeElement = elements.find(element => element.symbol === current.selectedSymbol) || getNewestUnlockedElement(current);
  return getElementClickPower(activeElement, current);
}

function getAutoClickPower(current = state) { return getElementClickPower(getNewestUnlockedElement(current), current); }
function getParticlesPerSecondWithoutClickShare(current = state) { return current.hasStarted ? elements.reduce((sum, element) => sum + getElementProduction(element, current), 0) : 0; }

function getLevelCost(element, quantity = 1, current = state) {
  const elementState = getElementState(current, element.symbol);
  let total = 0;
  const reduction = Math.min(0.65, current.bonuses.costReduction);
  for (let i = 0; i < quantity; i += 1) total += element.baseCost * Math.pow(BALANCE.levelCosts.growth, elementState.level + i) * (1 - reduction);
  return total;
}

function getBuyMaxQuantity(element) {
  let quantity = 0;
  let total = 0;
  while (quantity < BALANCE.levelCosts.maxBuyCap) {
    const next = getLevelCost(element, quantity + 1);
    if (next > state.particles) break;
    total = next;
    quantity += 1;
  }
  return { quantity, cost: total };
}

function getNextElement() { return elements.find(element => !isUnlocked(state, element.symbol)); }
function getResearchDiscoveryDiscount(current = state) { return Math.min(BALANCE.research.maxDiscoveryDiscount, (current.research || 0) * BALANCE.research.discoveryDiscountPerPoint); }
function getResearchLevelDiscount(current = state) { return Math.min(BALANCE.research.maxLevelDiscount, (current.research || 0) * BALANCE.research.levelDiscountPerPoint); }

function getElementDiscoveryCurveMultiplier(element) {
  if (!element?.unlockCost) return 1;
  const atomicStep = Math.max(0, element.atomicNumber - 1);
  const earlyCurve = Math.pow(BALANCE.unlocks.earlyCurve, Math.min(atomicStep, 9));
  const postNeonCurve = Math.pow(BALANCE.unlocks.postNeonCurve, Math.max(0, element.atomicNumber - 10));
  const postArgonCurve = Math.pow(BALANCE.unlocks.postArgonCurve, Math.max(0, element.atomicNumber - 18));
  return earlyCurve * postNeonCurve * postArgonCurve;
}

function getUnlockCost(element, current = state) {
  if (!element?.unlockCost) return 0;
  return element.unlockCost * getElementDiscoveryCurveMultiplier(element) * (1 - getResearchDiscoveryDiscount(current));
}

function addParticles(amount) {
  state.particles += amount;
  state.lifetimeParticles += amount;
}

function activateLabFromHydrogen(event) {
  state.hasStarted = true;
  lastWallClock = Date.now();
  state.selectedSymbol = "H";
  const gain = getClickPower();
  addParticles(gain);
  spawnFloatText(`+${formatNumber(gain)}`, event?.clientX, event?.clientY);
  renderFull();
  saveGame();
}

function clickActiveElement(event) {
  catchUpProgress(false);
  if (!state.hasStarted) return;
  const gain = getClickPower();
  addParticles(gain);
  spawnFloatText(`+${formatNumber(gain)}`, event?.clientX, event?.clientY);
  requestLiveUpdate();
}

function requestLiveUpdate() {
  if (pendingLiveUpdate) return;
  pendingLiveUpdate = true;
  requestAnimationFrame(() => {
    pendingLiveUpdate = false;
    updateLiveUI();
  });
}

function unlockElement(symbol, event) {
  catchUpProgress(false);
  const element = elements.find(item => item.symbol === symbol);
  if (!element) return;
  const elementState = getElementState(state, symbol);
  if (!state.hasStarted && symbol === "H") return activateLabFromHydrogen(event);
  if (!state.hasStarted) return;
  if (elementState.unlocked) {
    if (state.selectedSymbol === symbol) return clickActiveElement(event);
    state.selectedSymbol = symbol;
    clickActiveElement(event);
    renderFull();
    return;
  }
  const next = getNextElement();
  if (next?.symbol !== symbol) return showToast(`${element.name} is not the current discovery frontier yet.`);
  const cost = getUnlockCost(element);
  if (state.particles < cost) return showToast(`${element.name} requires ${formatNumber(cost)} Particles.`);
  state.particles -= cost;
  elementState.unlocked = true;
  elementState.level = Math.max(1, elementState.level || 1);
  state.discoveredHighest = Math.max(state.discoveredHighest, element.atomicNumber);
  state.selectedSymbol = symbol;
  showToast(`${element.name} discovered.`);
  renderFull();
  saveGame();
}

function buyLevels(symbol, quantity) {
  catchUpProgress(false);
  const element = elements.find(item => item.symbol === symbol);
  if (!element || !isUnlocked(state, symbol) || !state.hasStarted) return;
  let amount = quantity;
  let cost = getLevelCost(element, amount);
  if (quantity === "max") {
    const max = getBuyMaxQuantity(element);
    amount = max.quantity;
    cost = max.cost;
  }
  if (!amount) return showToast("Not enough Particles for another level yet.");
  if (state.particles < cost) return showToast(`Need ${formatNumber(cost)} Particles.`);
  state.particles -= cost;
  getElementState(state, symbol).level += amount;
  renderFull();
}

function buyUpgrade(upgradeId) {
  catchUpProgress(false);
  const upgrade = upgrades.find(item => item.id === upgradeId);
  if (!upgrade || state.purchasedUpgrades.includes(upgradeId) || !state.hasStarted) return;
  if (!upgrade.requires(state)) return showToast("This upgrade is not ready yet.");
  if (state.particles < upgrade.cost) return showToast(`Need ${formatNumber(upgrade.cost)} Particles.`);
  state.particles -= upgrade.cost;
  state.purchasedUpgrades.push(upgradeId);
  rebuildDerivedEffects(state);
  showToast(`Upgrade purchased: ${upgrade.name}.`);
  renderFull();
  saveGame();
}

function publishResearch() {
  catchUpProgress(false);
  if (!isUnlocked(state, "Ne")) return;
  const gain = calculateResearchGain();
  if (gain <= 0) return;
  const oldResearch = state.research;
  const oldPublishedCount = state.publishedCount || 0;
  state = defaultState();
  state.research = oldResearch + gain;
  state.publishedCount = oldPublishedCount + 1;
  lastWallClock = Date.now();
  rebuildDerivedEffects(state);
  showToast(`Published findings: +${formatNumber(gain)} Research.`);
  renderFull();
  saveGame();
}

function calculateResearchGain() {
  if (!isUnlocked(state, "Ne")) return 0;
  const lifetimeComponent = Math.sqrt(Math.max(0, state.lifetimeParticles) / 100000000);
  const discoveryComponent = state.discoveredHighest * 0.8;
  return Math.max(1, Math.floor((lifetimeComponent + discoveryComponent) * state.bonuses.researchGain));
}

function renderFull() {
  document.body.classList.toggle("lab-not-started", !state.hasStarted);
  renderTable();
  renderDetails();
  renderUpgrades();
  renderPrestige();
  renderResearchEffects();
  updateLiveUI();
}

function updateLiveUI() {
  const pps = getParticlesPerSecond();
  const clickPower = getClickPower();
  dom.particlesDisplay.textContent = formatNumber(state.particles);
  dom.ppsDisplay.textContent = formatNumber(pps);
  dom.clickDisplay.textContent = formatNumber(clickPower);
  dom.researchDisplay.textContent = formatNumber(state.research);
  updateTableState();
  updateUpgradeState();
  renderResearchEffects();
}

function renderTable() {
  dom.periodicTable.innerHTML = "";
  tileRefs.clear();
  for (const element of elements) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = `element-tile category-${element.category}`;
    tile.style.gridColumn = element.col;
    tile.style.gridRow = element.row;
    tile.innerHTML = `
      <span class="element-number">${element.atomicNumber}</span>
      <span class="element-symbol">${element.symbol}</span>
      <span class="element-name" data-role="name"></span>
      <span class="element-level" data-role="level"></span>
    `;
    tile.addEventListener("click", event => unlockElement(element.symbol, event));
    dom.periodicTable.appendChild(tile);
    tileRefs.set(element.symbol, { tile, name: tile.querySelector('[data-role="name"]'), level: tile.querySelector('[data-role="level"]') });
  }
  updateTableState();
}

function updateTableState() {
  const next = getNextElement();
  for (const element of elements) {
    const refs = tileRefs.get(element.symbol);
    if (!refs) continue;
    const elementState = getElementState(state, element.symbol);
    const isActive = state.hasStarted && element.symbol === state.selectedSymbol;
    refs.tile.classList.toggle("locked", !elementState.unlocked);
    refs.tile.classList.toggle("initial-element", !state.hasStarted && element.symbol === "H");
    refs.tile.classList.toggle("active-click-target", isActive);
    refs.tile.classList.toggle("frontier", state.hasStarted && next?.symbol === element.symbol);
    refs.tile.classList.toggle("affordable", state.hasStarted && next?.symbol === element.symbol && state.particles >= getUnlockCost(element));
    refs.tile.classList.toggle("selected", isActive);
    refs.name.textContent = elementState.unlocked ? element.name : state.hasStarted && next?.symbol === element.symbol ? formatNumber(getUnlockCost(element)) : "Locked";
    refs.level.textContent = elementState.unlocked && state.hasStarted ? `${isActive ? "Tap" : "Lv."} ${isActive ? formatNumber(getClickPower()) : elementState.level}` : state.hasStarted && next?.symbol === element.symbol ? "Frontier" : "";
  }
}

function renderDetails() {
  const element = getActiveElement();
  const elementState = getElementState(state, element.symbol);
  dom.selectedName.textContent = state.hasStarted ? `${element.name} · Lv. ${elementState.level}` : element.name;
  if (!state.hasStarted) {
    dom.elementDetails.innerHTML = `<div class="compact-card" style="padding: 14px;"><strong>Table inactive.</strong></div>`;
    return;
  }
  const cost1 = getLevelCost(element, 1);
  const cost10 = getLevelCost(element, 10);
  const max = getBuyMaxQuantity(element);
  const milestoneMultiplier = getElementLevelLandmarkMultiplier(elementState.level);
  dom.elementDetails.innerHTML = `
    <div class="detail-row"><span>Production</span><strong>${formatNumber(getElementProduction(element))}/sec</strong></div>
    <div class="detail-row"><span>Level Bonus</span><strong>${formatNumber(milestoneMultiplier)}x</strong></div>
    <div class="buy-row">
      <button class="buy-button" data-buy="1">Buy 1<br><small>${formatNumber(cost1)}</small></button>
      <button class="buy-button" data-buy="10">Buy 10<br><small>${formatNumber(cost10)}</small></button>
      <button class="buy-button" data-buy="max">Buy Max<br><small>${max.quantity ? `${max.quantity} levels` : "—"}</small></button>
    </div>
  `;
  dom.elementDetails.querySelectorAll("[data-buy]").forEach(button => {
    const value = button.dataset.buy;
    button.addEventListener("click", () => buyLevels(element.symbol, value === "max" ? "max" : Number(value)));
  });
}

function renderUpgrades() {
  upgradeRefs.clear();
  if (!state.hasStarted) {
    dom.upgradesList.innerHTML = `<div class="compact-card" style="padding: 14px;"><strong>Upgrades locked.</strong></div>`;
    return;
  }
  const visible = upgrades.filter(upgrade => !state.purchasedUpgrades.includes(upgrade.id) && upgrade.requires(state));
  if (!visible.length) {
    dom.upgradesList.innerHTML = `<div class="compact-card" style="padding: 14px;"><strong>No new upgrades ready.</strong><p style="margin:8px 0 0;color:var(--muted);font-weight:650;">Level elements or discover the next frontier to reveal more lab development.</p></div>`;
    return;
  }
  dom.upgradesList.innerHTML = "";
  for (const upgrade of visible) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "upgrade-card";
    button.innerHTML = `<div class="upgrade-meta"><span>${upgrade.element} Lv. ${upgrade.level}</span><span>${formatNumber(upgrade.cost)}</span></div><h3>${upgrade.name}</h3><p>${upgrade.description}</p>`;
    button.addEventListener("click", () => buyUpgrade(upgrade.id));
    dom.upgradesList.appendChild(button);
    upgradeRefs.set(upgrade.id, button);
  }
  updateUpgradeState();
}

function updateUpgradeState() {
  for (const [upgradeId, button] of upgradeRefs.entries()) {
    const upgrade = upgrades.find(item => item.id === upgradeId);
    if (upgrade) button.disabled = state.particles < upgrade.cost;
  }
}

function renderPrestige() {
  if (isUnlocked(state, "Ne")) {
    const gain = calculateResearchGain();
    dom.prestigeButton.disabled = false;
    dom.prestigeButton.textContent = `Publish for +${formatNumber(gain)} Research`;
    dom.prestigeCopy.textContent = "Publishing resets Particles, element levels, discoveries, and purchased lab upgrades. Research permanently improves production, click strength, discovery costs, level costs, offline time, and future Research gain.";
  } else {
    dom.prestigeButton.disabled = true;
    dom.prestigeButton.textContent = "Unlock Neon First";
    dom.prestigeCopy.textContent = "Discover Neon to publish your findings. Publishing resets the lab but grants permanent Research that accelerates future runs.";
  }
}

function renderResearchEffects() {
  if (!dom.researchEffectsGrid) return;
  const research = state.research || 0;
  dom.researchEffectsGrid.innerHTML = `
    <div class="research-effect-card"><span>Passive Production</span><strong>${formatNumber(1 + research * BALANCE.research.passivePerPoint)}x</strong></div>
    <div class="research-effect-card"><span>Click Power</span><strong>${formatNumber(1 + research * BALANCE.research.clickPerPoint)}x</strong></div>
    <div class="research-effect-card"><span>Discovery Costs</span><strong>-${formatNumber(getResearchDiscoveryDiscount(state) * 100)}%</strong></div>
    <div class="research-effect-card"><span>Level Costs</span><strong>-${formatNumber(getResearchLevelDiscount(state) * 100)}%</strong></div>
    <div class="research-effect-card"><span>Offline Cap</span><strong>+${Math.floor(research * BALANCE.research.offlineHoursPerPoint)} hr</strong></div>
    <div class="research-effect-card"><span>Future Research</span><strong>${formatNumber(1 + research * BALANCE.research.futureResearchPerPoint)}x</strong></div>
  `;
}

function gameLoop() {
  catchUpProgress(false);
  updateLiveUI();
  requestAnimationFrame(gameLoop);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "0";
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  if (absolute < 1000) return `${sign}${absolute.toFixed(absolute < 10 ? 1 : 0).replace(/\.0$/, "")}`;
  const unitIndex = Math.floor(Math.log10(absolute) / 3);
  if (unitIndex >= BALANCE.numberUnits.length) return `${sign}${absolute.toExponential(2).replace("e+", "e")}`;
  const display = absolute / Math.pow(1000, unitIndex);
  return `${sign}${display.toFixed(display < 10 ? 2 : display < 100 ? 1 : 0)}${BALANCE.numberUnits[unitIndex]}`;
}

function spawnFloatText(text, x, y) {
  floatToggle = (floatToggle + 1) % 3;
  if (floatToggle !== 0) return;
  const float = document.createElement("span");
  float.className = "float-text";
  float.textContent = text;
  float.style.left = `${x || window.innerWidth / 2}px`;
  float.style.top = `${y || window.innerHeight / 2}px`;
  dom.floatLayer.appendChild(float);
  setTimeout(() => float.remove(), 900);
}

function showToast(message) {
  clearTimeout(toastTimeout);
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  toastTimeout = setTimeout(() => dom.toast.classList.remove("show"), 2600);
}

function exportSave() {
  saveGame();
  navigator.clipboard?.writeText(btoa(localStorage.getItem(SAVE_KEY) || ""))
    .then(() => showToast("Save copied to clipboard."))
    .catch(() => prompt("Copy your save:", btoa(localStorage.getItem(SAVE_KEY) || "")));
}

function importSave() {
  const encoded = prompt("Paste exported Atomic Idle save:");
  if (!encoded) return;
  try {
    const decoded = atob(encoded.trim());
    JSON.parse(decoded);
    localStorage.setItem(SAVE_KEY, decoded);
    state = loadGame();
    lastWallClock = Date.now();
    renderFull();
    showToast("Save imported.");
  } catch (error) {
    showToast("That save could not be imported.");
  }
}

function resetSave() {
  if (!confirm("Reset Atomic Idle completely? This cannot be undone.")) return;
  localStorage.removeItem(SAVE_KEY);
  for (const key of LEGACY_SAVE_KEYS) localStorage.removeItem(key);
  state = defaultState();
  lastWallClock = Date.now();
  rebuildDerivedEffects(state);
  renderFull();
  showToast("Save reset.");
}

function handleVisibilityChange() {
  if (document.hidden) {
    catchUpProgress(false);
    saveGame(false);
  } else {
    catchUpProgress(true);
    renderFull();
    saveGame(false);
  }
}

function wireEvents() {
  dom.saveButton.addEventListener("click", () => saveGame(true));
  dom.exportButton.addEventListener("click", exportSave);
  dom.importButton.addEventListener("click", importSave);
  dom.resetButton.addEventListener("click", resetSave);
  dom.prestigeButton.addEventListener("click", publishResearch);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("beforeunload", () => saveGame(false));
}

wireEvents();
renderFull();
saveTimer = setInterval(() => saveGame(false), SAVE_INTERVAL_MS);
requestAnimationFrame(gameLoop);
