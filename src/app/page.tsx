"use client";

import { useState, useCallback } from "react";
import AddressSearch from "@/components/AddressSearch";
import MapView from "@/components/MapView";
import BuildingInfo from "@/components/BuildingInfo";
import EstimateResult from "@/components/EstimateResult";
import TabNavigation, { type TabId } from "@/components/TabNavigation";
import RoofAnalysisTab from "@/components/tabs/RoofAnalysisTab";
import SolarTab from "@/components/tabs/SolarTab";
import FinancialTab from "@/components/tabs/FinancialTab";
import DevModeTab from "@/components/tabs/DevModeTab";
import { fetchBuildingInsights, type BuildingInsights } from "@/lib/solar-api";

const DEFAULT_CENTER = { lat: 35.6812, lng: 139.7671 }; // 東京駅

function NoDataMessage() {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <p className="text-sm text-gray-500">
        住所を検索するか、地図上で建物をクリックするとデータが表示されます
      </p>
    </div>
  );
}

export default function Home() {
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [building, setBuilding] = useState<BuildingInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("simple");

  const lookupBuilding = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    setError("");
    setBuilding(null);
    setMarkerPosition({ lat, lng });
    setMapCenter({ lat, lng });

    try {
      const data = await fetchBuildingInsights(lat, lng);
      setBuilding(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "建物情報の取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocationFound = useCallback(
    (lat: number, lng: number, address: string) => {
      setSelectedAddress(address);
      lookupBuilding(lat, lng);
    },
    [lookupBuilding]
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      lookupBuilding(lat, lng);
    },
    [lookupBuilding]
  );

  const roofArea = building?.solarPotential?.wholeRoofStats?.areaMeters2 ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            リフォーム概算見積ツール
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            住所から建物の屋根面積を取得し、リフォーム費用を概算します
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto px-6 py-6 space-y-6">
        {/* 住所検索 */}
        <AddressSearch onLocationFound={handleLocationFound} />

        {/* 選択中の住所 */}
        {selectedAddress && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">選択中:</span>
            <span className="font-medium text-gray-900">{selectedAddress}</span>
          </div>
        )}

        {/* タブナビゲーション（地図の上） */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasData={!!building}
        />

        {/* 地図 */}
        <MapView
          center={mapCenter}
          onMapClick={handleMapClick}
          markerPosition={markerPosition}
        />

        {/* 建物情報（共通） */}
        <BuildingInfo building={building} loading={loading} error={error} />

        {/* タブコンテンツ */}
        <div className="min-h-[200px]">
          {activeTab === "simple" && (
            <div className="space-y-6">
              <EstimateResult roofAreaSqm={roofArea} />
              {building && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 space-y-1">
                  <p className="font-medium">ご注意</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>本ツールの見積もりは概算であり、実際の費用は現地調査後に確定します</li>
                    <li>屋根面積はGoogle Solar APIのデータに基づいており、実測値と異なる場合があります</li>
                    <li>足場代、撤去費用、その他の付帯工事費用は含まれていません</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === "roof" && (
            building ? <RoofAnalysisTab building={building} /> : <NoDataMessage />
          )}

          {activeTab === "solar" && (
            building ? <SolarTab building={building} /> : <NoDataMessage />
          )}

          {activeTab === "financial" && (
            building ? <FinancialTab building={building} /> : <NoDataMessage />
          )}

          {activeTab === "devmode" && (
            <DevModeTab building={building} />
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="mx-auto px-6 py-4 text-center text-xs text-gray-400">
          Powered by Google Maps Solar API
        </div>
      </footer>
    </div>
  );
}
