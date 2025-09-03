"use client";

import { Loader2, X } from "lucide-react";
import { forwardRef } from "react";

interface ImageUploadSectionProps {
  imageUrl: string | null;
  isUploadingImage: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export const ImageUploadSection = forwardRef<
  HTMLInputElement,
  ImageUploadSectionProps
>(({ imageUrl, isUploadingImage, onImageChange, onRemoveImage }, ref) => {
  return (
    <>
      <input
        type="file"
        ref={ref}
        accept="image/*"
        onChange={onImageChange}
        className="hidden"
      />

      {isUploadingImage && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          업로드 중...
        </div>
      )}

      {imageUrl && (
        <div className="mt-3">
          <div className="relative">
            <img
              src={imageUrl}
              alt="미리보기"
              className="w-full max-h-64 object-contain border border-gray-200 rounded-lg"
            />
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
});

ImageUploadSection.displayName = "ImageUploadSection";
