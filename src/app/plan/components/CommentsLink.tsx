"use client";

import { WeatherApiResponse } from '@/app/plan/types';
import Link from 'next/link';

interface CommentsLinkProps {
  weatherData: WeatherApiResponse | null;
  locationName: string;
}

const CommentsLink: React.FC<CommentsLinkProps> = ({ weatherData, locationName }) => {  
  const travelDate = (weatherData && weatherData.length > 0 && weatherData[0].date)
  ? weatherData[0].date
  : ''; // 날짜가 없을 경우 빈 문자열로 설정 (null 대신)

  if(weatherData === null) return;

  return (
    <div className="mt-6 pb-4">
      <div className="border-t border-gray-200 pt-4">
        <Link
          href={{
            pathname: "/comments",
            query: {
                location: locationName,
                ...(travelDate ? { date: travelDate } : {}),
            },
          }}
            className="w-full flex items-center justify-center space-x-2 text-blue-600 active:text-blue-800 font-medium py-3 rounded-lg active:bg-blue-50 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>관련 Log 보러가기</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default CommentsLink;