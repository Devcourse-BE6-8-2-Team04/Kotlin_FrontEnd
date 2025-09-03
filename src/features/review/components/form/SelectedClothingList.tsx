"use client";

import { components } from "@/lib/backend/apiV1/schema";
import type { ClothName } from "../../types";
import { CLOTHNAME_BY_CATEGORIES } from "./ClothData";

type ClothItemReqBody = components["schemas"]["ClothItemReqBody"];

interface SelectedClothingListProps {
  selectedClothing: ClothItemReqBody[];
  onRemove: (clothName: ClothName) => void;
}

export function SelectedClothingList({
  selectedClothing,
  onRemove,
}: SelectedClothingListProps) {
  if (selectedClothing.length === 0) return null;

  return (
    <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        선택된 옷 ({selectedClothing.length}개)
      </h4>
      <div className="flex flex-wrap gap-2">
        {selectedClothing.map((item, index) => (
          <div
            key={`${item.clothName}-${index}`}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm flex items-center gap-1"
          >
            <span
              className={item.isRecommend ? "text-blue-600" : "text-gray-600"}
            >
              {CLOTHNAME_BY_CATEGORIES[item.category]?.items.find(
                (cloth) => cloth.name === item.clothName
              )?.label || item.clothName}
            </span>
            {item.isRecommend && <span className="text-blue-500">(추천)</span>}
            <button
              type="button"
              onClick={() => onRemove(item.clothName)}
              className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
