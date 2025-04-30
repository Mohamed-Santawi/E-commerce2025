import { AuthProvider } from "./AuthContext";
// import { DataProvider } from "./DataContext";
import { useState } from "react"; // Import useState
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Theme } from "@radix-ui/themes"; // Import Theme from Radix UI
import { DataContext } from "./DataContext"; // Ensure this is correctly imported
import slides from "./productsData";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CartPage from "./pages/CartPage";
import { Toaster } from "react-hot-toast"; // Import Toaster from react-hot-toast
import PaymentPage from "./pages/PaymentPage";
// import other pages...

function App() {
  const [language, setLanguage] = useState("en");
  const [productsslides, setProductsslides] = useState(slides);
  // const [cart, setCart] = useState([]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/ar",
      element: <Home />,
    },
    {
      path: "/signup",
      element: <SignUp />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/about",
      element: <About />,
    },
    {
      path: "/contact",
      element: <Contact />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/cart",
      element: <CartPage />,
    },
    {
      path: "/checkout",
      element: <PaymentPage />,
    },
    // other routes...
  ]);

  return (
    <DataContext.Provider
      value={{
        language,
        setLanguage,
        handleLanguageChange,
        productsslides,
        setProductsslides,
        // cart,
        // setCart,
        // addToCart,
      }}
    >
      <AuthProvider>
        <Theme>
          <Toaster
            position="top-center" // Position of the toast messages
            reverseOrder={false} // New toasts appear on top
            toastOptions={{
              duration: 4000, // Duration of the toast messages
              style: {
                background: "#4CAF50", // Background color for success toasts
                color: "#fff", // Text color
              },
              error: {
                style: {
                  background: "#FF5252", // Background color for error toasts
                },
              },
            }}
          />
          <RouterProvider router={router} />
        </Theme>
      </AuthProvider>
    </DataContext.Provider>
  );
}

export default App;
