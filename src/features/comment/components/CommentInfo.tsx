import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useComment } from "../hooks/useComment";
import { LoadingSpinner } from "./LoadingSpinner";
import { CommentHeader } from "./CommentHeader";
import { CommentCard } from "./CommentCard";
import PasswordModal from "../modals/PasswordModal";
import ConfirmModal from "../modals/ConfirmModal";

interface CommentInfoProps {
  commentState: ReturnType<typeof useComment>;
}

export function CommentInfo({ commentState }: CommentInfoProps) {
  const router = useRouter();
  const { comment, deleteComment, verifyPassword } = commentState;
  const [showPwModal, setShowPwModal] = useState<"delete" | "edit" | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (comment == null) {
    return <LoadingSpinner />;
  }

  const executeDelete = () => {
    deleteComment(() => router.back());
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
          // router.push(`/comments/edit/${id}`);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-[73px]">
      <CommentHeader
        onEdit={() => setShowPwModal("edit")}
        onDelete={() => setShowPwModal("delete")}
      />

      <div className="px-4 py-6 max-w-4xl mx-auto">
        <CommentCard comment={comment} />
      </div>

      {showPwModal && (
        <PasswordModal
          onClose={() => setShowPwModal(null)}
          onVerify={handlePasswordVerify}
        />
      )}

      {showConfirmModal && (
        <ConfirmModal
          message={`${comment.id}번 글을 정말 삭제하시겠습니까?`}
          onConfirm={executeDelete}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {errorMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-[9999] animate-fade-in-out">
          {errorMsg}
        </div>
      )}
    </div>
  );
}