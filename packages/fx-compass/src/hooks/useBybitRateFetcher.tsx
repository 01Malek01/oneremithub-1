
import { fetchBybitRateWithRetry } from '@/services/bybit/bybit-utils';
import { saveUsdtNgnRate } from '@/services/usdt-ngn-service';
import { logger } from '@/utils/logUtils';

interface BybitRateFetcherProps {
  setUsdtNgnRate: (rate: number) => void;
  setLastUpdated: (date: Date | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useBybitRateFetcher = ({
  setUsdtNgnRate,
  setLastUpdated,
  setIsLoading
}: BybitRateFetcherProps) => {
  // Removed notifications dependency
  
  const fetchBybitRate = async (): Promise<number | null> => {
    try {
      logger.debug("Fetching Bybit P2P rate with improved retry logic");
      const { rate, error } = await fetchBybitRateWithRetry(3, 2000); // Increased retries to 3
      
      if (!rate || rate <= 0) {
        logger.warn(`Failed to get valid Bybit rate: ${error || "Unknown error"}`);
        return null;
      }
      
      logger.info("Bybit P2P rate fetched successfully:", rate);
      
      return rate;
    } catch (error) {
      logger.error("Error in fetchBybitRate:", error);
      return null;
    }
  };

  const refreshBybitRate = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const bybitRate = await fetchBybitRate();
      
      if (bybitRate && bybitRate > 0) {
        logger.info("Refreshed Bybit USDT/NGN rate:", bybitRate);
        
        // Update local state
        setUsdtNgnRate(bybitRate);
        setLastUpdated(new Date());
        
        // Important: Save the rate to the database with explicit source value
        // This creates a new INSERT that will trigger real-time updates
        const saveSuccess = await saveUsdtNgnRate(bybitRate, 'bybit', false);
        
        if (!saveSuccess) {
          logger.error("Failed to save the bybit rate to database for real-time sync");
        }
        
        console.log("USDT/NGN rate updated from Bybit: The new rate will sync with all connected users");
        
        return true;
      } else {
        logger.warn("Could not refresh Bybit rate");
        
        console.warn("Failed to update USDT/NGN rate from Bybit: Using last saved rate instead");
        
        return false;
      }
    } catch (error) {
      logger.error("Error refreshing Bybit rate:", error);
      console.error("Failed to update USDT/NGN rate: Check your network connection and try again");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchBybitRate,
    refreshBybitRate
  };
};
