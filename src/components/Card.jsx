/* eslint-disable react/prop-types */
import { MdOutlineRemoveRedEye } from "react-icons/md";
import heart from "../assets/heart2.png";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { useContext } from "react";
import { AuthContext } from "../AuthContext";

// Convert Western numbers to Arabic numerals
const toArabicNumerals = (num) => {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((digit) => arabicNumerals[digit] || digit)
    .join("");
};

// Add leading zero and format based on language
const addLeadingZero = (num, language) => {
  const formattedNum = num < 10 ? `0${num}` : num;
  return language === "ar" ? toArabicNumerals(formattedNum) : formattedNum;
};

export const Card = ({ product, language, inOurProducts }) => {
  const {
    name,
    nameAr,
    currentPrice,
    currentPriceAr,
    previousPrice,
    previousPriceAr,
    discount,
    discountAr,
    stars,
    rating,
    image,
    newProduct,
    colors,
  } = product;
  const { addToCart } = useContext(AuthContext);
  const handleAddToCart = () => {
    addToCart(product);
  };
  // Choose correct language values
  const displayName = language === "ar" ? nameAr : name;
  const displayCurrentPrice =
    language === "ar" ? toArabicNumerals(currentPriceAr) : `$${currentPrice}`;
  const displayPreviousPrice =
    language === "ar"
      ? previousPriceAr !== "٠"
        ? toArabicNumerals(previousPriceAr)
        : ""
      : previousPrice !== 0
      ? `$${previousPrice}`
      : "";
  const displayDiscount =
    language === "ar" ? toArabicNumerals(discountAr) : discount;

  return (
    <div className="card relative w-[270px] h-[400px] bg-white rounded-[4px] flex flex-col items-center justify-center mb-20 group">
      <div className="w-[270px] h-[250px] bg-[#F5F5F5] relative flex flex-col">
        <div className="flex justify-between items-center w-full px-3">
          {discount ? (
            <div className="w-14 h-6 bg-Button text-white py-1 px-3 rounded-[4px]">
              <span className="text-[12px] font-normal block">
                -{displayDiscount}%
              </span>
            </div>
          ) : newProduct ? (
            <div className="w-[51px] h-[26px] bg-[#00FF66] text-white py-1 px-3 rounded-[4px] text-xs flex items-center justify-center">
              NEW
            </div>
          ) : (
            ""
          )}

          <div className="flex flex-col items-center gap-1 justify-center pt-1.5">
            <span className="flex w-6 h-6 rounded-full bg-white items-center justify-center">
              <img src={heart} className="w-4 h-[14px]" alt="Heart Icon" />
            </span>
            <span className="flex w-6 h-6 rounded-full bg-white items-center justify-center">
              <MdOutlineRemoveRedEye className="w-[20px] h-[18px]" />
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <img src={image} alt={displayName} />
        </div>
        {/* "Add to Cart" button */}
        <div className="absolute bottom-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            className="bg-black text-white py-2 rounded-[4px] w-full"
          >
            {language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-start w-full pl-3">
        <h2 className="text-base font-medium mt-4 flex justify-start">
          {displayName}
        </h2>
        <div className="flex items-center mt-4">
          <span className="lg:text-base text-sm font-medium text-Button mr-2">
            {displayCurrentPrice}
          </span>
          {displayPreviousPrice && (
            <span className="lg:text-base text-sm font-medium line-through text-gray-500">
              {displayPreviousPrice}
            </span>
          )}
        </div>
        {stars ? (
          <div className="flex items-center mt-2">
            {Array.from({ length: Math.floor(stars) }, (_, index) => (
              <FaStar key={index} className="text-stars w-[20px] h-[20px]" />
            ))}
            {stars % 1 !== 0 && (
              <FaStarHalfAlt className="text-stars w-[20px] h-[20px]" />
            )}
            <span className="ml-2 text-sm font-semibold text-gray-400">
              ({addLeadingZero(rating, language)})
            </span>
          </div>
        ) : (
          ""
        )}
        {inOurProducts && colors ? (
          <div className="flex items-center gap-2 mt-3">
            {/* Dynamic Color */}
            <div className="w-[20px] h-[20px] rounded-full border-2 border-black flex items-center justify-center">
              <span
                className="w-[12px] h-[12px] rounded-full block"
                style={{ backgroundColor: colors }}
              ></span>
            </div>

            {/* Static Button Color */}
            <div className="w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center">
              <span className="w-full h-full rounded-full block bg-Button"></span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
