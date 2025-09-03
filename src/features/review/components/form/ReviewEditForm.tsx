"use client";

import { AlertCircle } from "lucide-react";
import { useReview } from "../../hooks/useReview";
import { LoadingSpinner } from "../LoadingSpinner";
import { ReviewEditFormContent } from "./ReviewEditFormContent";

interface ReviewEditFormProps {
  reviewState: ReturnType<typeof useReview>;
}

export function ReviewEditForm({ reviewState }: ReviewEditFormProps) {
  const { review } = reviewState;

  if (review == null) {
    return <LoadingSpinner />;
  }

  // 데이터가 성공적으로 로드되었을 때만 실제 폼을 렌더링합니다.
  if (review) {
    return (
      <div className="min-h-screen bg-white pb-[73px]">
        <ReviewEditFormContent initialData={review} />
      </div>
    );
  }

  // 데이터 로딩에 실패하거나 없는 경우
  return (
    <div className="flex justify-center items-center h-screen text-gray-500">
      <AlertCircle size={24} className="mr-2" />
      리뷰 데이터를 찾을 수 없습니다.
    </div>
  );
}
