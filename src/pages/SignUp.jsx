/* eslint-disable no-unused-vars */
import { Container } from "../components/Container";
import { Header } from "../components/Header";
import register from "../assets/register.png";
import { Footer } from "../components";
import iconGoogle from "../assets/Icon-Google.png";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { DataContext } from "../DataContext";
import { useAuth } from "../AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
function SignUp() {
  const { language } = useContext(DataContext);
  const { signup, signInWithGoogle } = useAuth(); // Add signInWithGoogle
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState(""); // Add name state
  const [lastName, setLastName] = useState(""); // Add name state
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const toArabicNumbers = (str) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return str.replace(/\d/g, (digit) => arabicNumbers[parseInt(digit)]);
  };

  const passwordValidationOrder = ["length", "uppercase", "lowercase", "digit"];

  const getFirstPasswordError = (password) => {
    for (const rule of passwordValidationOrder) {
      switch (rule) {
        case "length":
          if (password.length < 8) return "length";
          break;
        case "uppercase":
          if (!/[A-Z]/.test(password)) return "uppercase";
          break;
        case "lowercase":
          if (!/[a-z]/.test(password)) return "lowercase";
          break;
        case "digit":
          if (!/[0-9]/.test(password)) return "digit";
          break;
        default:
          break;
      }
    }
    return null; // No errors
  };
  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: null,
    address: false,
    city: false,
    country: false,
    phone: false,
    // zipCode: false,
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    // Name processing
    if (name === "firstName" || name === "lastName") {
      processedValue = value
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    }
    if (name === "phone") {
      processedValue = value.replace(/\D/g, "");
    }

    // Update State
    switch (name) {
      case "firstName":
        setFirstName(processedValue);
        break;
      case "lastName":
        setLastName(processedValue);
        break;
      case "email":
        setEmail(processedValue);
        break;
      case "password":
        setPassword(processedValue);
        break;
      case "phone":
        setPhone(processedValue);
        break;
      case "address":
        setAddress(processedValue);
        break;
      case "city":
        setCity(processedValue);
        break;
      // case "zipCode":
      //   setZipCode(processedValue);
      //   break;
      case "country":
        setCountry(processedValue);
        break;
      default:
        break;
    }
    // Immediate validation

    if (name === "password") {
      const firstError = getFirstPasswordError(processedValue);
      setFormErrors((prev) => ({ ...prev, password: firstError }));
    } else {
      const isValid = validateField(name, processedValue);
      setFormErrors((prev) => ({ ...prev, [name]: !isValid }));
    }
  };
  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
        return /^[A-Za-zÀ-ž\s]{2,50}$/.test(value); // Name validation
      case "email":
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value); // Email validation
      case "phone":
        return /^\d{11}$/.test(value); // Phone number validation
      case "country":
      case "city":
      case "address":
        return value.trim() !== ""; // Non-empty validation
      // case "zipCode":
      //   return /^\d{5}$/.test(value); // Zip code validation
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reset Errors
    setError({});
    // Validate all fields before submission
    const errors = {
      firstName: !validateField("firstName", firstName),
      lastName: !validateField("lastName", lastName),
      email: !validateField("email", email),
      password: getFirstPasswordError(password),
      phone: !validateField("phone", phone),
      address: !validateField("address", address),
      city: !validateField("city", city),
      country: !validateField("country", country),
      // zipCode: !validateField("zipCode", zipCode),
    };

    setFormErrors(errors);
    if (Object.values(errors).every((error) => !error)) {
      try {
        // Combine first name and last name for the display name
        const displayName = `${firstName} ${lastName}`;
        await signup(email, password, displayName, address, city, country);
        // Show success toast
        toast.success(
          language === "ar" ? "تم إنشاء الحساب بنجاح" : "Account created!",
          {
            position: "top-center",
            style: {
              background: "#4CAF50",
              color: "#fff",
            },
          }
        );
        navigate("/");
      } catch (err) {
        // Show error toast
        toast.error(language === "ar" ? "خطأ في إنشاء الحساب" : err.message, {
          position: "top-center",
          style: {
            background: "#FF5252",
            color: "#fff",
          },
        });
      }
    } else {
      // Show error toast
      toast.error(
        language === "ar"
          ? "يرجى تصحيح الأخطاء في النموذج"
          : "Please correct the errors in the form",
        {
          position: "top-center",
          style: {
            background: "#FF5252",
            color: "#fff",
          },
        }
      );
    }
  };

  // Handle Google Sign-In
  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
      toast.success(
        language === "ar" ? "تم تسجيل الدخول بنجاح" : "Logged in successfully!",
        {
          position: "top-center",
          style: {
            background: "#4CAF50",
            color: "#fff",
          },
        }
      );
      navigate("/");
    } catch (err) {
      setError(err.message);
      toast.error(language === "ar" ? "خطأ في تسجيل الدخول" : err.message, {
        position: "top-center",
        style: {
          background: "#FF5252",
          color: "#fff",
        },
      });
    }
  }
  return (
    <div>
      <Header isRegister={true} />
      <Container>
        <div className="flex lg:flex-row flex-col justify-between items-center gap-3 lg:gap-8 mb-20">
          <img
            src={register}
            alt="register"
            className="lg:w-[605px] w-full lg:h-[680px] rounded-[4px] mb-8 lg:mb-0"
          />
          <div className="flex flex-col w-full px-2">
            <div className="w-full lg:w-[339px] lg:h-[78px] gap-[24px] mb-2">
              <h1 className="lg:text-4xl font-medium text-2xl font-inter mb-2">
                {language === "ar" ? "انشاء حساب" : " Create an account"}
              </h1>
              <p className="lg:text-base text-sm font-normal">
                {language === "ar"
                  ? " أدخل التفاصيل أدناه"
                  : "  Enter your details below"}
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-[25px] lg:w-[430px] w-full h-auto mt-4"
            >
              <div className="flex md:gap-8 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="md:text-base text-sm text-gray-500">
                    {language === "ar" ? "الاسم الاول*" : "First Name*"}
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={firstName}
                    onChange={handleInputChange}
                    required
                    placeholder={
                      language === "ar" ? "الاسم الاول" : "First Name"
                    }
                    className={`md:text-base text-sm border-none bg-[#F5F5F5] focus:outline-none placeholder:px-2 md:px-2 py-2 px-0 rounded-[4px] ${
                      formErrors.firstName
                        ? "border-red-500"
                        : "border-[rgba(0,0,0,0.3)]"
                    }`}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="md:text-base text-sm text-gray-500">
                    {language === "ar" ? "الاسم الاخير*" : "last Name*"}
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={lastName}
                    onChange={handleInputChange}
                    required
                    placeholder={
                      language === "ar" ? "الاسم الاخير" : "Last Name"
                    }
                    className={`md:text-base text-sm border-none bg-[#F5F5F5] focus:outline-none placeholder:px-2 md:px-2 py-2 px-0 rounded-[4px] ${
                      formErrors.lastName
                        ? "border-red-500"
                        : "border-[rgba(0,0,0,0.3)]"
                    }`}
                  />
                </div>
              </div>
              <div className="flex md:gap-8 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="md:text-base text-sm text-gray-500">
                    {language === "ar" ? "البريد الالكتروني*" : "Email*"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleInputChange}
                    required
                    placeholder={
                      language === "ar"
                        ? "البريد الالكتروني الخاص بك"
                        : "Enter Your Email"
                    }
                    className={`md:text-base text-sm border-none bg-[#F5F5F5] focus:outline-none placeholder:px-2 md:px-2 py-2 px-0 rounded-[4px] ${
                      formErrors.email
                        ? "border-red-500"
                        : "border-[rgba(0,0,0,0.3)]"
                    }`}
                  />
                  {formErrors.email && (
                    <div className="text-red-500 text-sm">
                      {language === "ar"
                        ? "البريد الإلكتروني غير صحيح"
                        : "Invalid email address."}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="md:text-base text-sm text-gray-500">
                    {language === "ar" ? "كلمة المرور*" : "Password*"}
                  </label>
                  <div className="relative flex">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={handleInputChange}
                      required
                      minLength="8"
                      className={`md:text-base text-sm border-none bg-[#F5F5F5] focus:outline-none placeholder:px-2 md:px-2 py-2 px-0 rounded-[4px] ${
                        formErrors.password
                          ? "border-red-500"
                          : "border-[rgba(0,0,0,0.3)]"
                      }`}
                      placeholder={
                        language === "ar" ? "كلمة المرور" : "Password"
                      }
                    />
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 cursor-pointer ${
                        language === "ar"
                          ? "lg:left-6 md:left-10 left-4"
                          : "lg:right-6 md:right-10 right-4"
                      }`}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                  {formErrors.password === "length" && (
                    <div className="text-red-500 text-sm">
                      {language === "ar"
                        ? toArabicNumbers(
                            "يجب أن تكون كلمة المرور 8 أحرف على الأقل"
                          )
                        : "Password must be at least 8 characters long."}
                    </div>
                  )}
                  {formErrors.password === "uppercase" && (
                    <div className="text-red-500 text-sm">
                      {language === "ar"
                        ? "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل"
                        : "Password must contain at least one uppercase letter."}
                    </div>
                  )}
                  {formErrors.password === "lowercase" && (
                    <div className="text-red-500 text-sm">
                      {language === "ar"
                        ? "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل"
                        : "Password must contain at least one lowercase letter."}
                    </div>
                  )}
                  {formErrors.password === "digit" && (
                    <div className="text-red-500 text-sm">
                      {language === "ar"
                        ? "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل"
                        : "Password must contain at least one digit."}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex md:gap-8 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="md:text-base text-sm text-gray-500">
                    {language === "ar" ? "رقم الهاتف*" : "Phone Number*"}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={handleInputChange}
                    required
                    placeholder={
                      language === "ar" ? "رقم الهاتف" : "Phone Number"
                    }
                    className={`md:text-base text-sm border-none bg-[#F5F5F5] focus:outline-none placeholder:px-2 md:px-2 py-2 px-0 rounded-[4px] ${
                      formErrors.phoneNumber
                        ? "border-red-500"
                        : "border-[rgba(0,0,0,0.3)]"
                    }`}
                  />
                  {formErrors.phone && (
                    <div className="text-red-500 text-sm">
                      {language === "ar"
                        ? toArabicNumbers("رقم الهاتف يجب أن يكون 11 أرقام")
                        : "Phone number must be 11 digits."}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="md:text-base text-sm text-gray-500">
                    {language === "ar" ? "العنوان*" : "Address*"}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={address}
                    onChange={handleInputChange}
                    required
                    placeholder={language === "ar" ? "العنوان" : "Address"}
                    className={`md:text-base text-sm border-none bg-[#F5F5F5] focus:outline-none placeholder:px-2 md:px-2 py-2 px-0 rounded-[4px] ${
                      formErrors.address
                        ? "border-red-500"
                        : "border-[rgba(0,0,0,0.3)]"
                    }`}
                  />
                  {formErrors.address && (
                    <div className="text-red-500 text-sm">
                      {language === "ar"
                        ? "العنوان مطلوب"
                        : "Address is required."}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex md:gap-8 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="md:text-base text-sm text-gray-500">
                    {language === "ar" ? "المدينة*" : "City*"}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={city}
                    onChange={handleInputChange}
                    required
                    placeholder={language === "ar" ? "المدينة" : "City"}
                    className={`md:text-base text-sm border-none bg-[#F5F5F5] focus:outline-none placeholder:px-2 md:px-2 py-2 px-0 rounded-[4px] ${
                      formErrors.city
                        ? "border-red-500"
                        : "border-[rgba(0,0,0,0.3)]"
                    }`}
                  />
                  {formErrors.city && (
                    <div className="text-red-500 text-sm">
                      {language === "ar"
                        ? "المدينة مطلوبة"
                        : "City is required."}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="md:text-base text-sm text-gray-500">
                    {language === "ar" ? "البلد*" : "Country*"}
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={country}
                    onChange={handleInputChange}
                    required
                    placeholder={language === "ar" ? "البلد" : "Country"}
                    className={`md:text-base text-sm border-none bg-[#F5F5F5] focus:outline-none placeholder:px-2 md:px-2 py-2 px-0 rounded-[4px] ${
                      formErrors.country
                        ? "border-red-500"
                        : "border-[rgba(0,0,0,0.3)]"
                    }`}
                  />
                  {formErrors.country && (
                    <div className="text-red-500 text-sm">
                      {language === "ar"
                        ? "البلد مطلوب"
                        : "Country is required."}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-8 mt-10">
                <button
                  type="submit"
                  className="bg-Button text-white md:py-4 md:px-2 h-[56px] lg:w-[300px] w-full rounded-[4px] md:text-base text-sm font-medium flex items-center justify-center mx-auto"
                  // className="bg-Button text-white md:py-4 md:px-[20px] py-2 px-16 rounded-[4px] md:w-[200px] md:text-base text-sm font-medium flex items-center justify-center mx-auto"
                >
                  {language === "ar" ? "انشاء حساب" : "Create an account"}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="border border-[rgba(0,0,0,0.3)] md:py-4 md:px-2 py-2 px-8 rounded-[4px] h-[56px] lg:w-[300px] w-full md:text-base text-sm font-normal flex items-center justify-center mx-auto"
                >
                  <img src={iconGoogle} className="w-[20px] h-[20px] mx-2" />
                  {language === "ar"
                    ? "تسجيل الدخول باستخدام جوجل"
                    : "Sign up with Google"}
                </button>
              </div>
            </form>
            <div className="flex gap-3 text-gray-700 mt-6">
              <p className="lg:text-base text-sm font-normal">
                {language === "ar"
                  ? "لديك حساب بالفعل؟"
                  : "Already have an account?"}
              </p>
              <Link
                to="/login"
                className="font-medium border-b border-b-gray-400"
              >
                {language === "ar" ? "تسجيل الدخول" : "Login"}
              </Link>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
export default SignUp;
