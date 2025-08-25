import React, { useState } from "react";

export default function PasswordModal({
  onClose, onVerify,
}: {
  onClose: () => void;
  onVerify: (password: string) => void;
}) {
  const [pw, setPw] = useState("");

  return (
    <div className="fixed inset-0 bg-black/30 z-50">
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl w-80 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">비밀번호 확인</h2>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="비밀번호를 입력해주세요."
          autoFocus
          autoComplete="current-password"
          onKeyDown={(e) => e.key === 'Enter' && pw && onVerify(pw)}
          aria-label="비밀번호 입력"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={() => onVerify(pw)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            disabled={!pw.trim()}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
