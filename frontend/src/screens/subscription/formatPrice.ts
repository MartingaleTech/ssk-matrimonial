const SYMBOLS: Record<string, string> = { INR: '₹', USD: '$' };

/** Amounts arrive as integer minor units (paise / cents). */
export function formatPrice(amount: number, currency: string): string {
  const symbol = SYMBOLS[currency] ?? `${currency} `;
  const major = amount / 100;
  const formatted = Number.isInteger(major) ? major.toString() : major.toFixed(2);
  return `${symbol}${formatted}`;
}
