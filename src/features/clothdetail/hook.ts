import { useEffect, useState } from "react";
import { fetchClothDetails, ClothItem, ExtraCloth, WeatherInfo } from "./api";

export function useClothDetailData() {
  const [weatherData, setWeatherData] = useState<WeatherInfo | null>(null);
  const [clothingItems, setClothingItems] = useState<ClothItem[]>([]);
  const [extraClothingItems, setExtraClothingItems] = useState<ExtraCloth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function fetchData(latitude: number, longitude: number) {
      fetchClothDetails(latitude, longitude)
        .then((data) => {
          setWeatherData(data.weatherData);
          setClothingItems(data.clothingItems);
          setExtraClothingItems(data.extraClothingItems);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Failed to load data");
          setLoading(false);
        });
    }

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported. Using fallback location.");
      fetchData(37.5665, 126.9780);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        console.log("✅ 위치 정보:", lat, lon);
        fetchData(lat, lon);
      },
      (err) => {
        console.warn("❌ 위치 에러, fallback 사용:", err);
        fetchData(37.5665, 126.9780);
      }
    );
  }, []);

  return { weatherData, clothingItems, extraClothingItems, loading, error };
}
