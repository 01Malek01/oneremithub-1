
import { DailyTransaction } from '@/types/transactions';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export function filterTransactionsByPeriod(transactions: DailyTransaction[], period: TimePeriod): DailyTransaction[] {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate: Date;
  
  switch (period) {
    case 'daily':
      startDate = startOfDay;
      break;
    case 'weekly':
      const dayOfWeek = now.getDay();
      startDate = new Date(startOfDay);
      startDate.setDate(startDate.getDate() - dayOfWeek);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = startOfDay;
  }
  
  return transactions.filter(tx => {
    const txDate = new Date(tx.transactionDate);
    return txDate >= startDate;
  });
}

export function getPeriodLabel(period: TimePeriod): string {
  switch (period) {
    case 'daily': return 'Today';
    case 'weekly': return 'This Week';
    case 'monthly': return 'This Month';
    case 'yearly': return 'This Year';
    default: return 'Today';
  }
}
