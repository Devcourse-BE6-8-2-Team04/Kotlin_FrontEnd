"use client";

import { WeatherInfoDto } from "@/lib/backend/apiV1/weatherService";
import WeatherInfoCard from "./WeatherInfoCard";
import { Wind, Droplet, Gauge, Umbrella } from "lucide-react";

/**
 * 풍속에 따른 바람 강도 설명을 반환하는 유틸리티 함수
 *
 * @param speed - 풍속 (m/s)
 * @returns 바람 강도 설명 문자열
 */
function getWindFeeling(speed: number): string {
  if (speed < 0.3) return "바람 없음";
  if (speed < 1.6) return "실바람";
  if (speed < 3.4) return "약한 바람";
  if (speed < 5.5) return "산들바람";
  if (speed < 8.0) return "조금 강한 바람";
  if (speed < 10.8) return "강한 바람";
  return "매우 강한 바람";
}

/**
 * 풍향 각도를 16방위로 변환하는 유틸리티 함수
 *
 * @param deg - 풍향 각도 (0-360도)
 * @returns 16방위 문자열 (N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW)
 */
function getWindDirectionLabel(deg?: number): string {
  if (deg === undefined) return "";
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

/**
 * 자외선 지수에 따른 위험도를 반환하는 유틸리티 함수
 *
 * @param uvi - 자외선 지수
 * @returns 위험도 정보 객체
 */
function getUVInfo(uvi: number) {
  if (uvi < 3) return { level: "낮음" };
  if (uvi < 6) return { level: "보통" };
  if (uvi < 8) return { level: "높음" };
  if (uvi < 11) return { level: "매우 높음" };
  return { level: "위험" };
}

/**
 * 습도에 따른 쾌적도 정보를 반환하는 유틸리티 함수
 *
 * @param humidity - 습도 (%)
 * @returns 쾌적도 정보 객체 (레이블과 색상)
 */
function getHumidityInfo(humidity: number) {
  if (humidity < 30) return { label: "건조", color: "bg-blue-300" };
  if (humidity < 60) return { label: "쾌적", color: "bg-green-400" };
  if (humidity < 80) return { label: "약간 습함", color: "bg-yellow-400" };
  return { label: "매우 습함", color: "bg-red-400" };
}

/**
 * 상세 날씨 정보를 카드 형태로 표시하는 컴포넌트
 *
 * @description
 * - 강수 정보: 강수 확률, 강수량, 적설량
 * - 바람 정보: 풍속, 풍향, 바람 강도
 * - 자외선 지수: UV 지수와 위험도
 * - 습도: 습도 퍼센트와 쾌적도
 *
 * @param weather - 표시할 날씨 정보 객체
 * @returns 상세 날씨 정보 카드들 JSX
 */
export default function WeatherDetailCards({
  weather,
}: {
  weather: WeatherInfoDto;
}) {
  // 날씨 정보에서 필요한 데이터 추출
  const { uvi, humidity, pop, rain, snow, windDeg, windSpeed } = weather;

  // 자외선 지수와 습도 정보 계산
  const uv = uvi !== undefined ? getUVInfo(uvi) : undefined;
  const hum = humidity !== undefined ? getHumidityInfo(humidity) : undefined;

  return (
    <div className="grid grid-cols-2 gap-3 px-2 mt-6">
      {/* 🌧 강수 정보 카드 (전체 너비) */}
      {(pop !== undefined || rain !== undefined || snow !== undefined) && (
        <div className="col-span-2">
          <WeatherInfoCard
            icon={<Umbrella size={18} />}
            title="강수 정보"
            value={
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-white">
                  {pop !== undefined ? `${Math.round(pop * 100)}%` : "-"}
                </span>
              </div>
            }
            description={
              <div className="mt-2 space-y-2">
                {/* 강수 확률 진행바 */}
                {pop !== undefined && (
                  <div className="w-full h-2 bg-white/20 rounded">
                    <div
                      className="h-2 bg-blue-400 rounded"
                      style={{ width: `${Math.round(pop * 100)}%` }}
                    />
                  </div>
                )}
                {/* 강수량과 적설량 정보 */}
                <div className="flex gap-4 text-sm text-white/90">
                  <div>강수량: {rain ?? 0} mm</div>
                  <div>적설량: {snow ?? 0} mm</div>
                </div>
              </div>
            }
          />
        </div>
      )}

      {/* 🌬 바람 정보 카드 (전체 너비) */}
      {windSpeed !== undefined && (
        <div className="col-span-2">
          <WeatherInfoCard
            icon={<Wind size={18} />}
            title="바람"
            description={
              <div className="grid grid-cols-2 gap-2 items-center mt-2">
                {/* 왼쪽: 바람 정보 텍스트 */}
                <div className="text-sm space-y-1 flex flex-col">
                  <span className="text-lg font-semibold text-white">
                    {getWindFeeling(windSpeed)}
                  </span>
                  <div>풍속: {windSpeed} m/s</div>
                  <div>
                    풍향: {windDeg}° {getWindDirectionLabel(windDeg)}
                  </div>
                </div>

                {/* 오른쪽: 나침반 시각화 */}
                <div className="flex justify-center">
                  <div className="relative w-24 h-24 rounded-full border border-white flex items-center justify-center">
                    {/* 4방향 표시 */}
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs text-white/70">
                      N
                    </span>
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-white/70">
                      S
                    </span>
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-white/70">
                      W
                    </span>
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-white/70">
                      E
                    </span>
                    {/* 풍향 화살표 */}
                    <div
                      className="absolute top-1/2 left-1/2 text-lg text-white origin-center"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${
                          (windDeg ?? 0) + 90
                        }deg)`,
                      }}
                    >
                      ➤
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      )}

      {/* 🌞 자외선 지수 카드 */}
      {uvi !== undefined && uv && (
        <WeatherInfoCard
          icon={<Gauge size={18} />}
          title="자외선 지수"
          value={
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-white">{uvi}</span>
              <span className="text-sm text-white/70">{uv.level}</span>
            </div>
          }
          description={
            <div className="mt-2 relative">
              {/* 자외선 지수 진행바 (색상 그라데이션) */}
              <div className="w-full h-2 rounded-full bg-gradient-to-r from-blue-400 via-yellow-400 to-red-500" />
              {/* 현재 자외선 지수 표시 마커 */}
              <div
                className="absolute top-1/2 w-4 h-4 rounded-full border border-white bg-white"
                style={{
                  left: `${(uvi / 11) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          }
        />
      )}

      {/* 💧 습도 카드 */}
      {humidity !== undefined && hum && (
        <WeatherInfoCard
          icon={<Droplet size={18} />}
          title="습도"
          value={
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-white">
                {humidity}%
              </span>
              <span className="text-sm text-white/70">{hum.label}</span>
            </div>
          }
          description={
            <div className="w-full h-2 rounded-full mt-2">
              {/* 습도 진행바 (쾌적도에 따른 색상) */}
              <div className={`h-2 rounded ${hum.color}`} />
            </div>
          }
        />
      )}
    </div>
  );
}
