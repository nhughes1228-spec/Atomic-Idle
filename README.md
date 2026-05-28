# Atomic Idle

A browser-based idle game prototype built for GitHub Pages.

## Current prototype

Atomic Idle uses the periodic table as the progression board. The player begins with Hydrogen, generates **Particles** through the Reaction Chamber, levels elements for passive production, and slowly unlocks the first ten elements. Unlock pacing is intentionally slow: Helium should take several minutes on a fresh run, and later elements stretch farther until the player publishes Research.

## Implemented

- Particles as the main currency
- Modern chemistry-lab visual direction
- Reaction Chamber click target
- First ten elements from Hydrogen through Neon
- Slow linear element discovery frontier
- Element leveling and passive Particles/sec
- Lab upgrades
- Local save/load
- Export/import save
- Offline progress
- First prestige loop through Publishing Research after Neon

## Files

- `index.html` — page structure
- `style.css` — visual styling and responsive layout
- `main.js` — game state, balancing, rendering, saving, and prestige logic

## GitHub Pages

This project is designed to run as a static site. Enable GitHub Pages from the repository settings and deploy from the `main` branch root.
