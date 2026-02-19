"use client";

import type { BuildingInsights } from "@/lib/solar-api";

type Props = {
  building: BuildingInsights;
};

export default function RoofAnalysisTab({ building }: Props) {
  const sp = building.solarPotential;
  const segments = sp.roofSegmentStats;
  const wholeRoof = sp.wholeRoofStats;

  const getDirectionLabel = (azimuth: number): string => {
    if (azimuth >= 337.5 || azimuth < 22.5) return "北";
    if (azimuth >= 22.5 && azimuth < 67.5) return "北東";
    if (azimuth >= 67.5 && azimuth < 112.5) return "東";
    if (azimuth >= 112.5 && azimuth < 157.5) return "南東";
    if (azimuth >= 157.5 && azimuth < 202.5) return "南";
    if (azimuth >= 202.5 && azimuth < 247.5) return "南西";
    if (azimuth >= 247.5 && azimuth < 292.5) return "西";
    return "北西";
  };

  const getPitchLabel = (pitch: number): string => {
    if (pitch < 5) return "平屋根";
    if (pitch < 15) return "緩勾配";
    if (pitch < 30) return "普通勾配";
    if (pitch < 45) return "急勾配";
    return "急傾斜";
  };

  return (
    <div className="space-y-6">
      {/* 屋根全体サマリー */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">屋根全体サマリー</h3>
        <dl className="grid grid-cols-3 gap-4">
          <div>
            <dt className="text-xs text-gray-500">総屋根面積</dt>
            <dd className="text-2xl font-bold text-blue-700">{wholeRoof.areaMeters2.toFixed(1)}<span className="text-sm font-normal ml-1">㎡</span></dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">地上投影面積</dt>
            <dd className="text-2xl font-bold text-gray-900">{wholeRoof.groundAreaMeters2.toFixed(1)}<span className="text-sm font-normal ml-1">㎡</span></dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">セグメント数</dt>
            <dd className="text-2xl font-bold text-gray-900">{segments.length}<span className="text-sm font-normal ml-1">面</span></dd>
          </div>
        </dl>
      </div>

      {/* セグメント一覧 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">屋根セグメント一覧</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                <th className="pb-2 pr-4">#</th>
                <th className="pb-2 pr-4">面積</th>
                <th className="pb-2 pr-4">勾配</th>
                <th className="pb-2 pr-4">方位</th>
                <th className="pb-2 pr-4">高さ</th>
                <th className="pb-2">日照（年間）</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                  <td className="py-2 pr-4 font-medium">{seg.stats.areaMeters2.toFixed(1)}㎡</td>
                  <td className="py-2 pr-4">
                    <span className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                      {seg.pitchDegrees.toFixed(1)}° {getPitchLabel(seg.pitchDegrees)}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700">
                      {getDirectionLabel(seg.azimuthDegrees)} ({seg.azimuthDegrees.toFixed(0)}°)
                    </span>
                  </td>
                  <td className="py-2 pr-4">{seg.planeHeightAtCenterMeters?.toFixed(1) ?? "-"}m</td>
                  <td className="py-2">
                    {seg.stats.sunshineQuantiles && seg.stats.sunshineQuantiles.length > 0
                      ? `${seg.stats.sunshineQuantiles[seg.stats.sunshineQuantiles.length - 1].toFixed(0)}h`
                      : "-"
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 方位別面積チャート（テキストベース） */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">方位別屋根面積</h3>
        {(() => {
          const directionMap: Record<string, number> = {};
          segments.forEach((seg) => {
            const dir = getDirectionLabel(seg.azimuthDegrees);
            directionMap[dir] = (directionMap[dir] || 0) + seg.stats.areaMeters2;
          });
          const maxArea = Math.max(...Object.values(directionMap));
          const directions = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];

          return (
            <div className="space-y-2">
              {directions.filter((d) => directionMap[d]).map((dir) => {
                const area = directionMap[dir];
                const pct = (area / maxArea) * 100;
                return (
                  <div key={dir} className="flex items-center gap-3">
                    <span className="w-8 text-xs text-gray-500 text-right">{dir}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${dir === "南" ? "bg-amber-500" : "bg-blue-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-16 text-right">{area.toFixed(1)}㎡</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
        <p className="mt-3 text-xs text-gray-400">南向きの屋根面積が多いほど太陽光発電に有利です</p>
      </div>
    </div>
  );
}
