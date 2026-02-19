import { NextRequest, NextResponse } from "next/server";

const DATA_LAYERS_BASE = "https://solar.googleapis.com/v1/dataLayers:get";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius") || "50";

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat と lng パラメータが必要です" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    return NextResponse.json(
      { error: "Google Maps API Key が設定されていません" },
      { status: 500 }
    );
  }

  const url = `${DATA_LAYERS_BASE}?location.latitude=${lat}&location.longitude=${lng}&radiusMeters=${radius}&view=IMAGERY_AND_ALL_FLUX_LAYERS&requiredQuality=MEDIUM&pixelSizeMeters=0.5&key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("DataLayers API error:", response.status, errorData);
      return NextResponse.json(
        { error: "データレイヤーの取得に失敗しました" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("DataLayers API fetch error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
