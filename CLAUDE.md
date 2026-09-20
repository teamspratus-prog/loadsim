# Testing Loading Simulator

A single self-contained HTML file that visualizes how full a truck, sea container
or flatbed is with a given pallet and box configuration, and highlights the empty
space left over. It is a visualizer, not an optimizer: it must not recommend a
"best" transport unit, a best fit, or an optimal solution.

## Structure

Everything lives in `Testing_Loading_Simulator.html`:

1. `<style>` — all CSS, with light/dark themes driven by CSS custom properties on
   `:root` and `:root[data-theme="dark"]`.
2. Markup — top bar, transport unit rail, then a three-column workbench
   (Cargo panel, 3D viewer, results rail) and an analysis section.
3. `<script>` — one IIFE with three parts, in this order:
   - **Engine** (original code): presets, layout math (`calcLayout`), the canvas
     renderer (`draw`, `drawMulti`, `drawBox`, `drawPallet`, projection `pt`),
     the multi-part optimizer (`buildMultiPlan`), state save/load, warnings.
   - **Extensions** (added later): equipment rail, empty-space overlay, results
     rail, scenarios, print, keyboard shortcuts. These wrap engine functions by
     reassigning the binding, e.g.
     `var drawEngine = draw; draw = function(n){ var r = drawEngine(n); ... };`
   - **Init**: event wiring and first render.

## Rules to keep

- No build step, no bundler, no framework. Plain ES5-style JS and CSS.
- No external files or requests except the Google Fonts stylesheet. The file must
  still work offline, so keep real font fallbacks.
- Do not rewrite the engine. Prefer wrapping its functions, as the extensions do.
- Element IDs are the contract between the engine and the DOM. The engine writes
  to them by `getElementById`. Renaming or removing one silently breaks a feature.
- Dimensions are in inches internally, volumes in cubic feet, weight in kg
  (`MAX_PAYLOAD_KG = 20200`). Part weight can be entered in kg or lb.
- Settings persist in `localStorage`, wrapped in try/catch (`storageGet`,
  `storageSet`). Keys: `tlsScenariosV1`, `tlsShowEmptyV1`, plus the engine's own.
- Keep it accessible: visible focus, real buttons, `aria-pressed` and
  `aria-expanded` kept in sync, and honour `prefers-reduced-motion`.
- Keep the print stylesheet working; the print sheet is a real deliverable.

## Features

3D view with 5 angles, zoom and pan, schematic or realistic look, fullscreen.
Pallet slider with a Play animation. Volume and weight fill meters. Empty-space
overlay with labels in the view, plus empty volume, free floor length, headroom
and unused payload. Single-part and multiple-parts modes. Saved scenarios with a
share code. Print load sheet. Copy results for Excel. Keyboard shortcuts.

## Testing

There is no test suite. After a change, open the file in a browser and check:
light and dark mode, single and multiple parts, a phone-width window, the print
preview, and the browser console for errors.
