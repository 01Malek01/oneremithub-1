
export interface CalculationResult {
  usdtEquivalent: number;
  totalNgnReceived: number;
  totalNgnCost: number;
  profit: number;
}

export function calculateTransaction(
  customerAmount: number,
  rateSold: number,
  rateBought: number,
  usdtNgnRate: number
): CalculationResult {
  // USDT Amount = Customer Currency Amount ÷ Rate Sold
  const usdtEquivalent = customerAmount / rateSold;
  
  // Total NGN Received = USDT Amount × Rate Sold × USDT/NGN
  const totalNgnReceived = usdtEquivalent * rateSold * usdtNgnRate;
  
  // Total NGN Cost = USDT Amount × Rate Bought × USDT/NGN
  const totalNgnCost = usdtEquivalent * rateBought * usdtNgnRate;
  
  // Profit = Total NGN Received - Total NGN Cost
  const profit = totalNgnReceived - totalNgnCost;

  return {
    usdtEquivalent,
    totalNgnReceived,
    totalNgnCost,
    profit
  };
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
