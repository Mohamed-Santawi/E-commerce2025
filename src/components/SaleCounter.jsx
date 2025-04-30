/* eslint-disable react/prop-types */
// /* eslint-disable react/prop-types */
import React, { useState, useContext } from "react";
import Countdown from "react-countdown";
import products from "../productsShow";
import { Card } from "./Card";
import { SectionTitle } from "./SectionTitle";
import { Container } from "./Container";
import { Carousel } from "./Carousel";
import { SliderControls } from "./SliderControls";
import { DataContext } from "../DataContext"; // Import DataContext for language
import { useEffect } from "react";

// Function to convert Western numbers to Arabic numerals
const toArabicNumerals = (num) => {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((digit) => arabicNumerals[digit] || digit)
    .join("");
};

const addLeadingZero = (num, language) => {
  const formattedNum = num < 10 ? `0${num}` : num;
  return language === "ar" ? toArabicNumerals(formattedNum) : formattedNum;
};

const TimeUnit = ({ label, value, language }) => (
  <div className="flex flex-col items-center">
    <span className="text-xs md:text-sm font-medium">{label}</span>
    <span className="text-xl md:text-4xl font-bold">
      {addLeadingZero(value, language)}
    </span>
  </div>
);

const TimeSeparator = () => (
  <div className="flex flex-col items-center gap-1 justify-center">
    <span className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-hover"></span>
    <span className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-hover"></span>
  </div>
);
const useProductsPerSlide = () => {
  const [productsPerSlide, setProductsPerSlide] = useState(3);

  useEffect(() => {
    const updateProductsPerSlide = () => {
      if (window.innerWidth >= 1024) {
        setProductsPerSlide(3); // Desktop
      } else if (window.innerWidth >= 768) {
        setProductsPerSlide(2); // Tablet
      } else {
        setProductsPerSlide(1); // Mobile
      }
    };

    updateProductsPerSlide(); // Initial setup
    window.addEventListener("resize", updateProductsPerSlide); // Listen for resize

    return () => {
      window.removeEventListener("resize", updateProductsPerSlide); // Cleanup
    };
  }, []);

  return productsPerSlide;
};
export function SaleCounter() {
  const { language } = useContext(DataContext); // Get the language from context
  const [targetDate] = useState(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const [currentSlide, setCurrentSlide] = useState(0);
  const productsPerSlide = useProductsPerSlide();
  const selectedProductIds = [12, 13, 6, 14, 15, 16, 9, 5];
  const filteredProducts = products.filter(
    (product) =>
      !(selectedProductIds.includes(product.id) && "newProduct" in product)
  );



  const nextSlide = () => {
    if (filteredProducts.length === 0) return; // Add check for empty array
    setCurrentSlide((prev) => {
      const next = prev + 1;
      return next < filteredProducts.length ? next : 0; // Loop back to the first slide
    });
  };

  const prevSlide = () => {
    if (filteredProducts.length === 0) return; // Add check for empty array
    setCurrentSlide((prev) => {
      const prevSlide = prev - 1;
      return prevSlide >= 0 ? prevSlide : filteredProducts.length - 1; // Loop back to the last slide
    });
  };
  useEffect(() => {
    setCurrentSlide(0); // Reset to the first slide whenever screen size changes
  }, [productsPerSlide]); // This will trigger the reset whenever `productsPerSlide` changes

  const renderer = ({ days, hours, minutes, seconds }) => {
    const timeUnits = [
      { label: language === "ar" ? "أيام" : "Days", value: days },
      { label: language === "ar" ? "ساعات" : "Hours", value: hours },
      { label: language === "ar" ? "دقائق" : "Minutes", value: minutes },
      { label: language === "ar" ? "ثواني" : "Seconds", value: seconds },
    ];

    return (
      <div className={`flex space-x-2 md:space-x-4 `}>
        {timeUnits.map((unit, index) => (
          <React.Fragment key={unit.label}>
            <TimeUnit
              label={unit.label}
              value={unit.value}
              language={language}
            />
            {index < timeUnits.length - 1 && <TimeSeparator />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Container lgPx="28">
      <div
        className={`flex flex-col lg:flex-row justify-between mb-4 lg:mb-12 ${
          language === "ar" ? "text-right" : ""
        }`}
      >
        <div className="flex lg:flex-row gap-4 lg:gap-20 items-center">
          <SectionTitle
            title={language === "ar" ? "عروض اليوم" : "Today’s"}
            content={language === "ar" ? "التخفيضات السريعة" : "Flash Sales"}
          />
          <Countdown date={targetDate} renderer={renderer} />
        </div>
        <div className="flex items-end justify-end relative -top-4">
          <SliderControls
            onNext={language === "ar" ? prevSlide : nextSlide}
            onPrev={language === "ar" ? nextSlide : prevSlide}
          />
        </div>
      </div>

      {/* Product Carousel */}
      <Carousel
        items={filteredProducts}
        renderItem={(product) => <Card product={product} language={language} />}
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        productsPerSlide={productsPerSlide}
      />

      <button className="flex items-center justify-center w-[240px] bg-Button text-white py-4 px-12 rounded-[4px] font-medium mb-10 lg:text-base text-sm mx-auto">
        {language === "ar" ? "عرض جميع المنتجات" : "View All Products"}
      </button>

      <div className="w-full max-w-[1400px] mx-auto border-b-[0.5px]"></div>
    </Container>
  );
}
