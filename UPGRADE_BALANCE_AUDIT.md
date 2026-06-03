# Atomic Idle Upgrade Balance Audit

This file groups upgrades by milestone level instead of by element so we can see which bonuses are doing the most work in the economy.

## Current Research Impact

For now, Research has only two direct effects:

| Research | Particles/sec multiplier | Click power multiplier | Removed effects |
|---:|---:|---:|---|
| 1 | x1.08 | x1.06 | No discovery discount, level discount, offline cap, or future Research gain |
| 5 | x1.40 | x1.30 | Same removals |
| 10 | x1.80 | x1.60 | Same removals |
| 25 | x3.00 | x2.50 | Same removals |
| 50 | x5.00 | x4.00 | Same removals |
| 100 | x9.00 | x7.00 | Same removals |

Formula:

```js
particlesPerSecondMultiplier = 1 + research * 0.08
clickPowerMultiplier = 1 + research * 0.06
```

This is intentionally simple for the next balance pass. If prestige still accelerates too fast, the next move should be diminishing returns rather than lowering both numbers equally.

## Level 10 Milestone Upgrades

These are the earliest shaping upgrades for each element. They should usually be strong enough to make unlocking a new element feel good immediately.

| Element | Upgrade | Main effect | Estimated direct impact |
|---|---|---|---:|
| H | Focused Chamber | Click power x2 | Very high early manual impact |
| He | Magnetic Lens | Click power x1.4 | High early manual impact |
| Li | Lab Assistant | Lithium production x1.75 | Medium/high element impact |
| Be | Beryllium Frame | Beryllium production x1.6 | Medium element impact |
| B | Boron Efficiency Matrix | Boron production x2 | High element impact |
| C | Carbon Lattice | Carbon production x1.8 | Medium/high element impact |
| N | Nitrogen Modeling | Nitrogen production x1.9 | Medium/high element impact |
| O | Oxygen Reaction Web | Oxygen production x2.1 and click x1.25 | Very high hybrid impact |
| F | Fluorine Catalyst | Fluorine production x1.65 and click x1.65 | Very high hybrid impact |
| Ne | Neon Tube Array | Neon production x2 and global production x1.35 | Very high first-prestige gateway impact |
| Generated later elements | Element Lv. 10 | That element production x1.6 | Medium element impact |

Biggest level 10 impacts: **Focused Chamber**, **Oxygen Reaction Web**, **Fluorine Catalyst**, and **Neon Tube Array**.

## Level 25 Milestone Upgrades

These should usually become the first meaningful production commitment after unlocking an element.

| Element | Upgrade | Main effect | Estimated direct impact |
|---|---|---|---:|
| H | Hydrogen Containment | Hydrogen production x2 | High element impact |
| He | Helium Cooling Loop | Helium production x2 and click x1.15 | High hybrid impact |
| Li | Lithium Channels | Lithium production x2 and click x1.2 | High hybrid impact |
| Be | Beryllium Lattice | Beryllium production x2 and global x1.12 | Very high hybrid/global impact |
| B | Semiconductor Grid | Boron production x2.5 | Very high element impact |
| C | Carbon Chains | Carbon production x2.5 | Very high element impact |
| N | Pressure Vessel | Nitrogen production x2.5 | Very high element impact |
| O | Oxidation Cycle | Oxygen production x2.5 | Very high element impact |
| F | Halogen Surge | Fluorine production x2 and click x1.5 | Very high hybrid impact |
| Ne | Publication Pipeline | Future Research gain x1.35 | Candidate for replacement if we keep Research simplified |
| Generated later elements | Element Lv. 25 | That element production x2 | High element impact |

Biggest level 25 impacts: **Boron/C/ N/O x2.5 upgrades**, **Halogen Surge**, and **Beryllium Lattice**.

Current problem child: **Publication Pipeline** still affects future Research gain and should probably be replaced in the next tuning pass if Research remains simplified.

## Level 50 Milestone Upgrades

These are usually the mid-run accelerators. In the pre-Neon stretch, they should be immediate and obvious.

| Element | Upgrade | Main effect | Estimated direct impact |
|---|---|---|---:|
| H | Pipette Array | Click power x1.35 | Medium/high manual impact |
| He | Noble Gas Buffer | Helium production x2 | High element impact |
| Li | Ion Exchange Rack | Click power x1.3 | Medium manual impact |
| Be | Precision Balancer | Click power x1.4 | High manual impact |
| B | Boron Doping | Click power x1.35 | Medium/high manual impact |
| C | Compound Modeling | Carbon production x1.5 and click x1.6 | Very high hybrid impact |
| N | Reaction Forecasting | Click gain from passive +8% | Potentially explosive once passive grows |
| O | Catalyst Cloud | Oxygen production x1.8 and click x1.35 | Very high hybrid impact |
| Generated later elements | Element Lv. 50 | That element production x2.6 | Very high element impact |

Biggest level 50 impacts: **Compound Modeling**, **Catalyst Cloud**, generated x2.6 element upgrades, and potentially **Reaction Forecasting** if passive income is large.

Candidate watch item: **Reaction Forecasting** is still a click-from-passive upgrade. It is immediate, but it can become unexpectedly strong.

## Level 100 Milestone Upgrades

These are major commitment rewards. Pre-Neon, they should probably be powerful but not required on every element.

| Element | Upgrade | Main effect | Estimated direct impact |
|---|---|---|---:|
| H | Hydrogen Manifold | Hydrogen production x2.25 | High element impact |
| He | Helium Recapture | Helium production x2.25 | High element impact |
| Li | Alkali Boost | Lithium production x2.25 and click x1.1 | High hybrid impact |
| Be | Structural Scaffold | Beryllium production x2.25 and click x1.15 | High hybrid impact |
| Generated later elements | Element Lv. 100 | That element production x3.5 | Extremely high element impact |

Biggest level 100 impacts: generated x3.5 upgrades and any hand-authored x2.25+click hybrid.

## Highest-Impact Upgrade Types

1. **Global production multipliers**: strongest because they multiply every unlocked element.
2. **Click multipliers**: strongest before passive dominates, especially if click power is intentionally important pre-prestige.
3. **Click-from-passive effects**: can become explosive because passive production starts feeding click power.
4. **Element-specific multipliers on newest/highest-output elements**: strong, but more contained than global.
5. **Element-specific multipliers on old elements**: good for flavor, usually lower total impact unless old elements are heavily leveled.

## Immediate Balance Notes

- Pre-Neon upgrades now mostly help the current run, which is good.
- Future Research gain should not appear before or at Neon if Research is currently simplified.
- If post-prestige still jumps too fast, change Research scaling from linear to square-root/log scaling.
- If pre-prestige still feels slow, adjust element unlock costs and level-cost growth before increasing Research power.
