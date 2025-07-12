import { supabase } from "@/integrations/supabase/client";
import type { BybitP2PResponse, BybitRequestParams } from "./types";
import { logger } from "@/utils/logUtils";

/**
 * Calls the Bybit P2P API through our Supabase Edge Function proxy
 * to avoid CORS issues and protect API credentials
 */
export const getBybitP2PRate = async (
  currencyId: string = "NGN",
  tokenId: string = "USDT",
  verifiedOnly: boolean = true
): Promise<BybitP2PResponse | null> => {
  logger.debug("[BybitAPI] Initiating request for", tokenId, "to", currencyId);

  try {
    logger.debug("[BybitAPI] Calling Supabase Edge Function proxy");

    // Call our Supabase Edge Function instead of directly calling the Bybit API
    const { data, error } = await supabase.functions.invoke("bybit-proxy", {
      body: {
        currencyId,
        tokenId,
        verifiedOnly,
        page: 1,
      },
    });

    if (error) {
      logger.error("[BybitAPI] Edge function error:", error);
      return {
        traders: [],
        market_summary: {
          total_traders: 0,
          price_range: {
            min: 0,
            max: 0,
            average: 0,
            median: 0,
            mode: 0,
          },
        },
        timestamp: new Date().toISOString(),
        success: false,
        error: `Edge function error: ${error.message || "Unknown error"}`,
      };
    }

    logger.debug("[BybitAPI] Received response from Edge Function:", data);

    // The Edge Function returns the data in the same format we expect
    if (data && data.success && data.market_summary && data.traders) {
      console.log('wewewefsf',data)
      return data as BybitP2PResponse;
    }

    // Handle unsuccessful responses from the Edge Function
    return {
      traders: [],
      market_summary: {
        total_traders: 0,
        price_range: {
          min: 0,
          max: 0,
          average: 0,
          median: 0,
          mode: 0,
        },
      },
      timestamp: new Date().toISOString(),
      success: false,
      error: data?.error || "Invalid response from Edge Function",
    };
  } catch (error: any) {
    logger.error("❌ Error fetching Bybit P2P rate:", error);
    logger.error("[BybitAPI] Error details:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
    });

    // Determine if it's a network error, timeout, or other issue
    let errorMessage = "Unknown error occurred";

    if (error.code === "ECONNABORTED") {
      errorMessage = "Request timed out";
    } else if (error.code === "ERR_NETWORK") {
      errorMessage = "Network error - check your internet connection";
    } else if (error.response) {
      // The request was made and the server responded with a status code
      errorMessage = `Server responded with error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = "No response received from server";
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message || "Error setting up request";
    }

    return {
      traders: [],
      market_summary: {
        total_traders: 0,
        price_range: {
          min: 0,
          max: 0,
          average: 0,
          median: 0,
          mode: 0,
        },
      },
      timestamp: new Date().toISOString(),
      success: false,
      error: errorMessage,
    };
  }
};
