
'use client';

import React from 'react';
import WeatherResults from './WeatherResults';
import ClothResults from './ClothResults';
import CommentsLink from './CommentsLink';
import { ClothApiResponse, WeatherApiResponse } from '@/app/plan/types';

interface ResultsDisplayProps {
  isLoading: boolean;
  error: string | null;
  clothData: ClothApiResponse | null;
  weatherData: WeatherApiResponse | null;
  locationName: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  isLoading,
  error,
  clothData,
  weatherData,
  locationName,
}) => {
  if (isLoading) {
    return <div className="text-center text-gray-500">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  if (!clothData && !weatherData) {
    return (
      <div className="text-center text-gray-500">
        여행 정보를 입력하고 확인 버튼을 눌러주세요.
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <WeatherResults weatherData={weatherData} locationName={locationName} />
      <ClothResults clothData={clothData} />
      <CommentsLink weatherData={weatherData} locationName={locationName} />
    </div>
  );
};

export default ResultsDisplay;
