
import { useCallback, useEffect, useRef, useState } from 'react';
import { saveHistoricalRates } from '@/services/historical-rates-service';
import { CurrencyRates } from '@/services/api';
import { logger } from '@/utils/logUtils';

interface RateRefresherProps {
  usdtNgnRate: number | null;
  usdMargin: number;
  otherCurrenciesMargin: number;
  costPrices: CurrencyRates;
  fxRates: CurrencyRates;
  refreshBybitRate: () => Promise<boolean>;
  refreshVertoFXRates: () => Promise<boolean>;
  calculateAllCostPrices: (usdMargin: number, otherCurrenciesMargin: number) => void;
}

export const useRateRefresher = ({
  usdtNgnRate,
  usdMargin,
  otherCurrenciesMargin,
  costPrices,
  fxRates,
  refreshBybitRate,
  refreshVertoFXRates,
  calculateAllCostPrices
}: RateRefresherProps) => {
  // Reference to store timer
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update initial countdown to 10 minutes (600 seconds)
  const [nextRefreshIn, setNextRefreshIn] = useState(600);

  // Handle manual Bybit rate refresh
  const handleBybitRateRefresh = useCallback(async () => {
    logger.debug("RateRefresher: Manually refreshing Bybit rate");
    const success = await refreshBybitRate();

    if (success) {
      logger.debug("RateRefresher: Manual refresh was successful");
      // Ensure we have a valid rate before recalculating
      if (usdtNgnRate && usdtNgnRate > 0) {
        // After refreshing the rate, recalculate with current margins
        calculateAllCostPrices(usdMargin, otherCurrenciesMargin);
      }
      return true;
    } else {
      logger.warn("RateRefresher: Manual refresh did not update the rate");
      return false;
    }
  }, [refreshBybitRate, calculateAllCostPrices, usdMargin, otherCurrenciesMargin, usdtNgnRate]);

  // Handle refresh button click
  const handleRefresh = async () => {
    logger.debug("RateRefresher: Handling refresh button click");

    try {
      // Refresh both Bybit and VertoFX rates concurrently
      const [bybitSuccess, vertoSuccess] = await Promise.all([
        handleBybitRateRefresh(),
        refreshVertoFXRates()
      ]);

      logger.debug(`RateRefresher: Refresh results - Bybit: ${bybitSuccess}, VertoFX: ${vertoSuccess}`);

      // Only save historical data if both refreshes were successful
      if (bybitSuccess) {
        try {
          // Add validation for FX rates before saving historical data
          if (usdtNgnRate && usdtNgnRate > 0 && Object.keys(costPrices).length > 0) {
            // Check if we have valid FX rates
            const fxRatesValid = fxRates && Object.keys(fxRates).length > 0;
            logger.debug(`RateRefresher: FX rates valid: ${fxRatesValid}, FX rates:`, fxRates);
            
            await saveHistoricalRates(
              usdtNgnRate,
              usdMargin,
              otherCurrenciesMargin,
              fxRates,
              costPrices,
              'refresh'
            );
            logger.debug("Historical data saved after refresh");
          } else {
            logger.warn("RateRefresher: Cannot save historical data - missing required data", {
              usdtNgnRate,
              costPricesCount: Object.keys(costPrices).length,
              fxRatesCount: Object.keys(fxRates).length
            });
          }
        } catch (error) {
          logger.error("Error saving historical data after refresh:", error);
        }
      }
    } catch (error) {
      logger.error("Error during refresh:", error);
    }
  };

  // Function to handle the actual refresh
  const performRefresh = async () => {
    logger.debug("RateRefresher: Performing auto-refresh");
    try {
      // For auto-refresh, use a different approach - don't show toast notifications
      // We'll directly fetch the rate without notification
      const success = await refreshBybitRate();

      if (success) {
        logger.debug("RateRefresher: Auto-refresh successful");
        // Ensure we have a valid rate before recalculating
        if (usdtNgnRate && usdtNgnRate > 0) {
          calculateAllCostPrices(usdMargin, otherCurrenciesMargin);
        }

        // Save historical data only if we have valid rates
        if (usdtNgnRate && usdtNgnRate > 0 && Object.keys(costPrices).length > 0) {
          // Add validation for FX rates
          const fxRatesValid = fxRates && Object.keys(fxRates).length > 0;
          logger.debug(`RateRefresher: Auto-refresh - FX rates valid: ${fxRatesValid}`);
          
          if (fxRatesValid) {
            await saveHistoricalRates(
              usdtNgnRate,
              usdMargin,
              otherCurrenciesMargin,
              fxRates,
              costPrices,
              'auto'
            );
          } else {
            logger.warn("RateRefresher: Skipping historical data save - no valid FX rates");
          }
        }
      } else {
        logger.warn("RateRefresher: Auto-refresh failed");
      }
    } catch (error) {
      logger.error("Auto-refresh failed:", error);
    }
  };

  // Setup countdown timer and auto-refresh
  useEffect(() => {
    // Perform initial refresh immediately
    performRefresh();

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      setNextRefreshIn(prev => {
        if (prev <= 1) {
          performRefresh(); // Trigger refresh when countdown reaches 0
          return 600; // Reset to 600 seconds (10 minutes)
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [usdMargin, otherCurrenciesMargin]);

  return {
    handleRefresh,
    handleBybitRateRefresh,
    nextRefreshIn
  };
};
