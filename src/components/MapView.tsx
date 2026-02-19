"use client";

import { useEffect, useRef, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

type Props = {
  center: { lat: number; lng: number };
  onMapClick: (lat: number, lng: number) => void;
  markerPosition: { lat: number; lng: number } | null;
};

export default function MapView({ center, onMapClick, markerPosition }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const initRef = useRef(false);

  const handleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onMapClick]
  );

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || !mapRef.current) return;

    setOptions({
      key: apiKey,
      v: "weekly",
    });

    Promise.all([
      importLibrary("maps"),
      importLibrary("marker"),
    ]).then(([mapsLib]) => {
      if (!mapRef.current) return;

      const map = new mapsLib.Map(mapRef.current, {
        center,
        zoom: 18,
        tilt: 45,
        mapTypeId: "satellite",
        mapId: "reform-estimator-map",
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      map.addListener("click", handleClick);
      mapInstanceRef.current = map;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 中心位置が変わったらパン
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(center);
      mapInstanceRef.current.setZoom(18);
    }
  }, [center]);

  // マーカー更新
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // 既存マーカーを削除
    if (markerRef.current) {
      markerRef.current.map = null;
    }

    if (markerPosition) {
      const { AdvancedMarkerElement } = google.maps.marker;
      markerRef.current = new AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: markerPosition,
        title: "選択した建物",
      });
    }
  }, [markerPosition]);

  return (
    <div className="w-full">
      <div
        ref={mapRef}
        className="w-full h-[500px] rounded-lg border border-gray-200 overflow-hidden"
      />
      <p className="mt-1.5 text-xs text-gray-500">
        地図上をクリックして建物を選択できます
      </p>
    </div>
  );
}
