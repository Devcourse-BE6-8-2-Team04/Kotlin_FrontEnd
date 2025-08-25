"use client";
import React, { useEffect } from "react";
import Card from "@/components/common/Card";
import { BACKGROUNDS, weatherBackgroundMap } from "@/features/weather/utils/weatherBackgroundMap";
import { getBackgroundImage } from "@/features/weather/utils/weatherBackgroundMap"; 
import BackgroundLayout from "@/components/layout/BackgroundLayout";
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
import { useClothDetailData } from "@/features/clothdetail/hook";
import Nav from "@/components/layout/NavBar";
import dynamic from "next/dynamic";

const CategorySlider = dynamic(() => import("@/components/common/CategorySlider"), {
  ssr: false,
});

function getWeatherIconByCode(code: number) {
  if (code >= 200 && code < 300) return <CloudLightning className="text-yellow-300 w-20 h-20" />;
  if (code >= 300 && code < 400) return <CloudDrizzle className="text-blue-300 w-20 h-20" />;
  if (code >= 500 && code < 600) return <CloudRain className="text-blue-500 w-20 h-20" />;
  if (code >= 600 && code < 700) return <CloudSnow className="text-white w-20 h-20" />;
  if (code >= 700 && code < 800) return <CloudFog className="text-gray-400 w-20 h-20" />;
  if (code === 800) return <Sun className="text-yellow-400 w-20 h-20" />;
  if (code > 800 && code < 900) return <Cloud className="text-gray-300 w-20 h-20" />;
  if (code === 900) return <ThermometerSun className="text-red-500 w-20 h-20" />;

  console.warn(`Unknown weather code: ${code}`);
  return <Sun className="text-yellow-300 w-20 h-20" />;
}

export default function Screen() {
  const { weatherData, clothingItems, extraClothingItems } = useClothDetailData();

  useEffect(() => {
    if (weatherData) {
      console.log("weather:", weatherData.weather);
console.log("mapped key:", weatherBackgroundMap[weatherData.weather]);
console.log("background path:", BACKGROUNDS[weatherBackgroundMap[weatherData.weather] ?? 'DEFAULT']);
    }
  }, [weatherData]);

  const groupedByCategory: Record<
    string,
    { clothName: string; imageUrl: string; category: string }[]
  > = clothingItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof clothingItems>);

  Object.keys(groupedByCategory).forEach((category) => {
    groupedByCategory[category] = [
      ...groupedByCategory[category],
      ...extraClothingItems.map((extra) => ({
        clothName: extra.clothName,
        imageUrl: extra.imageUrl,
        category: category,
      })),
    ];
  });

  const categoryNameMap = {
    CASUAL_DAILY: "캐주얼",
    FORMAL_OFFICE: "오피스룩",
    OUTDOOR: "야외활동",
    DATE_LOOK: "데이트룩",
  };


  
  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-100">
      <BackgroundLayout 
        backgroundImage={
          weatherData 
            ? BACKGROUNDS[weatherBackgroundMap[weatherData.weather] ?? 'DEFAULT'] 
            : undefined
        }
      >
        <div className="bg-[#97d2e8] w-[390px] h-[844px]">
          <div className="relative h-[844px]">
            {weatherData && (
              <>
                {/* 도시명 */}
                <div className="top-[74px] left-[161px] font-bold text-2xl absolute text-white">
                  {weatherData.location}
                </div>

                {/* 메인 카드 - 체감 온도와 날씨 */}
                <Card
                  className="absolute w-[308px] h-[140px] top-[169px] left-[41px] p-0 bg-[#ffffff33] rounded-[15px] border-none"
                  style={{ boxShadow: "15px 4px 16.3px 0 rgba(0, 0, 0, 0.25)" }}
                >
                  <div className="p-0 h-full relative">
                    {/* 날씨 설명 */}
                    <div className="top-[14px] left-[169px] text-xl absolute text-white">
                      {weatherData.weatherDescription}
                    </div>

                    {/* 아이콘 */}
                    <div className="absolute w-[110px] h-[107px] top-[20px] left-[14px] flex items-center justify-center">
                      {getWeatherIconByCode(weatherData.weatherCode)}
                    </div>

                    {/* 체감 온도 */}
                    <div className="absolute w-[136px] h-[86px] top-[20px] left-[160px]">
                      <div className="relative w-[136px] h-[86px]">
                        <div className="top-[15px] text-8xl absolute text-white">
                          {Math.floor(weatherData.feelsLikeTemperature)}
                        </div>
                        <div className="w-6 h-6 top-[23px] left-[108px] rounded-xl border-[5px] border-white absolute" />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 최고/최저 온도 */}
                <div className="absolute flex items-center space-x-4 top-[339px] left-[55px]">
                  <div className="flex items-center">
                    <ThermometerSun className="w-6 h-6 text-red-500" />
                    <div className="ml-2 text-base text-white">
                      {Math.floor(weatherData.maxTemperature)}
                    </div>
                    <div className="w-[5px] h-[5px] ml-1 rounded-[2.5px] border border-white" />
                  </div>
                  <div className="flex items-center">
                    <ThermometerSnowflake className="w-[22px] h-[22px] text-blue-500" />
                    <div className="ml-2 text-base text-white">
                      {Math.floor(weatherData.minTemperature)}
                    </div>
                    <div className="w-[5px] h-[5px] ml-1 rounded-[2.5px] border border-white" />
                  </div>
                </div>
              </>
            )}

            {/* 슬라이더 및 네비게이션 */}
            <div
              className="fixed top-[367px] left-0 w-screen h-[375px] z-10 flex justify-center overflow-hidden"
              style={{ maxWidth: "390px", margin: "0 auto", left: "50%", transform: "translateX(-50%)" }}
            >
              <CategorySlider groupedItems={groupedByCategory} categoryNameMap={categoryNameMap} />
            </div>
            <Nav />
          </div>
        </div>
      </BackgroundLayout>
    </div>
  );
}