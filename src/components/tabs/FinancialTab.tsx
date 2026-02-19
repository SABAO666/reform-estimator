"use client";

import type { BuildingInsights } from "@/lib/solar-api";

type Props = {
  building: BuildingInsights;
};

function formatMoney(money: { currencyCode?: string; units?: string; nanos?: number } | undefined): string {
  if (!money) return "-";
  const units = parseInt(money.units || "0", 10);
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: money.currencyCode || "USD",
    maximumFractionDigits: 0,
  }).format(units);
}

export default function FinancialTab({ building }: Props) {
  const sp = building.solarPotential;
  const analyses = sp.financialAnalyses || [];
  const configs = sp.solarPanelConfigs || [];

  if (analyses.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <p className="text-sm text-gray-500">この地域の財務分析データは利用できません。</p>
      </div>
    );
  }

  // デフォルトの電気料金シナリオを選択
  const defaultAnalysis = analyses.find((a) => a.defaultBill) || analyses[Math.floor(analyses.length / 2)];
  const fd = defaultAnalysis?.financialDetails;
  const configIndex = defaultAnalysis?.panelConfigIndex ?? -1;
  const optimalConfig = configIndex >= 0 && configIndex < configs.length ? configs[configIndex] : null;

  const cash = defaultAnalysis?.cashPurchaseSavings;
  const financed = defaultAnalysis?.financedPurchaseSavings;
  const lease = defaultAnalysis?.leasingSavings;

  return (
    <div className="space-y-6">
      {/* 分析概要 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">財務分析概要</h3>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt className="text-xs text-gray-500">想定月間電気料金</dt>
            <dd className="text-xl font-bold text-gray-900">{formatMoney(defaultAnalysis?.monthlyBill)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">初年度AC発電量</dt>
            <dd className="text-xl font-bold text-green-700">{fd?.initialAcKwhPerYear?.toFixed(0) || "-"}<span className="text-sm font-normal ml-1">kWh</span></dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">太陽光カバー率</dt>
            <dd className="text-xl font-bold text-amber-600">{fd?.solarPercentage?.toFixed(0) || "-"}<span className="text-sm font-normal ml-1">%</span></dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">最適パネル枚数</dt>
            <dd className="text-xl font-bold text-gray-900">{optimalConfig?.panelsCount || "-"}<span className="text-sm font-normal ml-1">枚</span></dd>
          </div>
        </dl>
      </div>

      {/* 購入方法比較 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 一括購入 */}
        <div className={`rounded-lg border p-5 ${cash?.savings?.financiallyViable ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"}`}>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">一括購入</h4>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-gray-500">初期費用（補助金後）</dt>
              <dd className="text-lg font-bold">{formatMoney(cash?.upfrontCost)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">補助金・税控除</dt>
              <dd className="text-sm font-medium text-green-700">{formatMoney(cash?.rebateValue)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">投資回収年数</dt>
              <dd className="text-lg font-bold text-blue-700">
                {cash?.paybackYears && cash.paybackYears > 0 ? `${cash.paybackYears.toFixed(1)}年` : "回収不可"}
              </dd>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <dt className="text-xs text-gray-500">生涯節約額</dt>
              <dd className="text-xl font-bold text-green-700">{formatMoney(cash?.savings?.savingsLifetime)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">20年目の節約額</dt>
              <dd className="text-sm font-medium">{formatMoney(cash?.savings?.savingsYear20)}</dd>
            </div>
          </dl>
          {cash?.savings?.financiallyViable && (
            <div className="mt-3 text-xs text-green-700 font-medium">投資価値あり</div>
          )}
        </div>

        {/* ローン購入 */}
        <div className={`rounded-lg border p-5 ${financed?.savings?.financiallyViable ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"}`}>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">ローン購入</h4>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-gray-500">年間ローン支払い</dt>
              <dd className="text-lg font-bold">{formatMoney(financed?.annualLoanPayment)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">ローン金利</dt>
              <dd className="text-sm font-medium">{financed?.loanInterestRate ? `${(financed.loanInterestRate * 100).toFixed(1)}%` : "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">補助金・税控除</dt>
              <dd className="text-sm font-medium text-green-700">{formatMoney(financed?.rebateValue)}</dd>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <dt className="text-xs text-gray-500">生涯節約額</dt>
              <dd className="text-xl font-bold text-green-700">{formatMoney(financed?.savings?.savingsLifetime)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">1年目の節約額</dt>
              <dd className="text-sm font-medium">{formatMoney(financed?.savings?.savingsYear1)}</dd>
            </div>
          </dl>
          {financed?.savings?.financiallyViable && (
            <div className="mt-3 text-xs text-green-700 font-medium">投資価値あり</div>
          )}
        </div>

        {/* リース */}
        <div className={`rounded-lg border p-5 ${lease?.savings?.financiallyViable ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"}`}>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">リース</h4>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-gray-500">年間リース料金</dt>
              <dd className="text-lg font-bold">{formatMoney(lease?.annualLeasingCost)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">リース可否</dt>
              <dd className="text-sm font-medium">
                {lease?.leasesAllowed ? (lease?.leasesSupported ? "対応可能" : "制限あり") : "非対応地域"}
              </dd>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <dt className="text-xs text-gray-500">生涯節約額</dt>
              <dd className="text-xl font-bold text-green-700">{formatMoney(lease?.savings?.savingsLifetime)}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">1年目の節約額</dt>
              <dd className="text-sm font-medium">{formatMoney(lease?.savings?.savingsYear1)}</dd>
            </div>
          </dl>
          {lease?.savings?.financiallyViable && (
            <div className="mt-3 text-xs text-green-700 font-medium">投資価値あり</div>
          )}
        </div>
      </div>

      {/* 補助金情報 */}
      {fd && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">補助金・インセンティブ</h3>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-xs text-blue-600">連邦補助金</dt>
              <dd className="text-lg font-bold text-blue-800">{formatMoney(fd.federalIncentive)}</dd>
            </div>
            <div>
              <dt className="text-xs text-blue-600">州/地方補助金</dt>
              <dd className="text-lg font-bold text-blue-800">{formatMoney(fd.stateIncentive)}</dd>
            </div>
            <div>
              <dt className="text-xs text-blue-600">電力会社補助金</dt>
              <dd className="text-lg font-bold text-blue-800">{formatMoney(fd.utilityIncentive)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-blue-500">
            ※ 補助金データは米国の制度に基づいています。日本の補助金制度は別途確認が必要です。
          </p>
        </div>
      )}

      {/* 電気料金シナリオ一覧 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">電気料金シナリオ別分析</h3>
        <p className="text-xs text-gray-500 mb-3">月間電気料金ごとの最適パネル枚数と節約額（全{analyses.length}シナリオ）</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                <th className="pb-2 pr-4">月額電気料金</th>
                <th className="pb-2 pr-4">最適パネル数</th>
                <th className="pb-2 pr-4">太陽光カバー率</th>
                <th className="pb-2">生涯節約額（一括）</th>
              </tr>
            </thead>
            <tbody>
              {analyses.slice(0, 10).map((a, i) => (
                <tr key={i} className={`border-b border-gray-100 ${a.defaultBill ? "bg-blue-50" : ""}`}>
                  <td className="py-2 pr-4 font-medium">
                    {formatMoney(a.monthlyBill)}
                    {a.defaultBill && <span className="ml-1 text-xs text-blue-600">(推奨)</span>}
                  </td>
                  <td className="py-2 pr-4">
                    {a.panelConfigIndex != null && a.panelConfigIndex >= 0 && a.panelConfigIndex < configs.length
                      ? `${configs[a.panelConfigIndex].panelsCount}枚`
                      : "-"
                    }
                  </td>
                  <td className="py-2 pr-4">{a.financialDetails?.solarPercentage?.toFixed(0) || "-"}%</td>
                  <td className="py-2 font-medium text-green-700">{formatMoney(a.cashPurchaseSavings?.savings?.savingsLifetime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
