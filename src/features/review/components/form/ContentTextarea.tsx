"use client";

interface ContentTextareaProps {
  content: string;
  error?: string;
  isLoggedIn: boolean;
  onChange: (value: string) => void;
}

export function ContentTextarea({
  content,
  error,
  isLoggedIn,
  onChange,
}: ContentTextareaProps) {
  return (
    <div>
      <textarea
        placeholder={`여행지의 날씨나 분위기, 입었던 착장을\n자유롭게 작성해주세요!`}
        className={`w-full px-2 py-4 bg-white border-0 text-base placeholder-gray-400 resize-none ${
          isLoggedIn ? "min-h-[340px]" : "min-h-[250px]"
        } focus:outline-none`}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        maxLength={500}
      />
      {error && <p className="text-sm text-red-500 mt-1 px-2">{error}</p>}
    </div>
  );
}
