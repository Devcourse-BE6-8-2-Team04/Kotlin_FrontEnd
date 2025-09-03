"use client";

import { components } from "@/lib/backend/apiV1/schema";
import {
  GeoLocationDto,
  getGeoLocations,
} from "@/lib/backend/apiV1/weatherService";
import { AlertCircle, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import type { Category, ClothName, Material, Style } from "../../types";
import { ActionButtons } from "./ActionButtons";
import { ClothingModal } from "./ClothingModal";
import { ContentTextarea } from "./ContentTextarea";
import { DatePicker } from "./DatePicker";
import { ErrorAlert } from "./ErrorAlert";
import { ImageUploadSection } from "./ImageUploadSection";
import { LocationSearch } from "./LocationSearch";
import { SelectedClothingList } from "./SelectedClothingList";
import { TagInput } from "./TagInput";
import { TitleInput } from "./TitleInput";

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
    setLocation(city.localName || city.name || "");
    setShowDropdown(false);
    setLocationCandidates([]);
    clearError("location");
  };

  const handleLocationChange = (value: string) => {
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
        {errors.general && <ErrorAlert message={errors.general} />}

        <div className="flex flex-col md:flex-row gap-2">
          {/* 날짜 선택 */}
          <DatePicker
            date={date}
            error={errors.date}
            onChange={(value) => {
              setDate(value);
              clearError("date");
            }}
          />

          {/* 위치 검색 */}
          <LocationSearch
            ref={dropdownRef}
            location={location}
            selectedCity={selectedCity}
            locationCandidates={locationCandidates}
            showDropdown={showDropdown}
            isLoadingCities={isLoadingCities}
            onLocationChange={handleLocationChange}
            onCitySelect={handleCitySelect}
            onClearCity={handleClearSelectedCity}
            onFocus={() => {
              if (locationCandidates.length > 0) {
                setShowDropdown(true);
              }
            }}
          />
        </div>
        {errors.location && (
          <div className="flex items-center gap-2 mt-2 px-1">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{errors.location}</p>
          </div>
        )}

        {/* 제목 */}
        <TitleInput
          ref={titleRef}
          title={title}
          error={errors.title}
          onChange={(value) => {
            setTitle(value);
            clearError("title");
          }}
        />

        {/* 내용 */}
        <ContentTextarea
          content={content}
          error={errors.content}
          isLoggedIn={false}
          onChange={(value) => {
            setContent(value);
            clearError("content");
          }}
        />

        {/* 액션 버튼들 */}
        <ActionButtons
          isUploadingImage={isUploadingImage}
          onClothingClick={handleClothingButtonClick}
          onTagClick={handleTagButtonClick}
          onImageClick={handleImageButtonClick}
        />

        {/* 선택된 옷 목록 */}
        <SelectedClothingList
          selectedClothing={selectedClothing}
          onRemove={handleRemoveClothing}
        />

        {/* 태그 입력 UI */}
        <TagInput
          ref={tagInputRef}
          showTagInput={showTagInput}
          tagInput={tagInput}
          tags={tags}
          error={errors.tag}
          onTagInputChange={(value) => {
            setTagInput(value);
            clearError("tag");
          }}
          onTagAdd={handleTagAdd}
          onTagRemove={handleTagRemove}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleTagAdd();
            }
          }}
        />

        {/* 이미지 업로드 관련 */}
        <ImageUploadSection
          ref={fileInputRef}
          imageUrl={imageUrl}
          isUploadingImage={isUploadingImage}
          onImageChange={handleImageChange}
          onRemoveImage={() => setImageUrl(null)}
        />

        {/* 옷 선택 모달 */}
        <ClothingModal
          showModal={showClothingModal}
          currentStep={currentStep}
          selectedCategory={selectedCategory}
          selectedClothName={selectedClothName}
          selectedStyle={selectedStyle}
          selectedMaterial={selectedMaterial}
          onClose={closeClothingModal}
          onCategorySelect={handleCategorySelect}
          onClothItemSelect={handleClothItemSelect}
          onStyleChange={setSelectedStyle}
          onMaterialChange={setSelectedMaterial}
          onAddClothing={handleAddClothing}
        />
      </div>
    </div>
  );
}
