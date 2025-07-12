
import { toast } from "sonner";
import { ApiSuccessResponse, Order, P2POrderFilter, P2POrderSimplified, P2POrderSimplifyResponse, STATUS_MAP } from "../types/bybit-api-types";
import { convertTimestampToReadable, debugLog, getDebugMode } from "../utils/bybit-utils";
import { BybitApiClient } from "./bybit-api-client";
import axios from "axios";

export class BybitP2PApi extends BybitApiClient {
    constructor(
        apiKey: string,
        apiSecret: string,
        testnet: boolean = false
    ) {
        super(apiKey, apiSecret, testnet);
    }

    public async getP2POrders(
        page: number = 1,
        size: number = 30,
        filters?: P2POrderFilter
    ): Promise<ApiSuccessResponse<P2POrderSimplifyResponse>> {
        try {
            const params: Record<string, any> = {
                page,
                size
            };

            // Add optional filters if provided
            if (filters) {
                if (filters.status !== undefined && filters.status !== null) {
                    params.status = filters.status;
                }
                if (filters.beginTime) {
                    params.beginTime = filters.beginTime;
                }
                if (filters.endTime) {
                    params.endTime = filters.endTime;
                }
                if (filters.tokenId) {
                    params.tokenId = filters.tokenId;
                }
                if (filters.side && filters.side.length > 0) {
                    params.side = filters.side;
                }
            }
            
            debugLog(`Fetching P2P orders with params:`, params);
            
            // Use the correct P2P order list endpoint
            return await this.makeRequest<ApiSuccessResponse<P2POrderSimplifyResponse>>(
                "/p2p/v1/order/list", 
                params
            );
        } catch (error: any) {
            console.error("Error fetching P2P orders:", error);
            throw error;
        }
    }

    public async getUserInfo(): Promise<ApiSuccessResponse<any>> {
        try {
            const res  = await axios.post('https://api.bybit.com/v5/p2p/user/personal/info', {
                apiKey: this.apiKey,
                apiSecret: this.apiSecret
            })
            return res.data;
            } catch (error: any) {
            console.error("Error fetching user info:", error);
            throw error;
        }
    }
    public async getOrderDetails(orderId: string): Promise<ApiSuccessResponse<any>> {
        try {
            return await this.makeRequest<ApiSuccessResponse<any>>("/p2p/v1/order/detail", {
                orderId
            });
        } catch (error: any) {
            console.error(`Error fetching details for Order ID ${orderId}:`, error);
            throw error;
        }
    }

    public async fetchAllOrders(
        cutoffDate: string = "2025-01-01",
        filters?: P2POrderFilter
    ): Promise<Order[]> {
        let page = 1;
        const size = 30;
        let processed = 0;
        const ordersToExport: Order[] = [];

        try {
            const isConnected = await this.testConnection();
            if (!isConnected) {
                toast.error("Cannot connect to Bybit API. Check your API key and try again.");
                return [];
            }
            
            const p2pPermission = await this.testP2PPermissions();
            if (!p2pPermission.hasAccess) {
                toast.error(`P2P API Access Failed: ${p2pPermission.message}`);
                debugLog("P2P permission test failed", p2pPermission);
                return [];
            }

            toast.info(`Fetching P2P orders...`);
            let hasMoreOrders = true;
            
            while (hasMoreOrders) {
                try {
                    const response = await this.getP2POrders(page, size, filters);
                    const { result } = response;
                    
                    if (!result || !result.items || result.items.length === 0) {
                        debugLog("No items found or empty response", response);
                        break;
                    }
                    
                    debugLog(`Found ${result.items.length} items on page ${page}.`);
                    
                    for (let i = 0; i < result.items.length; i++) {
                        const item = result.items[i];
                        const statusCode = item.status ?? -1;
                        const createDateStr = convertTimestampToReadable(parseInt(item.createDate) || 0);
                        const createDateOnly = createDateStr.split(" ")[0];

                        if (createDateOnly <= cutoffDate) {
                            debugLog(`Stopped at order from: ${createDateOnly} (cutoff: ${cutoffDate})`);
                            return ordersToExport;
                        }
                        
                        const orderSide = item.side === 0 ? "BUY" : "SELL";
                        const orderStatus = STATUS_MAP[statusCode] || `Unknown status (${statusCode})`;
                        
                        ordersToExport.push({
                            orderNumber: processed + 1,
                            id: item.id,
                            side: orderSide,
                            status: orderStatus, // Changed from filter to status
                            tokenId: item.tokenId || "N/A",
                            price: item.price || "N/A",
                            notifyTokenQuantity: item.notifyTokenQuantity || "N/A",
                            targetNickName: item.targetNickName || "N/A",
                            createDate: createDateStr,
                            sellerRealName: item.sellerRealName || "N/A",
                            buyerRealName: item.buyerRealName || "N/A",
                            amount: item.amount || "N/A"
                        });
                        
                        processed++;
                    }
                    
                    hasMoreOrders = result.items.length === size;
                    page++;
                    
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error: any) {
                    console.error(`Error fetching orders on page ${page}:`, error);
                    
                    if (error.message?.includes("10006") || error.message?.includes("permission")) {
                        toast.error("API Error: Your API key doesn't have permission to access P2P trading data.");
                    } else if (error.message?.includes("rate limit")) {
                        toast.error("Rate limit exceeded. Pausing requests for a few seconds...");
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        continue;
                    } else {
                        toast.error(`Failed to fetch orders on page ${page}: ${error.message}`);
                    }
                    
                    break;
                }
            }
            
            if (ordersToExport.length === 0) {
                if (getDebugMode()) {
                    toast.warning("No P2P trades found. Make sure you've done P2P trades and your API key has the correct permissions.");
                } else {
                    toast.warning("No P2P trades found. Check your API permissions.");
                }
            } else {
                toast.success(`Successfully fetched ${ordersToExport.length} P2P trades`);
            }
            
            return ordersToExport;
        } catch (error: any) {
            console.error("Error in fetchAllOrders:", error);
            toast.error(`Failed to fetch orders: ${error.message}`);
            return ordersToExport;
        }
    }
}
