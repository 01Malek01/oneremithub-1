
import CryptoJS from 'crypto-js';

/**
 * Generates a signature for Bybit API requests
 * Updated to support the header-based auth format according to Bybit docs
 */
export const getSignature = (payload: string, secret: string): string => {
  // Ensure we have valid inputs
  if (!payload || !secret) {
    console.error("Cannot generate signature: missing payload or secret");
    return "";
  }
  
  debugLog("Generating signature with payload:", payload.replace(/[a-zA-Z0-9]{10,}/g, "***"));
  return CryptoJS.HmacSHA256(payload, secret).toString();
};

/**
 * Converts a timestamp to a readable date format
 */
export const convertTimestampToReadable = (timestamp: number): string => {
  if (!timestamp) return "N/A";
  try {
    const date = new Date(timestamp);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  } catch (e) {
    console.error("Failed to convert timestamp:", timestamp, e);
    return "Invalid date";
  }
};

/**
 * Formats and prepares the query parameters for Bybit API
 * According to Bybit docs: parameters should be sorted alphabetically
 */
export const prepareQueryString = (params: Record<string, any>): string => {
  const cleanParams: Record<string, string> = {};
  
  // Convert params to clean format
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        cleanParams[key] = value.join(',');
      } else {
        cleanParams[key] = String(value);
      }
    }
  });
  
  // Sort keys alphabetically as required by Bybit API
  const sortedKeys = Object.keys(cleanParams).sort();
  const parts: string[] = [];
  
  for (const key of sortedKeys) {
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(cleanParams[key])}`);
  }
  
  const result = parts.join('&');
  debugLog("Prepared query string:", result);
  return result;
};

// Debug mode flag - can be enabled via localStorage
let DEBUG_MODE = false;
try {
  DEBUG_MODE = localStorage.getItem('bybit_debug_mode') === 'true';
} catch (e) {
  // Ignore localStorage errors in SSR contexts
}

/**
 * Debug logger for API requests with improved formatting
 */
export const debugLog = (message: string, data?: any): void => {
  if (DEBUG_MODE) {
    console.group(`[Bybit API Debug] ${message}`);
    if (data !== undefined) {
      if (typeof data === 'string' && data.length > 200) {
        console.log(data.substring(0, 200) + '... (truncated)');
      } else {
        console.log(data);
      }
    }
    console.groupEnd();
  }
};

/**
 * Toggle debug mode for Bybit API
 */
export const toggleDebugMode = (enable?: boolean): boolean => {
  try {
    DEBUG_MODE = enable !== undefined ? enable : !DEBUG_MODE;
    localStorage.setItem('bybit_debug_mode', String(DEBUG_MODE));
    console.log(`[Bybit API] Debug mode ${DEBUG_MODE ? 'enabled' : 'disabled'}`);
    return DEBUG_MODE;
  } catch (e) {
    console.error("Could not toggle debug mode:", e);
    return false;
  }
};

/**
 * Get current debug mode state
 */
export const getDebugMode = (): boolean => {
  return DEBUG_MODE;
};
