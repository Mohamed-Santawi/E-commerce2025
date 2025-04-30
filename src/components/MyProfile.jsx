/* eslint-disable react/prop-types */
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { auth } from "../firebase";
export const MyProfile = ({ language, isPayment }) => {
  const { currentUser, updateProfile, reauthenticateUser } = useAuth(); // Get reauthentication methods

  // State for form fields
  const [firstName, setFirstName] = useState(
    currentUser?.displayName?.split(" ")[0] || ""
  );
  const [lastName, setLastName] = useState(
    currentUser?.displayName?.split(" ")[1] || ""
  );
  const [email, setEmail] = useState(currentUser?.email || "");
  const [address, setAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isEmailPasswordUser = currentUser?.providerData?.some(
    (provider) => provider.providerId === "password"
  );
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
  // Validate email format
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validate fields
    const newErrors = {};

    if (!firstName) {
      newErrors.firstName =
        language === "ar" ? "الاسم الاول مطلوب" : "First Name is required";
    }

    if (!lastName) {
      newErrors.lastName =
        language === "ar" ? "الاسم الاخير مطلوب" : "Last Name is required";
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
    // Validate current password
    if ((newPassword || email !== currentUser.email) && isEmailPasswordUser) {
      if (!currentPassword) {
        newErrors.currentPassword =
          language === "ar"
            ? "كلمة المرور الحالية مطلوبة"
            : "Current Password is required";
      } else {
        try {
          const isReauthenticated = await reauthenticateUser(currentPassword);
          if (!isReauthenticated) {
            newErrors.currentPassword =
              language === "ar"
                ? "كلمة المرور الحالية غير صحيحة"
                : "Current Password is incorrect";
          }
        } catch (error) {
          console.error("Reauthentication failed:", error);
          newErrors.currentPassword =
            language === "ar"
              ? "خطأ في إعادة المصادقة"
              : "Reauthentication failed";
        }
      }
    }
    // Validate new password
    if (newPassword) {
      const passwordError = getFirstPasswordError(newPassword);
      if (passwordError) {
        newErrors.newPassword =
          language === "ar"
            ? "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم"
            : "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a number";
      }
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword =
        language === "ar"
          ? "كلمة المرور غير متطابقة"
          : "Passwords do not match";
    }

    // If there are errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      // Update the user's profile in Firebase
      const displayName = `${firstName} ${lastName}`;
      await updateProfile({ displayName, email });

      // Update the Firestore document
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        {
          displayName,
          email,
          address,
          city,
          country,
        },
        { merge: true }
      );

      // Refresh the currentUser object
      await currentUser.reload();
      const updatedUser = auth.currentUser;
      // Update the state with the new values
      setFirstName(updatedUser.displayName?.split(" ")[0] || "");
      setLastName(updatedUser.displayName?.split(" ")[1] || "");
      setEmail(updatedUser.email || "");

      // Show success message
      toast.success(
        language === "ar"
          ? "تم تحديث الملف الشخصي بنجاح"
          : "Profile updated successfully!",
        {
          duration: 4000, // Duration in milliseconds
          position: "top-center", // Position of the toast
          style: {
            background: "#4CAF50", // Background color
            color: "#fff", // Text color
          },
        }
      );
    } catch (error) {
      // Handle errors
      console.error("Error updating profile:", error);
      toast.error(
        language === "ar"
          ? "خطأ في تحديث الملف الشخصي"
          : "Failed to update profile"
      );
    }
  };
  // Handle Cancel button click
  const handleCancel = () => {
    // Reset form fields to the current user's data
    setFirstName(currentUser?.displayName?.split(" ")[0] || "");
    setLastName(currentUser?.displayName?.split(" ")[1] || "");
    setEmail(currentUser?.email || "");
    setAddress(currentUser?.address || "");
    setCity(currentUser?.city || "");
    setCountry(currentUser?.country || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({}); // Clear any errors
  };
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFirstName(userData.displayName?.split(" ")[0] || "");
          setLastName(userData.displayName?.split(" ")[1] || "");
          setEmail(userData.email || "");
          setAddress(userData.address || "");
          setCity(userData.city || "");
          setCountry(userData.country || "");
        }
      }
    };

    fetchUserData();
  }, [currentUser]);
  useEffect(() => {
    console.log("Current User:", currentUser);
  }, [currentUser]);
  return (
    <div className="flex flex-col lg:items-start items-center relative w-full">
      <h2 className="font-meduim text-Button text-[20px] mb-6 leading-[28px]">
        {language === "ar" ? "تعديل الملف الشخصي" : "Edit Your Profile"}
      </h2>
      <form className="w-full " onSubmit={handleSubmit}>
        {/* First Name */}
        <div className="flex lg:flex-row flex-col items-center justify-center w-full gap-4 lg:gap-10 mb-4">
          <div className="flex flex-col w-full">
            <label className="text-base mb-2 px-4">
              {language === "ar" ? "الاسم الاول" : "First Name"}
            </label>
            <input
              className="flex items-center justify-center px-4 lg:w-[300px] w-full md:w-[500px] h-[50px] rounded-[4px] bg-[#F5F5F5] placeholder:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={language === "ar" ? "الاسم الاول" : "First Name"}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>
          {/* Last Name */}
          <div className="flex flex-col w-full">
            <label className="text-base mb-2 px-4">
              {language === "ar" ? "الاسم الاخير " : "Last Name"}
            </label>
            <input
              className="flex items-center justify-center px-4 w-full md:w-[500px] lg:w-[300px] h-[50px] rounded-[4px] bg-[#F5F5F5] placeholder:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={language === "ar" ? "الاسم الاخير" : "Last Name"}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        {/* Email and Address */}
        <div className="flex lg:flex-row flex-col gap-4 lg:gap-10 mb-4">
          <div className="flex flex-col w-full">
            <label className="text-base mb-2 px-4">
              {language === "ar" ? " البريد الالكتروني" : "Email"}
            </label>
            <input
              className="flex items-center justify-center w-full md:w-[500px] px-4 lg:w-[300px] h-[50px] rounded-[4px] bg-[#F5F5F5] placeholder:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === "ar" ? " البريد الالكتروني" : "Email"}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div className="flex flex-col w-full">
            <label className="text-base mb-2 px-4">
              {language === "ar" ? "العنوان " : "Address"}
            </label>
            <input
              className="flex items-center justify-center w-full md:w-[500px] px-4 lg:w-[300px] h-[50px] rounded-[4px] bg-[#F5F5F5] placeholder:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={language === "ar" ? "العنوان " : "Address"}
            />
          </div>
        </div>
        {/* Password Changes */}
        {!isPayment && isEmailPasswordUser ? (
          <div className="flex flex-col gap-5 mb-4 w-full">
            <label className="text-base px-4">
              {" "}
              {language === "ar" ? "تغيير كلمة المرور" : "Password Changes"}
            </label>
            <div className="flex flex-col w-full">
              <label className="text-base mb-2 px-4">
                {language === "ar" ? "كلمة المرور الحالية" : "Current Passwod"}
              </label>
              <div className="relative flex">
                <input
                  className="flex items-center justify-center px-4 lg:w-[640px] md:w-[500px] w-full h-[50px] rounded-[4px] bg-[#F5F5F5] placeholder:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={
                    language === "ar"
                      ? "كلمة المرور الحالية "
                      : "Current Passwod"
                  }
                />
                <div
                  className={`absolute top-1/2 transform -translate-y-1/2 cursor-pointer ${
                    language === "ar"
                      ? "lg:left-8 md:left-32 left-4"
                      : "lg:right-8 md:right-32 right-4"
                  }`}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            {errors.currentPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.currentPassword}
              </p>
            )}
            <div className="flex flex-col w-full">
              <label className="text-base mb-2 px-4">
                {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
              </label>
              <div className="relative flex">
                <input
                  className="flex items-center justify-center px-4 lg:w-[640px] md:w-[500px] w-full h-[50px] rounded-[4px] bg-[#F5F5F5] placeholder:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={
                    language === "ar" ? "كلمة المرور الجديدة " : "New Passwod"
                  }
                />
                <div
                  className={`absolute top-1/2 transform -translate-y-1/2 cursor-pointer ${
                    language === "ar"
                      ? "lg:left-8 md:left-32 left-4"
                      : "lg:right-8 md:right-32 right-4"
                  }`}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
            <div className="flex flex-col w-full">
              <label className="text-base mb-2 px-4">
                {language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
              </label>
              <div className="relative flex">
                <input
                  className="flex items-center justify-center px-4 lg:w-[640px] md:w-[500px] w-full h-[50px] rounded-[4px] bg-[#F5F5F5] placeholder:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={
                    language === "ar"
                      ? "تأكيد كلمة المرور الجديدة"
                      : "Confirm New Passwod"
                  }
                />
                <div
                  className={`absolute top-1/2 transform -translate-y-1/2 cursor-pointer ${
                    language === "ar"
                      ? "lg:left-8 md:left-32 left-4"
                      : "lg:right-8 md:right-32 right-4"
                  }`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        ) : (
          <div className="text-gray-600 mt-4">
            {language === "ar"
              ? "لا يمكن تغيير كلمة المرور لحسابات جوجل. الرجاء تغيير كلمة المرور من إعدادات حساب جوجل."
              : "Password changes are not available for Google accounts. Please change your password through your Google account settings."}
          </div>
        )}
        {/* Buttons */}
        {!isPayment && (
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
              {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
