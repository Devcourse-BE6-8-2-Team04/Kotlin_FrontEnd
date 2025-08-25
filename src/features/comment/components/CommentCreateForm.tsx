"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    MapPin,
    Thermometer,
    CalendarDays,
    Plus,
    Loader2,
    ImagePlus,
    ChevronLeft,
    Lock,
    Mail,
} from "lucide-react";

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

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

type CityCandidate = {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
};

export function CommentCreateForm() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [location, setLocation] = useState("");
    const [locationCandidates, setLocationCandidates] = useState<CityCandidate[]>([]);
    const [selectedCity, setSelectedCity] = useState<CityCandidate | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [feelsLikeTemperature, setFeelsLikeTemperature] = useState("");
    const [month, setMonth] = useState("");
    const [date, setDate] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoadingWeather, setIsLoadingWeather] = useState(false);
    const [weatherError, setWeatherError] = useState("");
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // focus 관리
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleTouchStart(event: TouchEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("touchstart", handleTouchStart);
        return () => document.removeEventListener("touchstart", handleTouchStart);
    }, []);

    useEffect(() => {
        if (!location) {
            setLocationCandidates([]);
            setShowDropdown(false);
            return;
        }
        let abortController = new AbortController();
        async function fetchCities() {
            setIsLoadingCities(true);
            try {
                const res = await fetch(
                    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=5&appid=${OPENWEATHER_API_KEY}`,
                    { signal: abortController.signal }
                );
                const data = await res.json();
                setLocationCandidates(data);
                setShowDropdown(data.length > 0);
            } catch (err) {
                setLocationCandidates([]);
                setShowDropdown(false);
            } finally {
                setIsLoadingCities(false);
            }
        }
        const timeout = setTimeout(fetchCities, 300);
        return () => {
            clearTimeout(timeout);
            abortController.abort();
        };
    }, [location]);

    useEffect(() => {
        async function fetchWeather() {
            if (!selectedCity || !date) {
                setFeelsLikeTemperature("");
                return;
            }
            setIsLoadingWeather(true);
            setWeatherError("");
            try {
                const weatherRes = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCity.lat}&lon=${selectedCity.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
                );
                const weatherData = await weatherRes.json();
                if (weatherData?.main?.feels_like == null)
                    throw new Error("날씨 정보를 가져올 수 없습니다.");
                setFeelsLikeTemperature(String(weatherData.main.feels_like));
            } catch (err: any) {
                setFeelsLikeTemperature("");
                setWeatherError(err.message || "날씨 정보를 가져올 수 없습니다.");
            } finally {
                setIsLoadingWeather(false);
            }
        }
        fetchWeather();
    }, [selectedCity, date]);

    useEffect(() => {
        // 도시 자동완성 후보가 하나일 때 자동 선택
        if (!selectedCity && locationCandidates.length === 1) {
            setSelectedCity(locationCandidates[0]);
            setLocation(`${locationCandidates[0].name}${locationCandidates[0].state ? `, ${locationCandidates[0].state}` : ""}, ${locationCandidates[0].country}`);
            setShowDropdown(false);
        }
    }, [locationCandidates, selectedCity]);

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
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };
    const handleTagRemove = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleGoBack = () => {
        router.push("/comments");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const body = {
                title,
                email,
                password,
                location,
                feelsLikeTemperature,
                month,
                date,
                sentence: content,
                tagString: tags.join(" "),
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
                    onClick={handleGoBack}
                    className="flex items-center gap-2 px-2 py-2 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-100 transition-all duration-150"
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
                    className="w-full text-base font-bold py-3 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-blue-400 placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white transition-all duration-150"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ color: "#222" }}
                />
            </div>

            {/* PC/모바일 조건부 layout */}
            <div className="mb-4">
                <div className="flex flex-col md:flex-row gap-2">
                    {/* 이메일 */}
                    <div className="flex items-center flex-1 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-blue-400 transition-all duration-150">
                        <Mail size={18} className="mr-2 text-blue-500" />
                        <input
                            ref={emailRef}
                            type="email"
                            placeholder="이메일"
                            className="w-full text-sm bg-transparent focus:outline-none placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ color: "#222" }}
                            onFocus={(e) => e.target.classList.add("animate-blink")}
                            onBlur={(e) => e.target.classList.remove("animate-blink")}
                        />
                    </div>
                    {/* 비밀번호 */}
                    <div className="flex items-center flex-1 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2 focus-within:border-blue-400 transition-all duration-150">
                        <Lock size={18} className="mr-2 text-blue-500" />
                        <input
                            ref={passwordRef}
                            type="password"
                            placeholder="비밀번호"
                            className="w-full text-sm bg-transparent focus:outline-none placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            style={{ color: "#222" }}
                            onFocus={(e) => e.target.classList.add("animate-blink")}
                            onBlur={(e) => e.target.classList.remove("animate-blink")}
                        />
                    </div>
                </div>
                {/* 날짜 */}
                <input
                    type="date"
                    className="w-full text-sm py-3 px-4 mt-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-blue-400"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    style={{ color: "#222" }}
                />
            </div>

            {/* 날씨 정보 - 한 줄 정렬 */}
            <div className="grid grid-cols-1 gap-2 mb-4">
                <div className="relative" ref={dropdownRef}>
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                        <MapPin size={22} className="text-blue-500 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="도시 검색"
                            className="bg-transparent focus:outline-none text-sm w-full placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white"
                            value={location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                setSelectedCity(null);
                            }}
                            onFocus={() => setShowDropdown(locationCandidates.length > 0)}
                            autoComplete="off"
                            required
                            style={{ color: "#222" }}
                        />
                        {isLoadingCities && <Loader2 className="animate-spin ml-1" size={18} />}
                    </div>
                    {showDropdown && (
                        <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-sm max-h-48 overflow-auto">
                            {locationCandidates.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-gray-400">검색 결과 없음</div>
                            ) : (
                                locationCandidates.map((city, idx) => (
                                    <div
                                        key={city.lat + city.lon + idx}
                                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-900 transition"
                                        onClick={() => {
                                            setSelectedCity(city);
                                            setLocation(city.name + (city.state ? `, ${city.state}` : "") + `, ${city.country}`);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        {city.name} {city.state ? `, ${city.state}` : ""} ({city.country})
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-blue-100 bg-blue-50">
                    <Thermometer size={22} className="text-blue-500 flex-shrink-0" />
                    <input
                        type="number"
                        placeholder="체감온도(°C)"
                        className="bg-transparent focus:outline-none text-sm w-32 placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white"
                        value={feelsLikeTemperature}
                        readOnly
                        required
                        style={{ color: "#222" }}
                    />
                    {isLoadingWeather && <Loader2 className="animate-spin text-gray-400 ml-2" size={16} />}
                    {weatherError && <span className="text-xs text-red-500 ml-2">{weatherError}</span>}
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
                    <CalendarDays size={22} className="text-blue-500 flex-shrink-0" />
                    <input
                        type="number"
                        min={1}
                        max={12}
                        placeholder="월"
                        className="bg-transparent focus:outline-none text-sm w-20 placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        required
                        style={{ color: "#222" }}
                    />
                </div>
            </div>

            {/* 내용 */}
            <div className="mb-4">
                <textarea
                    placeholder="내용을 입력하세요"
                    className="w-full text-base py-3 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:border-blue-400 placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white min-h-[120px] resize-none transition-all duration-150"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    style={{ color: "#222" }}
                />
            </div>

            {/* 태그 */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <input
                        type="text"
                        placeholder="#태그 입력 후 Enter"
                        className="bg-gray-50 focus:outline-none px-4 py-2 text-sm rounded-lg border border-gray-200 placeholder-gray-400 focus:placeholder-blue-400 focus:bg-white w-full"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" ? (e.preventDefault(), handleTagAdd()) : undefined}
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
                <div className="flex gap-2 flex-wrap">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs cursor-pointer border border-blue-200 shadow-sm"
                            onClick={() => handleTagRemove(tag)}
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* 이미지 업로드/미리보기 */}
            <div className="mb-6">
                <label className="block text-sm text-gray-800 mb-2 font-semibold">이미지</label>
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
                        <img src={imageUrl} alt="미리보기" className="max-w-full max-h-44 object-contain" />
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
                    0% { box-shadow: 0 0 0 0 #3b82f6; }
                    50% { box-shadow: 0 0 0 4px #3b82f6aa; }
                    100% { box-shadow: 0 0 0 0 #3b82f6; }
                }
                .animate-blink {
                    animation: blink 1s linear infinite;
                }
            `}</style>
        </form>
    );
}