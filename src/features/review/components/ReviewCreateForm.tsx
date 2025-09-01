"use client";

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
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

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

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

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
        email,
        password,
        date,
        sentence: content,
        tagString: tags.join(""),
        imageUrl, // 이미지 URL만 저장!
        countryCode: selectedCity?.country ?? "",
        cityName: selectedCity?.name ?? "",
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
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2"
            disabled={isSubmitting}
          >
            <X size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">글쓰기</h1>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-1.5 bg-black text-white text-sm font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="px-4 py-6">
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
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
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
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">{errors.password}</p>
              </div>
            )}
          </div>

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
            placeholder="제목은 2자부터 100자까지 가능해요."
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
            placeholder="내용은 2자부터 500자까지 가능해요"
            className="w-full px-2 py-4 bg-white border-0 text-base placeholder-gray-400 resize-none min-h-[290px] focus:outline-none"
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
        <div className="mt-4 flex gap-2">
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
      </div>
    </div>
  );
}
