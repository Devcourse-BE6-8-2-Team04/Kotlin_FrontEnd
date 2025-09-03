"use client";

import { components } from "@/lib/backend/apiV1/schema";
import {
  GeoLocationDto,
  getGeoLocations,
} from "@/lib/backend/apiV1/weatherService";
import {
  AlertCircle,
  Calendar,
  Hash,
  ImagePlus,
  Loader2,
  MapPin,
  Shirt,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import type { Category, ClothName, Material, Style } from "../../types";
import {
  CLOTHNAME_BY_CATEGORIES,
  MATERIALS_BY_CATEGORY,
  STYLES,
} from "./ClothData";

type ClothItemReqBody = components["schemas"]["ClothItemReqBody"];
type ReviewDetailDto = components["schemas"]["ReviewDetailDto"];

// 이미지 파일을 백엔드에 업로드하고 URL을 받아오는 함수 (기존과 동일)
async function uploadImageToServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/v1/images/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("이미지 업로드에 실패했습니다.");
  const data = await res.json();
  return data.url;
}

// 유효성 검사 함수들 (기존과 동일)
const validateTitle = (title: string): string | null => {
  if (!title) return "제목을 입력해주세요.";
  if (title.length < 2) return "제목은 2글자 이상이어야 합니다.";
  if (title.length > 100) return "제목은 100글자 이하여야 합니다.";
  return null;
};

const validateContent = (content: string): string | null => {
  if (!content) return "내용을 입력해주세요.";
  if (content.length < 2) return "내용은 2글자 이상이어야 합니다.";
  if (content.length > 500) return "내용은 500글자 이하여야 합니다.";
  return null;
};

// 수정 폼 컴포넌트
interface ReviewEditFormContentProps {
  initialData: ReviewDetailDto;
}

export function ReviewEditFormContent({
  initialData,
}: ReviewEditFormContentProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData.title);
  const [location, setLocation] = useState(initialData.weatherInfoDto.location);
  const [selectedCity, setSelectedCity] = useState<GeoLocationDto | null>(null);
  const [date, setDate] = useState(initialData.weatherInfoDto.date);
  const [tags, setTags] = useState<string[]>(
    initialData.tagString
      ? initialData.tagString
          .split("#")
          .filter((t) => t)
          .map((tag) => `#${tag}`)
      : []
  );
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [content, setContent] = useState(initialData.sentence);
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData.imageUrl || null
  );
  const recommendedItems = (initialData.recommendedClothList || []).map(
    (item) => ({ ...item, isRecommend: true })
  );
  const nonRecommendedItems = (initialData.nonRecommendedClothList || []).map(
    (item) => ({ ...item, isRecommend: false })
  );

  const [selectedClothing, setSelectedClothing] = useState<ClothItemReqBody[]>([
    ...recommendedItems,
    ...nonRecommendedItems,
  ]);

  const [locationCandidates, setLocationCandidates] = useState<
    GeoLocationDto[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showClothingModal, setShowClothingModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "category" | "item" | "detail"
  >("category");
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [selectedClothName, setSelectedClothName] = useState<ClothName>();
  const [selectedStyle, setSelectedStyle] = useState<Style>(undefined);
  const [selectedMaterial, setSelectedMaterial] = useState<Material>(undefined);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    tag?: string;
    location?: string;
    date?: string;
    general?: string;
  }>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof typeof newErrors];
      return newErrors;
    });
  };

  const setError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleClothingButtonClick = () => {
    setShowClothingModal(true);
    setCurrentStep("category");
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCurrentStep("item");
  };

  const handleClothItemSelect = (clothName: ClothName) => {
    setSelectedClothName(clothName);
    setCurrentStep("detail");
  };

  const handleAddClothing = (isRecommend: boolean) => {
    if (!selectedCategory || !selectedClothName) return;
    const newClothingItem: ClothItemReqBody = {
      clothName: selectedClothName,
      category: selectedCategory,
      style: selectedStyle || undefined,
      material: selectedMaterial || undefined,
      isRecommend,
    };
    setSelectedClothing((prev) => [...prev, newClothingItem]);
    setShowClothingModal(false);
    setCurrentStep("category");
  };

  const handleRemoveClothing = (clothName: ClothName) => {
    setSelectedClothing((prev) =>
      prev.filter((item) => item.clothName !== clothName)
    );
  };

  const closeClothingModal = () => {
    setShowClothingModal(false);
    setCurrentStep("category");
  };

  useEffect(() => {
    function handleTouchStart(event: TouchEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("touchstart", handleTouchStart);
    return () => document.removeEventListener("touchstart", handleTouchStart);
  }, []);

  useEffect(() => {
    if (showTagInput && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [showTagInput]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (!location || location.trim().length < 2) {
      setLocationCandidates([]);
      setShowDropdown(false);
      setIsLoadingCities(false);
      return;
    }
    const loadingTimeout = setTimeout(() => {
      setIsLoadingCities(true);
    }, 100);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await getGeoLocations(location);
        setLocationCandidates(results);
        if (results.length > 0) {
          setShowDropdown(true);
        } else {
          setShowDropdown(false);
        }
      } catch (error) {
        console.error("검색 실패:", error);
        setLocationCandidates([]);
        setShowDropdown(false);
      } finally {
        clearTimeout(loadingTimeout);
        setIsLoadingCities(false);
      }
    }, 500);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      clearTimeout(loadingTimeout);
    };
  }, [location, selectedCity]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const uploadedUrl = await uploadImageToServer(file);
        setImageUrl(uploadedUrl);
      } catch (err) {
        alert("이미지 업로드에 실패했습니다.");
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleImageButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTagButtonClick = () => {
    setShowTagInput(!showTagInput);
    if (!showTagInput) {
      clearError("tag");
    }
  };

  const handleTagAdd = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) {
      setError("tag", "태그를 입력해주세요.");
      return;
    }
    const tagToAdd = trimmedTag.startsWith("#") ? trimmedTag : `#${trimmedTag}`;
    if (tagToAdd.length > 20) {
      setError("tag", "태그는 20글자 이하여야 합니다.");
      return;
    }
    if (tags.includes(tagToAdd)) {
      setError("tag", "이미 추가된 태그입니다.");
      return;
    }
    setTags([...tags, tagToAdd]);
    setTagInput("");
    clearError("tag");
  };

  const handleTagRemove = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCitySelect = (city: GeoLocationDto) => {
    setSelectedCity(city);
    setLocation(city.localName || city.name);
    setShowDropdown(false);
    setLocationCandidates([]);
    clearError("location");
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    const isSelectedCityMatch =
      selectedCity &&
      (value === selectedCity.name || value === selectedCity.localName);
    if (selectedCity && !isSelectedCityMatch) {
      setSelectedCity(null);
    }
    clearError("location");
  };

  const handleClearSelectedCity = () => {
    setSelectedCity(null);
    setLocation("");
    setShowDropdown(false);
    if (locationInputRef.current) {
      locationInputRef.current.focus();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    const newErrors: typeof errors = {};
    const titleError = validateTitle(title);
    if (titleError) newErrors.title = titleError;
    const contentError = validateContent(content);
    if (contentError) newErrors.content = contentError;
    if (!date) newErrors.date = "날짜를 선택해주세요.";
    if (!selectedCity) newErrors.location = "도시를 선택해주세요.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.title && titleRef.current) {
        titleRef.current.focus();
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        title,
        date,
        sentence: content,
        tagString: tags.join(""),
        imageUrl,
        countryCode: selectedCity?.country ?? "",
        cityName: selectedCity?.name ?? "",
        clothList: selectedClothing.map((item) => ({
          clothName: item.clothName,
          category: item.category,
          style: item.style || null,
          material: item.material || null,
          isRecommend: item.isRecommend,
        })),
      };

      const res = await fetch(`/api/v1/reviews/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const errMessage =
          errData?.message || errData?.error || `서버 오류 (${res.status})`;
        throw new Error(errMessage);
      }

      router.push(`/reviews/${initialData.id}`);
    } catch (err: any) {
      console.error("수정 오류:", err);
      setError(
        "general",
        err.message || "수정에 실패했습니다. 다시 시도해 주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateError = errors.date;

  return (
    <div className="bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="relative flex items-center px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-1"
            disabled={isSubmitting}
          >
            <X size={24} className="text-gray-600" />
          </button>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-lg font-medium text-gray-900">
            글 수정
          </h1>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="ml-auto px-4 py-1.5 bg-black text-white text-sm font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-1">
                <Loader2 size={14} className="animate-spin" />
                수정중
              </div>
            ) : (
              "수정 완료"
            )}
          </button>
        </div>
      </div>
      <div className="px-4 pt-5">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <div className="flex flex-row rounded-lg border px-3 py-2 focus-within:border-blue-400 transition-all duration-150 border-gray-200">
              <Calendar size={18} className="text-black mr-2" />
              <input
                type="date"
                className="w-full text-sm focus:outline-none placeholder-gray-400"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  clearError("date");
                }}
              />
            </div>
            {dateError && (
              <div className="flex items-center gap-2 mt-1 px-1">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">{dateError}</p>
              </div>
            )}
          </div>
          <div className="relative flex-1" ref={dropdownRef}>
            {selectedCity ? (
              <div className="flex items-center justify-between rounded-lg border px-3 py-3 transition-all duration-150 border-gray-200">
                <div className="flex items-center">
                  <MapPin size={18} className="text-black mr-2" />
                  <span className="text-sm font-medium">
                    {selectedCity.localName
                      ? `${selectedCity.localName} (${selectedCity.name}, ${selectedCity.country})`
                      : `${selectedCity.name}, ${selectedCity.country}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedCity}
                  className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={16} className="text-black" />
                </button>
              </div>
            ) : (
              <div className="flex items-center rounded-lg border px-3 py-2 focus-within:border-blue-400 transition-all duration-150 border-gray-200">
                <MapPin size={18} className="text-black mr-2" />
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="도시 검색"
                  className="w-full text-sm focus:outline-none placeholder-gray-400"
                  value={location}
                  onChange={handleLocationChange}
                  onFocus={() => {
                    if (locationCandidates.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  autoComplete="off"
                  required
                  style={{ color: "#222" }}
                />
                {isLoadingCities && (
                  <Loader2
                    className="animate-spin ml-2 text-blue-500"
                    size={18}
                  />
                )}
              </div>
            )}
            {showDropdown && !selectedCity && (
              <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-auto animate-in fade-in duration-150">
                {locationCandidates.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-gray-500 text-center">
                    검색 결과가 없습니다
                  </div>
                ) : (
                  locationCandidates.map((city, idx) => (
                    <div
                      key={`${city.lat}-${city.lon}-${idx}`}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-900 transition-colors border-b border-gray-50 last:border-b-0"
                      onClick={() => handleCitySelect(city)}
                    >
                      <div className="font-medium">
                        {city.localName || city.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {city.country}
                        {city.localName && ` • ${city.name}`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {errors.location && (
          <div className="flex items-center gap-2 mt-2 px-1">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{errors.location}</p>
          </div>
        )}
        <div className="mt-4">
          <input
            ref={titleRef}
            type="text"
            placeholder="제목을 입력해주세요."
            className="w-full px-2 pt-4 pb-2 bg-white border-0 text-base font-medium placeholder-gray-400 resize-none focus:outline-none"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError("title");
            }}
            maxLength={100}
            required
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1 px-2">{errors.title}</p>
          )}
          <div className="relative px-1">
            <hr className="border-gray-200" />
          </div>
        </div>
        <div>
          <textarea
            placeholder={`여행지의 날씨나 분위기, 입었던 착장을\n자유롭게 작성해주세요!`}
            className={`w-full px-2 py-4 bg-white border-0 text-base placeholder-gray-400 resize-none min-h-[250px] focus:outline-none`}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              clearError("content");
            }}
            maxLength={500}
          />
          {errors.content && (
            <p className="text-sm text-red-500 mt-1 px-2">{errors.content}</p>
          )}
        </div>
        <div className="mt-4 flex justify-end mr-2 gap-2">
          <button
            type="button"
            onClick={handleClothingButtonClick}
            className="flex items-center gap-1 text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Shirt size={18} className="text-black" />옷 추가
          </button>
          <button
            type="button"
            onClick={handleTagButtonClick}
            className="flex items-center gap-1 text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Hash size={18} className="text-black" />
            태그
          </button>
          <button
            type="button"
            onClick={handleImageButtonClick}
            className="flex items-center gap-1 text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isUploadingImage}
          >
            <ImagePlus size={18} className="text-black" />
            이미지
          </button>
        </div>
        {selectedClothing.length > 0 && (
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
                    className={
                      item.isRecommend ? "text-blue-600" : "text-gray-600"
                    }
                  >
                    {CLOTHNAME_BY_CATEGORIES[item.category]?.items.find(
                      (cloth) => cloth.name === item.clothName
                    )?.label || item.clothName}
                  </span>
                  {item.isRecommend && (
                    <span className="text-blue-500">(추천)</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveClothing(item.clothName)}
                    className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {showTagInput && (
          <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex gap-2 mb-3">
              <input
                ref={tagInputRef}
                type="text"
                placeholder="태그를 입력하세요"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  clearError("tag");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                추가
              </button>
            </div>
            {errors.tag && (
              <p className="text-sm text-red-500 mb-3">{errors.tag}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => handleTagRemove(tag)}
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
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageChange}
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
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        {showClothingModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-t-lg sm:rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
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
                  onClick={closeClothingModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-96">
                {currentStep === "category" && (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(CLOTHNAME_BY_CATEGORIES).map(
                      ([key, category]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleCategorySelect(key as Category)}
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
                {currentStep === "item" && selectedCategory && (
                  <div className="space-y-2">
                    {CLOTHNAME_BY_CATEGORIES[selectedCategory].items.map(
                      (item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() =>
                            handleClothItemSelect(item.name as ClothName)
                          }
                          className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {item.label}
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
                {currentStep === "detail" &&
                  selectedCategory &&
                  selectedClothName && (
                    <div className="space-y-4">
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
                              onChange={() => setSelectedStyle(undefined)}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-600">
                              선택안함
                            </span>
                          </label>
                          {STYLES.map((style) => (
                            <label
                              key={style.name}
                              className="flex items-center"
                            >
                              <input
                                type="radio"
                                name="style"
                                value={style.name}
                                checked={selectedStyle === style.name}
                                onChange={() =>
                                  setSelectedStyle(style.name as Style)
                                }
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-900">
                                {style.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
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
                                onChange={() => setSelectedMaterial(undefined)}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-600">
                                선택안함
                              </span>
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
                                      setSelectedMaterial(
                                        material.name as Material
                                      )
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
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => handleAddClothing(true)}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            추천으로 추가
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddClothing(false)}
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
        )}
      </div>
    </div>
  );
}
