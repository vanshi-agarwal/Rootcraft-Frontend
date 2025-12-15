export const SHIPPING_FEE_INR = 50000; // ₹50,000 logistics fee
export const FREE_SHIPPING_THRESHOLD_INR = 500000; // Free shipping over ₹5,00,000

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function calculateShipping(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD_INR ? 0 : SHIPPING_FEE_INR;
}
