import { apiFetch } from "../client";
import type { components, operations } from "./schema";

// 타입 정의
export type WeatherInfoDto = components["schemas"]["WeatherInfoDto"];
export type GeoLocationDto = components["schemas"]["GeoLocationDto"];

/**
 * 주간 날씨 정보를 조회하는 API
 * 
 * @param lat - 위도
 * @param lon - 경도
 * @returns 주간 날씨 정보 배열
 */
export const getWeeklyWeather = async (
  lat: number,
  lon: number
): Promise<WeatherInfoDto[]> => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  });

  return apiFetch(`/api/v1/weathers?${params}`);
};

/**
 * 특정 날짜의 날씨 정보를 조회하는 API
 * 
 * @param date - 날짜 (YYYY-MM-DD 형식)
 * @param lat - 위도
 * @param lon - 경도
 * @returns 특정 날짜의 날씨 정보
 */
export const getWeatherByDate = async (
  date: string,
  lat: number,
  lon: number
): Promise<WeatherInfoDto> => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  });

  return apiFetch(`/api/v1/weathers/${date}?${params}`);
};

/**
 * 위치별 날씨 정보를 조회하는 API
 * 
 * @param location - 위치명
 * @param lat - 위도
 * @param lon - 경도
 * @param start - 시작 날짜
 * @param end - 종료 날짜
 * @returns 위치별 날씨 정보 배열
 */
export const getWeatherByLocation = async (
  location: string,
  lat: number,
  lon: number,
  start: string,
  end: string
): Promise<WeatherInfoDto[]> => {
  const params = new URLSearchParams({
    location,
    lat: lat.toString(),
    lon: lon.toString(),
    start,
    end,
  });

  return apiFetch(`/api/v1/weathers/location?${params}`);
};

/**
 * 도시 이름으로 지역 정보를 조회하는 API
 * 
 * @param location - 도시 이름
 * @returns 지역 정보 배열
 */
export const getGeoLocations = async (
  location: string
): Promise<GeoLocationDto[]> => {
  const params = new URLSearchParams({
    location,
  });

  return apiFetch(`/api/v1/geos?${params}`);
}; 