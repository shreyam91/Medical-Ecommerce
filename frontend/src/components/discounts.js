// discounts.js

export const availableDiscounts = [
  { code: "SAVE10", discount: 0.1, description: "10% off" },
  // { code: "SAVE20", discount: 0.2, description: "20% off" },
  { code: "WELCOME5", discount: 0.05, description: "5% off" },
];

// Helper to get discount by code
export function getDiscountForCode(code) {
  if (!code) return { discount: 0, description: "" };
  const upperCode = code.toUpperCase();
  const found = availableDiscounts.find((d) => d.code === upperCode);
  return found || { discount: 0, description: "" };
}
