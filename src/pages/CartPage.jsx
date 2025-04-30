import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext";
import { DataContext } from "../DataContext";
import { Container, Footer, Header } from "../components";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { Link } from "react-router";
export const CartPage = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    clearCoupon,
  } = useContext(AuthContext);
  const { language } = useContext(DataContext);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(3.75);
  const [rateError, setRateError] = useState(null);

  const API_KEY = "b7760452947b4719f69ea899";
  // Fetch USD to SAR exchange rate
  useEffect(() => {
    // Check for cached rate
    const cachedRate = localStorage.getItem("usd_to_sar");
    if (cachedRate) {
      setExchangeRate(Number(cachedRate));
    }
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch exchange rate: ${response.status} ${errorText}`
          );
        }
        const data = await response.json();
        if (data.result === "success" && data.conversion_rates.SAR) {
          setExchangeRate(data.conversion_rates.SAR);
          localStorage.setItem("usd_to_sar", data.conversion_rates.SAR);
          setRateError(null);
        } else {
          throw new Error("Invalid API response");
        }
      } catch (error) {
        console.error("Exchange rate error:", error.message);
        setRateError(
          language === "ar"
            ? "فشل في جلب سعر الصرف، يتم استخدام القيمة الافتراضية"
            : "Failed to fetch exchange rate, using default value"
        );
        setExchangeRate(3.75); // Fallback
        setTimeout(() => setRateError(null), 3000);
      }
    };
    fetchExchangeRate();
  }, [language]); // Re-fetch if language changes

  // Convert price to the appropriate currency
  const getPrice = (item) => {
    if (language === "ar") {
      const price = (item.currentPrice || 0) * exchangeRate;
      return price;
    }
    const price = item.currentPrice || 0;
    return price;
  };
  // Calculate Subtotal Price
  const subTotal = cart.reduce((total, item) => {
    const itemPrice = getPrice(item) * item.quantity;
    return total + (Number.isFinite(itemPrice) ? itemPrice : 0);
  }, 0);
  // Calculate discount based on applied coupon
  const discount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? (subTotal * appliedCoupon.discountValue) / 100
      : Math.min(
          language === "ar"
            ? appliedCoupon.discountValue
            : appliedCoupon.discountValue / exchangeRate,
          subTotal
        )
    : 0;

  // Calculate total
  const total = Number.isFinite(subTotal - discount) ? subTotal - discount : 0;
  // Convert numbers to Arabic numerals (no decimals)
  const toArabicNumbers = (num) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    const value = Number.isFinite(Number(num)) ? Math.floor(Number(num)) : 0;
    const str = value.toString();
    return str.replace(/\d/g, (digit) => arabicNumbers[parseInt(digit)]);
  };

  // Format price for display
  const formatPrice = (price) => {
    if (language === "ar") {
      return `${toArabicNumbers(price)} ر.س`;
    }
    return `$${price.toFixed(2)}`;
  };
  // Handle coupon application
  const handleApplyCoupon = async () => {
    try {
      await applyCoupon(couponCode);
      setCouponMessage({
        type: "success",
        text:
          language === "ar"
            ? "تم تطبيق الكوبون بنجاح"
            : "Coupon applied successfully",
      });
      setCouponCode("");
    } catch (error) {
      setCouponMessage({
        type: "error",
        text: error.message,
      });
    }
    setTimeout(() => setCouponMessage(null), 3000);
  };
  // Handle coupon removal
  const handleClearCoupon = async () => {
    await clearCoupon();
    setCouponMessage({
      type: "success",
      text:
        language === "ar"
          ? "تم حذف الكوبون بنجاح"
          : "Coupon removed successfully",
    });
    setTimeout(() => setCouponMessage(null), 3000);
  };
  return (
    <>
      <Header />
      <Container lgPx="40">
        <div className="w-full flex flex-col gap-4">
          {/* Table Header */}
          <div className="mb-4 rounded-[4px] hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-4 py-4 bg-gray-100 shadow-sm font-medium text-sm sticky top-0 z-10">
            <p
              className={
                language === "ar" ? "text-right px-2" : "text-left px-2"
              }
            >
              {language === "ar" ? "المنتج" : "Product"}
            </p>
            <p className="text-center">
              {language === "ar" ? "السعر" : "Price"}
            </p>
            <p className="text-center">
              {language === "ar" ? "الكمية" : "Quantity"}
            </p>
            <p className="text-center">
              {language === "ar" ? "الإجمالي" : "Subtotal"}
            </p>
            <p className="text-center">
              {language === "ar" ? "إزالة" : "Remove"}
            </p>
          </div>

          {/* Cart Items */}
          {cart && cart.length > 0 ? (
            cart.map((item) => (
              <>
                <div
                  key={item.id}
                  className="mb-4 flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] items-start md:items-center px-4 py-4 shadow-[0px_1px_13px_0px_rgba(0,0,0,0.05)] text-sm"
                >
                  {/* Product */}
                  <div className="flex flex-row items-center justify-between gap-3 mb-2 w-full md:mb-0 md:flex md:gap-3 md:px-2">
                    <p
                      className={`font-medium px-4 py-2 w-[100px] bg-gray-100 md:hidden rounded-[4px] text-center ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {language === "ar" ? "المنتج" : "Product"}
                    </p>
                    <div className="flex flex-row items-center gap-3 md:flex md:gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-contain"
                      />
                      <p className="text-sm font-medium">
                        {language === "ar" ? item.nameAr : item.name}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex flex-row items-center justify-between gap-3 mb-2 w-full md:mb-0 md:flex md:items-center md:justify-center">
                    <p
                      className={`font-medium px-4 py-2 w-[100px] rounded-[4px] text-center bg-gray-100 md:hidden ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {language === "ar" ? "السعر" : "Price"}
                    </p>
                    <p className="md:text-center">
                      {formatPrice(getPrice(item))}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex flex-row items-center justify-between gap-3 mb-2 w-full md:mb-0 md:flex md:items-center md:justify-center">
                    <p
                      className={`font-medium px-4 py-2 bg-gray-100 md:hidden w-[100px] rounded-[4px] text-center ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {language === "ar" ? "الكمية" : "Quantity"}
                    </p>
                    <div className="flex items-center border-[1.5px] rounded-[4px] border-black/40 md:px-2 px-1 md:py-2 py-1 w-fit">
                      <span className="mx-2 md:text-[16px] text-base font-medium text-red-600">
                        {language === "ar"
                          ? toArabicNumbers(item.quantity)
                          : item.quantity}
                      </span>
                      <div className="flex flex-col">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="text-[11px]"
                          aria-label="Increase quantity"
                        >
                          <IoIosArrowUp />
                        </button>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="text-[11px]"
                          aria-label="Decrease quantity"
                        >
                          <IoIosArrowDown />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="flex flex-row items-center justify-between gap-3 mb-2 w-full md:mb-0 md:flex md:items-center md:justify-center">
                    <p
                      className={`font-medium px-4 py-2 bg-gray-100 md:hidden w-[100px] rounded-[4px] text-center ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {language === "ar" ? "الإجمالي" : "Subtotal"}
                    </p>
                    <p className="md:text-center">
                      {formatPrice(getPrice(item) * item.quantity)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <div className="flex flex-row items-center justify-between gap-3 w-full md:mb-0 md:flex md:items-center md:justify-center">
                    <p
                      className={`font-medium px-4 py-2 bg-gray-100 md:hidden w-[100px] rounded-[4px] text-center ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {language === "ar" ? "إزالة" : "Remove"}
                    </p>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            language === "ar"
                              ? "هل تريد إزالة هذا المنتج؟"
                              : "Remove this item?"
                          )
                        ) {
                          removeFromCart(item);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 text-2xl w-[24px] h-[24px]"
                      aria-label="Remove item from cart"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              </>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 text-base">
              {language === "ar"
                ? "لا توجد منتجات في السلة"
                : "Your cart is empty"}
            </div>
          )}
          {/* Coupon and Total Section */}
          <div className="mt-6 mb-20 flex lg:flex-row flex-col gap-10 justify-between ">
            <div className="flex flex-col gap-4">
              <div className="flex flex-row items-start gap-6">
                <input
                  type="text"
                  value={couponCode}
                  className="border rounded-[4px] border-black/40 md:px-4 px-2 py-3 md:w-[200px] w-full md:text-base text-sm"
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder={
                    language === "ar" ? "أدخل كود الكوبون" : "Coupon Code"
                  }
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-Button text-white md:px-12 px-2 py-3 rounded-[4px] w-full md:w-auto md:text-base text-sm"
                  disabled={!couponCode}
                >
                  {language === "ar" ? "تطبيق كوبون" : "Apply Coupon"}
                </button>
                {appliedCoupon && (
                  <button
                    onClick={handleClearCoupon}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    {language === "ar" ? "إزالة الكوبون" : "Remove Coupon"}
                  </button>
                )}
              </div>
              {couponMessage && (
                <p
                  className={`text-sm ${
                    couponMessage.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {couponMessage.text}
                </p>
              )}
              {rateError && <p className="text-sm text-red-600">{rateError}</p>}
            </div>
            <div className="border-[1.5px] border-black md:px-4 px-2 py-4 rounded-[4px] flex flex-col w-full md:w-[420px]">
              <h1 className="md:text-lg font-medium">
                {language === "ar" ? "إجمالي السلة" : "Cart Total"}
              </h1>
              <div className="flex justify-between w-full border-b-[1.5px] border-black/20 py-3 md:text-base text-sm">
                <p>{language === "ar" ? "المجموع الفرعي" : "Subtotal"} </p>
                <p>{formatPrice(subTotal)}</p>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between w-full border-b-[1.5px] border-black/20 py-3 md:text-base text-sm">
                  <p>
                    {language === "ar"
                      ? `الخصم (${appliedCoupon.code})`
                      : `Discount (${appliedCoupon.code})`}
                  </p>
                  <p>{formatPrice(-discount)}</p>
                </div>
              )}
              <div className="flex justify-between w-full border-b-[1.5px] border-black/20 py-3 md:text-base text-sm">
                <p>{language === "ar" ? "الشحن" : "Shipping"}:</p>
                <p>{language === "ar" ? "مجاني" : "Free"}</p>
              </div>
              <div className="flex justify-between w-full py-3 md:text-base text-sm">
                <p>{language === "ar" ? "الإجمالي" : "Total"}:</p>
                <p>{formatPrice(total)}</p>
              </div>
              <Link
                to="/checkout"
                className="bg-Button text-white md:px-12 px-2 py-3 rounded-[4px] w-full md:w-[260px] mt-4 mx-auto md:text-base text-sm"
              >
                {language === "ar" ? "اتمام الطلب" : "Procees to checkout"}
              </Link>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  );
};

export default CartPage;
