"use client";

import { X } from "lucide-react";
import type { Category, ClothName, Material, Style } from "../../types";
import {
  CLOTHNAME_BY_CATEGORIES,
  MATERIALS_BY_CATEGORY,
  STYLES,
} from "./ClothData";

interface ClothingModalProps {
  showModal: boolean;
  currentStep: "category" | "item" | "detail";
  selectedCategory?: Category;
  selectedClothName?: ClothName;
  selectedStyle: Style;
  selectedMaterial: Material;
  onClose: () => void;
  onCategorySelect: (category: Category) => void;
  onClothItemSelect: (clothName: ClothName) => void;
  onStyleChange: (style: Style) => void;
  onMaterialChange: (material: Material) => void;
  onAddClothing: (isRecommend: boolean) => void;
}

export function ClothingModal({
  showModal,
  currentStep,
  selectedCategory,
  selectedClothName,
  selectedStyle,
  selectedMaterial,
  onClose,
  onCategorySelect,
  onClothItemSelect,
  onStyleChange,
  onMaterialChange,
  onAddClothing,
}: ClothingModalProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {currentStep === "category"
              ? "카테고리 선택"
              : currentStep === "item"
              ? CLOTHNAME_BY_CATEGORIES[selectedCategory!]?.name
              : "스타일 & 재질"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* 모달 내용 */}
        <div className="p-4 overflow-y-auto max-h-96">
          {/* 카테고리 선택 단계 */}
          {currentStep === "category" && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CLOTHNAME_BY_CATEGORIES).map(
                ([key, category]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onCategorySelect(key as Category)}
                    className="p-4 border border-gray-200 rounded-lg text-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="text-lg mb-1">
                      {key === "TOP"
                        ? "👕"
                        : key === "BOTTOM"
                        ? "👖"
                        : key === "SHOES"
                        ? "👟"
                        : "🎒"}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </button>
                )
              )}
            </div>
          )}

          {/* 옷 아이템 선택 단계 */}
          {currentStep === "item" && selectedCategory && (
            <div className="space-y-2">
              {CLOTHNAME_BY_CATEGORIES[selectedCategory].items.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onClothItemSelect(item.name as ClothName)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {item.label}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 세부 사항 선택 단계 */}
          {currentStep === "detail" &&
            selectedCategory &&
            selectedClothName && (
              <div className="space-y-4">
                {/* 스타일 선택 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    스타일 (선택사항)
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="style"
                        value=""
                        checked={selectedStyle === undefined}
                        onChange={() => onStyleChange(undefined)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600">선택안함</span>
                    </label>
                    {STYLES.map((style) => (
                      <label key={style.name} className="flex items-center">
                        <input
                          type="radio"
                          name="style"
                          value={style.name}
                          checked={selectedStyle === style.name}
                          onChange={() => onStyleChange(style.name as Style)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-900">
                          {style.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 재질 선택 */}
                {MATERIALS_BY_CATEGORY[selectedCategory].length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      재질 (선택사항)
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="material"
                          value=""
                          checked={selectedMaterial === undefined}
                          onChange={() => onMaterialChange(undefined)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-600">선택안함</span>
                      </label>
                      {MATERIALS_BY_CATEGORY[selectedCategory].map(
                        (material) => (
                          <label
                            key={material.name}
                            className="flex items-center"
                          >
                            <input
                              type="radio"
                              name="material"
                              value={material.name}
                              checked={selectedMaterial === material.name}
                              onChange={() =>
                                onMaterialChange(material.name as Material)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-900">
                              {material.label}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 추천 여부 선택 */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onAddClothing(true)}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      추천으로 추가
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddClothing(false)}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      일반으로 추가
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
