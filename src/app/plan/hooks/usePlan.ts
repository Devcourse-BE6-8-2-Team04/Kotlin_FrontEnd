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
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [locationName, setLocationName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // next.config.ts 의 rewrites 사용 중이면 비워둠
  const API_BASE = '';

  const getJsonOrText = async (res: Response) => {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await res.json(); } catch { return {}; }
    }
    try { return await res.text(); } catch { return ''; }
  };

  const handleConfirm = async () => {
    setError(null);
    setClothData(null);
    setWeatherData(null);
    setLocationName('');

    const keyword = destination.trim();
    if (!keyword || !checkInDate || !checkOutDate) {
      setError('모든 필드를 채워주세요.');
      return;
    }

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    if (daysDiff > 30) {
      setError('최대 30일까지 조회할 수 있습니다.');
      return;
    }

    setIsLoading(true);
    try {
      // 1) 지오 조회 (공개)
      const geoRes = await fetch(
        `${API_BASE}/api/v1/geos?location=${encodeURIComponent(keyword)}`,
        { credentials: 'include' }
      );
      if (!geoRes.ok) {
        const body = await getJsonOrText(geoRes);
        const msg = typeof body === 'string' ? body : (body as any).msg || '';
        throw new Error(`Geos API error! status: ${geoRes.status} ${msg}`);
      }
      const geoData: GeoApiResponse = await geoRes.json();
      if (!geoData || geoData.length === 0) {
        throw new Error('해당 위치를 찾을 수 없습니다.');
      }
      const locationInfo = geoData[0];
      setLocationName(locationInfo.localName);

      // 2) 인증 헤더 준비 (JWT 사용 시)
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const headers = new Headers();
      if (token) headers.set('Authorization', `Bearer ${token}`);

      // 3) cloth 파라미터 (백엔드 시그니처와 동일 키)
      const clothParams = new URLSearchParams({
        location: locationInfo.name,
        startDate: checkInDate,
        endDate: checkOutDate,
        latitude: locationInfo.lat.toString(),
        longitude: locationInfo.lon.toString(),
      });
      const clothUrl = `${API_BASE}/api/v1/cloth?${clothParams.toString()}`;

      // 3-1) weather 파라미터 - 다양한 스펙 폴백
      const weatherBase = `${API_BASE}/api/v1/weathers/location`;
      const weatherCandidates: string[] = [];

      // A. cloth와 동일 키
      weatherCandidates.push(
        `${weatherBase}?${new URLSearchParams({
          location: locationInfo.name,
          startDate: checkInDate,
          endDate: checkOutDate,
          latitude: locationInfo.lat.toString(),
          longitude: locationInfo.lon.toString(),
        }).toString()}`
      );

      // B. 흔한 대안 키(start/end/lat/lon)
      weatherCandidates.push(
        `${weatherBase}?${new URLSearchParams({
          location: locationInfo.name,
          start: checkInDate,
          end: checkOutDate,
          lat: locationInfo.lat.toString(),
          lon: locationInfo.lon.toString(),
        }).toString()}`
      );

      // C. 단일 날짜 전용(date) 스펙 (checkIn === checkOut)
      if (checkInDate === checkOutDate) {
        weatherCandidates.push(
          `${weatherBase}?${new URLSearchParams({
            location: locationInfo.name,
            date: checkInDate,
            latitude: locationInfo.lat.toString(),
            longitude: locationInfo.lon.toString(),
          }).toString()}`
        );
      }

      // (선택) D. end exclusive 스펙 대비 (end = 다음날)
      const endPlusOne = new Date(checkOutDate);
      endPlusOne.setDate(endPlusOne.getDate() + 1);
      const endPlusOneISO = endPlusOne.toISOString().slice(0, 10);
      weatherCandidates.push(
        `${weatherBase}?${new URLSearchParams({
          location: locationInfo.name,
          start: checkInDate,
          end: endPlusOneISO,
          lat: locationInfo.lat.toString(),
          lon: locationInfo.lon.toString(),
        }).toString()}`
      );

      // 4) cloth 1회 + weather 폴백 시도
      const clothRes = await fetch(clothUrl, { headers, credentials: 'include' });
      if (!clothRes.ok) {
        const body = await getJsonOrText(clothRes);
        const msg = typeof body === 'string' ? body : (body as any).msg ?? '';
        if (clothRes.status === 401) throw new Error('로그인 후 이용해주세요.');
        throw new Error(`cloth ${clothRes.status} ${msg}`);
      }

      let weatherRes: Response | null = null;
      let weatherLastErr = '';
      for (const url of weatherCandidates) {
        const res = await fetch(url, { headers, credentials: 'include' });
        if (res.ok) { weatherRes = res; break; }
        const body = await getJsonOrText(res);
        const msg = typeof body === 'string' ? body : (body as any).msg ?? '';
        weatherLastErr = `url=${url} -> ${res.status} ${msg}`;
      }
      if (!weatherRes) {
        console.error('weather fallback failed:', weatherLastErr);
        throw new Error(`weather 400 ${weatherLastErr}`);
      }

      // 5) 결과 파싱
      const [clothResult, weatherResult] = await Promise.all([
        clothRes.json(),
        weatherRes.json(),
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
