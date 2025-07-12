import { toast } from "sonner";
import { ApiSuccessResponse, BybitCredentials } from "../types/bybit-api-types";
import { getSignature, prepareQueryString, debugLog } from "../utils/bybit-utils";

export class BybitApiClient {
    private primaryBaseUrl: string;
    private fallbackBaseUrl: string | null;
    protected apiKey: string;
    protected apiSecret: string;
    private currentBaseUrl: string;
    private useTestnet: boolean;

    constructor(apiKey: string, apiSecret: string, testnet: boolean = false) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.useTestnet = testnet;

        if (testnet) {
            this.primaryBaseUrl = "https://api-testnet.bybit.com";
            this.fallbackBaseUrl = null;
            this.currentBaseUrl = this.primaryBaseUrl;
        } else {
            this.primaryBaseUrl = "https://api.bybit.com";
            this.fallbackBaseUrl = "https://api.bytick.com";
            this.currentBaseUrl = this.primaryBaseUrl;
        }

        debugLog(`Using Bybit ${testnet ? 'Testnet' : 'Mainnet'} API with endpoint: ${this.primaryBaseUrl}`);
    }

    protected async makeRequest<T>(endpoint: string, params: Record<string, any> = {}, attempt: number = 1): Promise<T> {
        try {
            const timestamp = Date.now().toString();
            const recvWindow = "5000"; // Standard recvWindow for P2P API

            // Prepare query string - P2P API requires different parameter handling
            const queryString = prepareQueryString(params);
            
            // Generate signature - Specific format for P2P API
            const signaturePayload = timestamp + this.apiKey + recvWindow + queryString;
            const signature = getSignature(signaturePayload, this.apiSecret);
            
            // Create URL with query parameters
            const url = `${this.currentBaseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;
            
            debugLog(`Making request to: ${url}`, {
                method: "GET",
                timestamp,
                apiKeyFirstChars: this.apiKey.substring(0, 5) + '...',
                endpoint,
                params
            });
            
            // Make the API request with P2P-specific headers
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-BAPI-API-KEY": this.apiKey, // P2P uses different header names
                    "X-BAPI-TIMESTAMP": timestamp,
                    "X-BAPI-SIGN": signature,
                    "X-BAPI-RECV-WINDOW": recvWindow
                }
            });
            
            debugLog(`Response status: ${response.status} ${response.statusText}`);
            
            const text = await response.text();
            if (!text) {
                throw new Error(`Empty response from endpoint: ${endpoint}`);
            }
            
            let responseData;
            try {
                responseData = JSON.parse(text);
                debugLog("API Response data:", responseData);
            } catch (e) {
                console.error("Failed to parse API response:", text);
                throw new Error(`Invalid JSON response from Bybit API: ${e.message}`);
            }
            
            if (!response.ok) {
                const errorMsg = responseData?.retMsg || `HTTP error: ${response.status} ${response.statusText}`;
                this.handleApiError(responseData, endpoint);
                throw new Error(`Bybit API Error (${response.status}): ${errorMsg}`);
            }
            
            // P2P API uses different response structure than other Bybit APIs
            if (responseData.code !== 0) {
                const errorMsg = responseData.msg || `API error: ${responseData.code}`;
                debugLog(`API Error (${endpoint}):`, errorMsg);
                this.handleApiError(responseData, endpoint);
                throw new Error(`Bybit API Error: ${errorMsg}`);
            }
            
            return responseData as T;
        } catch (error: any) {
            debugLog(`Request failed for ${endpoint}:`, error);
            
            if (attempt === 1 && this.fallbackBaseUrl && !this.useTestnet) {
                debugLog(`Trying fallback URL: ${this.fallbackBaseUrl}`);
                this.currentBaseUrl = this.fallbackBaseUrl;
                return this.makeRequest<T>(endpoint, params, 2);
            }
            
            throw error;
        }
    }

    private handleApiError(response: any, endpoint: string): void {
        const errorCode = response?.code || response?.retCode;

        if (!errorCode) return;

        switch (errorCode) {
            case 10001: 
                throw new Error("Invalid API parameters. Please check your input values.");
            case 10003:
                throw new Error("Invalid API key. Please check your API key or regenerate a new one.");
            case 10004:
                throw new Error("API signing error. Please check your API key and secret.");
            case 10006:
                throw new Error("Your API key doesn't have permission to access P2P trading data.");
            case 10016:
            case 10017:
            case 10018:
                throw new Error("Rate limit exceeded. Please wait before making more requests.");
            case 110001:
                throw new Error("P2P trading system temporary maintenance.");
            default:
                break;
        }
    }

    public getCurrentBaseUrl(): string {
        return this.currentBaseUrl;
    }

    public isTestnet(): boolean {
        return this.useTestnet;
    }

    public async testConnection(): Promise<boolean> {
        try {
            await this.makeRequest<ApiSuccessResponse<any>>("/v5/market/time", {});
            return true;
        } catch (error) {
            return false;
        }
    }

    public async testP2PPermissions(): Promise<{
        hasAccess: boolean;
        message: string;
    }> {
        try {
            const res = await this.makeRequest<ApiSuccessResponse<any>>("/p2p/v1/order/list", {
                page: 1,
                size: 30  // Updated from 1 to 30 to match our new page size
            });
            return {
                hasAccess: true,
                message: "P2P API permissions verified successfully"
            };
        } catch (error: any) {
            return {
                hasAccess: false,
                message: error.message || "Failed to access P2P endpoints. Check your API permissions."
            };
        }
    }
}
