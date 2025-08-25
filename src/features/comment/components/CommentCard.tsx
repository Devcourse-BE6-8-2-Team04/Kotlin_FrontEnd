import React from "react";
import type { components } from "@/lib/backend/apiV1/schema";
import { WeatherInfo } from "./WeatherInfo";
import { Tag } from "lucide-react";

type CommentDto = components["schemas"]["CommentDto"];

interface CommentCardProps {
  comment: CommentDto;
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        {/* Title Section */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-keep leading-tight">
          {comment.title}
        </h1>
            
        {/* Meta Info */}
        <div className="flex flex-row items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="truncate">{comment.email}</span>
          </div>
          <div className="text-sm text-gray-500">
            {new Date(comment.weatherInfoDto.date).toLocaleDateString("ko-KR", {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Weather Info */}
      <WeatherInfo weatherInfo={comment.weatherInfoDto} />

      {/* Content */}
      <div className="p-4 sm:p-6">
        <div className="whitespace-pre-line text-gray-700 leading-relaxed text-sm sm:text-base">
          {comment.sentence}
        </div>
      </div>

      {/* Tags */}
      {comment.tagString && (
        <div className="px-4 sm:px-6 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">태그</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {comment.tagString
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
      {comment.imageUrl && (
        <div className="px-4 sm:px-6 pb-6">
          <div className="relative w-full overflow-hidden rounded-xl bg-gray-100">
            <img
              src={comment.imageUrl}
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