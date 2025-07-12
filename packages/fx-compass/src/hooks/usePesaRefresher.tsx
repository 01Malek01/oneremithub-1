// src/hooks/usePesaRatesRefresher.tsx
import { useCallback, useEffect, useState, useRef } from 'react';
import { PesaRates, fetchPesaRates } from '@/services/currency-rates/api';
import { logger } from '@/utils/logUtils';
import { useNotifications } from '@/contexts/NotificationContext';

interface PesaRatesRefresherProps {
  setPesaRates: (rates: PesaRates) => void;
  pesaRates: PesaRates;
}

// Default refresh interval in seconds
const DEFAULT_REFRESH_INTERVAL = 60;

/**
 * Custom hook to handle automatic refreshing of Pesa rates
 */
export const usePesaRatesRefresher = ({
  setPesaRates,
  pesaRates
}: PesaRatesRefresherProps) => {
  // const { addNotification } = useNotifications();
  const [nextRefreshIn, setNextRefreshIn] = useState(DEFAULT_REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  // Function to refresh Pesa rates
  const refreshPesaRates = useCallback(async (forceRefresh: boolean = false): Promise<boolean> => {
    logger.debug("PesaRatesRefresher: Refreshing Pesa rates", { forceRefresh });
    setIsRefreshing(true);
    setError(null);

    try {
      const rates = await fetchPesaRates();
       console.log( "pesa rates from use pesa refresher", rates)
      // Check if we got valid rates
      if (rates && Object.keys(rates).length > 0) {
        setPesaRates(rates);
        setLastUpdated(new Date());
        logger.info("PesaRatesRefresher: Successfully refreshed Pesa rates");
        return true;
      } else {
        const errorMsg = "PesaRatesRefresher: No valid rates returned";
        logger.warn(errorMsg);
        setError("Failed to fetch Pesa rates: No data received");
        return false;
      }
    } catch (error) {
      const errorMsg = `PesaRatesRefresher: Error refreshing rates: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMsg);
      setError(errorMsg);
      return false;
    } finally {
      setIsRefreshing(false);
      // Reset the refresh countdown
      setNextRefreshIn(DEFAULT_REFRESH_INTERVAL);
    }
  }, [setPesaRates]);

  // Set up the auto-refresh interval
  useEffect(() => {
    // Initial load
    refreshPesaRates().catch(error => {
      logger.error("PesaRatesRefresher: Error in initial load:", error);
    });

    // Set up refresh interval
    refreshIntervalRef.current = setInterval(() => {
      refreshPesaRates().catch(error => {
        logger.error("PesaRatesRefresher: Error in scheduled refresh:", error);
      });
    }, DEFAULT_REFRESH_INTERVAL * 1000);

    // Clean up interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshPesaRates]);

  // Countdown effect
  useEffect(() => {
    if (nextRefreshIn <= 0) return;

    const timer = setTimeout(() => {
      setNextRefreshIn(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [nextRefreshIn]);

  // Show notification on error
  // useEffect(() => {
  //   if (error) {
  //     addNotification({
  //       id: 'pesa-rates-error',
  //       type: 'error',
  //       message: 'Failed to fetch Pesa rates',
  //       description: 'Using default rates instead',
  //       autoDismiss: 5000
  //     });
  //   }
  // }, [error, addNotification]);

  return {
    refreshPesaRates,
    nextRefreshIn,
    isRefreshing,
    lastUpdated,
    error
  };
};