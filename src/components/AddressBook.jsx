import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";

/* eslint-disable react/prop-types */
export const AddressBook = ({ language }) => {
  const { currentUser } = useAuth(); // Destructure currentUser from useAuth
  // State for form fields
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  // State for original data (to handle cancel)
  const [orginalData, setOrginalData] = useState({
    country: "",
    city: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  // Fetch user data from Firestore when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) {
        return;
      }
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Set Form Fields
          setCountry(userData.country || "");
          setCity(userData.city || "");
          setAddress(userData.address || "");
          // Save original data
          setOrginalData({
            country: userData.country || "",
            city: userData.city || "",
            address: userData.address || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [currentUser]);
  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reset Errors
    setErrors({});
    // Validate Fields
    const newErrors = {};
    if (!country) {
      newErrors.country =
        language === "ar" ? "الدولة مطلوبة" : "Country is required";
    }
    if (!city) {
      newErrors.city =
        language === "ar" ? "المدينة مطلوبة" : "City is required";
    }

    if (!address) {
      newErrors.address =
        language === "ar" ? "العنوان مطلوب" : "Address is required";
    }
    // If there are errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      // Update user data in Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        {
          country,
          city,
          address,
        },
        { merge: true } // Merge to avoid overwriting other fields
      );
      // Update Original Data
      setOrginalData({
        country,
        city,
        address,
      });
      // Show success message
      toast.success(
        language === "ar"
          ? "تم تحديث دفتر العناوين بنجاح"
          : "Address book updated successfully!",
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
      // Handle errors
      console.error("Error updating address book:", error);
      toast.error(
        language === "ar"
          ? "خطأ في تحديث دفتر العناوين"
          : "Failed to update address book"
      );
    }
  };
  const handleCancel = () => {
    // Reset form fields to original data
    setCountry(orginalData.country);
    setCity(orginalData.city);
    setAddress(orginalData.address);
    // Clear Errors
    setErrors({});
  };
  return (
    <div className="flex flex-col lg:items-start items-center relative w-full">
      <h2 className="font-meduim text-Button text-[20px] mb-6 leading-[28px]">
        {language === "ar" ? "دفتر العناوين" : "Address Book"}
      </h2>
      <form className="w-full" onSubmit={handleSubmit}>
        {/* Country */}
        <div className="flex flex-col w-full mb-4">
          <label className="text-base mb-2 px-4">
            {language === "ar" ? "الدولة" : "Country"}
          </label>
          <input
            className="flex items-center justify-center px-4 lg:w-[300px] w-full md:w-[500px] h-[50px] rounded-[4px] bg-[#F5F5F5] placeholder:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder={language === "ar" ? "الدولة" : "Country"}
          />
          {errors.country && (
            <p className="text-red-500 text-sm mt-1">{errors.country}</p>
          )}
        </div>

        {/* City */}
        <div className="flex flex-col w-full mb-4">
          <label className="text-base mb-2 px-4">
            {language === "ar" ? "المدينة" : "City"}
          </label>
          <input
            className="flex items-center justify-center px-4 lg:w-[300px] w-full md:w-[500px] h-[50px] rounded-[4px] bg-[#F5F5F5] placeholder:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={language === "ar" ? "المدينة" : "City"}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        {/* Address */}
        <div className="flex flex-col w-full mb-4">
          <label className="text-base mb-2 px-4">
            {language === "ar" ? "العنوان" : "Address"}
          </label>
          <input
            className="flex items-center justify-center px-4 lg:w-[300px] w-full md:w-[500px] h-[50px] rounded-[4px] bg-[#F5F5F5] placeholder:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={language === "ar" ? "العنوان" : "Address"}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>
        {/* Buttons */}
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
      </form>
    </div>
  );
};
