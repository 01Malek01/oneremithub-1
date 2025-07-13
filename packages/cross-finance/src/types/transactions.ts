export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'incoming' | 'outgoing';
  description: string;
}

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