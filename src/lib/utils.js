import clsx from "clsx";

export function cn(...inputs) {
  return clsx(...inputs);
}

export function generateTransactionReference() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BLT-${result}`;
}