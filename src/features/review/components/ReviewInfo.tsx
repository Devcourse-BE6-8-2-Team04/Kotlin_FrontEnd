"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useReview } from "../hooks/useReview";
import ConfirmModal from "../modals/ConfirmModal";
import PasswordModal from "../modals/PasswordModal";
import { LoadingSpinner } from "./LoadingSpinner";
import { ReviewCard } from "./ReviewCard";
import { ReviewHeader } from "./ReviewHeader";

interface ReviewInfoProps {
  reviewState: ReturnType<typeof useReview>;
}

export function ReviewInfo({ reviewState }: ReviewInfoProps) {
  const router = useRouter();
  const { review, deleteReview, verifyPassword } = reviewState;
  const [showPwModal, setShowPwModal] = useState<"delete" | "edit" | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (review == null) {
    return <LoadingSpinner />;
  }

  const executeDelete = () => {
    deleteReview(() => router.back());
    setShowConfirmModal(false);
  };

  const handlePasswordVerify = async (pw: string) => {
    try {
      if (showPwModal === "delete") {
        const isValid = await verifyPassword(pw);
        if (isValid) {
          setShowPwModal(null);
          setTimeout(() => setShowConfirmModal(true), 10);
        }
      } else {
        const isValid = await verifyPassword(pw);
        if (isValid) {
          setShowPwModal(null);
          // router.push(`/reviews/edit/${id}`);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-[73px]">
      <ReviewHeader
        onEdit={() => setShowPwModal("edit")}
        onDelete={() => setShowPwModal("delete")}
      />

      <div className="px-3 py-3 max-w-4xl mx-auto">
        <ReviewCard review={review} />
      </div>

      {showPwModal && (
        <PasswordModal
          onClose={() => setShowPwModal(null)}
          onVerify={handlePasswordVerify}
        />
      )}

      {showConfirmModal && (
        <ConfirmModal
          message={`${review.id}번 글을 정말 삭제하시겠습니까?`}
          onConfirm={executeDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 fixed top-4 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg shadow-lg z-[9999] animate-fade-in-out whitespace-nowrap">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
