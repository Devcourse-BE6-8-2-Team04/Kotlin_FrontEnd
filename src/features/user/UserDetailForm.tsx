"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/features/user/api";

type Tendency = "COLD_SENSITIVE" | "NEUTRAL" | "HEAT_SENSITIVE";
type Gender = "MALE" | "FEMALE";

interface User {
  id: number;
  userId: string;
  createDate: string;
  modifyDate: string;
  email: string;
  age: number;
  gender: Gender;
  tendency: Tendency;
}

const tendencyImageMap: Record<Tendency, string> = {
  COLD_SENSITIVE: "/cold.png",
  NEUTRAL: "/neutral.png",
  HEAT_SENSITIVE: "/hot.png",
};

export default function UserDetailForm() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 내 정보 조회
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }
    (async () => {
      try {
        const res = await api.get("/api/v1/members/me"); // 인터셉터가 토큰 자동 부착
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("accessToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await api.delete("/api/v1/auth/logout"); // (선택) 서버 쿠키 삭제
    } catch (e) {
      console.error("서버 로그아웃 실패", e);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      router.push("/user"); // 로그인 전(처음) 화면으로
    }
  };

  const Avatar = ({ size = 56 }: { size?: number }) => (
    <div
      className="overflow-hidden rounded-full shadow-md ring-1 ring-black/5 bg-white"
      style={{ width: size, height: size }}
    >
      <Image
        src="/avatar.png"
        alt="avatar"
        width={size}
        height={size}
        className="h-full w-full object-cover"
        priority
      />
    </div>
  );

  const Divider = () => <hr className="my-6 border-t border-[#E3E3E3]" />;

  if (loading) return <p>Loading...</p>;

  // 비로그인 UI
  if (!user) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar />
            <span className="text-gray-600">로그인</span>
          </div>
          <button className="underline text-blue-500" onClick={() => router.push("/auth")}>
            로그인
          </button>
        </div>

        <h3 className="font-bold">회원 정보</h3>
        <Divider />
        <div className="space-y-4 text-gray-500">
          <div className="flex justify-between"><span>나이</span><span>-</span></div>
          <div className="flex justify-between"><span>성별</span><span>-</span></div>
          <div className="flex justify-between"><span>이메일</span><span>-</span></div>
        </div>

        <Divider />
        <h3 className="font-bold">날씨 성향</h3>
        <div className="mt-6 flex justify-center text-gray-500">이미지 없음</div>
      </div>
    );
  }

  // 로그인 UI
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar />
          <span className="font-medium">{user.userId}</span>
        </div>
        <button className="underline text-red-500" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <h3 className="font-bold">회원 정보</h3>
      <Divider />
      <div className="space-y-4">
        <div className="flex justify-between"><span>나이</span><span className="font-medium">{user.age}</span></div>
        <div className="flex justify-between">
          <span>성별</span>
          <span className="font-medium">{user.gender === "MALE" ? "남성" : "여성"}</span>
        </div>
        <div className="flex justify-between"><span>이메일</span><span className="font-medium">{user.email}</span></div>
      </div>

      <Divider />
      <h3 className="font-bold">날씨 성향</h3>
      <div className="mt-6 flex justify-center">
        <Image
          src={tendencyImageMap[user.tendency]}
          alt={user.tendency}
          width={150}
          height={150}
        />
      </div>
    </div>
  );
}
