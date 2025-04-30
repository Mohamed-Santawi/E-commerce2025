/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { DataContext } from "../DataContext";
import { Link } from "react-router";

function CartSummary({
  subTotal,
  discount,
  total,
  appliedCoupon,
  formatPrice,
  applyCoupon,
  clearCoupon,
  showCheckoutLink = true,
}) {
  const { language } = useContext(DataContext);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState(null);

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
    <div className="flex flex-col gap-3 py-4 w-full ">
      <h2 className="text-lg font-medium">
        {language === "ar" ? "إجمالي السلة" : "Cart Total"}
      </h2>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex lg:flex-row lg:items-center flex-col gap-6">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder={language === "ar" ? "أدخل كود الكوبون" : "Coupon Code"}
            className="border rounded-[4px] outline-none border-black/40 md:px-4 px-2 py-3 md:w-[200px] w-full md:text-base text-sm"
          />
          <button
            onClick={handleApplyCoupon}
            className="bg-Button text-white md:px-8  px-2 py-3 rounded-[4px] md:w-[200px] w-full md:text-base text-sm"
            disabled={!couponCode}
          >
            {language === "ar" ? "تطبيق كوبون" : "Apply Coupon"}
          </button>
          {appliedCoupon && (
            <button
              onClick={handleClearCoupon}
              className="text-red-500 hover:text-red-700 text-sm w-full md:w-[130px]"
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
      </div>
      <div className="w-full">
      <div className="flex justify-between w-full border-b-[1.5px] border-black/20 py-3 md:text-base text-sm">
        <p>{language === "ar" ? "المجموع الفرعي" : "Subtotal"}</p>
        <p>{formatPrice(subTotal)}</p>
      </div>
      {appliedCoupon && (
        <div className="flex justify-between py-2 text-sm">
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
      <div className="flex justify-between py-2 text-sm font-medium">
        <p>{language === "ar" ? "الإجمالي" : "Total"}:</p>
        <p>{formatPrice(total)}</p>
      </div>
    </div>
      {showCheckoutLink && (
        <Link
          to="/checkout"
          className="bg-Button text-white px-6 py-3 rounded-[4px] w-full md:w-[260px] mt-4 mx-auto text-sm text-center"
        >
          {language === "ar" ? "إتمام الطلب" : "Proceed to checkout"}
        </Link>
      )}
    </div>
  );
}

export default CartSummary;
