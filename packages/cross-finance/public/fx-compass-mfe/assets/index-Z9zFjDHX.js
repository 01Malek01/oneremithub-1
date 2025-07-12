import { f as fetchMarginSettings, g as getCurrentCostPrices, s as saveHistoricalRates } from './__federation_expose_App-D6LZZFz9.js';
export { a as fetchCurrentVertoFxRates, c as getLastApiAttemptTimestamp, e as getTimeUntilNextAttempt, i as isVertoFxRateLimited, k as loadAndApplyMarginSettings, b as loadCurrencyRates, j as loadRatesData, l as loadUsdtRate, h as loadVertoFxRates, d as setLastApiAttemptTimestamp, u as updateVertoFxCurrentRates } from './__federation_expose_App-D6LZZFz9.js';

const saveHistoricalRatesData = async (fxRates, usdtRate) => {
  if (Object.keys(fxRates).length > 0 && usdtRate && usdtRate > 0) {
    try {
      const marginSettings = await fetchMarginSettings();
      if (!marginSettings) {
        console.warn("[historicalDataUtils] No margin settings found for historical data");
        return false;
      }
      const costPrices = getCurrentCostPrices();
      if (Object.keys(costPrices).length === 0) {
        console.warn("[historicalDataUtils] No cost prices available for historical data");
        return false;
      }
      const saved = await saveHistoricalRates(
        usdtRate,
        marginSettings.usd_margin,
        marginSettings.other_currencies_margin,
        fxRates,
        costPrices,
        "refresh"
      );
      console.log("[historicalDataUtils] Saved historical rates:", saved);
      return saved;
    } catch (error) {
      console.error("[historicalDataUtils] Error saving historical rates:", error);
      return false;
    }
  }
  return false;
};

export { saveHistoricalRatesData };
