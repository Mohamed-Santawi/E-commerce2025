/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useContext } from "react";
import clsx from "clsx";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { DataContext } from "../DataContext";

export function CustomDropdown({
  children,
  triggerText,
  isActive,
  isProfile = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { language } = useContext(DataContext);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={clsx(
          "cursor-pointer text-[11px] md:text-sm lg:text-base md:pt-2 lg:pt-0",
          isActive && "underline font-semibold text-Button" // Use prop for active state
        )}
      >
        {triggerText}
        {!isProfile && (
          <MdOutlineKeyboardArrowDown className="inline-block ml-2 md:text-2xl text-lg" />
        )}
      </button>
      {isOpen && (
        <div
          className={clsx(
            "absolute  flex flex-col items-center justify-center mt-2 z-10",
            language === "en" ? "right-0" : "left-0",
            isProfile
              ? "md:w-[224px] md:h-[240px] w-[200px] h-[220px] bg-black/5 backdrop-blur-[150px] rounded-[4px]"
              : "w-[130px] bg-white shadow-lg rounded-md border border-gray-300"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
