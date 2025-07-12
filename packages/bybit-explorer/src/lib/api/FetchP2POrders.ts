import axios from 'axios';
import { getDebugMode } from '@/lib/utils/bybit-utils';

const BYBIT_API_URL = 'https://api.bybit.com';

export interface P2POrderParams {
  userId?: string;
  orderId?: string;
  advertId?: string;
  coin?: string;
  currency?: string;
  orderStatus?: 'ALL' | 'WAIT_PAY' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  startTime?: number;
  endTime?: number | string; // Updated to accept string as well
  page?: number;
  limit?: number;
  recvWindow?: number;
  status?: number;
  beginTime?: number | string; // Added to match filter
  tokenId?: string;
  side?: number[];
  size?: number; // Added to match usage
}

interface P2POrderResponse {
  ret_code: number;
  ret_msg: string;
  result: {
    count: number;
    items: Array<any>; // We'll map this in the consumer
  };
  ext_code?: string;
  ext_info?: Record<string, unknown>;
  time_now?: string;
}

export async function generateSignature(secret: string, message: string): Promise<string> {
  // console.log("recieved api secret in the signature func", secret); 
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function fetchP2POrders(
  apiKey: string,
  apiSecret: string,
  page: number,
  params: P2POrderParams = {}
): Promise<P2POrderResponse> {
  const defaultParams = {
    page,
    size: 30,
    orderStatus: 'ALL' as const,
    recvWindow: 5000,
  };

  // Convert string timestamps to numbers if needed
  const processedParams = { ...defaultParams, ...params };
  
  // Convert beginTime and endTime to numbers if they are strings
  if (typeof processedParams.beginTime === 'string') {
    processedParams.beginTime = Number(processedParams.beginTime);
  }
  
  if (typeof processedParams.endTime === 'string') {
    processedParams.endTime = Number(processedParams.endTime);
  }

  const timestamp = Date.now().toString();
  const requestBodyString = JSON.stringify(processedParams);
  const message = timestamp + apiKey + processedParams.recvWindow.toString() + requestBodyString;

  // Debug logging
  if (getDebugMode()) {
    console.debug('Request Parameters:', {
      url: `${BYBIT_API_URL}/v5/p2p/order/simplifyList`,
      params: processedParams,
      timestamp,
      messageLength: message.length,
    });
  }

  const signature = await generateSignature(apiSecret, message);

  const headers = {
    'Content-Type': 'application/json',
    'X-BAPI-API-KEY': apiKey,
    'X-BAPI-TIMESTAMP': timestamp,
    'X-BAPI-RECV-WINDOW': processedParams.recvWindow.toString(),
    'X-BAPI-SIGN': signature,
  };

  const maxRetries = 3;
  let retryCount = 0;
  let lastError: any = null;

  while (retryCount < maxRetries) {
    try {
      const response = await axios.post<P2POrderResponse>(
        `${BYBIT_API_URL}/v5/p2p/order/simplifyList`,
        processedParams,
        { headers, timeout: 15000 } // Add a 15-second timeout
      );

      if (getDebugMode()) {
        console.debug('API Response:', {
          status: response.status,
          data: response.data,
          headers: response.headers,
        });
      }

      if (response.data.ret_code !== 0) {
        throw new Error(`API Error: ${response.data.ret_msg} (Code: ${response.data.ret_code})`);
      }

      return response.data;
    } catch (error: any) {
      lastError = error;
      
      if (getDebugMode()) {
        console.error('Detailed API Error:', {
          message: error.message,
          code: error.code, // Also log the error code for debugging timeouts
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
        });
      }

      // Check for retryable errors: rate limit or timeout
      const isRateLimitError = error.response?.data?.ret_code === 10006 || error.message?.includes('rate limit');
      const isTimeoutError = error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout');

      if ((isRateLimitError || isTimeoutError) && retryCount < maxRetries) {
        retryCount++;
        // Exponential backoff: 2^retryCount seconds
        const delay = Math.pow(2, retryCount) * 1000;
        const reason = isRateLimitError ? 'Rate limit hit' : 'Request timed out';
        console.log(`${reason}. Retrying in ${delay / 1000} seconds... (${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Enhanced error messages for non-retryable errors
      if (error.response?.data?.ret_msg) {
        throw new Error(`Bybit API Error: ${error.response.data.ret_msg}`);
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your API key and secret.');
      } else if (error.response?.status === 403) {
        throw new Error('Permission denied. Please ensure your API key has P2P trading permissions.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      } else {
        throw new Error(`Failed to fetch P2P orders: ${error.message}`);
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
}
