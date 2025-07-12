
import { useQuery } from "@tanstack/react-query";

interface ExchangeRateResponse {
  result: {
    list: Array<{
      symbol: string;
      lastPrice: string;
      prevPrice24h: string;
      price24hPcnt: string;
      highPrice24h: string;
      lowPrice24h: string;
      volume24h: string;
      turnover24h: string;
    }>;
  };
}

async function fetchUsdtNairaRate() {
  try {
    const response = await fetch("https://api.bybit.com/v5/market/tickers?category=spot&symbol=USDTNGN");
    if (!response.ok) {
      throw new Error("Failed to fetch rate from Bybit");
    }
    const data: ExchangeRateResponse = await response.json();
    
    // Extract the rate from the response
    const usdtNgnPair = data.result.list.find(item => item.symbol === "USDTNGN");
    if (!usdtNgnPair) {
      throw new Error("USDT/NGN pair not found in response");
    }
    
    const rate = parseFloat(usdtNgnPair.lastPrice);
    const change24h = parseFloat(usdtNgnPair.price24hPcnt) * 100;
    const prevRate = parseFloat(usdtNgnPair.prevPrice24h);
    
    return {
      rate,
      change24h,
      prevRate,
      highPrice24h: parseFloat(usdtNgnPair.highPrice24h),
      lowPrice24h: parseFloat(usdtNgnPair.lowPrice24h)
    };
  } catch (error) {
    console.error("Error fetching USDT/NGN rate:", error);
    return { 
      rate: 1280.50, // Fallback rate
      change24h: 1.2,
      prevRate: 1265.32,
      highPrice24h: 1285.00,
      lowPrice24h: 1270.00
    };
  }
}

export function useExchangeRate() {
  return useQuery({
    queryKey: ['usdtNairaRate'],
    queryFn: fetchUsdtNairaRate,
    refetchInterval: 60000, // Refresh every minute
    initialData: {
      rate: 1280.50,
      change24h: 1.2,
      prevRate: 1265.32,
      highPrice24h: 1285.00,
      lowPrice24h: 1270.00
    }
  });
}
