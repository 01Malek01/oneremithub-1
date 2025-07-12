
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/utils/logUtils';
import { VertoFXRates } from "@/services/api";

/**
 * Update VertoFX current rates in the database using existing database function
 * @param rates The rates to store in vertofx_current_rates
 * @returns Promise<boolean> Success indicator
 */
export const updateVertoFxCurrentRates = async (
  rates: VertoFXRates
): Promise<boolean> => {
  try {
    logger.info("[vertofx-current] Updating current VertoFX rates");
    
    if (!rates || Object.keys(rates).length === 0) {
      logger.warn("[vertofx-current] No rates available to update");
      return false;
    }

    // Extract rates for each currency
    const usdRate = rates.USD?.buy || 0;
    const eurRate = rates.EUR?.buy || 0;
    const gbpRate = rates.GBP?.buy || 0;
    const cadRate = rates.CAD?.buy || 0;

    // Check if we have at least one valid rate
    if (usdRate === 0 && eurRate === 0 && gbpRate === 0 && cadRate === 0) {
      logger.warn("[vertofx-current] All rates are zero, skipping update");
      return false;
    }

    // First try using the database function
    try {
      const { error } = await supabase.rpc('update_vertofx_current_rates', {
        p_usd_rate: usdRate,
        p_eur_rate: eurRate,
        p_gbp_rate: gbpRate,
        p_cad_rate: cadRate
      });

      if (!error) {
        logger.info("[vertofx-current] Successfully updated current rates via RPC");
        return true;
      }
      
      // If RPC fails, log it but proceed to try direct update
      logger.warn("[vertofx-current] RPC method failed:", error);
    } catch (rpcError) {
      logger.warn("[vertofx-current] RPC attempt failed:", rpcError);
      // Continue to fallback method
    }
    
    // Fallback: Try direct table update instead
    try {
      // Check if a record exists
      const { data: existingRecord } = await supabase
        .from('vertofx_current_rates')
        .select('id')
        .limit(1)
        .single();
        
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('vertofx_current_rates')
          .update({
            usd_rate: usdRate,
            eur_rate: eurRate,
            gbp_rate: gbpRate,
            cad_rate: cadRate,
            // Fix: Convert the Date object to an ISO string instead of passing the Date directly
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id);
          
        if (error) {
          logger.error("[vertofx-current] Error updating existing record:", error);
          return false;
        }
      } else {
        // Insert new record - the database should have a default ID of 1
        const { error } = await supabase
          .from('vertofx_current_rates')
          .insert({
            id: 1, // Set explicit ID to avoid multiple records
            usd_rate: usdRate,
            eur_rate: eurRate,
            gbp_rate: gbpRate,
            cad_rate: cadRate
          });
          
        if (error) {
          logger.error("[vertofx-current] Error inserting new record:", error);
          return false;
        }
      }
      
      logger.info("[vertofx-current] Successfully updated current rates via direct table access");
      return true;
    } catch (directError) {
      logger.error("[vertofx-current] Both update methods failed:", directError);
      return false;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("[vertofx-current] Error in updateVertoFxCurrentRates:", errorMessage);
    return false;
  }
};

/**
 * Fetch current VertoFX rates from the database
 * @returns Promise with VertoFXRates or null if not found
 */
export const fetchCurrentVertoFxRates = async (): Promise<VertoFXRates | null> => {
  try {
    logger.debug("[vertofx-current] Fetching current rates from database");
    
    const { data, error } = await supabase
      .from('vertofx_current_rates')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      logger.error("[vertofx-current] Error fetching current rates:", error);
      return null;
    }
    
    if (!data) {
      logger.warn("[vertofx-current] No current rates found in database");
      return null;
    }
    
    // Convert the database record to the expected format
    const rates: VertoFXRates = {
      USD: { buy: 0, sell: data.usd_rate || 0 },
      EUR: { buy: 0, sell: data.eur_rate || 0 },
      GBP: { buy: 0, sell: data.gbp_rate || 0 },
      CAD: { buy: 0, sell: data.cad_rate || 0 }
    };
    
    // Add rough approximation of buy rates (this is just a fallback)
    rates.USD.buy = data.usd_rate ? data.usd_rate * 1.015 : 0;
    rates.EUR.buy = data.eur_rate ? data.eur_rate * 1.015 : 0;
    rates.GBP.buy = data.gbp_rate ? data.gbp_rate * 1.015 : 0;
    rates.CAD.buy = data.cad_rate ? data.cad_rate * 1.015 : 0;
    
    return rates;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("[vertofx-current] Error in fetchCurrentVertoFxRates:", errorMessage);
    return null;
  }
};
