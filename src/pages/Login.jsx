import { Container, Header } from "../components";
import register from "../assets/register.png";
import { Footer } from "../components";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { DataContext } from "../DataContext";
import { useAuth } from "../AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
function Login() {
  const { language } = useContext(DataContext);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const passwordValidationOrder = ["length", "uppercase", "lowercase", "digit"];

  // Function to get the first password validation error
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
    email: false,
    password: null, // Track the first unmet password requirement
  });

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value); // Email validation
      case "password":
        return getFirstPasswordError(value) === null; // Password validation
      default:
        return true;
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update state
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);

    // Clear login error when user starts typing
    setError("");

    // Immediate validation
    if (name === "password") {
      const firstError = getFirstPasswordError(value);
      setFormErrors((prev) => ({ ...prev, password: firstError }));
    } else {
      const isValid = validateField(name, value);
      setFormErrors((prev) => ({ ...prev, [name]: !isValid }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields before submission
    const errors = {
      email: !validateField("email", email),
      password: getFirstPasswordError(password), // Check for password errors
    };

    setFormErrors({
      email: errors.email,
      password: errors.password,
    });

    if (!errors.email && !errors.password) {
      try {
        await login(email, password);
        toast.success(
          language === "ar"
            ? "تم تسجيل الدخول بنجاح"
            : "Logged in successfully!"
        );
        navigate("/");
      } catch (err) {
        setError(err.message);
        toast.error(language === "ar" ? "خطأ في تسجيل الدخول" : err.message);
      }
    } else {
      toast.error(
        language === "ar"
          ? "يرجى تصحيح الأخطاء في النموذج"
          : "Please correct the errors in the form"
      );
    }
  };
  return (
    <>
      <Header isRegister={true} />
      <Container>
        <div className="flex lg:flex-row flex-col justify-between items-center gap-3 mb-20">
          <img
            src={register}
            alt="register"
            className="lg:w-[605px] w-full lg:h-[680px] rounded-[4px] mb-8 lg:mb-0"
          />
          <div className="flex flex-col">
            <div className="w-full lg:w-[339px] lg:h-[78px] gap-[24px] mb-2">
              <h1 className="lg:text-4xl font-medium text-2xl font-inter mb-2">
                {language === "ar" ? "تسجيل الدخول" : "Log in to Exclusive"}
              </h1>
              <p className="lg:text-base text-sm font-normal">
                {language === "ar"
                  ? " أدخل التفاصيل أدناه"
                  : "  Enter your details below"}
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-[40px] lg:w-[371px] h-[370px] mt-4"
            >
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                required
                placeholder={
                  language === "ar"
                    ? "البريد الالكتروني أو رقم الهاتف "
                    : "Email or Phone number"
                }
                className={`lg:text-base text-sm border-b focus:outline-none ${
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
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleInputChange}
                required
                placeholder={language === "ar" ? "كلمة المرور" : "Password"}
                className={`lg:text-base text-sm border-b focus:outline-none ${
                  formErrors.password
                    ? "border-red-500"
                    : "border-[rgba(0,0,0,0.3)]"
                }`}
              />
              {formErrors.password === "length" && (
                <div className="text-red-500 text-sm">
                  {language === "ar"
                    ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل"
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
              {error && (
                <div className="text-red-500 text-sm">
                  {language === "ar" ? "خطأ في بيانات الدخول" : error}
                </div>
              )}
              <div className="flex gap-3 items-center justify-center">
                <button
                  type="submit"
                  className="bg-Button text-white md:py-4 md:px-12 py-2 px-8 rounded-[4px] md:w-[200px]  md:text-base text-sm font-medium md:mb-0 mb-2 flex items-center justify-center mx-auto"
                >
                  {language === "ar" ? "تسجيل الدخول" : "Login"}
                </button>
                <Link
                  // to="/forgot-password" // Update this route if needed
                  className="w-[150px] lg:text-base text-sm text-Button"
                >
                  {language === "ar" ? "نسيت كلمة المرور" : "Forgot Password?"}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  );
}

export default Login;
