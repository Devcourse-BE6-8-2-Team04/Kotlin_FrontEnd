"use client";

import React from "react";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl w-80 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">{message}</h2>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
