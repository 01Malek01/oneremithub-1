
export interface DailyTransaction {
  date: string;
  amount: number;
  count: number;
  volume: number;
}

export interface TransactionMetrics {
  totalVolume: number;
  transactionCount: number;
  averageAmount: number;
  successRate: number;
}

export interface Transaction {
     id : string,
     date : string,
     currency_payout : string,
     usdc_quantity : number,
     usdc_rate_naira : number,
     selling_rate_naira : number,
     selling_price_naira : number,
     transaction_status : string,
     note : string,
     cost_price_naira : number,
     pnl_naira : number,
     margin_percentage : number,
     counterparty_id : string,
     
}

export interface Counterparty {
    id : string,
    name : string,
   created_at : string,
}
    
