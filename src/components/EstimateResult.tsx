"use client";

import { useState, useMemo } from "react";
import {
  REFORM_TYPES,
  calculateEstimates,
  formatCurrency,
} from "@/lib/estimate";

type Props = {
  roofAreaSqm: number | null;
};

export default function EstimateResult({ roofAreaSqm }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    REFORM_TYPES.map((rt) => rt.id)
  );

  const estimates = useMemo(() => {
    if (!roofAreaSqm) return [];
    return calculateEstimates(roofAreaSqm, selectedIds);
  }, [roofAreaSqm, selectedIds]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!roofAreaSqm) return null;

  const selectedEstimates = estimates.filter((e) => e.selected);
  const totalLow = selectedEstimates.reduce((sum, e) => sum + e.lowEstimate, 0);
  const totalHigh = selectedEstimates.reduce(
    (sum, e) => sum + e.highEstimate,
    0
  );

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        リフォーム概算見積
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        屋根面積 {roofAreaSqm.toFixed(1)}㎡ に基づく概算です。実際の費用は現地調査で確定します。
      </p>

      <div className="space-y-3">
        {estimates.map((item) => (
          <label
            key={item.reformType.id}
            className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors ${
              item.selected
                ? "border-blue-300 bg-blue-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => toggleItem(item.reformType.id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {item.reformType.name}
                </span>
                <p className="text-xs text-gray-500">
                  {item.reformType.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(item.lowEstimate)} 〜{" "}
                {formatCurrency(item.highEstimate)}
              </span>
              <p className="text-xs text-gray-400">
                {formatCurrency(item.reformType.unitPriceLow)}〜
                {formatCurrency(item.reformType.unitPriceHigh)}/㎡
              </p>
            </div>
          </label>
        ))}
      </div>

      {selectedEstimates.length > 0 && (
        <div className="mt-6 rounded-lg bg-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">合計見積（税別）</span>
            <span className="text-xl font-bold">
              {formatCurrency(totalLow)} 〜 {formatCurrency(totalHigh)}
            </span>
          </div>
          <p className="mt-1 text-xs text-blue-200">
            {selectedEstimates.length}項目を選択中
          </p>
        </div>
      )}
    </div>
  );
}
