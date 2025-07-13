export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export const filterTransactionsByDateRange = (
  transactions: any[],
  startDate: Date,
  endDate: Date
) => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

export const filterTransactionsByPeriod = (transactions: any[], period: TimePeriod) => {
  const now = new Date();
  const daysMap = { 
    '7d': 7, '30d': 30, '90d': 90, '1y': 365,
    'daily': 1, 'weekly': 7, 'monthly': 30, 'yearly': 365 
  };
  const days = daysMap[period] || 30;
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return filterTransactionsByDateRange(transactions, startDate, now);
};

export const getPeriodLabel = (period: TimePeriod): string => {
  const labels = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days', 
    '90d': 'Last 90 days',
    '1y': 'Last year',
    'daily': 'Daily',
    'weekly': 'Weekly',
    'monthly': 'Monthly', 
    'yearly': 'Yearly'
  };
  return labels[period] || 'Unknown';
};

export const getDateRangeOptions = () => [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last year', days: 365 },
];