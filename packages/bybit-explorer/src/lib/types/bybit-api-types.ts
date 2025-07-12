
// Filter mapping from code to readable string
export const STATUS_MAP: Record<string, string> = {
  "10": "Waiting for buyer to pay",
  "20": "Waiting for seller to release",
  "30": "Appealing",
  "40": "Order canceled",
  "50": "Order finished"
};

// Order type definition
export interface Order {
  orderNumber: number;
  id: string;
  side: string;
  status: string; // Changed from 'filter' to 'status' for consistency
  tokenId: string;
  price: string;
  notifyTokenQuantity: string;
  targetNickName: string;
  createDate: string;
  sellerRealName: string;
  buyerRealName: string;
  amount: string;
}

export interface P2POrderSimplifyRequest {
  page: number;
  size: number;
  status?: number;
  beginTime?: string | number;
  endTime?: string | number;
  tokenId?: string;
  side?: number[];
}

export interface P2POrderSimplified {
  id: string;
  side: number;
  tokenId: string;
  orderType: string;
  amount: string;
  currencyId: string;
  price: string;
  notifyTokenQuantity?: string;
  notifyTokenId?: string;
  fee: string;
  targetNickName: string; 
  targetUserId: string;
  status: number;
  createDate: string;
  transferLastSeconds: string;
  userId: string;
  sellerRealName: string;
  buyerRealName: string;
  extension?: {
    isDelayWithdraw: boolean;
    delayTime: string;
    startTime: string;
  };
  // Instead of having getter methods, we'll define these as optional properties
  orderId?: string;
  quantity?: string;
  counterpartyNickname?: string;
}

// Extend the interface to add the aliases as optional properties
export interface P2POrderWithAliases extends P2POrderSimplified {
  orderId: string;
  quantity: string;
  counterpartyNickname: string;
}

export interface P2POrderSimplifyResponse {
  count: number;
  items: P2POrderSimplified[];
}

// New interface to match the actual API response structure
export interface P2POrderResponse {
  resultTotalSize: number;
  currentPage: number;
  data: Array<{
    orderId: string;
    userId: string;
    advertId: string;
    side: number;
    tokenId: string;
    price: string;
    quantity: string;
    amount: string;
    status: number;
    createDate: string;
    targetNickName?: string;
    sellerRealName?: string;
    buyerRealName?: string;
  }>;
}

export interface BybitCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface ApiErrorResponse {
  retCode: number;
  retMsg: string;
}

export interface ApiSuccessResponse<T> {
  retCode: number;
  retMsg: string;
  result: T;
  retExtInfo?: any;
  time: number;
}

// Filter types for UI - Added missing status property
export interface P2POrderFilter {
  status?: number | null; // Added this missing property
  beginTime?: string | number | null;
  endTime?: string | number | null;
  tokenId?: string | null;
  side?: number[] | null;
}
