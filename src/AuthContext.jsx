/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { DataContext } from "./DataContext"; // Import DataContext
const AuthContext = createContext();

// Export AuthContext explicitly
export { AuthContext };

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState(null); // Initialize as null to indicate loading
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const { language } = useContext(DataContext);
  // Predefined coupons (can be moved to Firestore)
  const validCoupons = [
    { code: "SAVE10", discountType: "percentage", discountValue: 10 }, // 10% off
    { code: "SAVE20", discountType: "percentage", discountValue: 20 }, // 20% off
    { code: "FLAT50", discountType: "fixed", discountValue: 50 }, // $50 off
  ];

  // Helper to get guest cart and coupon from localStorage
  const getGuestCart = () => {
    const storedCart = localStorage.getItem("guestCart");
    const storedCoupon = localStorage.getItem("guestCoupon");
    return {
      items: storedCart ? JSON.parse(storedCart) : [],
      coupon: storedCoupon ? JSON.parse(storedCoupon) : null,
    };
  };

  // Helper to save guest cart to localStorage
  const saveGuestCart = (cart, coupon) => {
    localStorage.setItem("guestCart", JSON.stringify(cart));
    localStorage.setItem("guestCoupon", JSON.stringify(coupon));
  };

  // Fetch user's cart and coupon from Firestore
  const fetchCart = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userCart = userDoc.data().cart || [];
        const userData = userDoc.data();
        const userCoupon = userData.coupon || null;
        // Merge with guest cart if it exists
        const guestCart = getGuestCart();
        if (guestCart.items.length > 0 || guestCart.coupon) {
          const mergedCart = mergeCarts(userCart, guestCart.items);
          const finalCoupon = userCoupon || guestCart.coupon;
          await setDoc(
            userRef,
            { cart: mergedCart, coupon: finalCoupon },
            { merge: true }
          );
          setCart(mergedCart);
          setAppliedCoupon(finalCoupon);
          localStorage.removeItem("guestCart"); // Clear guest cart after merging
          localStorage.removeItem("guestCoupon"); // Clear guest coupon after merging
        } else {
          setCart(userCart);
          setAppliedCoupon(userCoupon);
        }
      } else {
        setCart([]);
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart([]);
      setAppliedCoupon(null);
    }
  };

  // Merge guest and user carts
  const mergeCarts = (userCart, guestCart) => {
    const merged = [...userCart];
    guestCart.forEach((guestItem) => {
      const existingItem = merged.find((item) => item.id === guestItem.id);
      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        merged.push(guestItem);
      }
    });
    return merged;
  };
  // Apply Coupon
  const applyCoupon = async (couponCode) => {
    const coupon = validCoupons.find(
      (c) => c.code.toUpperCase() === couponCode.toUpperCase()
    );
    if (!coupon) {
      throw new Error(
        language === "ar" ? "كود الكوبون غير صالح" : "Invalid coupon code"
      );
    }
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, { coupon: coupon }, { merge: true });
      setAppliedCoupon(coupon);
    } else {
      saveGuestCart(cart, coupon);
      setAppliedCoupon(coupon);
    }
    return coupon;
  };
  const clearCoupon = async () => {
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, { coupon: null }, { merge: true });
    } else {
      saveGuestCart(cart, null);
    }
    setAppliedCoupon(null);
  };

  // Add product to cart
  const addToCart = async (product) => {
    if (currentUser) {
      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => item.id === product.id);
        let updatedCart;
        if (existingProduct) {
          updatedCart = prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          updatedCart = [...prevCart, { ...product, quantity: 1 }];
        }
        const userRef = doc(db, "users", currentUser.uid);
        setDoc(userRef, { cart: updatedCart }, { merge: true });
        return updatedCart;
      });
    } else {
      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => item.id === product.id);
        let updatedCart;
        if (existingProduct) {
          updatedCart = prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          updatedCart = [...prevCart, { ...product, quantity: 1 }];
        }
        saveGuestCart(updatedCart, appliedCoupon);
        return updatedCart;
      });
    }
  };

  // Remove product from cart
  const removeFromCart = async (product) => {
    if (currentUser) {
      setCart((prevCart) => {
        const updatedCart = prevCart.filter((item) => item.id !== product.id);
        const userRef = doc(db, "users", currentUser.uid);
        setDoc(userRef, { cart: updatedCart }, { merge: true });
        return updatedCart;
      });
    } else {
      setCart((prevCart) => {
        const updatedCart = prevCart.filter((item) => item.id !== product.id);
        saveGuestCart(updatedCart, appliedCoupon);
        return updatedCart;
      });
    }
  };

  // Update quantity in cart
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    if (currentUser) {
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
        const userRef = doc(db, "users", currentUser.uid);
        setDoc(userRef, { cart: updatedCart }, { merge: true });
        return updatedCart;
      });
    } else {
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
        saveGuestCart(updatedCart, appliedCoupon);
        return updatedCart;
      });
    }
  };

  function signup(email, password, name, address, city, country) {
    return createUserWithEmailAndPassword(auth, email, password).then(
      async (userCredential) => {
        await firebaseUpdateProfile(userCredential.user, { displayName: name });
        const userRef = doc(db, "users", userCredential.user.uid);
        const guestCart = getGuestCart();
        await setDoc(userRef, {
          displayName: name,
          email,
          address,
          city,
          country,
          cart: guestCart.items, // Transfer guest cart to Firestore
          coupon: guestCart.coupon,
        });
        localStorage.removeItem("guestCart"); // Clear guest cart
        localStorage.removeItem("guestCoupon"); // Clear guest coupon
        setCurrentUser(userCredential.user);
        fetchCart(userCredential.user.uid);
      }
    );
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  function logout() {
    return signOut(auth);
  }

  function updateProfile(updates) {
    return firebaseUpdateProfile(currentUser, updates).then(async () => {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, updates, { merge: true });
      setCurrentUser({ ...currentUser, ...updates });
    });
  }

  async function reauthenticateUser(currentPassword) {
    if (!currentUser || !currentUser.email) {
      throw new Error("No user or email available.");
    }
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    try {
      await reauthenticateWithCredential(currentUser, credential);
      return true;
    } catch (error) {
      console.error("Reauthentication failed:", error);
      throw error;
    }
  }

  async function savePaymentMethod(
    paymentMethod,
    cardNumber = null,
    expiryDate = null
  ) {
    if (!currentUser) {
      throw new Error("No user is currently signed in.");
    }
    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(
      userRef,
      {
        paymentMethod,
        ...(paymentMethod === "bank" && { cardNumber, expiryDate }),
      },
      { merge: true }
    );
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchCart(user.uid);
      } else {
        const guestCart = getGuestCart();
        setCart(guestCart.items); // Load guest cart for non-authenticated users
        setAppliedCoupon(guestCart.coupon);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    cart,
    appliedCoupon, // Expose appliedCoupon
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon, // Expose applyCoupon
    clearCoupon, // Expose clearCoupon
    signup,
    login,
    logout,
    loading,
    signInWithGoogle,
    updateProfile,
    reauthenticateUser,
    savePaymentMethod,
    fetchCart,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && cart !== null && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
