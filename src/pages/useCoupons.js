/* eslint-disable no-unused-vars */
import { useState, useCallback } from "react";

const validCoupons = [
  { code: "SAVE10", discountType: "percentage", discountValue: 10 }, // 10% off
  { code: "SAVE20", discountType: "percentage", discountValue: 20 }, // 20% off
  { code: "FLAT50", discountType: "fixed", discountValue: 50 }, // 50 SAR off
];

export const useCoupons = ({
  applyCoupon: applyCouponFromContext,
  clearCoupon: clearCouponFromContext,
  appliedCoupon,
  subTotal,
  language,
  exchangeRate,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState(null);

  // Validate coupon code
  const validateCoupon = useCallback(
    (code) => {
      const coupon = validCoupons.find((c) => c.code === code.toUpperCase());
      if (!coupon) {
        throw new Error(
          language === "ar" ? "كود الكوبون غير صالح" : "Invalid coupon code"
        );
      }
      return coupon;
    },
    [language]
  );

  // Apply coupon
  const handleApplyCoupon = useCallback(
    async () => {
      try {
        const coupon = validateCoupon(couponCode);
        await applyCouponFromContext(couponCode); // Persist via AuthContext
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
    },
    [couponCode, language, validateCoupon, applyCouponFromContext]
  );

  // Remove coupon
  const handleClearCoupon = useCallback(
    async () => {
      try {
        await clearCouponFromContext(); // Clear via AuthContext
        setCouponMessage({
          type: "success",
          text:
            language === "ar"
              ? "تم حذف الكوبون بنجاح"
              : "Coupon removed successfully",
        });
      } catch (error) {
        setCouponMessage({
          type: "error",
          text: error.message,
        });
      }
      setTimeout(() => setCouponMessage(null), 3000);
    },
    [language, clearCouponFromContext]
  );

  // Calculate discount
  const calculateDiscount = useCallback(() => {
    if (!appliedCoupon || !subTotal) return 0;

    console.log("Calculating discount:", { appliedCoupon, subTotal, exchangeRate });

    if (appliedCoupon.discountType === "percentage") {
      return (subTotal * appliedCoupon.discountValue) / 100;
    }

    // Fixed discount (in SAR)
    const discountInSAR = appliedCoupon.discountValue;
    return language === "ar" ? discountInSAR : discountInSAR / exchangeRate;
  }, [appliedCoupon, subTotal, language, exchangeRate]);

  const discount = calculateDiscount();

  return {
    couponCode,
    setCouponCode,
    couponMessage,
    handleApplyCoupon,
    handleClearCoupon,
    discount,
  };
};

export default useCoupons;