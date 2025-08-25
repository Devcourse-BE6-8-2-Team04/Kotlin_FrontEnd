"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { getBackgroundImage } from "@/features/weather/utils/weatherBackgroundMap";
import WeatherTodayCard from "./WeatherTodayCard";
import {
  getWeeklyWeather,
  type WeatherInfoDto,
} from "@/lib/backend/apiV1/weatherService";

/**
 * 주간 날씨 예보를 스와이프로 볼 수 있는 컴포넌트
 *
 * @description
 * - Swiper.js를 사용한 슬라이드 기능
 * - 각 날짜별 날씨 정보를 개별 슬라이드로 표시
 * - 날씨 테마에 따른 배경 이미지 적용
 * - 페이지네이션 도트로 현재 슬라이드 표시
 * - 전체 화면 높이 기반 레이아웃
 * - 실제 API를 통한 날씨 데이터 조회
 * - 사용자 현재 위치 기반 날씨 정보 요청
 */
export default function WeeklyForecastSwiper() {
  // 날씨 데이터 상태
  const [weatherData, setWeatherData] = useState<WeatherInfoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [locationSource, setLocationSource] = useState<
    "current" | "search" | "fallback" | null
  >(null);

  // 사용자 현재 위치 가져오기 (나중에 수정 예정)
  const getUserLocation = (): Promise<{
    lat: number;
    lon: number;
    isFallback: boolean;
  }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        // 위치 정보를 지원하지 않는 경우 기본값 반환
        resolve({ lat: 37.5665, lon: 126.978, isFallback: true }); // 서울 좌표
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lon: longitude, isFallback: false });
        },
        (error) => {
          console.warn("위치 정보를 가져올 수 없습니다:", error);

          // 첫 진입 시 한 번만 alert
          if (!sessionStorage.getItem("locationAlertShown")) {
            alert("위치 정보를 불러올 수 없습니다.");
            sessionStorage.setItem("locationAlertShown", "true");
          }

          // 에러 시 기본값 반환
          resolve({ lat: 37.5665, lon: 126.978, isFallback: true }); // 서울 좌표
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분
        }
      );
    });
  };

  // 컴포넌트 마운트 시 날씨 데이터 로드
  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 사용자 현재 위치 가져오기
        const location = await getUserLocation();
        setCurrentLocation(location);
        if (location.isFallback) {
          setLocationSource("fallback");
          (window as any).__currentWeatherSource = "fallback";
        } else {
          setLocationSource("current");
          (window as any).__currentWeatherSource = "current";
        }

        const data = await getWeeklyWeather(location.lat, location.lon);
        setWeatherData(data);
      } catch (err) {
        console.error("날씨 데이터 로드 실패:", err);
        setError("날씨 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, []);

  // 날씨 데이터 업데이트 이벤트 리스너
  useEffect(() => {
    const handleWeatherUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        weatherData: WeatherInfoDto[];
        source: "current" | "search";
      }>;
      try {
        setLoading(true);
        setError(null);
        setWeatherData(customEvent.detail.weatherData);
        setLocationSource(customEvent.detail.source);
        (window as any).__currentWeatherSource = customEvent.detail.source;
      } catch (err) {
        console.error("날씨 데이터 업데이트 실패:", err);
        setError("날씨 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener("weather:update", handleWeatherUpdate);

    return () => {
      window.removeEventListener("weather:update", handleWeatherUpdate);
    };
  }, []);

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>날씨 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (weatherData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p>날씨 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen overflow-y-auto">
      {/* 페이지네이션 도트 (상단 고정 위치) */}
      <div className="absolute top-10 left-0 w-full flex justify-center z-20">
        <div className="swiper-pagination" />
      </div>

      {/* Swiper 슬라이더 */}
      <Swiper
        slidesPerView={1} // 한 번에 하나의 슬라이드만 표시
        modules={[Pagination]} // 페이지네이션 모듈 사용
        pagination={{
          clickable: true, // 도트 클릭으로 슬라이드 이동 가능
          el: ".swiper-pagination", // 페이지네이션 요소 지정
        }}
        className="w-screen min-h-screen"
      >
        {/* 각 날짜별 날씨 슬라이드 */}
        {weatherData.map((day) => {
          const backgroundImage = getBackgroundImage(day.weather);
          const isCurrent = locationSource === "current";

          return (
            <SwiperSlide key={day.id}>
              {/* 배경 이미지가 적용된 슬라이드 컨테이너 */}
              <div
                className="min-h-screen bg-cover bg-center"
                style={{ backgroundImage: `url(${backgroundImage})` }}
              >
                {/* 어두운 반투명 오버레이 */}
                <div className="absolute inset-0 bg-black/10 z-0" />

                {/* 날씨 정보 카드 컨테이너 */}
                <div className="min-h-screen px-4 py-6 max-w-md mx-auto pt-10 bg-black/10">
                  <WeatherTodayCard
                    weather={day}
                    isCurrentLocation={isCurrent}
                  />
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
