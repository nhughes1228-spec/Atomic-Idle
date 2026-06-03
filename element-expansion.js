// Element expansion pack.
// Adds the rest of the periodic table after the core early-game elements are defined.

(function expandPeriodicTableTo118() {
  if (typeof elements === "undefined" || typeof upgrades === "undefined") return;

  const existingSymbols = new Set(elements.map(element => element.symbol));
  const expansionElements = [
    { atomicNumber: 37, symbol: "Rb", name: "Rubidium", category: "alkali-metal", row: 5, col: 1 },
    { atomicNumber: 38, symbol: "Sr", name: "Strontium", category: "alkaline-earth", row: 5, col: 2 },
    { atomicNumber: 39, symbol: "Y", name: "Yttrium", category: "transition-metal", row: 5, col: 3 },
    { atomicNumber: 40, symbol: "Zr", name: "Zirconium", category: "transition-metal", row: 5, col: 4 },
    { atomicNumber: 41, symbol: "Nb", name: "Niobium", category: "transition-metal", row: 5, col: 5 },
    { atomicNumber: 42, symbol: "Mo", name: "Molybdenum", category: "transition-metal", row: 5, col: 6 },
    { atomicNumber: 43, symbol: "Tc", name: "Technetium", category: "transition-metal", row: 5, col: 7 },
    { atomicNumber: 44, symbol: "Ru", name: "Ruthenium", category: "transition-metal", row: 5, col: 8 },
    { atomicNumber: 45, symbol: "Rh", name: "Rhodium", category: "transition-metal", row: 5, col: 9 },
    { atomicNumber: 46, symbol: "Pd", name: "Palladium", category: "transition-metal", row: 5, col: 10 },
    { atomicNumber: 47, symbol: "Ag", name: "Silver", category: "transition-metal", row: 5, col: 11 },
    { atomicNumber: 48, symbol: "Cd", name: "Cadmium", category: "transition-metal", row: 5, col: 12 },
    { atomicNumber: 49, symbol: "In", name: "Indium", category: "post-transition-metal", row: 5, col: 13 },
    { atomicNumber: 50, symbol: "Sn", name: "Tin", category: "post-transition-metal", row: 5, col: 14 },
    { atomicNumber: 51, symbol: "Sb", name: "Antimony", category: "metalloid", row: 5, col: 15 },
    { atomicNumber: 52, symbol: "Te", name: "Tellurium", category: "metalloid", row: 5, col: 16 },
    { atomicNumber: 53, symbol: "I", name: "Iodine", category: "halogen", row: 5, col: 17 },
    { atomicNumber: 54, symbol: "Xe", name: "Xenon", category: "noble-gas", row: 5, col: 18 },
    { atomicNumber: 55, symbol: "Cs", name: "Cesium", category: "alkali-metal", row: 6, col: 1 },
    { atomicNumber: 56, symbol: "Ba", name: "Barium", category: "alkaline-earth", row: 6, col: 2 },
    { atomicNumber: 57, symbol: "La", name: "Lanthanum", category: "lanthanide", row: 8, col: 3 },
    { atomicNumber: 58, symbol: "Ce", name: "Cerium", category: "lanthanide", row: 8, col: 4 },
    { atomicNumber: 59, symbol: "Pr", name: "Praseodymium", category: "lanthanide", row: 8, col: 5 },
    { atomicNumber: 60, symbol: "Nd", name: "Neodymium", category: "lanthanide", row: 8, col: 6 },
    { atomicNumber: 61, symbol: "Pm", name: "Promethium", category: "lanthanide", row: 8, col: 7 },
    { atomicNumber: 62, symbol: "Sm", name: "Samarium", category: "lanthanide", row: 8, col: 8 },
    { atomicNumber: 63, symbol: "Eu", name: "Europium", category: "lanthanide", row: 8, col: 9 },
    { atomicNumber: 64, symbol: "Gd", name: "Gadolinium", category: "lanthanide", row: 8, col: 10 },
    { atomicNumber: 65, symbol: "Tb", name: "Terbium", category: "lanthanide", row: 8, col: 11 },
    { atomicNumber: 66, symbol: "Dy", name: "Dysprosium", category: "lanthanide", row: 8, col: 12 },
    { atomicNumber: 67, symbol: "Ho", name: "Holmium", category: "lanthanide", row: 8, col: 13 },
    { atomicNumber: 68, symbol: "Er", name: "Erbium", category: "lanthanide", row: 8, col: 14 },
    { atomicNumber: 69, symbol: "Tm", name: "Thulium", category: "lanthanide", row: 8, col: 15 },
    { atomicNumber: 70, symbol: "Yb", name: "Ytterbium", category: "lanthanide", row: 8, col: 16 },
    { atomicNumber: 71, symbol: "Lu", name: "Lutetium", category: "lanthanide", row: 8, col: 17 },
    { atomicNumber: 72, symbol: "Hf", name: "Hafnium", category: "transition-metal", row: 6, col: 4 },
    { atomicNumber: 73, symbol: "Ta", name: "Tantalum", category: "transition-metal", row: 6, col: 5 },
    { atomicNumber: 74, symbol: "W", name: "Tungsten", category: "transition-metal", row: 6, col: 6 },
    { atomicNumber: 75, symbol: "Re", name: "Rhenium", category: "transition-metal", row: 6, col: 7 },
    { atomicNumber: 76, symbol: "Os", name: "Osmium", category: "transition-metal", row: 6, col: 8 },
    { atomicNumber: 77, symbol: "Ir", name: "Iridium", category: "transition-metal", row: 6, col: 9 },
    { atomicNumber: 78, symbol: "Pt", name: "Platinum", category: "transition-metal", row: 6, col: 10 },
    { atomicNumber: 79, symbol: "Au", name: "Gold", category: "transition-metal", row: 6, col: 11 },
    { atomicNumber: 80, symbol: "Hg", name: "Mercury", category: "transition-metal", row: 6, col: 12 },
    { atomicNumber: 81, symbol: "Tl", name: "Thallium", category: "post-transition-metal", row: 6, col: 13 },
    { atomicNumber: 82, symbol: "Pb", name: "Lead", category: "post-transition-metal", row: 6, col: 14 },
    { atomicNumber: 83, symbol: "Bi", name: "Bismuth", category: "post-transition-metal", row: 6, col: 15 },
    { atomicNumber: 84, symbol: "Po", name: "Polonium", category: "post-transition-metal", row: 6, col: 16 },
    { atomicNumber: 85, symbol: "At", name: "Astatine", category: "halogen", row: 6, col: 17 },
    { atomicNumber: 86, symbol: "Rn", name: "Radon", category: "noble-gas", row: 6, col: 18 },
    { atomicNumber: 87, symbol: "Fr", name: "Francium", category: "alkali-metal", row: 7, col: 1 },
    { atomicNumber: 88, symbol: "Ra", name: "Radium", category: "alkaline-earth", row: 7, col: 2 },
    { atomicNumber: 89, symbol: "Ac", name: "Actinium", category: "actinide", row: 9, col: 3 },
    { atomicNumber: 90, symbol: "Th", name: "Thorium", category: "actinide", row: 9, col: 4 },
    { atomicNumber: 91, symbol: "Pa", name: "Protactinium", category: "actinide", row: 9, col: 5 },
    { atomicNumber: 92, symbol: "U", name: "Uranium", category: "actinide", row: 9, col: 6 },
    { atomicNumber: 93, symbol: "Np", name: "Neptunium", category: "actinide", row: 9, col: 7 },
    { atomicNumber: 94, symbol: "Pu", name: "Plutonium", category: "actinide", row: 9, col: 8 },
    { atomicNumber: 95, symbol: "Am", name: "Americium", category: "actinide", row: 9, col: 9 },
    { atomicNumber: 96, symbol: "Cm", name: "Curium", category: "actinide", row: 9, col: 10 },
    { atomicNumber: 97, symbol: "Bk", name: "Berkelium", category: "actinide", row: 9, col: 11 },
    { atomicNumber: 98, symbol: "Cf", name: "Californium", category: "actinide", row: 9, col: 12 },
    { atomicNumber: 99, symbol: "Es", name: "Einsteinium", category: "actinide", row: 9, col: 13 },
    { atomicNumber: 100, symbol: "Fm", name: "Fermium", category: "actinide", row: 9, col: 14 },
    { atomicNumber: 101, symbol: "Md", name: "Mendelevium", category: "actinide", row: 9, col: 15 },
    { atomicNumber: 102, symbol: "No", name: "Nobelium", category: "actinide", row: 9, col: 16 },
    { atomicNumber: 103, symbol: "Lr", name: "Lawrencium", category: "actinide", row: 9, col: 17 },
    { atomicNumber: 104, symbol: "Rf", name: "Rutherfordium", category: "transition-metal", row: 7, col: 4 },
    { atomicNumber: 105, symbol: "Db", name: "Dubnium", category: "transition-metal", row: 7, col: 5 },
    { atomicNumber: 106, symbol: "Sg", name: "Seaborgium", category: "transition-metal", row: 7, col: 6 },
    { atomicNumber: 107, symbol: "Bh", name: "Bohrium", category: "transition-metal", row: 7, col: 7 },
    { atomicNumber: 108, symbol: "Hs", name: "Hassium", category: "transition-metal", row: 7, col: 8 },
    { atomicNumber: 109, symbol: "Mt", name: "Meitnerium", category: "transition-metal", row: 7, col: 9 },
    { atomicNumber: 110, symbol: "Ds", name: "Darmstadtium", category: "transition-metal", row: 7, col: 10 },
    { atomicNumber: 111, symbol: "Rg", name: "Roentgenium", category: "transition-metal", row: 7, col: 11 },
    { atomicNumber: 112, symbol: "Cn", name: "Copernicium", category: "transition-metal", row: 7, col: 12 },
    { atomicNumber: 113, symbol: "Nh", name: "Nihonium", category: "post-transition-metal", row: 7, col: 13 },
    { atomicNumber: 114, symbol: "Fl", name: "Flerovium", category: "post-transition-metal", row: 7, col: 14 },
    { atomicNumber: 115, symbol: "Mc", name: "Moscovium", category: "post-transition-metal", row: 7, col: 15 },
    { atomicNumber: 116, symbol: "Lv", name: "Livermorium", category: "post-transition-metal", row: 7, col: 16 },
    { atomicNumber: 117, symbol: "Ts", name: "Tennessine", category: "halogen", row: 7, col: 17 },
    { atomicNumber: 118, symbol: "Og", name: "Oganesson", category: "noble-gas", row: 7, col: 18 }
  ];

  let lastUnlockCost = elements.at(-1)?.unlockCost || 2.5e30;
  let lastBaseProduction = elements.at(-1)?.baseProduction || 4.4e20;

  for (const element of expansionElements) {
    if (existingSymbols.has(element.symbol)) continue;
    const difficultyRamp = 6.18 + Math.min(1.1, (element.atomicNumber - 37) * 0.008);
    const productionRamp = 4.05 + Math.min(0.85, (element.atomicNumber - 37) * 0.006);
    lastUnlockCost *= difficultyRamp;
    lastBaseProduction *= productionRamp;

    const expandedElement = {
      ...element,
      unlockCost: lastUnlockCost,
      baseCost: lastUnlockCost / 3.75,
      baseProduction: lastBaseProduction,
      role: `${element.name} extends the late-game table and adds another long-term production frontier.`
    };

    elements.push(expandedElement);

    if (typeof createGeneratedMilestoneUpgrade === "function" && typeof BALANCE !== "undefined") {
      for (const level of BALANCE.milestones.levels) upgrades.push(createGeneratedMilestoneUpgrade(expandedElement, level));
    }
  }

  if (typeof state !== "undefined" && typeof getElementState === "function") {
    for (const element of elements) getElementState(state, element.symbol);
  }

  if (typeof renderFull === "function") renderFull();
})();
