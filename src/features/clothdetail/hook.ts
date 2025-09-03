// src/features/clothdetail/hook.ts
import { useEffect, useState } from "react";
import { fetchClothDetails, WeatherInfo, OutfitMap } from "./api";

export function useClothDetailData() {
  const [weatherData, setWeatherData] = useState<WeatherInfo | null>(null);
  const [recommendedOutfits, setRecommendedOutfits] = useState<OutfitMap>({});
  const [notRecommendedOutfits, setNotRecommendedOutfits] = useState<OutfitMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function fetchData(latitude: number, longitude: number) {
      fetchClothDetails(latitude, longitude)
        .then((data) => {
          setWeatherData(data.weatherData);
          setRecommendedOutfits(data.recommendedOutfits);
          setNotRecommendedOutfits(data.notRecommendedOutfits);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to load data");
          setLoading(false);
        });
    }

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported. Using fallback location.");
      fetchData(37.5665, 126.9780); // 서울
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        fetchData(lat, lon);
      },
      (err) => {
        console.warn("❌ 위치 에러, fallback 사용:", err);
        fetchData(37.5665, 126.9780);
      }
    );
  }, []);

  return { weatherData, recommendedOutfits, notRecommendedOutfits, loading, error };
}
