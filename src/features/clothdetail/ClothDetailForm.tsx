"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/common/Card";
import BackgroundLayout from "@/components/layout/BackgroundLayout";
import Nav from "@/components/layout/NavBar";
import {
  Sun,
  ThermometerSnowflake,
  ThermometerSun,
  CloudLightning,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudFog,
  Cloud,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useClothDetailData } from "@/features/clothdetail/hook";

const CategorySlider = dynamic(() => import("@/components/common/CategorySlider"), { ssr: false });

function getWeatherIconByKey(key: string) {
  const k = (key || "").toUpperCase();
  if (k.includes("THUNDER")) return <CloudLightning className="text-yellow-300 w-20 h-20" />;
  if (k.includes("DRIZZLE")) return <CloudDrizzle className="text-blue-300 w-20 h-20" />;
  if (k.includes("RAIN")) return <CloudRain className="text-blue-500 w-20 h-20" />;
  if (k.includes("SNOW")) return <CloudSnow className="text-white w-20 h-20" />;
  if (k.includes("FOG") || k.includes("MIST") || k.includes("HAZE")) return <CloudFog className="text-gray-400 w-20 h-20" />;
  if (k.includes("CLOUD")) return <Cloud className="text-gray-300 w-20 h-20" />;
  if (k.includes("CLEAR")) return <Sun className="text-yellow-400 w-20 h-20" />;
  return <Sun className="text-yellow-300 w-20 h-20" />;
}

const labelMap: Record<string, string> = {
  TOP: "상의",
  BOTTOM: "하의",
  OUTER: "아우터",
  SHOES: "신발",
  CASUAL_DAILY: "캐주얼",
  FORMAL_OFFICE: "오피스룩",
  OUTDOOR: "야외활동",
  DATE_LOOK: "데이트룩",
  UNSPECIFIED: "기타",
};

export default function ClothDetailForm() {
  const { weatherData, recommendedOutfits, notRecommendedOutfits, loading, error } =
    useClothDetailData();

  const [mode, setMode] = useState<"recommended" | "not">("recommended");

  useEffect(() => {
    if (weatherData) {
      // console.log("feelsLike:", weatherData.feelsLikeTemperature);
    }
  }, [weatherData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen bg-gray-100">
        Loading...
      </div>
    );
  }
  if (error || !weatherData) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen bg-gray-100">
        <span className="text-red-500">{error || "데이터 없음"}</span>
      </div>
    );
  }

  const feelsLike = weatherData.feelsLikeTemperature;

  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-100">
      <BackgroundLayout>
        <div className="bg-[#97d2e8] w-[390px] min-h-screen">
          <div className="relative min-h-screen">
            {/* 상단 */}
            <div className="absolute top-[74px] left-1/2 -translate-x-1/2 font-bold text-2xl text-white">
              {weatherData.location}
            </div>

            <Card
              className="absolute w-[308px] h-[140px] top-[169px] left-1/2 -translate-x-1/2 p-0 bg-[#ffffff33] rounded-[15px] border-none"
              style={{ boxShadow: "15px 4px 16.3px 0 rgba(0, 0, 0, 0.25)" }}
            >
              <div className="p-0 h-full relative">
                <div className="absolute top-[14px] left-[169px] text-xl text-white">
                  {weatherData.description}
                </div>
                <div className="absolute w-[110px] h-[107px] top-[20px] left-[14px] flex items-center justify-center">
                  {getWeatherIconByKey(weatherData.weather)}
                </div>
                <div className="absolute w-[136px] h-[86px] top-[20px] left-[160px]">
                  <div className="relative w-[136px] h-[86px]">
                    <div className="absolute top-[15px] text-8xl text-white">
                      {Math.floor(feelsLike)}
                    </div>
                    <div className="absolute w-6 h-6 top-[23px] left-[108px] rounded-xl border-[5px] border-white" />
                  </div>
                </div>
              </div>
            </Card>

            <div className="absolute flex items-center space-x-6 top-[339px] left-1/2 -translate-x-1/2 text-white">
              <div className="flex items-center">
                <ThermometerSun className="w-6 h-6 text-red-500" />
                <div className="ml-2 text-base">{Math.floor(weatherData.maxTemperature)}</div>
                <div className="w-[5px] h-[5px] ml-1 rounded-[2.5px] border border-white" />
              </div>
              <div className="flex items-center">
                <ThermometerSnowflake className="w-[22px] h-[22px] text-blue-500" />
                <div className="ml-2 text-base">{Math.floor(weatherData.minTemperature)}</div>
                <div className="w-[5px] h-[5px] ml-1 rounded-[2.5px] border border-white" />
              </div>
            </div>

            {/* 탭: 추천 / 비추천 (한 번에 하나만 표시) */}
            <div className="absolute top-[367px] left-1/2 -translate-x-1/2 w-full flex justify-center z-10">
              <div style={{ maxWidth: 390 }} className="w-full flex flex-col items-center gap-5 pb-28">
                <div className="mx-auto mb-1 flex w-[350px] overflow-hidden rounded-full bg-white/60 backdrop-blur border border-white/60">
                  <button
                    className={`flex-1 py-2 text-sm font-medium transition ${
                      mode === "recommended" ? "bg-white text-gray-900" : "text-gray-700"
                    }`}
                    onClick={() => setMode("recommended")}
                  >
                    추천
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium transition ${
                      mode === "not" ? "bg-white text-gray-900" : "text-gray-700"
                    }`}
                    onClick={() => setMode("not")}
                  >
                    비추천
                  </button>
                </div>

                {mode === "recommended" ? (
                  <CategorySlider
                    itemsMap={recommendedOutfits}
                    categoryNameMap={labelMap}
                    title="추천"
                    feelsLike={feelsLike}
                    hideUnspecifiedStyles
                    hideExtraPlaceholder
                  />
                ) : (
                  <CategorySlider
                    itemsMap={notRecommendedOutfits}
                    categoryNameMap={labelMap}
                    title="비추천"
                    feelsLike={feelsLike}
                    hideUnspecifiedStyles
                    hideExtraPlaceholder
                  />
                )}
              </div>
            </div>

            <Nav />
          </div>
        </div>
      </BackgroundLayout>
    </div>
  );
}
