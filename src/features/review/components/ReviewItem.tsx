"use client";

import type { components } from "@/lib/backend/apiV1/schema";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  MapPin,
  Sun,
  Thermometer,
  ThermometerSun,
} from "lucide-react";
import Link from "next/link";

type ReviewDto = components["schemas"]["ReviewDto"];

interface ReviewItemProps {
  review: ReviewDto;
  index: number;
  totalElements: number;
  page: number;
}

function getWeatherIconByCode(code: number) {
  if (code >= 200 && code < 300)
    return <CloudLightning className="text-yellow-300 w-5 h-5" />;
  if (code >= 300 && code < 400)
    return <CloudDrizzle className="text-blue-300 w-5 h-5" />;
  if (code >= 500 && code < 600)
    return <CloudRain className="text-blue-500 w-5 h-5" />;
  if (code >= 600 && code < 700)
    return <CloudSnow className="text-gray-300 w-5 h-5" />;
  if (code >= 700 && code < 800)
    return <CloudFog className="text-gray-400 w-5 h-5" />;
  if (code === 800) return <Sun className="text-yellow-400 w-5 h-5" />;
  if (code > 800 && code < 900)
    return <Cloud className="text-gray-300 w-5 h-5" />;
  if (code === 900) return <ThermometerSun className="text-red-500 w-5 h-5" />;

  console.warn(`Unknown weather code: ${code}`);
  return <Sun className="text-yellow-300 w-5 h-5" />;
}

export function ReviewItem({
  review,
  index,
  totalElements,
  page,
}: ReviewItemProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] overflow-hidden">
      <Link href={`/reviews/${review.id}`}>
        <div className="p-4 flex gap-4">
          {/* 왼쪽 콘텐츠 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs md:text-sm font-mono text-gray-600 py-1">
                #{totalElements - ((page - 1) * 10 + index)}
              </span>
              <h4 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                {review.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="truncate">{review.email}</span>
              <span>•</span>
              <span className="text-xs shrink-0">
                {new Date(review.weatherInfoDto.date).toLocaleDateString(
                  "ko-KR"
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {review.weatherInfoDto.location && (
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                  <MapPin size={12} />
                  <span>{review.weatherInfoDto.location}</span>
                </div>
              )}
              {review.weatherInfoDto.feelsLikeTemperature && (
                <div className="flex items-center gap-1 text-blue-600 bg-gray-50 px-2 py-1 rounded-md">
                  <Thermometer size={12} />
                  <span>{review.weatherInfoDto.feelsLikeTemperature}°C</span>
                </div>
              )}
              {review.weatherInfoDto.weatherCode &&
                getWeatherIconByCode(review.weatherInfoDto.weatherCode)}
            </div>
          </div>

          {/* 오른쪽 이미지 */}
          {review.imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={review.imageUrl}
                alt="Review image"
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
