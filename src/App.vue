<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { calculateWB } from './utils/wbCalculator';
import type { WBInput, WeightUnit, FuelUnit } from './utils/wbCalculator';
// @ts-ignore
import config from './config/aircraftConfig';
import CgEnvelopeChart from './components/CgEnvelopeChart.vue';

const weightUnit = ref<WeightUnit>('kg');
const fuelUnit = ref<FuelUnit>('liters');
const maxTank = config.maxFuelGallons / 2;
const maxFuelLiters = maxTank / config.fuelGallonsPerLiter;
const maxFuelKg = maxTank * config.fuelWeightPerGallon / 2.20462;

const emptyCGPercentMAC = ref(((config.emptyCG - config.macLeadingEdge) / config.macLength) * 100);
const emptyCG = computed(() => config.macLeadingEdge + (emptyCGPercentMAC.value / 100) * config.macLength);

const input = ref<WBInput>({
  pilot: 0,
  copilot: 0,
  rearLeft: 0,
  rearRight: 0,
  baggage: 0,
  leftFuel: 0,
  rightFuel: 0,
  weightUnit: weightUnit.value,
  fuelUnit: fuelUnit.value,
  emptyCG: emptyCG.value,
});

watch([weightUnit, fuelUnit, emptyCG], () => {
  input.value.weightUnit = weightUnit.value;
  input.value.fuelUnit = fuelUnit.value;
  input.value.emptyCG = emptyCG.value;
});

const result = computed(() => calculateWB(input.value));

// --- Lateral CG calculation ---
const lateralCG = computed(() => {
  // Left: pilot, rearLeft, leftFuel; Right: copilot, rearRight, rightFuel
  // Use arms as lateral positions: pilot/coplilot = -1/+1, rearLeft/rearRight = -1/+1, left/right fuel = -1/+1
  // We'll use a simple model: left = -1, right = +1, center = 0
  // Baggage is assumed centered
  const toLbs = (w: number, unit: WeightUnit) => unit === 'kg' ? w * 2.20462 : w;
  const fuelToLbs = (f: number, unit: FuelUnit) => {
    if (unit === 'gal') return f * config.fuelWeightPerGallon;
    if (unit === 'liters') return f * config.fuelWeightPerLiter * 2.20462;
    return f;
  };
  const left =
    toLbs(input.value.pilot, input.value.weightUnit) +
    toLbs(input.value.rearLeft, input.value.weightUnit) +
    fuelToLbs(input.value.leftFuel, input.value.fuelUnit);
  const right =
    toLbs(input.value.copilot, input.value.weightUnit) +
    toLbs(input.value.rearRight, input.value.weightUnit) +
    fuelToLbs(input.value.rightFuel, input.value.fuelUnit);
  const total = left + right + toLbs(input.value.baggage, input.value.weightUnit);
  if (total === 0) return 0;
  // Lateral CG offset: negative = left, positive = right
  return (right - left) / total;
});

function reset() {
  input.value = {
    pilot: 0,
    copilot: 0,
    rearLeft: 0,
    rearRight: 0,
    baggage: 0,
    leftFuel: 0,
    rightFuel: 0,
    weightUnit: weightUnit.value,
    fuelUnit: fuelUnit.value,
    emptyCG: emptyCG.value,
  };
}

function fuelMax() {
  if (fuelUnit.value === 'gal') return maxTank;
  if (fuelUnit.value === 'liters') return maxFuelLiters;
  if (fuelUnit.value === 'kg') return maxFuelKg;
  return maxTank;
}
function fuelLabel(val: number) {
  if (fuelUnit.value === 'gal') return val.toFixed(2) + ' gal';
  if (fuelUnit.value === 'liters') return val.toFixed(2) + ' L';
  if (fuelUnit.value === 'kg') return val.toFixed(2) + ' kg';
  return val.toFixed(2);
}
function weightLabel(val: number) {
  return weightUnit.value === 'kg' ? (val / 2.20462).toFixed(1) + ' kg' : val.toFixed(1) + ' lbs';
}
function fuelSummaryLabel(left: number, right: number) {
  let totalLbs = 0;
  if (fuelUnit.value === 'gal') {
    totalLbs = (left + right) * config.fuelWeightPerGallon;
    return (left + right).toFixed(2) + ' gal / ' + (totalLbs / 2.20462).toFixed(1) + ' kg / ' + totalLbs.toFixed(1) + ' lbs';
  }
  if (fuelUnit.value === 'liters') {
    totalLbs = (left + right) * config.fuelWeightPerLiter * 2.20462;
    return (left + right).toFixed(2) + ' L / ' + (totalLbs / 2.20462).toFixed(1) + ' kg / ' + totalLbs.toFixed(1) + ' lbs';
  }
  if (fuelUnit.value === 'kg') {
    totalLbs = (left + right) * 2.20462;
    return (left + right).toFixed(2) + ' kg / ' + (left + right).toFixed(1) + ' kg / ' + totalLbs.toFixed(1) + ' lbs';
  }
  return (left + right).toFixed(2);
}
function payloadSummaryLabel(pilot: number, copilot: number, rearLeft: number, rearRight: number, baggage: number) {
  let totalLbs = 0;
  if (weightUnit.value === 'kg') {
    totalLbs = (pilot + copilot + rearLeft + rearRight + baggage) * 2.20462;
    return (pilot + copilot + rearLeft + rearRight + baggage).toFixed(2) + ' kg / ' + totalLbs.toFixed(1) + ' lbs';
  }
  return (pilot + copilot + rearLeft + rearRight + baggage).toFixed(2) + ' lbs / ' + ((pilot + copilot + rearLeft + rearRight + baggage) / 2.20462).toFixed(1) + ' kg';
}

// Prepare envelope polygon points from config.cgLimits
const envelope = [
  { x: 84.4, y: 1650 },
  { x: 85.9, y: 1975 },
  { x: 84.0, y: 2150 },
  { x: 95.9, y: 2150 },
  { x: 95.9, y: 1650 },
  { x: 84.4, y: 1650 }, // close polygon
];
</script>

<template>
  <v-app theme="dark">
    <v-container class="fill-height d-flex flex-column justify-center align-center" fluid>
      <v-card class="pa-6" max-width="1000" elevation="10" style="background: #23272b; color: #fff;">
        <v-row>
          <v-col cols="12" md="7">
            <v-card-title class="text-h5 mb-4">LEGACY WEIGHT &amp; BALANCE</v-card-title>
            <v-card class="mb-4 pa-4" style="background: #181a1b;">
              <div class="d-flex align-center mb-2">
                <span class="me-4">DISPLAY FUEL AS</span>
                <v-btn-toggle v-model="fuelUnit" mandatory color="primary" class="ml-2">
                  <v-btn value="gal">GAL</v-btn>
                  <v-btn value="liters">LITERS</v-btn>
                  <v-btn value="kg">KG</v-btn>
                </v-btn-toggle>
                <span class="me-4 ml-8">DISPLAY WEIGHT AS</span>
                <v-btn-toggle v-model="weightUnit" mandatory color="primary" class="ml-2">
                  <v-btn value="lbs">LBS</v-btn>
                  <v-btn value="kg">KG</v-btn>
                </v-btn-toggle>
              </div>
              <v-divider class="mb-2" />
              <div class="text-subtitle-2 mb-2">FUEL</div>
              <v-row>
                <v-col cols="6">
                  <div class="mb-1">LEFT WING TANK</div>
                  <v-slider v-model="input.leftFuel" :max="fuelMax()" :min="0" step="0.01" color="primary" thumb-label>
                  </v-slider>
                  <div class="d-flex justify-space-between">
                    <span>{{ ((input.leftFuel / fuelMax()) * 100).toFixed(2) }} %</span>
                    <span>{{ fuelLabel(input.leftFuel) }}</span>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="mb-1">RIGHT WING TANK</div>
                  <v-slider v-model="input.rightFuel" :max="fuelMax()" :min="0" step="0.01" color="primary" thumb-label>
                  </v-slider>
                  <div class="d-flex justify-space-between">
                    <span>{{ ((input.rightFuel / fuelMax()) * 100).toFixed(2) }} %</span>
                    <span>{{ fuelLabel(input.rightFuel) }}</span>
                  </div>
                </v-col>
              </v-row>
              <v-divider class="my-2" />
              <div class="text-subtitle-2 mb-2">PAYLOAD</div>
              <v-row>
                <v-col cols="6">
                  <v-text-field v-model.number="input.pilot" :label="'PILOT'" :suffix="weightUnit.toUpperCase()" type="number" min="0" color="primary" hide-details />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model.number="input.copilot" :label="'CO-PILOT'" :suffix="weightUnit.toUpperCase()" type="number" min="0" color="primary" hide-details />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model.number="input.rearLeft" :label="'REAR LEFT'" :suffix="weightUnit.toUpperCase()" type="number" min="0" color="primary" hide-details />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model.number="input.rearRight" :label="'REAR RIGHT'" :suffix="weightUnit.toUpperCase()" type="number" min="0" color="primary" hide-details />
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model.number="input.baggage" :label="'BAGGAGE'" :suffix="weightUnit.toUpperCase()" type="number" min="0" color="primary" hide-details />
                </v-col>
              </v-row>
            </v-card>
            <v-row class="mb-2">
              <v-col cols="12">
                <v-btn color="red" block @click="reset">RESET</v-btn>
              </v-col>
            </v-row>
            <v-card class="pa-3" style="background: #181a1b;">
              <v-row>
                <v-col cols="6">
                  <div>Empty Weight</div>
                  <div class="font-weight-bold">{{ weightLabel(config.emptyWeight) }}</div>
                </v-col>
                <v-col cols="6">
                  <div>Max Takeoff Weight</div>
                  <div class="font-weight-bold">{{ weightLabel(config.maxTakeoffWeight) }}</div>
                </v-col>
                <v-col cols="12">
                  <div>Fuel (Total)</div>
                  <div class="font-weight-bold">{{ fuelSummaryLabel(input.leftFuel, input.rightFuel) }}</div>
                </v-col>
                <v-col cols="12">
                  <div>Payload (Total)</div>
                  <div class="font-weight-bold">{{ payloadSummaryLabel(input.pilot, input.copilot, input.rearLeft, input.rearRight, input.baggage) }}</div>
                </v-col>
                <v-col cols="12">
                  <div>Total Weight</div>
                  <div class="font-weight-bold" :class="{ 'text-red': result.totalWeight > config.maxTakeoffWeight }">
                    {{ weightLabel(result.totalWeight) }}
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          <v-col cols="12" md="5">
            <v-card class="pa-4" style="background: #181a1b; min-height: 100%;">
              <!-- Empty CG slider -->
              <div class="mb-2">
                <div style="color: #bfeaff; font-size: 1em; font-family: monospace; margin-bottom: 0.2em;">
                  Empty CG Position (% MAC):
                  <span style="color: #fff; margin-left: 0.5em;">{{ emptyCGPercentMAC.toFixed(2) }}</span>
                </div>
                <v-slider v-model="emptyCGPercentMAC" :min="10" :max="40" step="0.01" color="primary" thumb-label hide-details />
              </div>
              <!-- Info block above SVG -->
              <div style="color: #bfeaff; font-size: 1.1em; font-family: monospace; margin-bottom: 0.5em;">
                <div style="font-weight: bold; letter-spacing: 1px; color: #bfeaff;">
                  EMPTY CG POSITION %MAC
                  <span style="color: #fff; float: right;">{{ emptyCGPercentMAC.toFixed(2) }}</span>
                </div>
                <div style="color: #fff; font-size: 0.95em; margin-top: 0.2em;">
                  Center of gravity <span :style="{ color: result.cgPercentMAC >= 20.0 && result.cgPercentMAC <= 35.0 ? '#4caf50' : '#ff5252', float: 'right' }">{{ result.cgPercentMAC.toFixed(2) }}% MAC</span><br>
                  CG forward limit <span style="float: right;">20.00% MAC</span><br>
                  CG aft limit <span style="float: right;">35.00% MAC</span>
                </div>
                <!-- Gross Weight / MTOW / Difference -->
                <div style="color: #fff; font-size: 0.95em; margin-top: 0.5em;">
                  Gross Weight <span style="float: right;">{{ weightLabel(result.totalWeight) }}</span><br>
                  MTOW <span style="float: right;">{{ weightLabel(config.maxTakeoffWeight) }}</span><br>
                  <span>Difference
                    <span :style="{ color: result.totalWeight > config.maxTakeoffWeight ? '#ff5252' : '#4caf50', float: 'right' }">
                      {{
                        weightUnit === 'kg'
                          ? ((result.totalWeight - config.maxTakeoffWeight) / 2.20462 > 0
                              ? '+' : '') + ((result.totalWeight - config.maxTakeoffWeight) / 2.20462).toFixed(1)
                          : (result.totalWeight - config.maxTakeoffWeight > 0
                              ? '+' : '') + (result.totalWeight - config.maxTakeoffWeight).toFixed(1)
                      }} {{ weightUnit.toUpperCase() }}
                    </span>
                  </span>
                </div>

              </div>
              <div class="d-flex justify-center align-center" style="height: 340px;">
                <!-- ZOOMED CG WING DIAGRAM: Wing occupies 100% MAC vertically -->
                <svg width="360" height="320" style="background: #23272b; border-radius: 1em; display: block;">
                  <!-- Wing (vertical, full MAC range) -->
                  <rect x="60" y="20" width="240" height="280" rx="60" fill="#23272b" stroke="#888" stroke-width="6" />
                  <!-- MAC bar (vertical, centered) -->
                  <rect x="174" y="20" width="12" height="280" fill="#fff" stroke="#fff" stroke-width="1" rx="4" />
                  <!-- Forward/Aft limit ticks (top/bottom of MAC bar) -->
                  <line x1="174" :y1="20 + 280 * 0.20" x2="186" :y2="20 + 280 * 0.20" stroke="#ffeb3b" stroke-width="4" />
                  <line x1="174" :y1="20 + 280 * 0.35" x2="186" :y2="20 + 280 * 0.35" stroke="#ffeb3b" stroke-width="4" />
                  <!-- CG dot (vertical: %MAC, horizontal: lateralCG) -->
                  <circle :cx="180 + 120 * lateralCG" :cy="20 + 280 * (result.cgPercentMAC / 100)" r="12" fill="cyan" stroke="#fff" stroke-width="3" />
                  <!-- Left/Right labels -->
                  <text x="80" y="170" font-size="18" fill="#fff">LEFT</text>
                  <text x="260" y="170" font-size="18" fill="#fff">RIGHT</text>
                  <!-- FWD/AFT labels -->
                  <text x="200" y="40" font-size="16" fill="#fff">FWD</text>
                  <text x="200" y="310" font-size="16" fill="#fff">AFT</text>
                </svg>
              </div>
              <div class="mt-4">
                <v-alert v-if="!result.withinLimits" type="error" variant="tonal" border="start" prominent>
                  Warning: Out of CG or Weight Limits!
                </v-alert>
                <v-alert v-else type="success" variant="tonal" border="start" prominent>
                  Within Limits
                </v-alert>
              </div>
              <!-- CG Envelope Chart below the airplane diagram -->
              <!-- <CgEnvelopeChart :envelope="envelope" :current="{ x: result.cg, y: result.totalWeight }" /> -->
              <!-- End CG Envelope Chart -->
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-app>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
}
.text-red {
  color: #ff5252 !important;
}
</style>
