"use client";

import type { components } from "@/lib/backend/apiV1/schema";
import { Tag } from "lucide-react";
import { WeatherInfo } from "./WeatherInfo";

type ReviewDto = components["schemas"]["ReviewDto"];

interface ReviewCardProps {
  review: ReviewDto;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        {/* Title Section */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-keep leading-tight">
          {review.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-row items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="truncate">{review.email}</span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(review.weatherInfoDto.date).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Weather Info */}
      <WeatherInfo weatherInfo={review.weatherInfoDto} />

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="whitespace-pre-line text-gray-700 leading-relaxed text-sm sm:text-base">
          {review.sentence}
        </div>
      </div>

      {/* Tags */}
      {review.tagString && (
        <div className="px-4 sm:px-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">태그</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {review.tagString
              .split("#")
              .filter((tag) => tag.trim() !== "")
              .map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200 font-medium"
                >
                  #{tag}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Image */}
      {review.imageUrl && (
        <div className="px-4 sm:px-6 pb-6">
          <div className="relative w-full overflow-hidden rounded-xl bg-gray-100">
            <img
              src={review.imageUrl}
              alt="댓글 이미지"
              className="w-full h-auto object-contain max-h-200"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}
