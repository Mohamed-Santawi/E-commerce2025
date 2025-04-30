/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from "../AuthContext";
import { toast } from "react-hot-toast";

export const PaymentOptions = ({ language }) => {
  const { savePaymentMethod } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("cashOnDelivery");
  const [errors, setErrors] = useState({});

  const handlePayPalSuccess = async (details) => {
    try {
      await savePaymentMethod("paypal", details.id);
      toast.success(
        language === "ar"
          ? "تمت عملية الدفع عبر باي بال بنجاح"
          : "Payment successful via PayPal!",
        { position: "top-center" }
      );
    } catch (error) {
      console.error("PayPal Payment Error:", error);
      toast.error(
        language === "ar"
          ? "فشل عملية الدفع عبر باي بال"
          : "PayPal payment failed!"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await savePaymentMethod(paymentMethod, null, null);
      toast.success(
        language === "ar"
          ? "تم حفظ طريقة الدفع بنجاح"
          : "Payment method saved successfully!",
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#4CAF50",
            color: "#fff",
          },
        }
      );
    } catch (error) {
      console.error("Error saving payment method:", error);
      toast.error(
        language === "ar"
          ? "خطأ في حفظ طريقة الدفع"
          : "Failed to save payment method"
      );
    }
  };

  const handleCancel = () => {
    setPaymentMethod("cashOnDelivery");
    setErrors({});
  };

  return (
    <div className="flex flex-col lg:items-start items-center relative w-full">
      <h2 className="font-medium text-Button text-[20px] mb-6 leading-[28px]">
        {language === "ar" ? "خيارات الدفع" : "Payment Options"}
      </h2>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 mb-6">
          <label className="text-base mb-2 px-4">
            {language === "ar" ? "اختر طريقة الدفع" : "Select Payment Method"}
          </label>

          {/* Cash on Delivery Option */}
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              value="cashOnDelivery"
              checked={paymentMethod === "cashOnDelivery"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            {language === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}
          </label>

          {/* PayPal Option */}
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === "paypal"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            {language === "ar" ? "باي بال" : "PayPal"}
          </label>
        </div>

        {/* PayPal Buttons */}
        {paymentMethod === "paypal" && (
          <PayPalScriptProvider
            options={{
              "client-id":
                "AWD5LuAtabKgkqGIBV02YBXp6xbgxiSmQARf8kdqWu2kqjXafnaqQRBEvSm8tiE6cBM4gypDnRHT3r5G",
            }}
          >
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: { value: "0.1" },
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                const details = await actions.order.capture();
                handlePayPalSuccess(details);
              }}
              onError={(err) => {
                console.error("PayPal Payment Error:", err);
                toast.error(
                  language === "ar"
                    ? "فشل عملية الدفع عبر باي بال"
                    : "PayPal payment failed!"
                );
              }}
            />
          </PayPalScriptProvider>
        )}

        <div className="relative w-full flex justify-end gap-8 items-center mt-8 px-4">
          <button
            type="button"
            onClick={handleCancel}
            className="lg:px-12 py-4 px-8 rounded-[4px] bg-gray-500 text-white flex justify-end items-end"
          >
            {language === "ar" ? "الغاء" : "Cancel"}
          </button>
          <button
            type="submit"
            className="lg:px-12 py-4 px-4 rounded-[4px] bg-Button text-white flex justify-end items-end"
          >
            {language === "ar" ? "دفع" : "Pay"}
          </button>
        </div>
      </form>
      
    </div>
  );
};
