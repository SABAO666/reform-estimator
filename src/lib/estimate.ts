export type ReformType = {
  id: string;
  name: string;
  unitPriceLow: number; // ¥/㎡
  unitPriceHigh: number; // ¥/㎡
  description: string;
};

export const REFORM_TYPES: ReformType[] = [
  {
    id: "exterior-paint",
    name: "外壁塗装",
    unitPriceLow: 3000,
    unitPriceHigh: 5000,
    description: "外壁のシリコン・フッ素塗装",
  },
  {
    id: "roof-paint",
    name: "屋根塗装",
    unitPriceLow: 2000,
    unitPriceHigh: 3500,
    description: "屋根の塗り替え工事",
  },
  {
    id: "roof-replace",
    name: "屋根葺き替え",
    unitPriceLow: 5000,
    unitPriceHigh: 10000,
    description: "屋根材の全面交換",
  },
  {
    id: "waterproof",
    name: "防水工事",
    unitPriceLow: 3000,
    unitPriceHigh: 6000,
    description: "屋上・ベランダの防水処理",
  },
];

export type EstimateItem = {
  reformType: ReformType;
  selected: boolean;
  lowEstimate: number;
  highEstimate: number;
};

export function calculateEstimates(
  roofAreaSqm: number,
  selectedIds: string[]
): EstimateItem[] {
  return REFORM_TYPES.map((rt) => ({
    reformType: rt,
    selected: selectedIds.includes(rt.id),
    lowEstimate: Math.round(roofAreaSqm * rt.unitPriceLow),
    highEstimate: Math.round(roofAreaSqm * rt.unitPriceHigh),
  }));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}
