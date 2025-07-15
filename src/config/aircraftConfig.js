// @ts-check
/**
 * @typedef {Object} AircraftConfig
 * @property {string} model
 * @property {number} emptyWeight
 * @property {number} emptyCG
 * @property {number} maxTakeoffWeight
 * @property {number} maxFuelGallons
 * @property {number} fuelWeightPerGallon
 * @property {number} fuelWeightPerLiter
 * @property {number} fuelGallonsPerLiter
 * @property {number} macLength
 * @property {number} macLeadingEdge
 * @property {{left: number, right: number, pilot: number, copilot: number, rearLeft: number, rearRight: number, baggage: number}} arms
 * @property {{weight: number, min: number, max: number}[]} cgLimits
 */

/** @type {AircraftConfig} */
const config = {
  model: "Piper Cherokee 140 (150hp)",
  emptyWeight: 1300, // lbs (example, update for your aircraft)
  emptyCG: 90.5, // in (example, update for your aircraft)
  maxTakeoffWeight: 2150, // lbs
  maxFuelGallons: 50, // gal (25 gal per tank)
  fuelWeightPerGallon: 6, // lbs/gal
  fuelWeightPerLiter: 0.72, // kg/liter (Avgav)
  fuelGallonsPerLiter: 0.264172,
  macLength: 57.5, // in (example, update for your aircraft) 
  macLeadingEdge: 78.0, // in (example, update for your aircraft)
  arms: {
    left: 95.0, // Left tank arm
    right: 95.0, // Right tank arm
    pilot: 85.5,
    copilot: 85.5,
    rearLeft: 117.0,
    rearRight: 117.0,
    baggage: 117.0,
  },
  cgLimits: [
    // Example: { weight: 1950, min: 83.0, max: 93.0 },
    // Fill in from manual's CG envelope chart for more accuracy
    { weight: 1650, min: 84.4, max: 95.9 },
    { weight: 1975, min: 85.9, max: 95.9 },
    { weight: 2150, min: 84.0, max: 95.9 },
  ],
};

export default config; 