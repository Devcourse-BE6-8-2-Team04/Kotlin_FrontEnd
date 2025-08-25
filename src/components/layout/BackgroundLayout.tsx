import React, { ReactNode } from "react";

interface BackgroundLayoutProps {
  backgroundImage?: string; 
  backgroundColor?: string; 
  children: ReactNode;
}

export default function BackgroundLayout({
  backgroundImage,
backgroundColor = "#97d2e8",
  children,
}: BackgroundLayoutProps) {
  return (
    <div
      className="relative w-[390px] min-h-screen"
      style={{
        backgroundColor,
      }}
    >
      {backgroundImage && (
        <img
          className="absolute top-0 left-0 w-[390px] min-h-screen object-cover"
          src={backgroundImage}
          alt="Background"
        />
      )}
      {children}
    </div>
  );
}
