/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useState } from "react";
import { Button, DropdownMenu } from "@radix-ui/themes";
import { RiShoppingBag3Fill } from "react-icons/ri";
import { MdOutlineCancel } from "react-icons/md";
import "@radix-ui/themes/styles.css";
import { SearchInput } from "./SearchInput";
import { FaUserAlt } from "react-icons/fa";
import heart from "@assets/heart.png";
import cartImage from "@assets/cart.png";
import clsx from "clsx";
import { DataContext } from "../DataContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CustomDropdown } from "./CustomDropdown";
import { useAuth } from "../AuthContext";
import { FaRegStar } from "react-icons/fa6";
import { TbLogout2 } from "react-icons/tb";
export function Header({ isRegister = false }) {
  const { language, handleLanguageChange } = useContext(DataContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const location = useLocation();
  const { currentUser, logout, cart } = useAuth();
  const navigate = useNavigate(); // Use useNavigate for redirection
  // Logout handler
  const handleLogout = () => {
    logout(); // Call the logout function from useAuth
    navigate("/"); // Redirect to the login page after logout
  };

  const handleCartClick = () => {
    navigate("/cart");
  };
  const navItems = useMemo(
    () => [
      {
        name: "Home",
        path: "/",
        arPath: "/ar",
        labelEn: "Home",
        labelAr: "الرئيسية",
      },
      {
        name: "Contact",
        path: "/contact",
        arPath: "/ar/contact",
        labelEn: "Contact",
        labelAr: "اتصل بنا",
      },
      {
        name: "About",
        path: "/about",
        arPath: "/ar/about",
        labelEn: "About",
        labelAr: "معلومات عنا",
      },
      {
        name: "Auth",
        labelEn: currentUser ? "Account" : "Register",
        labelAr: currentUser ? "الحساب" : "سجل الآن",
        dropdown: true,
        options: currentUser
          ? [
              {
                name: "Profile",
                path: "/profile",
                labelEn: "Profile",
                labelAr: "الملف الشخصي",
              },
              {
                name: "Logout",
                action: logout,
                labelEn: "Logout",
                labelAr: "تسجيل الخروج",
              },
            ]
          : [
              {
                name: "Sign Up",
                path: "/signup",
                labelEn: "Sign Up",
                labelAr: "إنشاء حساب",
              },
              {
                name: "Login",
                path: "/login",
                labelEn: "Login",
                labelAr: "تسجيل الدخول",
              },
            ],
      },
    ],
    [currentUser, logout] // Add dependencies here
  );
  useEffect(() => {
    let currentNav = navItems.find((item) => item.path === location.pathname);

    if (!currentNav) {
      // Check if any dropdown options match the location pathname
      const dropdownItem = navItems.find(
        (item) =>
          item.dropdown &&
          item.options.some((option) => option.path === location.pathname)
      );
      if (dropdownItem) {
        currentNav = dropdownItem; // Set Register as active if any of its options are active
      }
    }

    if (currentNav) {
      setActiveNav(currentNav.name);
    }
  }, [location.pathname, navItems]);

  return (
    <header className="relative">
      {/* Top Bar */}
      <div className="flex bg-black h-[48px] text-white items-center text-[11px]">
        <div className="flex items-center md:text-sm justify-center text-center w-full">
          <p className="w-full text-center break-words leading-normal md:leading-relaxed text-[11px] lg:text-base md:text-sm">
            {language === "en"
              ? "Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!"
              : "تخفيضات الصيف على جميع ملابس السباحة وتوصيل سريع مجاني - خصم 50٪!"}
            <span className="inline-block mt-1 px-2 md:text-sm">
              <a
                href="/shop-now"
                className="underline font-semibold text-[11px] md:text-sm"
              >
                {language === "en" ? "Shop Now" : "تسوق الآن"}
              </a>
            </span>
          </p>
        </div>
        {/* Language Dropdown */}
        <div className="lg:absolute lg:right-[150px]">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button
                variant="soft"
                className="!text-white !cursor-pointer focus:outline-none !text-[11px] md:!text-base !bg-transparent !border-none md:!px-6"
              >
                {language === "en" ? "English" : "العربية"}
                <DropdownMenu.TriggerIcon />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={() => handleLanguageChange("en")}>
                English
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={() => handleLanguageChange("ar")}>
                العربية
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Main Header */}
      <div className="md:mx-auto lg:h-[70px] h-[50px] grid grid-cols-[repeat(3,minmax(0,_auto))] border-b-[0.5px] items-center justify-around lg:px-20 md:pl-16 lg:max-w-[1400px]">
        <h1
          className={`lg:text-2xl md:text-base text-[13px] font-semibold lg:pl-2 ${
            language === "ar" ? "text-right" : "text-left"
          }`}
        >
          {language === "en" ? "Exclusive" : "حصري"}
        </h1>

        {/* Navigation Menu */}
        <nav className="relative hidden lg:flex md:flex list-none flex-row gap-3 lg:gap-8 md:gap-1 text-[11px] md:text-sm lg:text-base">
          {navItems.map((item) =>
            item.dropdown ? (
              <CustomDropdown
                key={item.name}
                triggerText={language === "en" ? item.labelEn : item.labelAr}
                isActive={activeNav === "Auth"}
              >
                {item.options.map((option) =>
                  option.path ? (
                    <Link
                      key={option.name}
                      to={option.path}
                      className="block p-2 transition duration-300 ease-in-out hover:text-[#F58A7B]"
                    >
                      {language === "en" ? option.labelEn : option.labelAr}
                    </Link>
                  ) : option.name === "Profile" ? (
                    <Link key={option.name} to={option.path}>
                      {" "}
                      {language === "en" ? option.labelEn : option.labelAr}
                    </Link>
                  ) : (
                    <button
                      key={option.name}
                      onClick={option.action}
                      className="block w-full p-2 text-center transition duration-300 ease-in-out hover:text-[#F58A7B]"
                    >
                      {language === "en" ? option.labelEn : option.labelAr}
                    </button>
                  )
                )}
              </CustomDropdown>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "py-2 px-4 lg:py-0 lg:px-0 lg:border-none cursor-pointer transition",
                  {
                    "underline font-semibold text-Button":
                      activeNav === item.name,
                    "hover:text-[#F58A7B]": activeNav !== item.name,
                  }
                )}
              >
                {language === "en" ? item.labelEn : item.labelAr}
              </Link>
            )
          )}
        </nav>

        {/* Search and Cart icons */}
        <div className="flex gap-2 lg:gap-16 md:gap-4">
          <SearchInput
            onSearchChange={(value) => console.log(value)}
            language={language}
          />
          {!isRegister && (
            <div className="flex lg:gap-4 gap-3 items-center justify-center pl-2 cursor-pointer">
              <img
                src={heart}
                alt="Favourite image"
                className="w-[17px] h-[17px] lg:w-[22px] lg:h-[22px] md:w-[17px] md:h-[17px]"
              />
              <div className="relative" onClick={handleCartClick}>
                <img
                  src={cartImage}
                  alt="Cart image"
                  className="w-[17px] h-[17px] lg:w-[25px] lg:h-[25px] md:w-[17px] md:h-[17px]"
                />
                {cart && cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {cart.length}
                  </span>
                )}
              </div>
              {/* Conditionally render the user icon */}
              {currentUser && (
                <CustomDropdown
                  triggerText={
                    <div className="bg-Button rounded-full lg:w-[32px] lg:h-[32px] md:w-[26px] md:h-[26px] w-[22px] h-[22px] flex items-center justify-center">
                      <FaUserAlt className="w-[10px] h-[10px] lg:w-[15px] lg:h-[15px] md:w-[12px] md:h-[12px] text-white" />
                    </div>
                  }
                  isProfile={true}
                >
                  <div className="flex flex-col text-white gap-2 items-start justify-center font-normal">
                    <div className="flex gap-2 text-white items-center justify-center">
                      <FaUserAlt className="w-[15px] h-[15px] lg:w-[24px] lg:h-[24px] md:w-[20px] md:h-[20px] text-white" />
                      <Link
                        to="/profile"
                        className="block p-2 transition duration-300 md:text-[14px] text-[12px] font-normal leading-[21px] ease-in-out hover:text-[#F58A7B]"
                      >
                        {language === "en"
                          ? "Manage My Account"
                          : " ادارة حسابي"}
                      </Link>
                    </div>
                    <div className="flex gap-2 text-white items-center justify-center">
                      <RiShoppingBag3Fill className="w-[15px] h-[15px] lg:w-[24px] lg:h-[24px] md:w-[20px] md:h-[20px] text-white" />
                      <Link className="block p-2 transition duration-300 md:text-[14px] text-[12px] font-normal leading-[21px] ease-in-out hover:text-[#F58A7B]">
                        {language === "en" ? "My Orders" : "طلباتي"}
                      </Link>
                    </div>
                    <div className="flex gap-2 text-white items-center justify-center">
                      <MdOutlineCancel className="w-[15px] h-[15px] lg:w-[24px] lg:h-[24px] md:w-[20px] md:h-[20px] text-white" />
                      <Link className="block p-2 transition duration-300 md:text-[14px] text-[12px] font-normal leading-[21px] ease-in-out hover:text-[#F58A7B]">
                        {language === "en" ? "My Cancellations" : "الإلغاءات"}
                      </Link>
                    </div>
                    <div className="flex gap-2 text-white items-center justify-center">
                      <FaRegStar className="w-[15px] h-[15px] lg:w-[24px] lg:h-[24px] md:w-[20px] md:h-[20px] text-white" />
                      <Link className="block p-2 transition duration-300 md:text-[14px] text-[12px] font-normal leading-[21px] ease-in-out hover:text-[#F58A7B]">
                        {language === "en" ? "My Reviews" : "التقييمات"}
                      </Link>
                    </div>
                    <div className="flex gap-2 text-white items-center justify-center">
                      <TbLogout2 className="w-[15px] h-[15px] lg:w-[24px] lg:h-[24px] md:w-[20px] md:h-[20px] text-white" />
                      <button
                        onClick={handleLogout}
                        className="block w-full p-2 text-center transition duration-300 ease-in-out hover:text-[#F58A7B] md:text-[14px] text-[12px] font-normal leading-[21px]"
                      >
                        {language === "en" ? "Logout" : "تسجيل الخروج"}
                      </button>
                    </div>
                  </div>
                </CustomDropdown>
              )}
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center justify-end !text-black">
          <button
            className="text-lg focus:outline-none focus:text-black hover:text-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <nav
        className={`md:hidden flex flex-row gap-2 list-none w-full bg-white z-10 border-b-[0.5px] text-[11px] items-center justify-center ${
          isMenuOpen ? "flex" : "hidden"
        }`}
      >
        {navItems.map((item) =>
          item.dropdown ? (
            <CustomDropdown
              key={item.name}
              triggerText={language === "en" ? item.labelEn : item.labelAr}
              isActive={activeNav === "Register"}
            >
              {item.options.map((option) => (
                <Link
                  key={option.name}
                  to={option.path}
                  className="block p-2 transition duration-300 ease-in-out hover:text-[#F58A7B]"
                >
                  {language === "en" ? option.labelEn : option.labelAr}
                </Link>
              ))}
            </CustomDropdown>
          ) : (
            <Link
              key={item.name}
              to={item.path}
              className={clsx("py-2 px-4 cursor-pointer", {
                "underline font-semibold text-[12px] text-Button":
                  activeNav === item.name,
                "hover:text-[#F58A7B]": activeNav !== item.name,
              })}
              onClick={() => setActiveNav(item.name)}
            >
              {language === "en" ? item.labelEn : item.labelAr}
            </Link>
          )
        )}
      </nav>
    </header>
  );
}
