"use client";

import type { components } from "@/lib/backend/apiV1/schema";
import { Search } from "lucide-react";
import { ReviewItem } from "./ReviewItem";

type ReviewDto = components["schemas"]["ReviewDto"];

interface ReviewsListProps {
  reviews: ReviewDto[];
  totalElements: number;
  page: number;
}

export function ReviewsList({
  reviews,
  totalElements,
  page,
}: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 mb-4">
          <Search size={48} className="mx-auto" />
        </div>
        <p className="text-gray-600 text-lg font-medium">글이 없습니다</p>
        <p className="text-gray-400 text-sm mt-2">
          새로운 리뷰를 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-8">
      {reviews.map((review, index) => (
        <ReviewItem
          key={review.id}
          review={review}
          index={index}
          totalElements={totalElements}
          page={page}
        />
      ))}
    </div>
  );
}
