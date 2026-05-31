// Early-game tuning pass.
// Pre-Neon upgrades should mainly help the current run through tap power and element production.

(function tuneEarlyGameUpgrades() {
  if (typeof BALANCE === "undefined" || typeof upgrades === "undefined") return;

  // Slightly shorten the first prestige ramp without removing the need to publish Research.
  BALANCE.unlocks.earlyCurve = 1.13;

  const replacements = {
    hydrogen_manifold: {
      description: "H Lv. 100 milestone. Hydrogen production x2.25.",
      effect: current => { current.elementMultipliers.H *= 2.25; }
    },
    magnetic_lens: {
      description: "He Lv. 10 milestone. Active element clicks are 40% stronger.",
      effect: current => { current.multipliers.click *= 1.4; }
    },
    helium_cooling: {
      description: "He Lv. 25 milestone. Helium production x2 and active element clicks +15%.",
      effect: current => { current.elementMultipliers.He *= 2; current.multipliers.click *= 1.15; }
    },
    helium_recapture: {
      description: "He Lv. 100 milestone. Helium production x2.25.",
      effect: current => { current.elementMultipliers.He *= 2.25; }
    },
    lab_assistant: {
      description: "Li Lv. 10 milestone. Lithium production x1.75.",
      effect: current => { current.elementMultipliers.Li *= 1.75; }
    },
    ion_exchange: {
      description: "Li Lv. 50 milestone. Active element clicks are 30% stronger.",
      effect: current => { current.multipliers.click *= 1.3; }
    },
    alkali_boost: {
      description: "Li Lv. 100 milestone. Lithium production x2.25 and active element clicks +10%.",
      effect: current => { current.elementMultipliers.Li *= 2.25; current.multipliers.click *= 1.1; }
    },
    beryllium_frame: {
      description: "Be Lv. 10 milestone. Beryllium production x1.6.",
      effect: current => { current.elementMultipliers.Be *= 1.6; }
    },
    structural_scaffold: {
      description: "Be Lv. 100 milestone. Beryllium production x2.25 and active element clicks +15%.",
      effect: current => { current.elementMultipliers.Be *= 2.25; current.multipliers.click *= 1.15; }
    },
    boron_efficiency: {
      description: "B Lv. 10 milestone. Boron production x2.",
      effect: current => { current.elementMultipliers.B *= 2; }
    },
    semiconductor_grid: {
      description: "B Lv. 25 milestone. Boron production x2.5.",
      effect: current => { current.elementMultipliers.B *= 2.5; }
    },
    boron_doping: {
      description: "B Lv. 50 milestone. Active element clicks are 35% stronger.",
      effect: current => { current.multipliers.click *= 1.35; }
    },
    carbon_lattice: {
      description: "C Lv. 10 milestone. Carbon production x1.8.",
      effect: current => { current.elementMultipliers.C *= 1.8; }
    },
    carbon_chains: {
      description: "C Lv. 25 milestone. Carbon production x2.5.",
      effect: current => { current.elementMultipliers.C *= 2.5; }
    },
    compound_modeling: {
      description: "C Lv. 50 milestone. Carbon production x1.5 and active element clicks +60%.",
      effect: current => { current.elementMultipliers.C *= 1.5; current.multipliers.click *= 1.6; }
    },
    nitrogen_modeling: {
      description: "N Lv. 10 milestone. Nitrogen production x1.9.",
      effect: current => { current.elementMultipliers.N *= 1.9; }
    },
    pressure_vessel: {
      description: "N Lv. 25 milestone. Nitrogen production x2.5.",
      effect: current => { current.elementMultipliers.N *= 2.5; }
    },
    oxygen_reaction_web: {
      description: "O Lv. 10 milestone. Oxygen production x2.1 and active element clicks +25%.",
      effect: current => { current.elementMultipliers.O *= 2.1; current.multipliers.click *= 1.25; }
    },
    oxidation_cycle: {
      description: "O Lv. 25 milestone. Oxygen production x2.5.",
      effect: current => { current.elementMultipliers.O *= 2.5; }
    },
    catalyst_cloud: {
      description: "O Lv. 50 milestone. Oxygen production x1.8 and active element clicks +35%.",
      effect: current => { current.elementMultipliers.O *= 1.8; current.multipliers.click *= 1.35; }
    },
    fluorine_catalyst: {
      description: "F Lv. 10 milestone. Fluorine production x1.65 and active element clicks +65%.",
      effect: current => { current.elementMultipliers.F *= 1.65; current.multipliers.click *= 1.65; }
    }
  };

  for (const upgrade of upgrades) {
    const replacement = replacements[upgrade.id];
    if (!replacement) continue;
    upgrade.description = replacement.description;
    upgrade.effect = replacement.effect;
  }

  if (typeof rebuildDerivedEffects === "function" && typeof state !== "undefined") rebuildDerivedEffects(state);
  if (typeof renderFull === "function") renderFull();
})();
