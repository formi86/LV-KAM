declare const config: {
  maxFuelGallons: number;
  fuelGallonsPerLiter: number;
  fuelWeightPerGallon: number;
  fuelWeightPerLiter: number;
  emptyCG: number;
  macLeadingEdge: number;
  macLength: number;
  emptyWeight: number;
  maxTakeoffWeight: number;
  arms: {
    left: number;
    right: number;
    pilot: number;
    copilot: number;
    rearLeft: number;
    rearRight: number;
    baggage: number;
  };
  cgLimits?: any;
};
export default config; 