import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VertoFxRate } from "./vertofx";
import { logger } from '@/utils/logUtils';

/**
 * Save VertoFX rates to the historical database
 * @param rates The VertoFX rates to save
 * @returns Promise<boolean> Success indicator
 */
export const saveVertoFxHistoricalRates = async (
  rates: Record<string, VertoFxRate>
): Promise<boolean> => {
  try {
    logger.info("[vertofx-historical] Saving historical VertoFX rates");
    console.log("[vertofx-historical] Saving historical VertoFX rates");

    if (!rates || Object.keys(rates).length === 0) {
      logger.warn("[vertofx-historical] No rates available to save");
      return false;
    }

    const MIN_INTERVAL_MINUTES = 10; // or whatever interval you want

    const recordsToInsert = [];
    for (const [currencyPair, rateData] of Object.entries(rates)) {
      // Determine buy and sell rates based on the currency pair
      const [fromCurrency, toCurrency] = currencyPair.split('-');
      const isNgnBuy = fromCurrency === 'NGN';

      // 1. Fetch the latest record for this currency pair
      const { data: latest, error } = await supabase
        .from('vertofx_historical_rates')
        .select('date')
        .eq('currency_pair', currencyPair)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      let shouldInsert = true;
      if (latest && latest.date) {
        const lastDate = new Date(latest.date);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastDate.getTime()) / (1000 * 60);
        if (diffMinutes < MIN_INTERVAL_MINUTES) {
          shouldInsert = false;
        }
      }

      if (shouldInsert) {
        recordsToInsert.push({
          currency_pair: currencyPair,
          buy_rate: isNgnBuy ? rateData.inverse_rate : rateData.rate,
          sell_rate: isNgnBuy ? rateData.rate : rateData.inverse_rate,
          provider: rateData.provider || 'VertoFX',
          percent_change: rateData.percent_change
        });
      }
    }

    // Only insert if there are new records
    if (recordsToInsert.length > 0) {
      const { error } = await supabase
        .from('vertofx_historical_rates')
        .insert(recordsToInsert);

      if (error) {
        logger.error("[vertofx-historical] Error saving historical rates:", error);
        return false;
      }

      logger.info(`[vertofx-historical] Successfully saved ${recordsToInsert.length} historical rates`);
      console.log(`[vertofx-historical] Successfully saved ${recordsToInsert.length} historical rates`);
      return true;
    }

    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("[vertofx-historical] Error in saveVertoFxHistoricalRates:", errorMessage);
    return false;
  }
};

/**
 * Fetch historical VertoFX rates for analytics
 * @param currencyPair The currency pair to fetch rates for (e.g., 'NGN-USD')
 * @param limit Maximum number of records to return
 * @returns Array of historical rates
 */
export const fetchVertoFxHistoricalRates = async (
  currencyPair: string,
  limit: number = 30
) => {
  try {
    const { data, error } = await supabase
      .from('vertofx_historical_rates')
      .select('*')
      .eq('currency_pair', currencyPair)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(`[vertofx-historical] Error fetching historical rates for ${currencyPair}:`, error);
      toast.error(`Failed to fetch historical data for ${currencyPair}`);
      return [];
    }

    return data || [];
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[vertofx-historical] Error in fetchVertoFxHistoricalRates:`, errorMessage);
    toast.error(`Failed to fetch historical VertoFX data`);
    return [];
  }
};
