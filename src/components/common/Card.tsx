import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  opacity?: number; // 0~100
  style?: React.CSSProperties;
}

export default function Card({
  children,
  className = "",
  style, // ✅ 추가
}: CardProps) {
  return (
    <div className={clsx("rounded-xl shadow-md transition-all", className)} style={style}>
      {children}
    </div>
  );
}
