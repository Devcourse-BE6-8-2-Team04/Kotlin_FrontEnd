
'use client';

import React, { createRef, useEffect, useRef, useState } from 'react';
import { Weather, WeatherApiResponse } from '@/app/plan/types';

interface WeatherResultsProps {
  weatherData: WeatherApiResponse | null;
  locationName: string;
}

interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

const WeatherResults: React.FC<WeatherResultsProps> = ({
  weatherData,
  locationName,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollLeft: false,
    canScrollRight: true,
  });

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const canScrollLeft = scrollLeft > 0;
      const canScrollRight = scrollLeft < scrollWidth - clientWidth;
      setScrollState({ canScrollLeft, canScrollRight });
    }
  };

  useEffect(() => {
    checkScrollability();
  }, [weatherData]);

  if (!weatherData) return null;

  return (
    <div className="mb-8 relative">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
        {locationName} 날씨 정보
      </h2>
      <div
        ref={scrollRef}
        onScroll={checkScrollability}
        className="flex overflow-x-auto space-x-4 p-2 scroll-smooth scrollbar-hide"
      >
        {weatherData.map((weather: Weather) => (
          <div
            key={weather.id}
            className="flex-shrink-0 w-40 border rounded-lg p-3 shadow-sm bg-white/80"
          >
            <p className="font-semibold text-sm">{weather.date}</p>
            <p className="text-xs">
              최고/최저: {weather.maxTemperature}°/{weather.minTemperature}°
            </p>
            <p className="text-xs">체감: {weather.feelsLikeTemperature}°C</p>
            <p className="text-xs">하늘: {weather.description}</p>
            <p className="text-xs">강수: {weather.pop}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherResults;
