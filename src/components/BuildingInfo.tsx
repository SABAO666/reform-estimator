"use client";

import type { BuildingInsights } from "@/lib/solar-api";

type Props = {
  building: BuildingInsights | null;
  loading: boolean;
  error: string;
};

export default function BuildingInfo({ building, loading, error }: Props) {
  if (loading) {
    return (
      <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm text-gray-600">建物情報を取得中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="w-full rounded-lg border border-gray-200 bg-gray-50 p-6">
        <p className="text-sm text-gray-500">
          住所を検索するか、地図上で建物をクリックしてください
        </p>
      </div>
    );
  }

  const roofArea = building.solarPotential.wholeRoofStats.areaMeters2;
  const segments = building.solarPotential.roofSegmentStats.length;
  const imageryDate = building.imageryDate;

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">建物情報</h2>
        {building._imageryQuality === "MEDIUM" && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
            中精度データ
          </span>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-gray-500">屋根面積</dt>
          <dd className="text-2xl font-bold text-blue-700">
            {roofArea.toFixed(1)}
            <span className="text-sm font-normal ml-1">㎡</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">屋根セグメント数</dt>
          <dd className="text-2xl font-bold text-gray-900">
            {segments}
            <span className="text-sm font-normal ml-1">面</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">最大パネル設置数</dt>
          <dd className="text-lg font-semibold text-gray-700">
            {building.solarPotential.maxArrayPanelsCount}枚
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">画像撮影日</dt>
          <dd className="text-lg font-semibold text-gray-700">
            {imageryDate.year}/{imageryDate.month}/{imageryDate.day}
          </dd>
        </div>
      </dl>
    </div>
  );
}
