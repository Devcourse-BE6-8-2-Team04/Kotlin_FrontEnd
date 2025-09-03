"use client";

import { components } from "@/lib/backend/apiV1/schema";
import {
  GeoLocationDto,
  getGeoLocations,
} from "@/lib/backend/apiV1/weatherService";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import type { Category, ClothName, Material, Style } from "../../types";
import { ActionButtons } from "./ActionButtons";
import { ClothingModal } from "./ClothingModal";
import { ContentTextarea } from "./ContentTextarea";
import { DatePicker } from "./DatePicker";
import { ErrorAlert } from "./ErrorAlert";
import { FormHeader } from "./FormHeader";
import { ImageUploadSection } from "./ImageUploadSection";
import { LocationSearch } from "./LocationSearch";
import { SelectedClothingList } from "./SelectedClothingList";
import { TagInput } from "./TagInput";
import { TitleInput } from "./TitleInput";
import { UserCredentialsSection } from "./UserCredentialsSection";

type ClothItemReqBody = components["schemas"]["ClothItemReqBody"];

// 이미지 파일을 백엔드에 업로드하고 URL을 받아오는 함수
async function uploadImageToServer(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/v1/images/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("이미지 업로드에 실패했습니다.");
  const data = await res.json(); // { url: "http://..." }
  return data.url;
}

// 유효성 검사 함수들
const validateEmail = (email: string): string | null => {
  if (!email) return "이메일을 입력해주세요.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "올바른 이메일 형식이 아닙니다.";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "비밀번호를 입력해주세요.";
  if (password.length < 4) return "비밀번호는 4글자 이상이어야 합니다.";
  return null;
};

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

export function ReviewCreateForm() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [locationCandidates, setLocationCandidates] = useState<
    GeoLocationDto[]
  >([]);
  const [selectedCity, setSelectedCity] = useState<GeoLocationDto | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [date, setDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 옷 관련 상태
  const [showClothingModal, setShowClothingModal] = useState(false);
  const [selectedClothing, setSelectedClothing] = useState<ClothItemReqBody[]>(
    []
  );
  const [currentStep, setCurrentStep] = useState<
    "category" | "item" | "detail"
  >("category");
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [selectedClothName, setSelectedClothName] = useState<ClothName>();
  const [selectedStyle, setSelectedStyle] = useState<Style>(undefined);
  const [selectedMaterial, setSelectedMaterial] = useState<Material>(undefined);

  // 에러 상태 관리
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
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

  // focus 관리
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // 디바운스를 위한 타이머 ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 에러 제거 헬퍼 함수
  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof typeof newErrors];
      return newErrors;
    });
  };

  // 에러 설정 헬퍼 함수
  const setError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  // 옷 선택 관련 함수들
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

    // 모달 닫기 및 상태 초기화
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

  // 태그 입력 UI가 표시될 때 포커스
  useEffect(() => {
    if (showTagInput && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [showTagInput]);

  // 개선된 도시 검색 로직
  useEffect(() => {
    // 이전 타이머가 있다면 클리어
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 입력값이 없거나 2글자 미만이면 드롭다운 숨기기
    if (!location || location.trim().length < 2) {
      setLocationCandidates([]);
      setShowDropdown(false);
      setIsLoadingCities(false);
      return;
    }

    // 이미 선택된 도시와 같다면 검색하지 않음
    if (selectedCity && location === selectedCity.name) {
      return;
    }

    // 로딩 상태 시작 (좀 더 빠르게 표시)
    const loadingTimeout = setTimeout(() => {
      setIsLoadingCities(true);
    }, 100);

    // 실제 검색은 500ms 후에 실행 (디바운스)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await getGeoLocations(location);
        setLocationCandidates(results);

        // 결과가 있으면 드롭다운 표시
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

  // 이미지 파일 선택 → 서버에 업로드 → imageUrl에 URL 저장
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

    // 태그가 #으로 시작하지 않으면 자동으로 추가
    const tagToAdd = trimmedTag.startsWith("#") ? trimmedTag : `#${trimmedTag}`;

    // 길이 체크 (# 포함)
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

  // 도시 선택 핸들러 개선
  const handleCitySelect = (city: GeoLocationDto) => {
    setSelectedCity(city);
    setLocation(city.localName || city.name || "");
    setShowDropdown(false);
    setLocationCandidates([]);
    clearError("location");
  };

  // 위치 입력 핸들러 개선
  const handleLocationChange = (value: string) => {
    setLocation(value);

    // 입력이 변경되면 선택된 도시 초기화
    if (
      selectedCity &&
      value !== selectedCity.name &&
      value !== selectedCity.localName
    ) {
      setSelectedCity(null);
    }
    clearError("location");
  };

  // 선택된 도시 제거
  const handleClearSelectedCity = () => {
    setSelectedCity(null);
    setLocation("");
    setShowDropdown(false);
    if (locationInputRef.current) {
      locationInputRef.current.focus();
    }
  };

  const handleSubmit = async () => {
    // 이미 제출 중이면 중복 실행 방지
    if (isSubmitting) {
      return;
    }

    // 전체 유효성 검사
    const newErrors: typeof errors = {};

    // 비로그인 상태일 때만 이메일/비밀번호 검사
    if (!isLoggedIn) {
      const emailError = validateEmail(email);
      if (emailError) newErrors.email = emailError;

      const passwordError = validatePassword(password);
      if (passwordError) newErrors.password = passwordError;
    }
    const titleError = validateTitle(title);
    if (titleError) newErrors.title = titleError;

    const contentError = validateContent(content);
    if (contentError) newErrors.content = contentError;

    if (!date) newErrors.date = "날짜를 선택해주세요.";

    if (!selectedCity) newErrors.location = "도시를 선택해주세요.";

    // 에러가 있으면 제출 중단
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // 첫 번째 에러가 있는 필드로 스크롤 및 포커스
      if (newErrors.email && emailRef.current) {
        emailRef.current.focus();
      } else if (newErrors.password && passwordRef.current) {
        passwordRef.current.focus();
      } else if (newErrors.title && titleRef.current) {
        titleRef.current.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const body = {
        title,
        email: isLoggedIn ? null : email,
        password: isLoggedIn ? null : password,
        date,
        sentence: content,
        tagString: tags.join(""),
        imageUrl, // 이미지 URL만 저장!
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

      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const errMessage =
          errData?.message || errData?.error || `서버 오류 (${res.status})`;
        throw new Error(errMessage);
      }

      // 성공 시 페이지 이동
      router.push("/reviews");
    } catch (err: any) {
      console.error("제출 오류:", err);
      setError(
        "general",
        err.message || "등록에 실패했습니다. 다시 시도해 주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* 헤더 */}
      <FormHeader isSubmitting={isSubmitting} onSubmit={handleSubmit} />

      <div className="px-4 pt-5">
        {/* 일반적인 에러 메시지 */}
        {errors.general && <ErrorAlert message={errors.general} />}

        <div className="flex flex-col md:flex-row gap-2">
          {/* 비로그인 상태일 때만 이메일/비밀번호 표시 */}
          <UserCredentialsSection
            ref={emailRef}
            isLoggedIn={isLoggedIn}
            email={email}
            password={password}
            errors={errors}
            onEmailChange={(value) => {
              setEmail(value);
              clearError("email");
            }}
            onPasswordChange={(value) => {
              setPassword(value);
              clearError("password");
            }}
          />

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
          isLoggedIn={isLoggedIn}
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
