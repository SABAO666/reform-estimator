/* eslint-disable @typescript-eslint/no-explicit-any */

type Money = {
  currencyCode?: string;
  units?: string;
  nanos?: number;
};

type SavingsOverTime = {
  savingsYear1?: Money;
  savingsYear20?: Money;
  presentValueOfSavingsYear20?: Money;
  savingsLifetime?: Money;
  presentValueOfSavingsLifetime?: Money;
  financiallyViable?: boolean;
};

export type BuildingInsights = {
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  boundingBox: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
  solarPotential: {
    maxArrayPanelsCount: number;
    maxArrayAreaMeters2: number;
    maxSunshineHoursPerYear: number;
    panelCapacityWatts: number;
    panelHeightMeters: number;
    panelWidthMeters: number;
    panelLifetimeYears: number;
    carbonOffsetFactorKgPerMwh: number;
    roofSegmentStats: Array<{
      pitchDegrees: number;
      azimuthDegrees: number;
      planeHeightAtCenterMeters?: number;
      center?: { latitude: number; longitude: number };
      boundingBox?: any;
      stats: {
        areaMeters2: number;
        sunshineQuantiles: number[];
        groundAreaMeters2: number;
      };
    }>;
    wholeRoofStats: {
      areaMeters2: number;
      sunshineQuantiles: number[];
      groundAreaMeters2: number;
    };
    buildingStats: {
      areaMeters2: number;
      sunshineQuantiles: number[];
      groundAreaMeters2: number;
    };
    solarPanels: Array<{
      center: { latitude: number; longitude: number };
      orientation: "LANDSCAPE" | "PORTRAIT";
      yearlyEnergyDcKwh: number;
      segmentIndex?: number;
    }>;
    solarPanelConfigs: Array<{
      panelsCount: number;
      yearlyEnergyDcKwh: number;
      roofSegmentSummaries?: Array<{
        panelsCount: number;
        yearlyEnergyDcKwh: number;
        pitchDegrees: number;
        azimuthDegrees: number;
        segmentIndex: number;
      }>;
    }>;
    financialAnalyses: Array<{
      monthlyBill?: Money;
      defaultBill?: boolean;
      averageKwhPerMonth?: number;
      panelConfigIndex?: number;
      financialDetails?: {
        initialAcKwhPerYear?: number;
        remainingLifetimeUtilityBill?: Money;
        federalIncentive?: Money;
        stateIncentive?: Money;
        utilityIncentive?: Money;
        lifetimeSrecTotal?: Money;
        costOfElectricityWithoutSolar?: Money;
        netMeteringAllowed?: boolean;
        solarPercentage?: number;
        percentageExportedToGrid?: number;
      };
      cashPurchaseSavings?: {
        outOfPocketCost?: Money;
        upfrontCost?: Money;
        rebateValue?: Money;
        savings?: SavingsOverTime;
        paybackYears?: number;
      };
      financedPurchaseSavings?: {
        annualLoanPayment?: Money;
        rebateValue?: Money;
        loanInterestRate?: number;
        savings?: SavingsOverTime;
      };
      leasingSavings?: {
        leasesAllowed?: boolean;
        leasesSupported?: boolean;
        annualLeasingCost?: Money;
        savings?: SavingsOverTime;
      };
    }>;
  };
  imageryDate: {
    year: number;
    month: number;
    day: number;
  };
  imageryQuality: string;
  _imageryQuality?: string;
};

export async function fetchBuildingInsights(
  lat: number,
  lng: number
): Promise<BuildingInsights> {
  const response = await fetch(
    `/api/building?lat=${lat}&lng=${lng}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "建物情報の取得に失敗しました");
  }

  return response.json();
}
