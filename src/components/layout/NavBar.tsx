import React from "react";
import { Home, Search, ShoppingBag, Menu } from "lucide-react";
import Link from "next/link";

export default function NavBar() {
  return (
    <>
      {/* 배경 레이어 */}
      <div className="fixed bottom-0 left-0 w-full h-[73px] bg-white z-0 shadow" />

      {/* 실제 네비게이션 바 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[73px] bg-white flex justify-between items-center px-10 z-10">
        <Link href="/plan">
          <Search className="w-6 h-6" />
        </Link>

        <Link href="/">
          <Home className="w-6 h-6" />
        </Link>
        
        <Link href="/clothdetail">
          <ShoppingBag className="w-6 h-6" />
        </Link>
        
        <Link href="/comments">
          <Menu className="w-6 h-6" />
        </Link>
      </nav>
    </>
  );
}
