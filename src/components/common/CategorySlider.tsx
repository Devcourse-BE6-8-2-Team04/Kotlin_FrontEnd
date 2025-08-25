import React from "react";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ClothingItem {
  clothName: string;
  imageUrl: string;
  category: string;
}

interface CategorySliderProps {
  groupedItems: Record<string, ClothingItem[]>;
  categoryNameMap: Record<string, string>;
}

export default function CategorySlider({ groupedItems, categoryNameMap }: CategorySliderProps) {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    centerMode: false,
    centerPadding: "0px",
  };

  return (
    <>
      <Slider {...settings} className="custom-slick-slider w-[350px] h-[375px]">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} style={{ padding: "0 0px" }}>
            <div className="w-[290px] h-[375px] p-6 bg-[#ffffffcf] rounded-[15px] shadow-[3px_4px_10px_rgba(0,0,0,0.25)] mx-auto">
              <div className="text-center text-base font-semibold text-gray-700 pt-2">
                {categoryNameMap[category] || category}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {items.map((item, idx) => (
                  <img
                    key={idx}
                    src={item.imageUrl}
                
                    alt={item.clothName}
                    className="w-[121px] h-[121px] object-cover"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </Slider>

      <style jsx global>{`
        /* slick-slider 및 slick-list의 overflow를 visible로 */
        .custom-slick-slider.slick-slider {
          overflow: visible !important;
        }
        .custom-slick-slider .slick-list {
          overflow: visible !important;
        }
      `}</style>
    </>
  );
}