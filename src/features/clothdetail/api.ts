// src/features/clothdetail/api.ts
import api from "@/lib/api";

export type OutfitCategory = "TOP" | "BOTTOM" | "OUTER" | "SHOES" | string;

export interface OutfitItem {
  clothName: string;
  imageUrl: string;
  category: OutfitCategory;
  style: "CASUAL_DAILY" | "FORMAL_OFFICE" | "OUTDOOR" | "DATE_LOOK" | string | null;
  material: string | null;
  maxFeelsLike: number | null;
  minFeelsLike: number | null;
  id: number;
  createDate: string;
  modifyDate: string;
}

export type OutfitMap = Record<OutfitCategory, OutfitItem[]>;

export interface WeatherInfo {
  weather: string; // e.g. "SCATTERED_CLOUDS"
  dailyTemperatureGap: number;
  feelsLikeTemperature: number;
  maxTemperature: number;
  minTemperature: number;
  location: string; // e.g. "서울"
  date: string; // "YYYY-MM-DD"
  description: string; // "흩어진 구름"
  pop: number;
  rain: number;
  snow: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  uvi: number;
  id: number;
  createDate: string;
  modifyDate: string;
  isValid: boolean;
}

type ClothDetailResponse = {
  weatherInfo: WeatherInfo;
  recommendedOutfits: OutfitMap;
  notRecommendedOutfits: OutfitMap;
};

export async function fetchClothDetails(
  latitude: number,
  longitude: number
): Promise<{
  weatherData: WeatherInfo;
  recommendedOutfits: OutfitMap;
  notRecommendedOutfits: OutfitMap;
}> {
  const res = await api.get<ClothDetailResponse>("/api/v1/cloth/details", {
    params: { latitude, longitude },
    headers: { accept: "*/*" },
  });

  const data = res.data;

  return {
    weatherData: data.weatherInfo,
    recommendedOutfits: data.recommendedOutfits,
    notRecommendedOutfits: data.notRecommendedOutfits,
  };
}
