"use client";

import type { BuildingInsights } from "@/lib/solar-api";

type Props = {
  building: BuildingInsights;
};

export default function SolarTab({ building }: Props) {
  const sp = building.solarPotential;
  const panels = sp.solarPanels || [];
  const configs = sp.solarPanelConfigs || [];
  const panelWatts = sp.panelCapacityWatts || 400;
  const carbonFactor = sp.carbonOffsetFactorKgPerMwh || 0;

  // 最大パネル構成
  const maxConfig = configs.length > 0 ? configs[configs.length - 1] : null;
  const maxYearlyKwh = maxConfig?.yearlyEnergyDcKwh || 0;

  // DC→AC変換効率（一般的に85%）
  const dcToAcRatio = 0.85;
  const maxYearlyAcKwh = maxYearlyKwh * dcToAcRatio;

  // CO2削減量
  const co2ReductionKg = (maxYearlyAcKwh / 1000) * carbonFactor;

  // パネル構成比較（5段階）
  const configSamples = (() => {
    if (configs.length <= 5) return configs;
    const step = Math.floor((configs.length - 1) / 4);
    return [0, step, step * 2, step * 3, configs.length - 1].map((i) => configs[i]);
  })();

  return (
    <div className="space-y-6">
      {/* パネル設置サマリー */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">太陽光パネル設置シミュレーション</h3>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt className="text-xs text-gray-500">最大設置枚数</dt>
            <dd className="text-2xl font-bold text-amber-600">{sp.maxArrayPanelsCount}<span className="text-sm font-normal ml-1">枚</span></dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">最大設置容量</dt>
            <dd className="text-2xl font-bold text-gray-900">{((sp.maxArrayPanelsCount * panelWatts) / 1000).toFixed(1)}<span className="text-sm font-normal ml-1">kW</span></dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">年間発電量（AC）</dt>
            <dd className="text-2xl font-bold text-green-700">{(maxYearlyAcKwh / 1000).toFixed(1)}<span className="text-sm font-normal ml-1">MWh</span></dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">年間日照時間</dt>
            <dd className="text-2xl font-bold text-gray-900">{sp.maxSunshineHoursPerYear.toFixed(0)}<span className="text-sm font-normal ml-1">時間</span></dd>
          </div>
        </dl>
        <div className="mt-3 flex gap-4 text-xs text-gray-400">
          <span>パネル出力: {panelWatts}W</span>
          <span>パネルサイズ: {sp.panelHeightMeters}m × {sp.panelWidthMeters}m</span>
          <span>想定寿命: {sp.panelLifetimeYears}年</span>
        </div>
      </div>

      {/* パネル枚数別発電量比較 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">パネル枚数別 発電量比較</h3>
        <div className="space-y-3">
          {configSamples.map((config, i) => {
            const acKwh = config.yearlyEnergyDcKwh * dcToAcRatio;
            const capacityKw = (config.panelsCount * panelWatts) / 1000;
            const pct = maxYearlyKwh > 0 ? (config.yearlyEnergyDcKwh / maxYearlyKwh) * 100 : 0;

            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-16 text-xs text-gray-500 text-right">{config.panelsCount}枚</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {(acKwh / 1000).toFixed(1)} MWh/年
                  </span>
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">{capacityKw.toFixed(1)}kW</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CO2削減量 */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4">環境貢献度</h3>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs text-green-600">年間CO2削減量</dt>
            <dd className="text-2xl font-bold text-green-800">
              {(co2ReductionKg / 1000).toFixed(1)}
              <span className="text-sm font-normal ml-1">トン</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-green-600">杉の木換算（年間）</dt>
            <dd className="text-2xl font-bold text-green-800">
              {Math.round(co2ReductionKg / 14)}
              <span className="text-sm font-normal ml-1">本分</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-green-600">CO2オフセット係数</dt>
            <dd className="text-lg font-semibold text-green-700">
              {carbonFactor.toFixed(1)} kg/MWh
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-green-600">
          ※ 杉の木1本あたりの年間CO2吸収量は約14kgとして計算
        </p>
      </div>

      {/* パネル配置詳細（上位10枚） */}
      {panels.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">パネル配置詳細</h3>
          <p className="text-xs text-gray-500 mb-4">発電効率の高い上位10枚を表示（全{panels.length}枚中）</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="pb-2 pr-4">#</th>
                  <th className="pb-2 pr-4">向き</th>
                  <th className="pb-2 pr-4">年間発電量</th>
                  <th className="pb-2">屋根セグメント</th>
                </tr>
              </thead>
              <tbody>
                {[...panels]
                  .sort((a, b) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh)
                  .slice(0, 10)
                  .map((panel, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${panel.orientation === "LANDSCAPE" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                          {panel.orientation === "LANDSCAPE" ? "横置き" : "縦置き"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 font-medium">{panel.yearlyEnergyDcKwh.toFixed(1)} kWh</td>
                      <td className="py-2">セグメント {(panel.segmentIndex || 0) + 1}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
