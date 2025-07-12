
import React, { Suspense, lazy, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransactionProvider, TransactionErrorBoundary } from '@/components/transactions/TransactionContext';
import { TransactionsHeader } from '@/components/transactions/TransactionsHeader';
import { TransactionsToolbar } from '@/components/transactions/TransactionsToolbar';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { TransactionsAnalytics } from '@/components/transactions/TransactionsAnalytics';
import { TransactionsFilters } from '@/components/transactions/TransactionsFilters';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useTransactions } from '@/hooks/useTransactions';
import { 
  DailyTransaction, 
  FXTransaction, 
  PaymentHistory,
  PaymentInstallment,
  PaymentScheduleType,
  TransactionStatus 
} from '@/types/transactions';
import { 
  paymentCalculations, 
  paymentScheduleUtils, 
  transactionStatusUtils 
} from '@/utils/paymentCalculations';
import { PaymentScheduleCard } from '@/components/transactions/PaymentScheduleCard';
import { PaymentHistoryTable } from '@/components/transactions/PaymentHistoryTable';

// Lazy load heavy components for better performance
const TransactionCalculatorForm = lazy(() => 
  import('@/components/transactions/TransactionCalculatorForm').then(module => ({ 
    default: module.TransactionCalculatorForm 
  }))
);
const EnhancedTransactionTable = lazy(() => 
  import('@/components/transactions/EnhancedTransactionTable').then(module => ({ 
    default: module.EnhancedTransactionTable 
  }))
);

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

const Transactions: React.FC = () => {
  const {
    transactions,
    analytics,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetchTransactions,
    exportTransactions
  } = useTransactions();

  // Payment-related state
  const [selectedTransaction, setSelectedTransaction] = React.useState<DailyTransaction | FXTransaction | null>(null);
  const [showPaymentSchedule, setShowPaymentSchedule] = React.useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = React.useState(false);
  const [selectedTransactions, setSelectedTransactions] = React.useState<string[]>([]);

  // Memoized calculations
  const paymentAnalytics = useMemo(() => {
    const totalOutstanding = transactions.reduce((sum, transaction) => {
      return sum + (transaction.remainingBalance || 0);
    }, 0);

    const overdueTransactions = transactions.filter(transaction => 
      paymentCalculations.isPaymentOverdue(transaction)
    );

    const totalOverdue = overdueTransactions.reduce((sum, transaction) => {
      return sum + (transaction.remainingBalance || 0);
    }, 0);

    const averageDaysOverdue = overdueTransactions.length > 0 
      ? overdueTransactions.reduce((sum, transaction) => {
          return sum + (paymentCalculations.calculateDaysOverdue(transaction));
        }, 0) / overdueTransactions.length
      : 0;

    const totalPaid = transactions.reduce((sum, transaction) => {
      return sum + (transaction.paidAmount || 0);
    }, 0);

    const totalOriginal = transactions.reduce((sum, transaction) => {
      return sum + (transaction.originalAmount || transaction.amount);
    }, 0);

    const collectionRate = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;

    return {
      totalOutstanding,
      totalOverdue,
      averageDaysOverdue,
      collectionRate,
      overdueCount: overdueTransactions.length
    };
  }, [transactions]);

  // Calculate totals for header
  const totalVolume = useMemo(() => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const totalProfit = useMemo(() => {
    return transactions.reduce((sum, transaction) => {
      return sum + ('profit' in transaction ? transaction.profit : 0);
    }, 0);
  }, [transactions]);

  // Handle payment received
  const handlePaymentReceived = (payment: PaymentHistory) => {
    if (!selectedTransaction) return;

    // Update transaction with new payment
    const updatedTransaction = { ...selectedTransaction };
    
    // Add payment to history
    if (!updatedTransaction.paymentHistory) {
      updatedTransaction.paymentHistory = [];
    }
    updatedTransaction.paymentHistory.push(payment);

    // Update payment schedule if exists
    if (updatedTransaction.paymentSchedule) {
      updatedTransaction.paymentSchedule = paymentScheduleUtils.processPayment(
        updatedTransaction.paymentSchedule,
        payment
      );
    }

    // Update transaction amounts
    updatedTransaction.paidAmount = (updatedTransaction.paidAmount || 0) + payment.amount;
    updatedTransaction.remainingBalance = paymentCalculations.calculateRemainingBalance(updatedTransaction);
    updatedTransaction.isFullyPaid = updatedTransaction.remainingBalance <= 0;
    updatedTransaction.lastPaymentDate = payment.paymentDate;
    updatedTransaction.nextPaymentDue = paymentCalculations.calculateNextPaymentDue(updatedTransaction);
    updatedTransaction.daysOverdue = paymentCalculations.calculateDaysOverdue(updatedTransaction);
    updatedTransaction.lateFeesAccrued = paymentCalculations.calculateLateFees(updatedTransaction);

    // Update status
    updatedTransaction.status = transactionStatusUtils.updateTransactionStatus(updatedTransaction);

    // Update in the system
    updateTransaction(updatedTransaction.id, updatedTransaction);
    
    // Refresh transactions to update analytics
    refetchTransactions?.();
  };

  // Handle installment added
  const handleInstallmentAdded = (installment: Omit<PaymentInstallment, 'id' | 'transactionId'>) => {
    if (!selectedTransaction || !selectedTransaction.paymentSchedule) return;

    const updatedTransaction = { ...selectedTransaction };
    
    // Add installment to schedule
    updatedTransaction.paymentSchedule = paymentScheduleUtils.addInstallment(
      updatedTransaction.paymentSchedule,
      installment
    );

    // Update transaction amounts
    updatedTransaction.originalAmount = updatedTransaction.paymentSchedule.totalAmount;
    updatedTransaction.remainingBalance = paymentCalculations.calculateRemainingBalance(updatedTransaction);
    updatedTransaction.isFullyPaid = updatedTransaction.remainingBalance <= 0;

    // Update in the system
    updateTransaction(updatedTransaction.id, updatedTransaction);
    
    // Refresh transactions
    refetchTransactions?.();
  };

  // Handle transaction selection for payment management
  const handleTransactionSelect = (transaction: DailyTransaction | FXTransaction) => {
    setSelectedTransaction(transaction);
    setShowPaymentSchedule(true);
  };

  // Handle payment schedule creation
  const handleCreatePaymentSchedule = (
    transaction: DailyTransaction | FXTransaction,
    scheduleType: PaymentScheduleType,
    options: {
      originalAmount: number;
      frequency?: string;
      numberOfInstallments?: number;
      gracePeriod?: number;
      lateFeeRate?: number;
      autoCharge?: boolean;
    }
  ) => {
    const paymentSchedule = paymentScheduleUtils.createPaymentSchedule(
      transaction.id,
      options.originalAmount,
      scheduleType,
      {
        frequency: options.frequency,
        numberOfInstallments: options.numberOfInstallments,
        startDate: new Date(),
        gracePeriod: options.gracePeriod,
        lateFeeRate: options.lateFeeRate,
        autoCharge: options.autoCharge
      }
    );

    const updatedTransaction = { ...transaction };
    updatedTransaction.paymentSchedule = paymentSchedule;
    updatedTransaction.originalAmount = options.originalAmount;
    updatedTransaction.paidAmount = 0;
    updatedTransaction.remainingBalance = options.originalAmount;
    updatedTransaction.isFullyPaid = false;
    updatedTransaction.status = TransactionStatus.PENDING;

    updateTransaction(updatedTransaction.id, updatedTransaction);
    refetchTransactions?.();
  };

  // Handle retry with proper event handling
  const handleRetry = () => {
    refetchTransactions?.();
  };

  // Handle export
  const handleExport = (format: 'csv' | 'json') => {
    exportTransactions(format);
  };

  // Handle bulk operations
  const handleBulkDelete = () => {
    selectedTransactions.forEach(async (id) => {
      await deleteTransaction(id);
    });
    setSelectedTransactions([]);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Transactions</h2>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button 
            onClick={handleRetry}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TransactionProvider>
          <TransactionErrorBoundary>
            <div className="container mx-auto p-6 space-y-6">
              {/* Header */}
              <TransactionsHeader 
                totalTransactions={transactions.length}
                totalVolume={totalVolume}
                totalProfit={totalProfit}
              />

              {/* Analytics */}
              <TransactionsAnalytics 
                analytics={analytics}
              />

              {/* Toolbar */}
              <TransactionsToolbar 
                totalSelected={selectedTransactions.length}
                onExport={handleExport}
                onCreateNew={() => {/* Handle create new */}}
                onBulkDelete={handleBulkDelete}
              />

              {/* Filters */}
              <TransactionsFilters 
                filters={filters}
                onFiltersChange={updateFilters}
                onClearFilters={clearFilters}
              />

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transactions Table */}
                <div className="lg:col-span-2">
                  <TransactionsTable 
                    transactions={transactions}
                    isLoading={isLoading}
                    onUpdateTransaction={updateTransaction}
                    onDeleteTransaction={deleteTransaction}
                  />
                </div>

                {/* Payment Management Sidebar */}
                <div className="space-y-6">
                  {/* Payment Schedule Card */}
                  {selectedTransaction && showPaymentSchedule && (
                    <PaymentScheduleCard
                      transaction={selectedTransaction}
                      onPaymentReceived={handlePaymentReceived}
                      onInstallmentAdded={handleInstallmentAdded}
                    />
                  )}

                  {/* Payment History */}
                  {selectedTransaction && showPaymentHistory && selectedTransaction.paymentHistory && (
                    <PaymentHistoryTable
                      payments={selectedTransaction.paymentHistory}
                      installments={selectedTransaction.paymentSchedule?.installments || []}
                    />
                  )}

                  {/* Quick Actions */}
                  {selectedTransaction && (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowPaymentSchedule(!showPaymentSchedule)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        {showPaymentSchedule ? 'Hide' : 'Show'} Payment Schedule
                      </button>
                      
                      {selectedTransaction.paymentHistory && selectedTransaction.paymentHistory.length > 0 && (
                        <button
                          onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          {showPaymentHistory ? 'Hide' : 'Show'} Payment History
                        </button>
                      )}
                    </div>
                  )}

                  {/* Lazy Loaded Components */}
                  <Suspense fallback={<LoadingSpinner />}>
                    <TransactionCalculatorForm 
                      onTransactionSaved={(transaction) => {
                        createTransaction(transaction);
                      }}
                    />
                  </Suspense>
                </div>
              </div>

              {/* Enhanced Transaction Table (Lazy Loaded) */}
              <Suspense fallback={<LoadingSpinner />}>
                <EnhancedTransactionTable 
                  transactions={transactions.filter(t => 'nairaUsdtRate' in t) as DailyTransaction[]}
                />
              </Suspense>
            </div>
          </TransactionErrorBoundary>
        </TransactionProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default Transactions;
