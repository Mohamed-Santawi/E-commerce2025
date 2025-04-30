import { useContext, useEffect, useState } from "react";
import { Container, Footer, Header } from "../components";
import { DataContext } from "../DataContext";
import { useAuth } from "../AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import CartItemsList from "../components/CartItemsList";
import CartSummary from "../components/CartSummary";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-hot-toast";

function PaymentPage() {
  const { language } = useContext(DataContext);
  const {
    currentUser,
    updateProfile,
    cart,
    appliedCoupon,
    applyCoupon,
    clearCoupon,
    savePaymentMethod,
  } = useAuth();
  const [firstName, setFirstName] = useState(
    currentUser?.displayName?.split(" ")[0] || ""
  );
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState("");
  const [saveInfo, setSaveInfo] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(3.75);
  const API_KEY = "b7760452947b4719f69ea899";
  const [paymentMethod, setPaymentMethod] = useState("cashOnDelivery");

  // Fetch USD to SAR exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      const cashedRate = localStorage.getItem("usd_to_sar");
      if (cashedRate) {
        setExchangeRate(Number(cashedRate));
      }
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch exchange rate: ${response.status} `);
        }
        const data = await response.json();
        if (data.result === "success" && data.conversion_rates.SAR) {
          setExchangeRate(data.conversion_rates.SAR);
          localStorage.setItem("usd_to_sar", data.conversion_rates.SAR);
        } else {
          throw new Error("Invalid API response");
        }
      } catch (error) {
        console.error("Exchange rate error:", error.message);
        setExchangeRate(3.75); // Fallback
      }
    };
    fetchExchangeRate();
  }, [language]);
  // Validate email format
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser || !currentUser.uid) {
        setFetchError(
          language === "ar"
            ? "لم يتم تسجيل الدخول. يرجى تسجيل الدخول أولاً."
            : "No user logged in. Please log in first."
        );
        return;
      }
      setLoading(true);
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData.displayName?.split(" ")[0] || firstName);
          setAddress(userData.address || "");
          setCity(userData.city || "");
          setEmail(userData.email || currentUser.email);
          setPhoneNumber(userData.phoneNumber || "");
          setFetchError("");
        } else {
          setFetchError(
            language === "ar"
              ? "لم يتم العثور على بيانات المستخدم."
              : "User data not found."
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
        setFetchError(
          language === "ar"
            ? "فشل في جلب بيانات المستخدم. حاول مرة أخرى."
            : "Failed to fetch user data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [currentUser, language, firstName]);
  // Convert price to the appropriate currency
  const getPrice = (item) => {
    if (language === "ar") {
      const price = (item.currentPrice || 0) * exchangeRate;
      return price;
    }
    const price = item.currentPrice || 0;
    return price;
  };
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
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitError("");
    // Validate fields
    const newErrors = {};
    if (!firstName) {
      newErrors.firstName =
        language === "ar" ? "الاسم الاول مطلوب" : "First Name is required";
    }
    if (!address) {
      newErrors.address =
        language === "ar" ? "العنوان مطلوب" : "Address is required";
    }
    if (!city) {
      newErrors.city =
        language === "ar" ? "المدينة مطلوبة" : "City is required";
    }
    if (!email) {
      newErrors.email =
        language === "ar" ? "البريد الالكتروني مطلوب" : "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email =
        language === "ar"
          ? "البريد الالكتروني غير صالح"
          : "Invalid email format";
    }
    if (!phoneNumber) {
      newErrors.phoneNumber =
        language === "ar" ? "رقم الهاتف مطلوب" : "Phone is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Prepare data for submis
    const formData = {
      displayName: firstName,
      address,
      city,
      email,
      phoneNumber,
    };
    // Save information to firestore if checkbox is checked
    if (saveInfo) {
      try {
        await updateProfile(formData);
        console.log("User data saved to Firestore:", formData);
      } catch (error) {
        console.error("Error saving user data to Firestore:", error.message);
        setSubmitError(
          language === "ar"
            ? "فشل في حفظ البيانات. حاول مرة أخرى."
            : "Failed to save data. Please try again."
        );
        return;
      }
    }
    // Proceed with form submission (e.g., payment processing)
    console.log("Form submitted:", formData);
    // TODO: Add payment processing logic here
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};
    if (!firstName) {
      newErrors.firstName =
        language === "ar" ? "الاسم الاول مطلوب" : "First Name is required";
    }
    if (!address) {
      newErrors.address =
        language === "ar" ? "العنوان مطلوب" : "Address is required";
    }
    if (!city) {
      newErrors.city =
        language === "ar" ? "المدينة مطلوبة" : "City is required";
    }
    if (!email) {
      newErrors.email =
        language === "ar" ? "البريد الالكتروني مطلوب" : "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email =
        language === "ar"
          ? "البريد الالكتروني غير صالح"
          : "Invalid email format";
    }
    if (!phoneNumber) {
      newErrors.phoneNumber =
        language === "ar" ? "رقم الهاتف مطلوب" : "Phone is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(
        language === "ar"
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill in all required fields",
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#f44336",
            color: "#fff",
            fontSize: "16px",
            padding: "16px",
          },
        }
      );
      return;
    }

    try {
      if (paymentMethod === "cashOnDelivery") {
        // For Cash on Delivery, save payment method and show success message
        await savePaymentMethod(paymentMethod, null, null);
        toast.success(
          language === "ar"
            ? "تم تأكيد طلبك بنجاح! سيتم التواصل معك قريباً على الرقم ${phoneNumber} لتأكيد التسليم"
            : `Your order has been confirmed! We'll contact you soon at ${phoneNumber} for delivery confirmation`,
          {
            duration: 5000,
            position: "top-center",
            style: {
              background: "#4CAF50",
              color: "#fff",
              fontSize: "16px",
              padding: "16px",
            },
          }
        );
      } else if (paymentMethod === "paypal") {
        // For PayPal, the success message will be handled in handlePayPalSuccess
        await savePaymentMethod(paymentMethod, null, null);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى"
          : "An error occurred while processing your payment. Please try again",
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#f44336",
            color: "#fff",
            fontSize: "16px",
            padding: "16px",
          },
        }
      );
    }
  };

  const handlePayPalSuccess = async (details) => {
    try {
      await savePaymentMethod("paypal", details.id);
      toast.success(
        language === "ar"
          ? `تم تأكيد طلبك بنجاح! سيتم التواصل معك قريباً على الرقم ${phoneNumber} لتأكيد التسليم`
          : `Your order has been confirmed! We'll contact you soon at ${phoneNumber} for delivery confirmation`,
        {
          duration: 5000,
          position: "top-center",
          style: {
            background: "#4CAF50",
            color: "#fff",
            fontSize: "16px",
            padding: "16px",
          },
        }
      );
    } catch (error) {
      console.error("PayPal Payment Error:", error);
      toast.error(
        language === "ar"
          ? "فشل عملية الدفع عبر باي بال"
          : "PayPal payment failed!",
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#f44336",
            color: "#fff",
            fontSize: "16px",
            padding: "16px",
          },
        }
      );
    }
  };

  return (
    <>
      <Header />
      <Container lgPx="36">
        <h1 className="font-inter font-medium md:text-4xl text-base tracking-wider">
          {language === "ar" ? "تفاصيل الفاتورة" : " Billing Details"}
        </h1>
        {fetchError && (
          <p className="text-red-500 text-sm mb-4">{fetchError}</p>
        )}
        {loading ? (
          <p className="text-gray-500">
            {language === "ar" ? "جارٍ التحميل..." : "Loading..."}
          </p>
        ) : (
          <div className="flex md:flex-row md:justify-between flex-col gap-4 md:gap-10 mb-20">
            <div>
              <form onSubmit={handleSubmit}>
                <div className="my-2">
                  <label className="text-gray-400 text-xs px-2">
                    {language === "ar" ? "الاسم الاول" : "First Name"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={
                      language === "ar" ? "الاسم الاول" : "First Name"
                    }
                    className="border bg-gray-100 focus:outline-none border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs">{errors.firstName}</p>
                  )}
                </div>
                <div className="my-2">
                  <label className="text-gray-400 text-xs px-2">
                    {language === "ar" ? "العنوان" : "Street Address"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      language === "ar" ? "العنوان" : "Street Address"
                    }
                    className="border bg-gray-100 focus:outline-none border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs">{errors.address}</p>
                  )}
                </div>
                <div className="my-2">
                  <label className="text-gray-400 text-xs px-2">
                    {language === "ar" ? "المدينة/البلدة" : "Town/City"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={
                      language === "ar" ? "المدينة/البلدة" : "Town/City"
                    }
                    className="border bg-gray-100 focus:outline-none border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs">{errors.city}</p>
                  )}
                </div>
                <div className="my-2">
                  <label className="text-gray-400 text-xs px-2">
                    {language === "ar" ? "البريد الالكتروني" : "Email Address"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      language === "ar" ? "البريد الالكتروني" : "Email Address"
                    }
                    className="border bg-gray-100 focus:outline-none border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email}</p>
                  )}
                </div>
                <div className="my-2">
                  <label className="text-gray-400 text-xs px-2">
                    {language === "ar" ? "رقم الهاتف" : "Phone Number"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={
                      language === "ar" ? "رقم الهاتف" : "Phone Number"
                    }
                    className="border bg-gray-100 focus:outline-none border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs">{errors.phoneNumber}</p>
                  )}
                </div>
                <div className="my-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="mr-2 mt-2 h-4 w-4 text-Button  border-gray-300 rounded focus:ring-Button"
                    style={{ accentColor: "#DB4444" }} // Fallback color
                  />
                  <label className="text-gray-800 text-base">
                    {language === "ar"
                      ? "حفظ معلوماتي للمرة القادمة"
                      : "Save my information for next time"}
                  </label>
                </div>
                {submitError && (
                  <p className="text-red-500 text-sm mb-4">{submitError}</p>
                )}
              </form>
            </div>
            {/* Cart Items and Summary Section */}
            <div className=" flex flex-col gap-6 lg:w-[50%] md:w-[55%]">
              <CartItemsList
                cart={cart}
                getPrice={getPrice}
                formatPrice={formatPrice}
              />
              <CartSummary
                subTotal={subTotal}
                discount={discount}
                total={total}
                appliedCoupon={appliedCoupon}
                formatPrice={formatPrice}
                applyCoupon={applyCoupon}
                clearCoupon={clearCoupon}
                showCheckoutLink={false}
              />
              {/* Payment Options Section */}
              <div className="flex flex-col lg:items-start items-center relative w-full">
                <form className="w-full" onSubmit={handlePaymentSubmit}>
                  <div className="flex flex-col gap-4 mb-6">
                    <label className="text-lg font-semibold text-gray-800 mb-4 px-4 border-b-2 border-Button pb-2">
                      {language === "ar"
                        ? "اختر طريقة الدفع"
                        : "Select Payment Method"}
                    </label>
                    {/* Cash on Delivery Option */}
                    <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-Button transition-all duration-300 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cashOnDelivery"
                        checked={paymentMethod === "cashOnDelivery"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-Button focus:ring-Button"
                      />
                      <span className="text-gray-700 font-medium">
                        {language === "ar"
                          ? "الدفع عند الاستلام"
                          : "Cash on Delivery"}
                      </span>
                    </label>

                    {/* PayPal Option */}
                    <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-Button transition-all duration-300 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-Button focus:ring-Button"
                      />
                      <span className="text-gray-700 font-medium">
                        {language === "ar" ? "باي بال" : "PayPal"}
                      </span>
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
                                amount: { value: total.toFixed(2) },
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

                  <div className="relative w-full flex justify-end items-center mt-8 px-4">
                    <button
                      type="submit"
                      className="px-8 py-4 rounded-lg bg-Button text-white font-semibold text-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      {language === "ar" ? (
                        <>
                          <span>دفع</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Pay</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Container>
      <Footer />
    </>
  );
}
export default PaymentPage;
