import React, { useState } from "react";
import { getDiscountForCode, availableDiscounts } from "../components/discounts";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState({ code: "", discount: 0, description: "" });

  // Apply promo from input or button
  const applyPromo = (code) => {
    const { discount, description } = getDiscountForCode(code);
    if (discount > 0) {
      setAppliedPromo({ code: code.toUpperCase(), discount, description });
      alert(`Promo code "${code.toUpperCase()}" applied!`);
    } else {
      setAppliedPromo({ code: "", discount: 0, description: "" });
      alert("Invalid promo code");
    }
  };

  const getTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getDiscountedTotal = () => {
    const total = getTotal();
    return total - total * appliedPromo.discount;
  };

  const handleCheckout = () => {
    // Store the applied promo in localStorage before navigating
    if (appliedPromo.code) {
      localStorage.setItem('appliedPromo', JSON.stringify(appliedPromo));
    }
    navigate("/checkout");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-700 text-center">
        Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-lg">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border p-4 rounded-md shadow"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="text-sm text-gray-600">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded">
                    <button
                      className="px-3 py-1 text-xl"
                      onClick={() => updateQuantity(item.id, -1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      className="px-3 py-1 text-xl"
                      onClick={() => updateQuantity(item.id, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-20 text-right font-medium">
                    ₹{item.price * item.quantity}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Promo code input */}
          <div className="mt-6 max-w-sm">
            <label className="block mb-2 font-medium">Enter Promo Code</label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Enter code"
                disabled={appliedPromo.code !== ""}
              />
              <button
                onClick={() => applyPromo(promoCode)}
                className={`px-4 rounded ${
                  appliedPromo.code
                    ? "bg-green-700 text-white"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                disabled={appliedPromo.code !== ""}
              >
                {appliedPromo.code ? "Applied" : "Apply"}
              </button>
            </div>

            {/* List available promo codes */}
            <div>
              <h3 className="font-semibold mb-2">Available Promo Codes:</h3>
              <ul className="space-y-2">
                {availableDiscounts.map(({ code, description }) => (
                  <li key={code} className="flex justify-between items-center border p-2 rounded">
                    <span>
                      <strong>{code}</strong>: {description}
                    </span>
                    <button
                      onClick={() => {
                        setPromoCode(code);
                        applyPromo(code);
                      }}
                      className={`px-3 py-1 rounded ${
                        appliedPromo.code === code
                          ? "bg-green-700 text-white"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                      disabled={appliedPromo.code !== ""}
                    >
                      {appliedPromo.code === code ? "Applied" : "Apply"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Total price with discount */}
          <div className="mt-8 flex justify-between items-center text-xl font-bold">
            {appliedPromo.discount > 0 ? (
              <div>
                <p>
                  Total:{" "}
                  <span className="line-through text-gray-500 mr-2">₹{getTotal().toFixed(2)}</span>
                  <span className="text-green-700">₹{getDiscountedTotal().toFixed(2)}</span>
                </p>
                <p className="text-green-600 mt-1">
                  Promo <strong>{appliedPromo.code}</strong> applied ({appliedPromo.description})
                </p>
              </div>
            ) : (
              <p>Total: ₹{getTotal().toFixed(2)}</p>
            )}

            <button
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
