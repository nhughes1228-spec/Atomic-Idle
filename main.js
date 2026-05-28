const SAVE_KEY = "atomic-idle-save-v1";
const SAVE_INTERVAL_MS = 8000;
const OFFLINE_CAP_SECONDS = 60 * 60 * 4;

const elements = [
  { atomicNumber: 1, symbol: "H", name: "Hydrogen", category: "nonmetal", row: 1, col: 1, unlockCost: 0, baseCost: 18, baseProduction: 0.06, role: "Particle foundation and basic chamber calibration." },
  { atomicNumber: 2, symbol: "He", name: "Helium", category: "noble-gas", row: 1, col: 18, unlockCost: 350, baseCost: 145, baseProduction: 0.42, role: "Stable passive production and offline continuity." },
  { atomicNumber: 3, symbol: "Li", name: "Lithium", category: "alkali-metal", row: 2, col: 1, unlockCost: 3200, baseCost: 1050, baseProduction: 1.8, role: "Reactive bursts that reward rebuilding momentum." },
  { atomicNumber: 4, symbol: "Be", name: "Beryllium", category: "alkaline-earth", row: 2, col: 2, unlockCost: 22000, baseCost: 7200, baseProduction: 7.5, role: "Structural lab improvements and stronger automation." },
  { atomicNumber: 5, symbol: "B", name: "Boron", category: "metalloid", row: 2, col: 13, unlockCost: 145000, baseCost: 48000, baseProduction: 28, role: "Efficiency upgrades and level cost reduction." },
  { atomicNumber: 6, symbol: "C", name: "Carbon", category: "nonmetal", row: 2, col: 14, unlockCost: 920000, baseCost: 300000, baseProduction: 105, role: "Compound framework preview and broad scaling." },
  { atomicNumber: 7, symbol: "N", name: "Nitrogen", category: "diatomic-nonmetal", row: 2, col: 15, unlockCost: 6200000, baseCost: 1900000, baseProduction: 390, role: "Research modeling and prestige preparation." },
  { atomicNumber: 8, symbol: "O", name: "Oxygen", category: "diatomic-nonmetal", row: 2, col: 16, unlockCost: 43000000, baseCost: 12200000, baseProduction: 1500, role: "Reaction multipliers and compound activation." },
  { atomicNumber: 9, symbol: "F", name: "Fluorine", category: "halogen", row: 2, col: 17, unlockCost: 285000000, baseCost: 77000000, baseProduction: 6100, role: "High reactivity and large late-run multipliers." },
  { atomicNumber: 10, symbol: "Ne", name: "Neon", category: "noble-gas", row: 2, col: 18, unlockCost: 1800000000, baseCost: 480000000, baseProduction: 25000, role: "Prestige gateway and lab illumination." }
];

const upgrades = [
  { id: "focused_chamber", name: "Focused Chamber", description: "Doubles Particle gain from clicking the active element.", cost: 90, requires: () => true, effect: state => { state.multipliers.click *= 2; } },
  { id: "hydrogen_containment", name: "Hydrogen Containment", description: "Hydrogen production x2. The first element stays relevant longer.", cost: 260, requires: state => getElementState(state, "H").level >= 8, effect: state => { state.elementMultipliers.H *= 2; } },
  { id: "magnetic_lens", name: "Magnetic Lens", description: "Element clicks gain +10% of total passive production.", cost: 850, requires: state => isUnlocked(state, "He"), effect: state => { state.bonuses.clickFromPassive += 0.10; } },
  { id: "helium_cooling", name: "Helium Cooling Loop", description: "All passive Particle production +25% and offline cap +1 hour.", cost: 2400, requires: state => getElementState(state, "He").level >= 5, effect: state => { state.multipliers.global *= 1.25; state.bonuses.offlineCapHours += 1; } },
  { id: "lab_assistant", name: "Lab Assistant", description: "Adds a steady +1 virtual element click per second.", cost: 9500, requires: state => isUnlocked(state, "Li"), effect: state => { state.bonuses.autoClicksPerSecond += 1; } },
  { id: "beryllium_frame", name: "Beryllium Frame", description: "Element level costs are reduced by 8%.", cost: 65000, requires: state => isUnlocked(state, "Be"), effect: state => { state.bonuses.costReduction += 0.08; } },
  { id: "boron_efficiency", name: "Boron Efficiency Matrix", description: "All unlocked elements produce 40% more Particles.", cost: 380000, requires: state => getElementState(state, "B").level >= 3, effect: state => { state.multipliers.global *= 1.4; } },
  { id: "carbon_lattice", name: "Carbon Lattice", description: "Every discovered element adds +4% global production.", cost: 2400000, requires: state => isUnlocked(state, "C"), effect: state => { state.bonuses.perElementGlobal += 0.04; } },
  { id: "nitrogen_modeling", name: "Nitrogen Modeling", description: "Future Research gains are increased by 25%.", cost: 16500000, requires: state => isUnlocked(state, "N"), effect: state => { state.bonuses.researchGain *= 1.25; } },
  { id: "oxygen_reaction_web", name: "Oxygen Reaction Web", description: "Unlocks a simulated water-cycle bonus: all production x1.75.", cost: 110000000, requires: state => isUnlocked(state, "O") && isUnlocked(state, "H"), effect: state => { state.multipliers.global *= 1.75; } },
  { id: "fluorine_catalyst", name: "Fluorine Catalyst", description: "Click power and passive production both increase by 65%.", cost: 720000000, requires: state => isUnlocked(state, "F"), effect: state => { state.multipliers.global *= 1.65; state.multipliers.click *= 1.65; } }
];

const defaultState = () => ({
  hasStarted: false,
  particles: 0,
  lifetimeParticles: 0,
  research: 0,
  selectedSymbol: "H",
  lastSaved: Date.now(),
  discoveredHighest: 1,
  publishedCount: 0,
  elements: Object.fromEntries(elements.map(element => [element.symbol, { unlocked: element.symbol === "H", level: element.symbol === "H" ? 1 : 0 }])),
  purchasedUpgrades: [],
  multipliers: { click: 1, global: 1 },
  elementMultipliers: Object.fromEntries(elements.map(element => [element.symbol, 1])),
  bonuses: { autoClicksPerSecond: 0, clickFromPassive: 0, costReduction: 0, offlineCapHours: 0, perElementGlobal: 0, researchGain: 1 }
});

let state = loadGame();
let toastTimeout = null;
let lastTick = performance.now();

const dom = {
  particlesDisplay: document.getElementById("particles-display"),
  ppsDisplay: document.getElementById("pps-display"),
  clickDisplay: document.getElementById("click-display"),
  researchDisplay: document.getElementById("research-display"),
  clickHelpDisplay: document.getElementById("click-help-display"),
  objectiveDisplay: document.getElementById("objective-display"),
  periodicTable: document.getElementById("periodic-table"),
  selectedName: document.getElementById("selected-name"),
  elementDetails: document.getElementById("element-details"),
  upgradesList: document.getElementById("upgrades-list"),
  prestigeButton: document.getElementById("prestige-button"),
  prestigeCopy: document.getElementById("prestige-copy"),
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
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw);
    const merged = deepMerge(fresh, saved);
    normalizeState(merged);
    applyOfflineProgress(merged);
    rebuildDerivedEffects(merged);
    return merged;
  } catch (error) {
    console.warn("Could not load save", error);
    return fresh;
  }
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
  for (const element of elements) {
    if (!current.elements[element.symbol]) current.elements[element.symbol] = { unlocked: false, level: 0 };
    if (!current.elementMultipliers[element.symbol]) current.elementMultipliers[element.symbol] = 1;
  }
  current.purchasedUpgrades = Array.isArray(current.purchasedUpgrades) ? current.purchasedUpgrades : [];
  current.selectedSymbol = current.elements[current.selectedSymbol]?.unlocked ? current.selectedSymbol : "H";
  if (typeof current.hasStarted !== "boolean") current.hasStarted = Boolean(current.lifetimeParticles || current.particles || current.purchasedUpgrades.length || current.discoveredHighest > 1);
}

function rebuildDerivedEffects(current) {
  current.multipliers = { click: 1 + current.research * 0.06, global: 1 + current.research * 0.08 };
  current.elementMultipliers = Object.fromEntries(elements.map(element => [element.symbol, 1]));
  current.bonuses = {
    autoClicksPerSecond: 0,
    clickFromPassive: 0,
    costReduction: Math.min(0.35, current.research * 0.006),
    offlineCapHours: Math.floor(current.research / 8),
    perElementGlobal: 0,
    researchGain: 1 + current.research * 0.015
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
  if (!current.hasStarted || effectiveSeconds < 30) return;
  rebuildDerivedEffects(current);
  const offlineGain = getParticlesPerSecond(current) * effectiveSeconds * 0.65;
  if (offlineGain > 1) {
    current.particles += offlineGain;
    current.lifetimeParticles += offlineGain;
    setTimeout(() => showToast(`Offline lab report: +${formatNumber(offlineGain)} Particles collected.`), 400);
  }
}

function saveGame(showMessage = false) {
  state.lastSaved = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  if (showMessage) showToast("Experiment saved.");
}

function getElementState(current, symbol) { return current.elements[symbol]; }
function isUnlocked(current, symbol) { return Boolean(getElementState(current, symbol)?.unlocked); }
function getUnlockedElements(current = state) { return elements.filter(element => isUnlocked(current, element.symbol)); }
function getGlobalMultiplier(current = state) { return current.multipliers.global * (1 + getUnlockedElements(current).length * current.bonuses.perElementGlobal); }
function getActiveElement() { return elements.find(element => element.symbol === state.selectedSymbol) || elements[0]; }

function getElementProduction(element, current = state) {
  const elementState = getElementState(current, element.symbol);
  if (!current.hasStarted || !elementState?.unlocked) return 0;
  const levelBonus = Math.pow(1.035, Math.max(0, elementState.level - 1));
  const milestoneBonus = Math.pow(1.8, Math.floor(elementState.level / 25));
  return element.baseProduction * elementState.level * levelBonus * milestoneBonus * current.elementMultipliers[element.symbol] * getGlobalMultiplier(current);
}

function getParticlesPerSecond(current = state) {
  if (!current.hasStarted) return 0;
  const elementProduction = elements.reduce((sum, element) => sum + getElementProduction(element, current), 0);
  const autoClickProduction = getClickPower(current) * current.bonuses.autoClicksPerSecond;
  return elementProduction + autoClickProduction;
}

function getClickPower(current = state) {
  const activeLevel = getElementState(current, current.selectedSymbol)?.level || 1;
  const hydrogenLevel = getElementState(current, "H")?.level || 1;
  const base = 1 + Math.floor(hydrogenLevel / 6) + Math.floor(activeLevel / 12);
  return (base * current.multipliers.click) + (getParticlesPerSecondWithoutClickShare(current) * current.bonuses.clickFromPassive);
}

function getParticlesPerSecondWithoutClickShare(current = state) {
  if (!current.hasStarted) return 0;
  return elements.reduce((sum, element) => sum + getElementProduction(element, current), 0);
}

function getLevelCost(element, quantity = 1, current = state) {
  const elementState = getElementState(current, element.symbol);
  let total = 0;
  const reduction = Math.min(0.65, current.bonuses.costReduction);
  for (let i = 0; i < quantity; i += 1) total += element.baseCost * Math.pow(1.18, elementState.level + i) * (1 - reduction);
  return total;
}

function getBuyMaxQuantity(element) {
  let quantity = 0;
  let total = 0;
  while (quantity < 1000) {
    const next = getLevelCost(element, quantity + 1);
    if (next > state.particles) break;
    total = next;
    quantity += 1;
  }
  return { quantity, cost: total };
}

function getNextElement() { return elements.find(element => !isUnlocked(state, element.symbol)); }
function getUnlockCost(element) { return element.unlockCost * (1 - Math.min(0.55, state.research * 0.012)); }
function addParticles(amount) { state.particles += amount; state.lifetimeParticles += amount; }

function activateLabFromHydrogen(event) {
  state.hasStarted = true;
  state.selectedSymbol = "H";
  clickActiveElement(event, { silentStart: true });
  showToast("Hydrogen active. Click the highlighted tile to generate Particles.");
  saveGame();
}

function clickActiveElement(event, options = {}) {
  if (!state.hasStarted) return showToast("Begin with Hydrogen first.");
  const gain = getClickPower();
  addParticles(gain);
  spawnFloatText(`+${formatNumber(gain)}`, event?.clientX, event?.clientY);
  if (!options.skipRender) render();
}

function unlockElement(symbol, event) {
  const element = elements.find(item => item.symbol === symbol);
  if (!element) return;
  const elementState = getElementState(state, symbol);
  if (!state.hasStarted && symbol === "H") return activateLabFromHydrogen(event);
  if (!state.hasStarted) return showToast("Begin with Hydrogen first.");
  if (elementState.unlocked) {
    state.selectedSymbol = symbol;
    clickActiveElement(event);
    return;
  }
  const next = getNextElement();
  if (next?.symbol !== symbol) return showToast(`${element.name} is not the current discovery frontier yet.`);
  const cost = getUnlockCost(element);
  if (state.particles < cost) return showToast(`${element.name} requires ${formatNumber(cost)} Particles.`);
  state.particles -= cost;
  elementState.unlocked = true;
  elementState.level = 1;
  state.discoveredHighest = Math.max(state.discoveredHighest, element.atomicNumber);
  state.selectedSymbol = symbol;
  showToast(`Element discovered: ${element.name}. It is now your active click target.`);
  render();
  saveGame();
}

function buyLevels(symbol, quantity) {
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
  render();
}

function buyUpgrade(upgradeId) {
  const upgrade = upgrades.find(item => item.id === upgradeId);
  if (!upgrade || state.purchasedUpgrades.includes(upgradeId) || !state.hasStarted) return;
  if (!upgrade.requires(state)) return showToast("This upgrade is not ready yet.");
  if (state.particles < upgrade.cost) return showToast(`Need ${formatNumber(upgrade.cost)} Particles.`);
  state.particles -= upgrade.cost;
  state.purchasedUpgrades.push(upgradeId);
  rebuildDerivedEffects(state);
  showToast(`Upgrade purchased: ${upgrade.name}.`);
  render();
  saveGame();
}

function publishResearch() {
  if (!isUnlocked(state, "Ne")) return;
  const gain = calculateResearchGain();
  if (gain <= 0) return;
  const oldResearch = state.research;
  state = defaultState();
  state.research = oldResearch + gain;
  state.publishedCount += 1;
  rebuildDerivedEffects(state);
  showToast(`Published findings: +${formatNumber(gain)} Research. Click Hydrogen to begin the next experiment.`);
  render();
  saveGame();
}

function calculateResearchGain() {
  if (!isUnlocked(state, "Ne")) return 0;
  const lifetimeComponent = Math.sqrt(Math.max(0, state.lifetimeParticles) / 100000000);
  const discoveryComponent = state.discoveredHighest * 0.8;
  return Math.max(1, Math.floor((lifetimeComponent + discoveryComponent) * state.bonuses.researchGain));
}

function render() {
  document.body.classList.toggle("lab-not-started", !state.hasStarted);
  const pps = getParticlesPerSecond();
  const clickPower = getClickPower();
  dom.particlesDisplay.textContent = formatNumber(state.particles);
  dom.ppsDisplay.textContent = formatNumber(pps);
  dom.clickDisplay.textContent = formatNumber(clickPower);
  dom.researchDisplay.textContent = formatNumber(state.research);
  dom.clickHelpDisplay.textContent = formatNumber(clickPower);
  renderObjective();
  renderTable();
  renderDetails();
  renderUpgrades();
  renderPrestige();
}

function renderObjective() {
  if (!state.hasStarted) {
    dom.objectiveDisplay.textContent = "Click Hydrogen on the periodic table to begin generating Particles.";
    return;
  }
  const next = getNextElement();
  if (next) {
    const cost = getUnlockCost(next);
    const remaining = Math.max(0, cost - state.particles);
    dom.objectiveDisplay.textContent = remaining > 0 ? `Accumulate ${formatNumber(cost)} Particles to discover ${next.name}. ${formatNumber(remaining)} remaining.` : `${next.name} is ready to discover.`;
  } else {
    dom.objectiveDisplay.textContent = "First ten elements discovered. Publish Research or keep building levels.";
  }
}

function renderTable() {
  dom.periodicTable.innerHTML = "";
  const next = getNextElement();
  for (const element of elements) {
    const elementState = getElementState(state, element.symbol);
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = `element-tile category-${element.category}`;
    tile.style.gridColumn = element.col;
    tile.style.gridRow = element.row;
    if (!elementState.unlocked) tile.classList.add("locked");
    if (!state.hasStarted && element.symbol === "H") tile.classList.add("initial-element");
    if (state.hasStarted && element.symbol === state.selectedSymbol) tile.classList.add("active-click-target");
    if (state.hasStarted && next?.symbol === element.symbol) tile.classList.add("frontier");
    if (state.hasStarted && next?.symbol === element.symbol && state.particles >= getUnlockCost(element)) tile.classList.add("affordable");
    if (state.hasStarted && state.selectedSymbol === element.symbol) tile.classList.add("selected");
    tile.innerHTML = `
      <span class="element-number">${element.atomicNumber}</span>
      <span class="element-symbol">${element.symbol}</span>
      <span class="element-name">${elementState.unlocked ? element.name : state.hasStarted && next?.symbol === element.symbol ? formatNumber(getUnlockCost(element)) : "Locked"}</span>
      <span class="element-level">${elementState.unlocked && state.hasStarted ? `Lv. ${elementState.level}` : state.hasStarted && next?.symbol === element.symbol ? "Frontier" : ""}</span>
    `;
    tile.addEventListener("click", event => unlockElement(element.symbol, event));
    dom.periodicTable.appendChild(tile);
  }
}

function renderDetails() {
  const element = getActiveElement();
  const elementState = getElementState(state, element.symbol);
  dom.selectedName.textContent = element.name;
  if (!state.hasStarted) {
    dom.elementDetails.innerHTML = `<div class="compact-card" style="padding: 14px;"><strong>Table inactive.</strong><p style="margin:8px 0 0;color:var(--muted);font-weight:650;">Click Hydrogen directly on the periodic table to start producing Particles.</p></div>`;
    return;
  }
  const cost1 = getLevelCost(element, 1);
  const cost10 = getLevelCost(element, 10);
  const max = getBuyMaxQuantity(element);
  dom.elementDetails.innerHTML = `
    <div class="detail-row"><span>Active Click Target</span><strong>${element.symbol}</strong></div>
    <div class="detail-row"><span>Atomic #</span><strong>${element.atomicNumber}</strong></div>
    <div class="detail-row"><span>Role</span><strong>${element.role}</strong></div>
    <div class="detail-row"><span>Level</span><strong>${elementState.level}</strong></div>
    <div class="detail-row"><span>Production</span><strong>${formatNumber(getElementProduction(element))}/sec</strong></div>
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
  if (!state.hasStarted) {
    dom.upgradesList.innerHTML = `<div class="compact-card" style="padding: 14px;"><strong>Upgrades locked.</strong><p style="margin:8px 0 0;color:var(--muted);font-weight:650;">Click Hydrogen to bring the table online.</p></div>`;
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
    button.disabled = state.particles < upgrade.cost;
    button.innerHTML = `<div class="upgrade-meta"><span>Upgrade</span><span>${formatNumber(upgrade.cost)}</span></div><h3>${upgrade.name}</h3><p>${upgrade.description}</p>`;
    button.addEventListener("click", () => buyUpgrade(upgrade.id));
    dom.upgradesList.appendChild(button);
  }
}

function renderPrestige() {
  if (isUnlocked(state, "Ne")) {
    const gain = calculateResearchGain();
    dom.prestigeButton.disabled = false;
    dom.prestigeButton.textContent = `Publish for +${formatNumber(gain)} Research`;
    dom.prestigeCopy.textContent = "Publishing resets Particles, element levels, discoveries, and purchased lab upgrades. Research permanently improves production, discounts discovery costs, and speeds future runs.";
  } else {
    dom.prestigeButton.disabled = true;
    dom.prestigeButton.textContent = "Unlock Neon First";
    dom.prestigeCopy.textContent = "Discover Neon to publish your findings. Publishing resets the lab but grants permanent Research that accelerates future runs.";
  }
}

function gameLoop(now) {
  const delta = Math.min(1, (now - lastTick) / 1000);
  lastTick = now;
  if (state.hasStarted) {
    const gain = getParticlesPerSecond() * delta;
    if (gain > 0) addParticles(gain);
  }
  render();
  requestAnimationFrame(gameLoop);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "0";
  if (value < 1000) return value.toFixed(value < 10 ? 1 : 0).replace(/\.0$/, "");
  const units = ["", "K", "M", "B", "T", "Qa", "Qi"];
  let unit = 0;
  let display = value;
  while (display >= 1000 && unit < units.length - 1) { display /= 1000; unit += 1; }
  return `${display.toFixed(display < 10 ? 2 : display < 100 ? 1 : 0)}${units[unit]}`;
}

function spawnFloatText(text, x, y) {
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
    render();
    showToast("Save imported.");
  } catch (error) {
    showToast("That save could not be imported.");
  }
}

function resetSave() {
  if (!confirm("Reset Atomic Idle completely? This cannot be undone.")) return;
  localStorage.removeItem(SAVE_KEY);
  state = defaultState();
  rebuildDerivedEffects(state);
  render();
  showToast("Save reset.");
}

function wireEvents() {
  dom.saveButton.addEventListener("click", () => saveGame(true));
  dom.exportButton.addEventListener("click", exportSave);
  dom.importButton.addEventListener("click", importSave);
  dom.resetButton.addEventListener("click", resetSave);
  dom.prestigeButton.addEventListener("click", publishResearch);
  window.addEventListener("beforeunload", () => saveGame());
  setInterval(() => saveGame(), SAVE_INTERVAL_MS);
}

rebuildDerivedEffects(state);
wireEvents();
render();
requestAnimationFrame(gameLoop);
