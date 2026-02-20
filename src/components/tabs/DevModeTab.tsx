"use client";

import type { BuildingInsights } from "@/lib/solar-api";

type Props = {
  building: BuildingInsights | null;
};

export default function DevModeTab({ building }: Props) {
  return (
    <div className="space-y-6">
      {/* ズバリの取得方法 */}
      <div className="rounded-lg border-2 border-blue-400 bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">屋根面積の取得方法 — ズバリ1行で取れる</h3>

        <div className="space-y-4 text-sm">
          <p className="text-blue-800">
            Google Solar API に<strong>緯度・経度を渡すだけ</strong>で、計算済みの屋根面積が数値で返ってくる。
            航空写真の解析・屋根検出・面積計算は<strong>全てGoogle側が実行済み</strong>。こちらで画像処理する必要はない。
          </p>

          {/* APIリクエスト */}
          <div>
            <p className="text-xs font-semibold text-blue-700 mb-1">1. APIを呼ぶ（HTTP GET 1回）</p>
            <div className="rounded bg-gray-900 p-3 font-mono text-xs text-green-400 overflow-x-auto">
              <pre>{`GET https://solar.googleapis.com/v1/buildingInsights:findClosest
  ?location.latitude=35.682
  &location.longitude=139.767
  &requiredQuality=HIGH
  &key=YOUR_API_KEY`}</pre>
            </div>
          </div>

          {/* レスポンスの該当箇所 */}
          <div>
            <p className="text-xs font-semibold text-blue-700 mb-1">2. レスポンスJSON内にある変数</p>
            <div className="rounded bg-gray-900 p-3 font-mono text-xs overflow-x-auto">
              <pre>{`{
  "solarPotential": {
    "wholeRoofStats": {`}</pre>
              <pre className="text-amber-400 text-sm font-bold">{`      "areaMeters2": 1120.6        ← ★ これが屋根面積（㎡）`}</pre>
              <pre className="text-gray-400">{`      "groundAreaMeters2": 1079.0  ← 地上投影面積（㎡）
    },
    "roofSegmentStats": [          ← 屋根の各面ごとの面積もある
      {
        "stats": { "areaMeters2": 46.3 },
        "pitchDegrees": 12.5,      ← 勾配（度）
        "azimuthDegrees": 106.0    ← 方位（度）
      }, ...
    ]
  }
}`}</pre>
            </div>
          </div>

          {/* コード */}
          <div>
            <p className="text-xs font-semibold text-blue-700 mb-1">3. このアプリでの取得コード（TypeScript）</p>
            <div className="rounded bg-gray-900 p-3 font-mono text-xs text-green-400 overflow-x-auto">
              <pre>{`// たった1行で屋根面積を取得
const roofArea = building.solarPotential.wholeRoofStats.areaMeters2;

// 各セグメントの面積・勾配・方位も取得できる
building.solarPotential.roofSegmentStats.forEach(seg => {
  console.log(seg.stats.areaMeters2);   // セグメント面積
  console.log(seg.pitchDegrees);        // 勾配
  console.log(seg.azimuthDegrees);      // 方位
});`}</pre>
            </div>
          </div>

          {/* 現在の建物のデータ */}
          {building && (
            <div className="rounded bg-white border border-blue-200 p-3">
              <p className="text-xs font-semibold text-blue-700 mb-2">現在取得中の建物データ</p>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-gray-500">wholeRoofStats.areaMeters2</dt>
                  <dd className="text-lg font-bold text-blue-800">{building.solarPotential.wholeRoofStats.areaMeters2.toFixed(1)} ㎡</dd>
                </div>
                <div>
                  <dt className="text-gray-500">wholeRoofStats.groundAreaMeters2</dt>
                  <dd className="text-lg font-bold text-gray-700">{building.solarPotential.wholeRoofStats.groundAreaMeters2.toFixed(1)} ㎡</dd>
                </div>
                <div>
                  <dt className="text-gray-500">roofSegmentStats.length</dt>
                  <dd className="text-lg font-bold text-gray-700">{building.solarPotential.roofSegmentStats.length} セグメント</dd>
                </div>
                <div>
                  <dt className="text-gray-500">imageryQuality</dt>
                  <dd className="text-lg font-bold text-gray-700">{building.imageryQuality} {building._imageryQuality === "MEDIUM" ? "(フォールバック)" : ""}</dd>
                </div>
              </dl>
            </div>
          )}

          <p className="text-xs text-blue-600">
            つまり、航空写真からの3D解析・屋根検出・面積計算は全部Google側でやっている。
            こちらは緯度経度を渡すだけ。面積は「変数を読むだけ」で取得できる。
          </p>
        </div>
      </div>

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

      {/* 屋根面積の算出原理 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">屋根面積はどうやって取得しているのか</h3>

        <div className="space-y-6 text-sm text-gray-700">
          {/* 全体フロー図 */}
          <div className="rounded bg-blue-50 p-4">
            <h4 className="font-semibold text-blue-900 mb-2">処理の全体フロー</h4>
            <div className="rounded bg-white p-3 font-mono text-xs text-blue-800 overflow-x-auto">
              <pre>{`航空写真/衛星画像 (複数アングル)
    │
    ▼
ステレオ写真測量 (Photogrammetry)
    │
    ▼
DSM (Digital Surface Model) 生成  ──→  0.1m/pixel の高さマップ
    │
    ▼
屋根検出 (深層学習NN)  ──→  各ピクセルに「屋根スコア」を割当
    │
    ▼
平面セグメンテーション (RANSAC)  ──→  法線ベクトルから平面を検出
    │
    ▼
各セグメントの属性算出
    ├── pitchDegrees (勾配)
    ├── azimuthDegrees (方位角)
    ├── areaMeters2 (実面積)
    └── groundAreaMeters2 (投影面積)
    │
    ▼
日射量シミュレーション (レイトレーシング + 気象データ)
    │
    ▼
パネル配置最適化 (貪欲法) ──→ 発電量・財務分析`}</pre>
            </div>
          </div>

          {/* Step 1: 入力データ */}
          <div>
            <h4 className="font-semibold text-gray-900">Step 1: 入力データ（画像ソース）</h4>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">品質</th>
                    <th className="pb-2 pr-4">画像ソース</th>
                    <th className="pb-2 pr-4">元データ解像度</th>
                    <th className="pb-2">撮影方法</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium">HIGH</td>
                    <td className="py-2 pr-4">低高度航空写真</td>
                    <td className="py-2 pr-4">~10cm/pixel</td>
                    <td className="py-2">航空機から直下+斜め45度の複数アングル</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium">MEDIUM</td>
                    <td className="py-2 pr-4">高高度航空写真</td>
                    <td className="py-2 pr-4">~25cm/pixel</td>
                    <td className="py-2">航空機から撮影（高度が高い）</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-medium">BASE</td>
                    <td className="py-2 pr-4">Pleiades Neo衛星</td>
                    <td className="py-2 pr-4">~30cm/pixel</td>
                    <td className="py-2">衛星からオフナディア（斜め視線）撮影</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              LiDARは使用しておらず、フォトグラメトリ（写真測量）が主軸。
              Google Earth/Mapsと同じ航空写真を使用している。
            </p>
          </div>

          {/* Step 2: DSM生成 */}
          <div>
            <h4 className="font-semibold text-gray-900">Step 2: 3Dモデル構築（DSM生成）</h4>
            <p className="mt-2">
              複数アングルの航空写真から<strong>ステレオ写真測量</strong>で3D高さマップ（DSM: Digital Surface Model）を生成する。
            </p>
            <ol className="mt-2 list-decimal list-inside space-y-1 text-xs">
              <li>航空機から直下+斜め方向の画像を複数枚取得</li>
              <li>異なる視点の画像ペアで各ピクセルの<strong>視差（parallax）</strong>を計算</li>
              <li>視差情報から各点の3D座標を算出 → 点群データ</li>
              <li>点群をグリッド化し、各ピクセルに高さ値を割当 → <strong>0.1m/pixel のDSM</strong></li>
            </ol>
            <p className="mt-2 text-xs text-gray-500">
              衛星画像ベース（BASE品質）では、Google Researchの「Satellite Sunroof」論文（2024年）で発表された
              U-Net + Swin Transformerモデルで高さマップを推定している。
            </p>
          </div>

          {/* Step 3: 屋根検出 */}
          <div>
            <h4 className="font-semibold text-gray-900">Step 3: 屋根検出とセグメンテーション</h4>
            <div className="mt-2 space-y-2">
              <div className="rounded bg-gray-50 p-3">
                <p className="font-medium text-xs">3a. 建物検出</p>
                <p className="text-xs text-gray-500">Google Mapsの建物フットプリントデータベースを活用し建物の輪郭を特定</p>
              </div>
              <div className="rounded bg-gray-50 p-3">
                <p className="font-medium text-xs">3b. 屋根ピクセル分類</p>
                <p className="text-xs text-gray-500">深層学習NNで各ピクセルに「屋根スコア」を割当。煙突やスカイライト等の障害物を除外</p>
              </div>
              <div className="rounded bg-gray-50 p-3">
                <p className="font-medium text-xs">3c. 平面セグメンテーション（RANSACアルゴリズム）</p>
                <p className="text-xs text-gray-500">
                  DSMから各ピクセルの<strong>法線ベクトル</strong>（面の向き）を算出し、
                  RANSACで類似した法線方向のピクセル群をグルーピング → 平面的な屋根セグメントを検出
                </p>
              </div>
            </div>
          </div>

          {/* Step 4: 面積計算 */}
          <div>
            <h4 className="font-semibold text-gray-900">Step 4: 面積の計算方法</h4>
            <p className="mt-2">
              APIは<strong>2種類の面積値</strong>を返す。これがこのアプリの屋根分析タブに表示される値。
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">フィールド</th>
                    <th className="pb-2 pr-4">意味</th>
                    <th className="pb-2">計算方法</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-mono font-medium">areaMeters2</td>
                    <td className="py-2 pr-4">実際の屋根面積（傾斜面積）</td>
                    <td className="py-2">groundArea / cos(pitch) で勾配補正</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono font-medium">groundAreaMeters2</td>
                    <td className="py-2 pr-4">地上投影面積</td>
                    <td className="py-2">ピクセル解像度 × 屋根ピクセル数</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded bg-amber-50 p-3">
              <p className="font-medium text-xs text-amber-900">勾配による面積差の例</p>
              <div className="mt-1 text-xs text-amber-800 font-mono">
                <p>投影面積 100㎡ × 勾配 10° → 実面積 101.5㎡ (差 1.5%)</p>
                <p>投影面積 100㎡ × 勾配 30° → 実面積 115.5㎡ (差 15.5%)</p>
                <p>投影面積 100㎡ × 勾配 45° → 実面積 141.4㎡ (差 41.4%)</p>
              </div>
            </div>
          </div>

          {/* Step 5: 日射量計算 */}
          <div>
            <h4 className="font-semibold text-gray-900">Step 5: 日射量の計算（フラックスマップ）</h4>
            <ol className="mt-2 list-decimal list-inside space-y-1 text-xs">
              <li><strong>太陽位置計算</strong> — 年間の毎時間の太陽位置（高度角・方位角）を天文モデルで算出</li>
              <li><strong>シャドウ解析（レイトレーシング）</strong> — DSM上で周囲100〜150mの樹木・建物等による影をシミュレーション</li>
              <li><strong>気象データ統合</strong> — TMY（標準気象年）データで雲量・降水を反映。米国はNREL NSRDB、米国外はMeteonormを使用</li>
              <li><strong>フラックス算出</strong> — GHI = DNI × cos(入射角) + DHI から各ポイントの実効日射量を計算</li>
            </ol>
          </div>

          {/* Step 6: パネル配置 */}
          <div>
            <h4 className="font-semibold text-gray-900">Step 6: パネル配置の最適化</h4>
            <p className="mt-2 text-xs">
              <strong>貪欲法（greedy algorithm）</strong>で総受光エネルギーを最大化しつつ、以下の制約を満たすパネル配置を決定:
            </p>
            <ul className="mt-1 list-disc list-inside text-xs space-y-0.5 text-gray-600">
              <li>少なくとも4枚の連続パネル</li>
              <li>合計2kW以上のシステム</li>
              <li>各パネルが最大年間日射量の75%以上を受ける場所のみ</li>
              <li>最小屋根セグメント面積: 4㎡</li>
              <li>パネル仕様: 400W、効率20.4%、DC-ACデレーティング85%</li>
            </ul>
          </div>

          {/* 精度 */}
          <div>
            <h4 className="font-semibold text-gray-900">精度と限界</h4>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">指標</th>
                    <th className="pb-2">値（衛星ベースモデル）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-4">DSM高さ誤差（建物限定）</td>
                    <td className="py-1">平均 約0.92m</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-4">屋根傾斜角誤差</td>
                    <td className="py-1">約5.1度</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-1 pr-4">屋根セグメントIoU</td>
                    <td className="py-1">約54〜56%</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">発電量推定誤差（5kW時）</td>
                    <td className="py-1">約2.5% (MAPE)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              出典: Google Research「Satellite Sunroof」論文 (arXiv 2408.14400, 2024年)。
              航空写真ベース（HIGH品質）はこれより高精度。
              屋根面積は実測値と比べ技術設備エリア等の影響で±30%程度の誤差が出る場合がある。
            </p>
          </div>

          {/* カバレッジ */}
          <div>
            <h4 className="font-semibold text-gray-900">カバレッジと更新</h4>
            <ul className="mt-2 list-disc list-inside text-xs space-y-0.5 text-gray-600">
              <li>40カ国以上、<strong>3.2億棟以上</strong>をカバー（2024年時点）</li>
              <li>衛星ベースの拡張で1.25億棟が新規追加、最終目標は<strong>19億棟</strong></li>
              <li>更新スケジュールは非公開（「新データは常に追加されている」）</li>
              <li>一部地域では数年前の画像が使用されている場合がある</li>
            </ul>
          </div>

          {/* 参考資料 */}
          <div>
            <h4 className="font-semibold text-gray-900">参考資料</h4>
            <ul className="mt-2 text-xs space-y-1">
              <li><a href="https://developers.google.com/maps/documentation/solar/methodology" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Solar API Methodology（公式）</a></li>
              <li><a href="https://arxiv.org/abs/2408.14400" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Satellite Sunroof 論文 (arXiv 2408.14400)</a></li>
              <li><a href="https://research.google/blog/satellite-powered-estimation-of-global-solar-potential/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Research Blog: Satellite-powered solar estimation</a></li>
              <li><a href="https://developers.google.com/maps/documentation/solar/coverage" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Solar API Coverage（対応地域）</a></li>
            </ul>
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
