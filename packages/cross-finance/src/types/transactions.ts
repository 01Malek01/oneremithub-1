// Currency types with Naira as primary customer payment currency
export type Currency = 'NGN' | 'USD' | 'GBP' | 'CAD' | 'EUR';

// Customer payment currency (always Naira)
export type CustomerPaymentCurrency = 'NGN';

// Transaction status enum
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PROCESSING = 'processing',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  SCHEDULED = 'scheduled'
}

// Transaction type enum
export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
  TRANSFER = 'transfer',
  EXCHANGE = 'exchange',
  INSTALLMENT = 'installment',
  PARTIAL_PAYMENT = 'partial_payment'
}

// Payment schedule types
export enum PaymentScheduleType {
  LUMP_SUM = 'lump_sum',
  INSTALLMENTS = 'installments',
  FLEXIBLE = 'flexible',
  RECURRING = 'recurring'
}

// Payment frequency
export enum PaymentFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

// Base transaction interface
export interface BaseTransaction {
  id: string;
  currency: Currency;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Payment installment interface
export interface PaymentInstallment {
  id: string;
  transactionId: string;
  installmentNumber: number;
  dueDate: Date;
  amount: number; // Amount in Naira
  paidAmount: number; // Amount paid in Naira
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  lateFees?: number; // Late fees in Naira
  notes?: string;
}

// Payment schedule interface
export interface PaymentSchedule {
  id: string;
  transactionId: string;
  type: PaymentScheduleType;
  frequency?: PaymentFrequency;
  totalAmount: number; // Total amount in Naira
  paidAmount: number; // Amount paid in Naira
  remainingAmount: number; // Remaining amount in Naira
  startDate: Date;
  endDate?: Date;
  installments: PaymentInstallment[];
  gracePeriod?: number; // days
  lateFeeRate?: number; // percentage
  autoCharge?: boolean;
  nextPaymentDate?: Date;
}

// Payment history interface
export interface PaymentHistory {
  id: string;
  transactionId: string;
  installmentId?: string;
  amount: number; // Payment amount in Naira
  paymentDate: Date;
  paymentMethod: string;
  reference: string;
  notes?: string;
  processedBy?: string;
  exchangeRate?: number; // Exchange rate at time of payment (if applicable)
}

// Daily transaction interface (enhanced with payment support)
export interface DailyTransaction extends BaseTransaction {
  nairaUsdtRate: number;
  amountProcessed: number;
  usdcSpent: number;
  amountReceived: number; // calculated: nairaUsdtRate * amountProcessed
  profit: number; // calculated: amountReceived - usdcSpent
  clientName?: string;
  reference?: string;
  notes?: string;
  tags?: string[];
  attachments?: string[];
  
  // Payment structure fields (all amounts in Naira)
  paymentSchedule?: PaymentSchedule;
  paymentHistory?: PaymentHistory[];
  originalAmount: number; // Total amount agreed upon in Naira
  paidAmount: number; // Total amount paid so far in Naira
  remainingBalance: number; // Original amount - paid amount in Naira
  isFullyPaid: boolean;
  lastPaymentDate?: Date;
  nextPaymentDue?: Date;
  daysOverdue?: number;
  lateFeesAccrued?: number; // Late fees in Naira
}

// FX transaction interface (enhanced)
export interface FXTransaction extends BaseTransaction {
  customerAmount: number;
  rateSold: number;
  rateBought: number;
  usdtEquivalent: number;
  totalNgnReceived: number; // Total Naira received
  totalNgnCost: number; // Total Naira cost
  profit: number;
  clientName?: string;
  exchangeRate?: number;
  fees?: number;
  commission?: number;
  
  // Payment structure fields (all amounts in Naira)
  paymentSchedule?: PaymentSchedule;
  paymentHistory?: PaymentHistory[];
  originalAmount: number; // Total amount in Naira
  paidAmount: number; // Total amount paid in Naira
  remainingBalance: number; // Remaining amount in Naira
  isFullyPaid: boolean;
  lastPaymentDate?: Date;
  nextPaymentDue?: Date;
  daysOverdue?: number;
  lateFeesAccrued?: number; // Late fees in Naira
}

// Form data interfaces
export interface DailyTransactionFormData {
  currency: Currency;
  nairaUsdtRate: string;
  amountProcessed: string;
  usdcSpent: string;
  transactionDate: Date;
  clientName?: string;
  reference?: string;
  notes?: string;
  tags?: string[];
  
  // Payment structure (amounts in Naira)
  paymentScheduleType: PaymentScheduleType;
  originalAmount: string; // Amount in Naira
  paymentFrequency?: PaymentFrequency;
  numberOfInstallments?: number;
  gracePeriod?: number;
  lateFeeRate?: number;
  autoCharge?: boolean;
}

export interface TransactionFormData {
  currency: Currency;
  customerAmount: string;
  rateSold: string;
  rateBought: string;
  clientName: string;
  transactionDate: Date;
  exchangeRate?: string;
  fees?: string;
  commission?: string;
  
  // Payment structure (amounts in Naira)
  paymentScheduleType: PaymentScheduleType;
  originalAmount: string; // Amount in Naira
  paymentFrequency?: PaymentFrequency;
  numberOfInstallments?: number;
  gracePeriod?: number;
  lateFeeRate?: number;
  autoCharge?: boolean;
}

// Payment form data (amounts in Naira)
export interface PaymentFormData {
  transactionId: string;
  installmentId?: string;
  amount: number; // Amount in Naira
  paymentDate: Date;
  paymentMethod: string;
  reference: string;
  notes?: string;
  exchangeRate?: number; // Exchange rate if payment is in different currency
}

// Installment form data (amounts in Naira)
export interface InstallmentFormData {
  transactionId: string;
  installmentNumber: number;
  dueDate: Date;
  amount: number; // Amount in Naira
  notes?: string;
}

// API response interfaces
export interface TransactionApiResponse {
  success: boolean;
  data: DailyTransaction | FXTransaction;
  message?: string;
  errors?: string[];
}

export interface TransactionsApiResponse {
  success: boolean;
  data: {
    transactions: (DailyTransaction | FXTransaction)[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      currency?: Currency;
      status?: TransactionStatus;
      type?: TransactionType;
      dateRange?: {
        start: Date;
        end: Date;
      };
    };
  };
  message?: string;
  errors?: string[];
}

// Payment API responses
export interface PaymentApiResponse {
  success: boolean;
  data: PaymentHistory;
  message?: string;
  errors?: string[];
}

export interface PaymentScheduleApiResponse {
  success: boolean;
  data: PaymentSchedule;
  message?: string;
  errors?: string[];
}

// Filter interfaces
export interface TransactionFilters {
  currency?: Currency;
  status?: TransactionStatus;
  type?: TransactionType;
  dateRange?: {
    start: Date;
    end: Date;
  };
  clientName?: string;
  minAmount?: number;
  maxAmount?: number;
  tags?: string[];
  search?: string;
  
  // Payment-specific filters
  paymentStatus?: 'fully_paid' | 'partially_paid' | 'overdue' | 'pending';
  paymentScheduleType?: PaymentScheduleType;
  overdueOnly?: boolean;
  dueDateRange?: {
    start: Date;
    end: Date;
  };
}

// Analytics interfaces
export interface TransactionAnalytics {
  totalTransactions: number;
  totalVolume: number;
  totalProfit: number;
  averageProfit: number;
  profitMargin: number;
  currencyBreakdown: Record<Currency, {
    count: number;
    volume: number;
    profit: number;
  }>;
  statusBreakdown: Record<TransactionStatus, number>;
  dailyTrends: Array<{
    date: string;
    transactions: number;
    volume: number;
    profit: number;
  }>;
  
  // Payment analytics (all amounts in Naira)
  paymentAnalytics: {
    totalOutstanding: number; // Total outstanding in Naira
    totalOverdue: number; // Total overdue in Naira
    averageDaysOverdue: number;
    collectionRate: number;
    paymentScheduleBreakdown: Record<PaymentScheduleType, {
      count: number;
      totalAmount: number; // Amount in Naira
      collectedAmount: number; // Amount in Naira
    }>;
    overdueBreakdown: Array<{
      daysOverdue: number;
      count: number;
      amount: number; // Amount in Naira
    }>;
  };
}

// Cache interfaces
export interface TransactionCache {
  transactions: Map<string, DailyTransaction | FXTransaction>;
  analytics: TransactionAnalytics | null;
  lastUpdated: Date;
  isStale: boolean;
}

// Error types
export interface TransactionError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// Validation schemas (for runtime validation)
export interface TransactionValidationSchema {
  currency: (value: any) => value is Currency;
  amount: (value: any) => value is number;
  date: (value: any) => value is Date;
  status: (value: any) => value is TransactionStatus;
  type: (value: any) => value is TransactionType;
}

// Payment calculation utilities (all amounts in Naira)
export interface PaymentCalculations {
  calculateRemainingBalance: (transaction: DailyTransaction | FXTransaction) => number; // Returns amount in Naira
  calculateLateFees: (transaction: DailyTransaction | FXTransaction) => number; // Returns amount in Naira
  calculateNextPaymentDue: (transaction: DailyTransaction | FXTransaction) => Date | null;
  calculateDaysOverdue: (transaction: DailyTransaction | FXTransaction) => number;
  isPaymentOverdue: (transaction: DailyTransaction | FXTransaction) => boolean;
  getPaymentProgress: (transaction: DailyTransaction | FXTransaction) => {
    percentage: number;
    paidAmount: number; // Amount in Naira
    remainingAmount: number; // Amount in Naira
    totalAmount: number; // Amount in Naira
  };
}
