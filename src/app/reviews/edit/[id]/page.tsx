"use client";

import { ReviewEditForm } from "@/features/review/components/create/ReviewEditForm";
import { useReview } from "@/features/review/hooks/useReview";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const id = parseInt(idStr);

  const reviewState = useReview(id);

  return <ReviewEditForm reviewState={reviewState} />;
}
