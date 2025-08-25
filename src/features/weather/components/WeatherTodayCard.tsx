"use client";

import { getCharacterImage } from "@/features/weather/utils/weatherCharacterMap";
import { WeatherInfoDto } from "@/lib/backend/apiV1/weatherService";
import WeatherCharacter from "./WeatherCharacter";
import WeatherDetailCards from "./WeatherDetailCards";
import { Navigation } from "lucide-react";
import Link from "next/link";

/**
 * 오늘 날씨 정보를 표시하는 메인 카드 컴포넌트
 *
 * @description
 * - 현재 온도, 날씨 상태, 최고/최저 온도를 표시
 * - 날씨에 따른 캐릭터 이미지를 우측에 배치
 * - 하단에 상세 날씨 정보 카드들을 포함
 *
 * @param weather - 표시할 날씨 정보 객체
 * @returns 날씨 정보 카드 JSX
 */
export default function WeatherTodayCard({
  weather,
  isCurrentLocation,
}: {
  weather: WeatherInfoDto;
  isCurrentLocation?: boolean;
}) {
  // 날씨 상태에 따른 테마 정보 가져오기 (기본값: DEFAULT)
  const characterImage = getCharacterImage(
    weather.feelsLikeTemperature,
    weather.weather
  );

  return (
    <div className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] px-3 pt-6 pb-12 pb-[73px]">
      <div className="flex justify-between items-center gap-6 px-3">
        {/* 왼쪽: 날씨 정보 섹션 */}
        <div className="flex flex-col gap-1">
          {/* 지역명 */}
          <p className="text-lg font-medium flex items-center gap-1">
            {weather.location}
            {isCurrentLocation && <Navigation size={16} />}
          </p>
          {/* 날짜 */}
          <p className="text-sm text-white/80">{weather.date}</p>
          {/* 현재 체감 온도 (가장 큰 텍스트) */}
          <h1 className="text-6xl font-bold mt-1">
            {Math.round(weather.feelsLikeTemperature)}°
          </h1>
          {/* 날씨 설명 */}
          <p className="text-base mt-2">
            {weather.weatherDescription || "날씨 정보 없음"}
          </p>
          {/* 최고/최저 온도 */}
          <p className="text-sm">
            최고 {Math.round(weather.maxTemperature)}° / 최저{" "}
            {Math.round(weather.minTemperature)}°
          </p>
          {/* 체감 온도 */}
          <p className="text-sm">
            체감 온도 {Math.round(weather.feelsLikeTemperature)}°
          </p>
        </div>

        {/* 오른쪽: 날씨 캐릭터 이미지 */}
        <div className="w-32 h-[180px] flex-shrink-0 flex items-end justify-center overflow-hidden">
          <Link href="/clothdetail">
            <WeatherCharacter src={characterImage} />
          </Link>
        </div>
      </div>

      {/* 하단: 상세 날씨 정보 카드들 */}
      <WeatherDetailCards weather={weather} />
    </div>
  );
}
