import { useEffect } from "react";
import { Order, P2POrderFilter } from "@/lib/types/bybit-api-types";

interface TradeDataFetcherProps {
  currentPage: number;
  filters?: P2POrderFilter;
  credentials: { apiKey: string; apiSecret: string };
  onFetchTrades: (page: number, filters?: P2POrderFilter) => Promise<void>;
  onFetchMoreTrades: (page: number, filters?: P2POrderFilter) => Promise<void>;
  hasMore: boolean;
  trades: Order[];
}

export const TradeDataFetcher = ({
  currentPage,
  filters,
  credentials,
  onFetchTrades,
  onFetchMoreTrades,
  hasMore,
  trades,
}: TradeDataFetcherProps) => {
  // Initial fetch on mount and when credentials change
  useEffect(() => {
    if (credentials?.apiKey && credentials?.apiSecret) {
      onFetchTrades(1, filters);
    }
  }, [credentials, onFetchTrades]);

  // Handle pagination
  useEffect(() => {
    if (credentials?.apiKey && credentials?.apiSecret && currentPage > 1) {
      onFetchMoreTrades(currentPage - 1, filters);
    }
  }, [currentPage, filters, credentials, onFetchMoreTrades]);

  return null;
};
