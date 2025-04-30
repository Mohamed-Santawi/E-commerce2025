import { useContext, useEffect, useMemo, useState } from "react";
import {
  AddressBook,
  Container,
  Footer,
  Header,
  PaymentOptions,
} from "../components";
import { DataContext } from "../DataContext";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { MyProfile } from "../components/MyProfile";

// Example components for each type of content

const MyReturns = () => (
  <div>
    <h2>My Returns</h2>
    <p>List of returned items will appear here.</p>
  </div>
);

const MyCancellations = () => (
  <div>
    <h2>My Cancellations</h2>
    <p>List of cancelled orders will appear here.</p>
  </div>
);

function Profile() {
  const { language } = useContext(DataContext);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("My Profile");

  const accountItems = useMemo(
    () => [
      {
        name: "My Profile",
        labelEn: "My Profile",
        labelAr: "ملفي الشخصي",
        component: <MyProfile language={language} />,
      },
      {
        name: "Address Book",
        labelEn: "Address Book",
        labelAr: "دفتر العناوين",
        component: <AddressBook language={language} />,
      },
      {
        name: "My Payment Options",
        labelEn: "My Payment Options",
        labelAr: "خيارات الدفع الخاصة بي",
        component: <PaymentOptions language={language} />,
      },
    ],
    [language]
  );

  const orderItems = useMemo(
    () => [
      {
        name: "My Returns",
        labelEn: "My Returns",
        labelAr: "المرتجعات الخاصة بي",
        component: <MyReturns />,
      },
      {
        name: "My Cancellations",
        labelEn: "My Cancellations",
        labelAr: "الإلغاءات الخاصة بي",
        component: <MyCancellations />,
      },
    ],
    []
  );

  const handleActiveItem = (itemName) => {
    setActiveItem(itemName);
  };

  // Redirect to login if the user is not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Find the active component based on the activeItem
  const activeComponent = useMemo(() => {
    const allItems = [...accountItems, ...orderItems];
    const active = allItems.find((item) => item.name === activeItem);
    return active ? active.component : null;
  }, [activeItem, accountItems, orderItems]);

  return (
    <>
      <Header />
      <Container lgPx="36">
        <div className="flex w-full justify-end items-end text-base mb-4">
          {language === "ar" ? ",مرحبا" : "Welcome,"}
          <span className="text-Button font-bold mx-2">
            {currentUser?.displayName || "User"}!
          </span>
        </div>
        <div className="px-2 flex lg:flex-row flex-col justify-between items-start gap-3 mb-20 mt-10">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col">
              <h1 className="font-medium text-base">
                {language === "ar" ? "إدارة حسابي" : "Mannage My Account"}
              </h1>
              <ul className="px-4 py-2 flex flex-col gap-1">
                {accountItems.map((item) => (
                  <li
                    key={item.name}
                    className={`cursor-pointer text-[15px] font-normal ${
                      activeItem === item.name ? "text-Button" : "text-gray-400"
                    }`}
                    onClick={() => handleActiveItem(item.name)}
                  >
                    {language === "ar" ? item.labelAr : item.labelEn}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col">
              <h1 className="font-medium text-base">
                {language === "ar" ? "طلباتي" : "My Orders"}
              </h1>
              <ul className="px-4 py-2 flex flex-col gap-1">
                {orderItems.map((item) => (
                  <li
                    key={item.name}
                    className={`cursor-pointer text-[15px] font-normal ${
                      activeItem === item.name ? "text-Button" : "text-gray-400"
                    }`}
                    onClick={() => handleActiveItem(item.name)}
                  >
                    {language === "ar" ? item.labelAr : item.labelEn}
                  </li>
                ))}
              </ul>
            </div>
            <Link className="font-medium text-base">
              {language === "ar" ? "قائمتي المفضلة" : "My WishList"}
            </Link>
          </div>
          <div className="flex rounded-[4px] shadow-[0px_1px_13px_0px_rgba(0,0,0,0.05)] w-full lg:w-[700px] p-6">
            {activeComponent}
          </div>
        </div>
      </Container>
      <Footer />
    </>
  );
}

export default Profile;
