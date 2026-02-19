import { NextRequest, NextResponse } from "next/server";

const SOLAR_API_BASE = "https://solar.googleapis.com/v1/buildingInsights:findClosest";

async function fetchSolarAPI(lat: string, lng: string, apiKey: string, quality: string) {
  const url = `${SOLAR_API_BASE}?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=${quality}&key=${apiKey}`;
  return fetch(url);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

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

  try {
    // HIGH品質で試行 → 404ならMEDIUMにフォールバック
    let response = await fetchSolarAPI(lat, lng, apiKey, "HIGH");
    let quality = "HIGH";

    if (response.status === 404) {
      response = await fetchSolarAPI(lat, lng, apiKey, "MEDIUM");
      quality = "MEDIUM";
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Solar API error:", response.status, errorData);

      if (response.status === 404) {
        return NextResponse.json(
          { error: "この場所の建物データが見つかりませんでした。別の住所を試してください。" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "建物情報の取得に失敗しました" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ ...data, _imageryQuality: quality });
  } catch (error) {
    console.error("Solar API fetch error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
