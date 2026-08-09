/**
 * Formats currency numbers into Turkish Lira format (tr-TR):
 * Thousands separator: dot (.)
 * Decimal (kuruş) separator: comma (,)
 * Example: 342299.99 -> "342.299,99"
 */
export const formatTL = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
