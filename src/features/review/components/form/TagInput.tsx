"use client";

import { forwardRef } from "react";

interface TagInputProps {
  showTagInput: boolean;
  tagInput: string;
  tags: string[];
  error?: string;
  onTagInputChange: (value: string) => void;
  onTagAdd: () => void;
  onTagRemove: (tag: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      showTagInput,
      tagInput,
      tags,
      error,
      onTagInputChange,
      onTagAdd,
      onTagRemove,
      onKeyDown,
    },
    ref
  ) => {
    if (!showTagInput) return null;

    return (
      <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex gap-2 mb-3">
          <input
            ref={ref}
            type="text"
            placeholder="태그를 입력하세요"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            value={tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            type="button"
            onClick={onTagAdd}
            className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            추가
          </button>
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        {/* 추가된 태그들 */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              onClick={() => onTagRemove(tag)}
              className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              {tag} ×
            </span>
          ))}
          {tags.length === 0 && (
            <p className="text-sm text-gray-500">추가된 태그가 없습니다</p>
          )}
        </div>
      </div>
    );
  }
);

TagInput.displayName = "TagInput";
