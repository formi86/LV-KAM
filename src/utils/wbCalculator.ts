// @ts-ignore
import config from '../config/aircraftConfig';

export type WeightUnit = 'lbs' | 'kg';
export type FuelUnit = 'gal' | 'liters' | 'kg';

export interface WBInput {
  pilot: number;
  copilot: number;
  rearLeft: number;
  rearRight: number;
  baggage: number;
  leftFuel: number;
  rightFuel: number;
  weightUnit: WeightUnit;
  fuelUnit: FuelUnit;
  emptyCG: number; // in
}

export interface WBResult {
  totalWeight: number;
  totalMoment: number;
  cg: number;
  cgPercentMAC: number;
  withinLimits: boolean;
  cgLimit: { min: number; max: number };
}

function toLbs(weight: number, unit: WeightUnit): number {
  return unit === 'kg' ? weight * 2.20462 : weight;
}
function fuelToLbs(fuel: number, unit: FuelUnit): number {
  if (unit === 'gal') return fuel * config.fuelWeightPerGallon;
  if (unit === 'liters') return fuel * config.fuelWeightPerLiter * 2.20462;
  return fuel; // already in lbs
}

export function calculateWB(input: WBInput): WBResult {
  const items = [
    { weight: config.emptyWeight, arm: input.emptyCG },
    { weight: toLbs(input.pilot, input.weightUnit), arm: config.arms.pilot },
    { weight: toLbs(input.copilot, input.weightUnit), arm: config.arms.copilot },
    { weight: toLbs(input.rearLeft, input.weightUnit), arm: config.arms.rearLeft },
    { weight: toLbs(input.rearRight, input.weightUnit), arm: config.arms.rearRight },
    { weight: toLbs(input.baggage, input.weightUnit), arm: config.arms.baggage },
    { weight: fuelToLbs(input.leftFuel, input.fuelUnit), arm: config.arms.left },
    { weight: fuelToLbs(input.rightFuel, input.fuelUnit), arm: config.arms.right },
  ];
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  const totalMoment = items.reduce((sum, i) => sum + i.weight * i.arm, 0);
  const cg = totalMoment / totalWeight;
  // CG as %MAC
  const cgPercentMAC = ((cg - config.macLeadingEdge) / config.macLength) * 100;
  // Find the closest cgLimit for the current weight
  let cgLimit = config.cgLimits[0];
  for (const limit of config.cgLimits) {
    if (totalWeight <= limit.weight) {
      cgLimit = limit;
      break;
    }
  }
  const withinLimits = cg >= cgLimit.min && cg <= cgLimit.max && totalWeight <= config.maxTakeoffWeight;
  return { totalWeight, totalMoment, cg, cgPercentMAC, withinLimits, cgLimit };
} 