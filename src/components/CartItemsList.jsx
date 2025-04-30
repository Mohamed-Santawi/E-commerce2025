/* eslint-disable react/prop-types */
import { useContext } from "react";
import { DataContext } from "../DataContext";

function CartItemsList({ cart, getPrice, formatPrice }) {
  const { language } = useContext(DataContext);
  return (
    <div className="flex flex-col gap-4">
      {cart && cart.length > 0 ? (
        cart.map((item) => (
          <div
            key={item.id}
            className="flex flex-row items-center justify-between gap-4 py-2"
          >
            <div className="flex flex-row items-center gap-3">
              <img
                src={item.image}
                alt={language === "ar" ? item.nameAr : item.name}
                className="w-12 h-12 object-contain"
              />
              <p className="text-sm font-medium">
                {language === "ar" ? item.nameAr : item.name}
              </p>
            </div>
            <p className="text-sm font-medium">{formatPrice(getPrice(item))}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">
          {language === "ar" ? "لا توجد منتجات في السلة" : "Your cart is empty"}
        </p>
      )}
    </div>
  );
}
export default CartItemsList;
