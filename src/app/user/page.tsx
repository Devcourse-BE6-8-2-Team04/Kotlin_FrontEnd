// src/app/user/page.tsx
import React from "react";
import Link from "next/link";
import UserDetailForm from "@/features/user/UserDetailForm";

export default function MemberInfo() {
  const backgroundColor = "#ffffff";
  const backgroundImage: string | undefined = undefined; // 예: "/bg.jpg"

  return (
    <div className="min-h-screen w-full flex justify-center">
      <div className="relative w-[390px] min-h-screen mx-auto" style={{ backgroundColor }}>
        {backgroundImage && (
          <img
            className="absolute top-0 left-0 w-[390px] min-h-screen object-cover pointer-events-none z-0"
            src={backgroundImage}
            alt="Background"
          />
        )}

        {/* 컨텐츠 */}
        <div className="relative z-10 px-4 py-12 pb-32">
          <UserDetailForm />
        </div>

        {/* 하단 NavBar */}
        {/* <nav className="absolute bottom-0 left-0 w-full z-20">
          <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-[#E3E3E3]">
            <div className="flex h-14 items-center justify-around">
              <Link href="/" className="text-sm">홈</Link>
              <Link href="/search" className="text-sm">검색</Link>
              <Link href="/user" className="text-sm">마이</Link>
            </div>
          </div>
        </nav> */}
      </div>
    </div>
  );
}
