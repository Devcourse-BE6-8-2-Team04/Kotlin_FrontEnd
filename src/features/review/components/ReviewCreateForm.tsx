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
  Lock,
  Mail,
  MapPin,
  Shirt,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import type { Category, ClothName, Material, Style } from "../types";

type ClothItemReqBody = components["schemas"]["ClothItemReqBody"];

// 옷 데이터 정의
const CLOTHNAME_BY_CATEGORIES = {
  TOP: {
    name: "상의",
    items: [
      { name: "T_SHIRT", label: "반팔" },
      { name: "SWEATSHIRT", label: "맨투맨" },
      { name: "HOODIE", label: "후드티" },
      { name: "SHIRT", label: "셔츠" },
      { name: "DRESS_SHIRT", label: "드레스 셔츠" },
      { name: "BLOUSE", label: "블라우스" },
      { name: "SWEATER", label: "스웨터" },
      { name: "CARDIGAN", label: "가디건" },
      { name: "COAT", label: "코트" },
      { name: "JACKET", label: "자켓" },
      { name: "LEATHER_JACKET", label: "가죽 자켓" },
      { name: "DENIM_JACKET", label: "데님 자켓" },
      { name: "BLAZER", label: "블레이저" },
      { name: "PADDING", label: "패딩" },
      { name: "VEST", label: "조끼" },
      { name: "WINDBREAKER", label: "바람막이" },
      { name: "FUNCTIONAL_T_SHIRT", label: "기능성 티셔츠" },
    ],
  },
  BOTTOM: {
    name: "하의",
    items: [
      { name: "JEANS", label: "청바지" },
      { name: "SLACKS", label: "슬랙스" },
      { name: "SHORTS", label: "반바지" },
      { name: "SKIRT", label: "치마" },
      { name: "JOGGER_PANTS", label: "조거 팬츠" },
      { name: "TRACK_PANTS", label: "트랙 팬츠" },
      { name: "LEGGINGS", label: "레깅스" },
      { name: "CARGO_PANTS", label: "카고 바지" },
      { name: "CORDUROY_PANTS", label: "골덴 바지" },
      { name: "CHINOS", label: "치노스" },
      { name: "SKI_PANTS", label: "스키 바지" },
    ],
  },
  SHOES: {
    name: "신발",
    items: [
      { name: "SNEAKERS", label: "스니커즈" },
      { name: "ATHLETIC_SHOES", label: "운동화" },
      { name: "FLATS", label: "플랫슈즈" },
      { name: "HEELS", label: "하이힐" },
      { name: "LOAFERS", label: "로퍼" },
      { name: "SLIPPERS", label: "슬리퍼" },
      { name: "LEATHER_BOOTS", label: "가죽 부츠" },
      { name: "FUR_BOOTS", label: "털 부츠" },
      { name: "RAIN_BOOTS", label: "장화" },
      { name: "SANDALS", label: "샌들" },
      { name: "OXFORDS", label: "옥스포드" },
      { name: "HIKING_SHOES", label: "하이킹 신발" },
      { name: "ANKLE_BOOTS", label: "앵클 부츠" },
    ],
  },
  EXTRA: {
    name: "기타",
    items: [
      { name: "HAT", label: "모자" },
      { name: "CAP", label: "캡" },
      { name: "BEANIE", label: "비니" },
      { name: "SCARF", label: "목도리" },
      { name: "GLOVES", label: "장갑" },
      { name: "BELT", label: "벨트" },
      { name: "BAG", label: "가방" },
      { name: "BACKPACK", label: "백팩" },
      { name: "CROSSBODY_BAG", label: "크로스백" },
      { name: "SUNGLASSES", label: "선글라스" },
      { name: "UMBRELLA", label: "우산" },
      { name: "MASK", label: "마스크" },
    ],
  },
};

const STYLES = [
  { name: "CASUAL_DAILY", label: "캐주얼 데일리" },
  { name: "FORMAL_OFFICE", label: "포멀 오피스" },
  { name: "OUTDOOR", label: "아웃도어" },
  { name: "DATE_LOOK", label: "데이트 룩" },
  { name: "EXTRA", label: "기타" },
];

// 카테고리별로 사용 가능한 재질 정의
const MATERIALS_BY_CATEGORY = {
  TOP: [
    { name: "COTTON", label: "면" },
    { name: "POLYESTER", label: "폴리에스터" },
    { name: "WOOL", label: "울" },
    { name: "LINEN", label: "린넨" },
    { name: "NYLON", label: "나일론" },
    { name: "DENIM", label: "데님" },
    { name: "LEATHER", label: "가죽" },
    { name: "FLEECE", label: "플리스" },
    { name: "SILK", label: "실크" },
    { name: "CASHMERE", label: "캐시미어" },
    { name: "CORDUROY", label: "코듀로이" },
  ],
  BOTTOM: [
    { name: "COTTON", label: "면" },
    { name: "POLYESTER", label: "폴리에스터" },
    { name: "WOOL", label: "울" },
    { name: "LINEN", label: "린넨" },
    { name: "NYLON", label: "나일론" },
    { name: "DENIM", label: "데님" },
    { name: "SILK", label: "실크" },
    { name: "CORDUROY", label: "코듀로이" },
  ],
  SHOES: [
    { name: "POLYESTER", label: "폴리에스터" },
    { name: "NYLON", label: "나일론" },
    { name: "LEATHER", label: "가죽" },
  ],
  EXTRA: [], // 기타는 재질 선택 불가
};

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
    setLocation(city.localName || city.name);
    setShowDropdown(false);
    setLocationCandidates([]);
    clearError("location");
  };

  // 위치 입력 핸들러 개선
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

  const dateError = errors.date;

  return (
    <div className="bg-white">
      {/* 헤더 */}
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
            글쓰기
          </h1>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="ml-auto px-4 py-1.5 bg-black text-white text-sm font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-1">
                <Loader2 size={14} className="animate-spin" />
                등록중
              </div>
            ) : (
              "등록"
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* 일반적인 에러 메시지 */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-2">
          {/* 비로그인 상태일 때만 이메일/비밀번호 표시 */}
          {!isLoggedIn && (
            <>
              {/* 이메일 */}
              <div className="flex-1">
                <div className="flex items-center rounded-lg border px-3 py-2 focus-within:border-blue-400 transition-all duration-150 border-gray-200">
                  <Mail size={18} className="mr-2 text-black" />
                  <input
                    ref={emailRef}
                    type="email"
                    placeholder="이메일"
                    className="w-full text-sm focus:outline-none placeholder-gray-400"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("email");
                    }}
                    required
                    style={{ color: "#222" }}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <AlertCircle
                      size={14}
                      className="text-red-500 flex-shrink-0"
                    />
                    <p className="text-xs text-red-600">{errors.email}</p>
                  </div>
                )}
              </div>

              {/* 비밀번호 */}
              <div className="flex-1">
                <div className="flex items-center rounded-lg border px-3 py-2 focus-within:border-blue-400 transition-all duration-150 border-gray-200">
                  <Lock size={18} className="mr-2 text-black" />
                  <input
                    ref={passwordRef}
                    type="password"
                    placeholder="비밀번호"
                    className="w-full text-sm focus:outline-none placeholder-gray-400"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError("password");
                    }}
                    required
                    autoComplete="new-password"
                    style={{ color: "#222" }}
                  />
                </div>
                {errors.password && (
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <AlertCircle
                      size={14}
                      className="text-red-500 flex-shrink-0"
                    />
                    <p className="text-xs text-red-600">{errors.password}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 날짜 선택 */}
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

          {/* 위치 검색 */}
          <div className="relative flex-1" ref={dropdownRef}>
            {/* 선택된 도시가 있을 때의 표시 */}
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
              /* 검색 입력 필드 */
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

            {/* 검색 결과 드롭다운 */}
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

        {/* 제목 */}
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

        {/* 내용 */}
        <div>
          <textarea
            placeholder={`여행지의 날씨나 분위기, 입었던 착장을\n자유롭게 작성해주세요!`}
            className={`w-full px-2 py-4 bg-white border-0 text-base placeholder-gray-400 resize-none ${
              isLoggedIn ? "min-h-[340px]" : "min-h-[250px]"
            } focus:outline-none`}
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

        {/* 액션 버튼들 */}
        <div className="mt-4 flex justify-end mr-2 gap-2">
          {/* 옷 추가 버튼 */}
          <button
            type="button"
            onClick={handleClothingButtonClick}
            className="flex items-center gap-1 text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Shirt size={18} className="text-black" />옷 추가
          </button>

          {/* 태그 버튼 */}
          <button
            type="button"
            onClick={handleTagButtonClick}
            className="flex items-center gap-1 text-sm px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Hash size={18} className="text-black" />
            태그
          </button>

          {/* 이미지 업로드 버튼 */}
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

        {/* 선택된 옷 목록 */}
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

        {/* 태그 입력 UI */}
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

            {/* 추가된 태그들 */}
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

        {/* 이미지 업로드 관련 */}
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

        {/* 옷 선택 모달 */}
        {showClothingModal && (
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
                  onClick={closeClothingModal}
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

                {/* 옷 아이템 선택 단계 */}
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

                      {/* 추천 여부 선택 */}
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
