"use client";

import { Hash, ImagePlus, Shirt } from "lucide-react";

interface ActionButtonsProps {
  isUploadingImage: boolean;
  onClothingClick: () => void;
  onTagClick: () => void;
  onImageClick: () => void;
}

export function ActionButtons({
  isUploadingImage,
  onClothingClick,
  onTagClick,
  onImageClick,
}: ActionButtonsProps) {
  return (
    <div className="mt-4 flex justify-end mr-2 gap-2">
      {/* 옷 추가 버튼 */}
      <button
        type="button"
        onClick={onClothingClick}
        className="flex items-center gap-1 text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Shirt size={18} className="text-black" />옷 추가
      </button>

      {/* 태그 버튼 */}
      <button
        type="button"
        onClick={onTagClick}
        className="flex items-center gap-1 text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Hash size={18} className="text-black" />
        태그
      </button>

      {/* 이미지 업로드 버튼 */}
      <button
        type="button"
        onClick={onImageClick}
        className="flex items-center gap-1 text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        disabled={isUploadingImage}
      >
        <ImagePlus size={18} className="text-black" />
        이미지
      </button>
    </div>
  );
}
