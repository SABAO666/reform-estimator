"use client";

import type { BuildingInsights } from "@/lib/solar-api";

type Props = {
  building: BuildingInsights | null;
};

export default function DevModeTab({ building }: Props) {
  return (
    <div className="space-y-6">
      {/* API解説 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Google Solar API 解説</h3>

        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-900">3つのエンドポイント</h4>
            <div className="mt-2 space-y-2">
              <div className="rounded bg-gray-50 p-3">
                <code className="text-xs text-blue-700">GET /v1/buildingInsights:findClosest</code>
                <p className="mt-1 text-xs text-gray-500">
                  座標に最も近い建物を特定し、屋根面積・パネル配置・発電量・財務分析を返す。
                  <span className="font-medium text-green-700">このアプリの主要データソース。</span>
                  無料枠: 10,000件/月、$10/1000件。
                </p>
              </div>
              <div className="rounded bg-gray-50 p-3">
                <code className="text-xs text-blue-700">GET /v1/dataLayers:get</code>
                <p className="mt-1 text-xs text-gray-500">
                  指定座標周辺のGeoTIFFデータ（DSM、RGB航空写真、屋根マスク、日射量ヒートマップ）へのURLを返す。
                  無料枠: 1,000件/月、$75/1000件。
                </p>
              </div>
              <div className="rounded bg-gray-50 p-3">
                <code className="text-xs text-blue-700">GET /v1/geoTiff:get</code>
                <p className="mt-1 text-xs text-gray-500">
                  dataLayersが返したURLからGeoTIFFバイナリを取得。dataLayersの課金に含まれる。
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">buildingInsights レスポンス構造</h4>
            <div className="mt-2 rounded bg-gray-900 p-4 text-xs text-green-400 font-mono overflow-x-auto">
              <pre>{`buildingInsights
├── name                        // リソース名
├── center { lat, lng }         // 建物中心座標
├── boundingBox { sw, ne }      // バウンディングボックス
├── imageryDate { y, m, d }     // 画像撮影日
├── imageryQuality              // HIGH / MEDIUM / BASE
└── solarPotential
    ├── maxArrayPanelsCount     // 最大パネル設置数
    ├── panelCapacityWatts      // パネル定格出力(W)
    ├── maxSunshineHoursPerYear // 年間最大日照時間
    ├── carbonOffsetFactorKgPerMwh // CO2係数
    ├── wholeRoofStats          // 屋根全体統計
    │   ├── areaMeters2         //   面積
    │   ├── groundAreaMeters2   //   地上投影面積
    │   └── sunshineQuantiles[] //   日照分位値
    ├── roofSegmentStats[]      // 各屋根面
    │   ├── pitchDegrees        //   勾配
    │   ├── azimuthDegrees      //   方位角
    │   ├── planeHeightAtCenterMeters
    │   └── stats { area, ground, sunshine }
    ├── solarPanels[]           // 個別パネル配置
    │   ├── center { lat, lng }
    │   ├── orientation         //   LANDSCAPE/PORTRAIT
    │   ├── yearlyEnergyDcKwh   //   年間発電量
    │   └── segmentIndex
    ├── solarPanelConfigs[]     // 枚数別構成
    │   ├── panelsCount
    │   ├── yearlyEnergyDcKwh
    │   └── roofSegmentSummaries[]
    └── financialAnalyses[]     // 財務分析
        ├── monthlyBill         //   想定月間電気料金
        ├── panelConfigIndex    //   最適構成インデックス
        ├── financialDetails
        │   ├── initialAcKwhPerYear
        │   ├── solarPercentage
        │   ├── federalIncentive
        │   └── stateIncentive
        ├── cashPurchaseSavings
        │   ├── upfrontCost, rebateValue
        │   ├── paybackYears
        │   └── savings { year1, year20, lifetime }
        ├── financedPurchaseSavings
        │   ├── annualLoanPayment, loanInterestRate
        │   └── savings { ... }
        └── leasingSavings
            ├── annualLeasingCost
            └── savings { ... }`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">dataLayers レスポンス構造</h4>
            <div className="mt-2 rounded bg-gray-900 p-4 text-xs text-green-400 font-mono overflow-x-auto">
              <pre>{`dataLayers
├── imageryDate, imageryQuality
├── dsmUrl          // デジタル表面モデル (0.1m/px)
├── rgbUrl          // RGB航空写真 (0.1m/px)
├── maskUrl         // 屋根マスク (0.1m/px, 1bit)
├── annualFluxUrl   // 年間日射量 (kWh/kW/年)
├── monthlyFluxUrl  // 月間日射量 (12バンド)
└── hourlyShadeUrls[] // 時間別日陰 (12ファイル×24バンド)`}</pre>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">品質レベル (requiredQuality)</h4>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-1 pr-4">品質</th>
                    <th className="pb-1 pr-4">カバレッジ</th>
                    <th className="pb-1">精度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-4 font-medium">HIGH</td>
                    <td className="py-1 pr-4">主要都市部</td>
                    <td className="py-1">最高精度。推奨</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-4 font-medium">MEDIUM</td>
                    <td className="py-1 pr-4">都市部+郊外</td>
                    <td className="py-1">中程度。HIGHが無い場合のフォールバック</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4 font-medium">BASE</td>
                    <td className="py-1 pr-4">広範囲</td>
                    <td className="py-1">低精度</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              このアプリではHIGH→MEDIUMの順でフォールバック取得しています。
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">料金体系</h4>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-1 pr-4">エンドポイント</th>
                    <th className="pb-1 pr-4">無料枠</th>
                    <th className="pb-1 pr-4">単価</th>
                    <th className="pb-1">このアプリでの使用</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-4 font-medium">buildingInsights</td>
                    <td className="py-1 pr-4">10,000件/月</td>
                    <td className="py-1 pr-4">$10/1000件</td>
                    <td className="py-1 text-green-700">全タブで使用（1検索=1コール）</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-4 font-medium">dataLayers</td>
                    <td className="py-1 pr-4">1,000件/月</td>
                    <td className="py-1 pr-4">$75/1000件</td>
                    <td className="py-1 text-amber-700">屋根分析タブ（オプション）</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4 font-medium">geoTiff</td>
                    <td className="py-1 pr-4">-</td>
                    <td className="py-1 pr-4">dataLayersに含む</td>
                    <td className="py-1 text-gray-500">画像取得時に使用</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 生データ表示 */}
      {building && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">APIレスポンス生データ</h3>
          <p className="text-xs text-gray-500 mb-4">buildingInsights:findClosest のレスポンス</p>
          <div className="rounded bg-gray-900 p-4 max-h-[600px] overflow-auto">
            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
              {JSON.stringify(building, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
