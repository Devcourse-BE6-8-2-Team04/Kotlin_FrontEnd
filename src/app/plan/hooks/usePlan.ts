
'use client';

import { useState } from 'react';
import {
  ClothApiResponse,
  GeoApiResponse,
  WeatherApiResponse,
} from '@/app/plan/types';

export const usePlan = () => {
  const [destination, setDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [clothData, setClothData] = useState<ClothApiResponse | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(
    null,
  );
  const [locationName, setLocationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setClothData(null);
    setWeatherData(null);
    setLocationName('');

    if (!destination || !checkInDate || !checkOutDate) {
      setError('모든 필드를 채워주세요.');
      return;
    }

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (daysDiff > 30) {
      setError('최대 30일까지 조회할 수 있습니다.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const geoResponse = await fetch(
        `/api/v1/geos?location=${encodeURIComponent(destination)}`,
      );
      if (!geoResponse.ok) {
        throw new Error(`Geos API error! status: ${geoResponse.status}`);
      }
      const geoData: GeoApiResponse = await geoResponse.json();
      if (!geoData || geoData.length === 0) {
        throw new Error('해당 위치를 찾을 수 없습니다.');
      }
      const locationInfo = geoData[0];
      setLocationName(locationInfo.localName);

      const clothParams = new URLSearchParams({
        location: locationInfo.name,
        start: checkInDate,
        end: checkOutDate,
        lat: locationInfo.lat.toString(),
        lon: locationInfo.lon.toString(),
      });
      const weatherParams = new URLSearchParams({
        location: locationInfo.name,
        start: checkInDate,
        end: checkOutDate,
        lat: locationInfo.lat.toString(),
        lon: locationInfo.lon.toString(),
      });

      const [clothResponse, weatherResponse] = await Promise.all([
        fetch(`/api/v1/cloth?${clothParams.toString()}`),
        fetch(`/api/v1/weathers/location?${weatherParams.toString()}`),
      ]);

      if (!clothResponse.ok || !weatherResponse.ok) {
        const errorResponse = await (clothResponse.ok
          ? weatherResponse
          : clothResponse
        ).json();
        throw new Error(
          errorResponse.msg ||
            `API error! cloth: ${clothResponse.status}, weather: ${weatherResponse.status}`,
        );
      }

      const [clothResult, weatherResult] = await Promise.all([
        clothResponse.json(),
        weatherResponse.json(),
      ]);

      setClothData(clothResult);
      setWeatherData(weatherResult);
    } catch (err: unknown) {
      console.error('API 요청 에러:', err);
      if (err instanceof Error) {
        setError(err.message || 'API 요청에 실패했습니다. 다시 시도해주세요.');
      } else {
        setError('API 요청에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    destination,
    setDestination,
    checkInDate,
    setCheckInDate,
    checkOutDate,
    setCheckOutDate,
    clothData,
    weatherData,
    locationName,
    isLoading,
    error,
    handleConfirm,
  };
};
