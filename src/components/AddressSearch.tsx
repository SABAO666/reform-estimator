"use client";

import { useState, useCallback } from "react";

type Props = {
  onLocationFound: (lat: number, lng: number, address: string) => void;
};

export default function AddressSearch({ onLocationFound }: Props) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = useCallback(async () => {
    if (!address.trim()) return;

    setLoading(true);
    setError("");

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=ja`
      );
      const data = await res.json();

      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const formattedAddress = data.results[0].formatted_address;
        onLocationFound(lat, lng, formattedAddress);
      } else {
        setError("住所が見つかりませんでした。もう少し詳しい住所を入力してください。");
      }
    } catch {
      setError("住所の検索に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [address, onLocationFound]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        住所を入力
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="例: 東京都渋谷区神宮前1-1-1"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !address.trim()}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "検索中..." : "検索"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
