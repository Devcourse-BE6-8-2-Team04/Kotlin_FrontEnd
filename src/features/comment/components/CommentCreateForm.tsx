"use client";

import {
  GeoLocationDto,
  getGeoLocations,
} from "@/lib/backend/apiV1/weatherService";
import {
  AlertCircle,
  ChevronLeft,
  ImagePlus,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Plus,
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

export function CommentCreateForm() {
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
  }>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

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

  // 필드별 blur 핸들러
  const handleEmailBlur = () => {
    const error = validateEmail(email);
    if (error) {
      setError("email", error);
    } else {
      clearError("email");
    }
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    if (error) {
      setError("password", error);
    } else {
      clearError("password");
    }
  };

  const handleTitleBlur = () => {
    const error = validateTitle(title);
    if (error) {
      setError("title", error);
    } else {
      clearError("title");
    }
  };

  const handleContentBlur = () => {
    const error = validateContent(content);
    if (error) {
      setError("content", error);
    } else {
      clearError("content");
    }
  };

  const handleDateBlur = () => {
    if (!date) {
      setError("date", "날짜를 선택해주세요.");
    } else {
      clearError("date");
    }
  };

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

    if (tags.length === 0) newErrors.tag = "태그를 최소 1개 이상 추가해주세요.";

    // 에러가 있으면 제출 중단
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

      const res = await fetch("/api/v1/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "등록에 실패했습니다.");
      }

      router.push("/comments");
    } catch (err: any) {
      alert(err.message || "등록에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-4 mb-16"
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      {/* 상단 네비 */}
      <div className="flex items-center mb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
        >
          <ChevronLeft size={22} className="text-gray-600" />
        </button>
        <h2 className="ml-2 text-lg font-semibold text-gray-900">새 글 작성</h2>
      </div>

      {/* 제목 */}
      <div className="mb-4">
        <input
          ref={titleRef}
          type="text"
          placeholder="제목"
          className={`w-full text-base font-bold py-3 px-4 rounded-lg border bg-gray-50 focus:outline-none placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white transition-all duration-150 ${
            errors.title
              ? "border-red-300 focus:border-red-400"
              : "border-gray-200 focus:border-blue-400"
          }`}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            clearError("title");
          }}
          onBlur={handleTitleBlur}
          required
          style={{ color: "#222" }}
        />
        {errors.title && (
          <div className="flex items-center gap-2 mt-2 px-1">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{errors.title}</p>
          </div>
        )}
      </div>

      {/* PC/모바일 조건부 layout */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row gap-2">
          {/* 이메일 */}
          <div className="flex-1">
            <div
              className={`flex items-center bg-gray-50 rounded-lg border px-3 py-2 focus-within:border-blue-400 transition-all duration-150 ${
                errors.email
                  ? "border-red-300 focus-within:border-red-400"
                  : "border-gray-200"
              }`}
            >
              <Mail size={18} className="mr-2 text-blue-500" />
              <input
                ref={emailRef}
                type="email"
                placeholder="이메일"
                className="w-full text-sm bg-transparent focus:outline-none placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white transition-all"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                onBlur={handleEmailBlur}
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
            <div
              className={`flex items-center bg-gray-50 rounded-lg border px-3 py-2 focus-within:border-blue-400 transition-all duration-150 ${
                errors.password
                  ? "border-red-300 focus-within:border-red-400"
                  : "border-gray-200"
              }`}
            >
              <Lock size={18} className="mr-2 text-blue-500" />
              <input
                ref={passwordRef}
                type="password"
                placeholder="비밀번호"
                className="w-full text-sm bg-transparent focus:outline-none placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white transition-all"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                onBlur={handlePasswordBlur}
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
        </div>
        {/* 날짜 */}
        <div className="mt-2">
          <input
            type="date"
            className={`w-full text-sm py-3 px-4 rounded-lg border bg-gray-50 focus:outline-none transition-all duration-150 ${
              errors.date
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-blue-400"
            }`}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              clearError("date");
            }}
            onBlur={handleDateBlur}
            required
            style={{ color: "#222" }}
          />
          {errors.date && (
            <div className="flex items-center gap-2 mt-1 px-1">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600">{errors.date}</p>
            </div>
          )}
        </div>
      </div>

      {/* 지역 정보 */}
      <div className="mb-4">
        <div className="relative" ref={dropdownRef}>
          {/* 선택된 도시가 있을 때의 표시 */}
          {selectedCity ? (
            <div className="flex items-center justify-between bg-blue-50 rounded-lg border border-blue-200 px-3 py-3 transition-all duration-150">
              <div className="flex items-center">
                <MapPin size={18} className="text-blue-500 mr-2" />
                <span className="text-sm text-blue-900 font-medium">
                  {selectedCity.localName
                    ? `${selectedCity.localName} (${selectedCity.name}, ${selectedCity.country})`
                    : `${selectedCity.name}, ${selectedCity.country}`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearSelectedCity}
                className="ml-2 p-1 hover:bg-blue-100 rounded-full transition-colors"
              >
                <X size={16} className="text-blue-600" />
              </button>
            </div>
          ) : (
            /* 검색 입력 필드 */
            <div
              className={`flex items-center bg-gray-50 rounded-lg border px-3 py-2 focus-within:border-blue-400 transition-all duration-150 ${
                errors.location
                  ? "border-red-300 focus-within:border-red-400"
                  : "border-gray-200"
              }`}
            >
              <MapPin size={18} className="text-blue-500 mr-2" />
              <input
                ref={locationInputRef}
                type="text"
                placeholder="도시 검색"
                className="w-full text-sm bg-transparent focus:outline-none placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white transition-all"
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
        {errors.location && (
          <div className="flex items-center gap-2 mt-2 px-1">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{errors.location}</p>
          </div>
        )}
      </div>

      {/* 내용 */}
      <div className="mb-4">
        <textarea
          placeholder="내용을 입력하세요"
          className={`w-full text-base py-3 px-4 rounded-lg border bg-gray-50 focus:outline-none placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white min-h-[120px] resize-none transition-all duration-150 ${
            errors.content
              ? "border-red-300 focus:border-red-400"
              : "border-gray-200 focus:border-blue-400"
          }`}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            clearError("content");
          }}
          onBlur={handleContentBlur}
          required
          style={{ color: "#222" }}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.content && (
              <div className="flex items-center gap-2 px-1">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">{errors.content}</p>
              </div>
            )}
          </div>
          {content && (
            <div className="text-xs text-gray-500">{content.length}/500자</div>
          )}
        </div>
      </div>

      {/* 태그 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="태그 입력 후 Enter (예: #여행)"
            className={`bg-gray-50 focus:outline-none px-4 py-2 text-sm rounded-lg border placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white w-full transition-all duration-150 ${
              errors.tag
                ? "border-red-300 focus:border-red-400"
                : "border-gray-200 focus:border-blue-400"
            }`}
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              clearError("tag");
            }}
            onKeyDown={(e) =>
              e.key === "Enter"
                ? (e.preventDefault(), handleTagAdd())
                : undefined
            }
            style={{ color: "#222" }}
          />
          <button
            type="button"
            onClick={handleTagAdd}
            className="bg-blue-200 text-blue-800 px-2 py-2 rounded-lg text-xs font-semibold shadow-sm transition hover:bg-blue-300"
            aria-label="태그 추가"
          >
            <Plus size={16} />
          </button>
        </div>
        {errors.tag && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{errors.tag}</p>
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="group bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs border border-blue-200 shadow-sm flex items-center gap-1 hover:bg-blue-200 transition-colors cursor-pointer"
              onClick={() => handleTagRemove(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
        {tags.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            태그를 클릭해서 제거할 수 있습니다
          </p>
        )}
      </div>

      {/* 이미지 업로드/미리보기 */}
      <div className="mb-6">
        <label className="block text-sm text-gray-800 mb-2 font-semibold">
          이미지
        </label>
        <button
          type="button"
          onClick={handleImageButtonClick}
          className="flex items-center gap-2 px-4 py-2 mb-2 bg-white border border-blue-200 text-blue-900 font-semibold rounded-lg shadow-sm hover:bg-blue-50 hover:text-blue-900 transition"
        >
          <ImagePlus size={20} />
          사진 등록하기
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          ref={fileInputRef}
        />
        {isUploadingImage && (
          <div className="text-blue-700 text-sm mt-2">이미지 업로드 중...</div>
        )}
        {imageUrl && (
          <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm border border-gray-200 mt-2">
            <img
              src={imageUrl}
              alt="미리보기"
              className="max-w-full max-h-44 object-contain"
            />
          </div>
        )}
      </div>

      {/* 등록 */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 mt-3 bg-blue-900 text-white rounded-lg font-semibold shadow-sm border border-blue-900 transition hover:bg-blue-800 disabled:opacity-60"
      >
        {isSubmitting ? "등록 중..." : "등록"}
      </button>

      {/* 깜빡임 애니메이션 */}
      <style jsx>{`
        @keyframes blink {
          0% {
            box-shadow: 0 0 0 0 #3b82f6;
          }
          50% {
            box-shadow: 0 0 0 4px #3b82f6aa;
          }
          100% {
            box-shadow: 0 0 0 0 #3b82f6;
          }
        }
        .animate-blink {
          animation: blink 1s linear infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 0.15s ease-out;
        }
      `}</style>
    </form>
  );
}
