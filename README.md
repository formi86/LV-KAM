# LV-KAM Weight Balance

A modern Vue 3 + TypeScript + Vite application for calculating and visualizing aircraft weight and balance, including CG envelope and payload/fuel breakdowns. Uses Vuetify for UI and Chart.js for envelope visualization.

## Features
- Interactive weight & balance calculator for the Piper Cherokee 140 (150hp)
- Supports multiple units (kg/lbs, liters/gal/kg)
- Visual CG envelope and aircraft diagram
- Responsive, dark-themed UI with Vuetify
- TypeScript for type safety

## Project Setup

### 1. Install dependencies

```bash
cd LV-KAM-Weight-Balance
npm install
```

### 2. Run the development server

```bash
npm run dev
```

The app will be available at the URL shown in your terminal (usually http://localhost:5173).

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Directory Structure
- `src/` — Main source code (Vue components, config, utilities)
- `src/config/aircraftConfig.js` — Aircraft-specific configuration
- `src/utils/wbCalculator.ts` — Weight & balance calculation logic
- `src/components/` — Vue components (CG envelope chart, etc.)

## Requirements
- Node.js 18+
- npm 9+

## Recommended IDE Setup
- [VSCode](https://code.visualstudio.com/) + [Volar extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## License
MIT
