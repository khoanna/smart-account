import { formatUnits } from "viem";

export function formatBalance(value: bigint | string | undefined | null, decimals: number = 18, displayDecimals: number = 4): string {
  if (!value) return "0";
  const formatted = formatUnits(BigInt(value), decimals);
  const [integerPart, fractionPart] = formatted.split(".");
  const integerFormatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (fractionPart) {
    const fractionTruncated = fractionPart.substring(0, displayDecimals);

    if (fractionTruncated.length > 0) {
      return `${integerFormatted}.${fractionTruncated}`;
    }
  }
  return integerFormatted;
}
