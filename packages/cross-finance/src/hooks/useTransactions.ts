
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyTransaction, FXTransaction, TransactionFilters, TransactionAnalytics, TransactionApiResponse, TransactionsApiResponse } from '@/types/transactions';

// API endpoints
const API_ENDPOINTS = {
  transactions: '/api/transactions',
  analytics: '/api/transactions/analytics',
  transaction: (id: string) => `/api/transactions/${id}`,
} as const;

// Query keys for React Query
const QUERY_KEYS = {
  transactions: 'transactions',
  transaction: (id: string) => ['transaction', id],
  analytics: 'transaction-analytics',
} as const;

// Local storage keys
const STORAGE_KEYS = {
  transactions: 'daily-transactions',
  filters: 'transaction-filters',
  preferences: 'transaction-preferences',
} as const;

// Cache configuration
const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
  retry: 1, // Reduce retries for faster fallback
  retryDelay: 1000,
} as const;

// API client with improved error handling
class TransactionApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response - API may be unavailable');
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getTransactions(filters?: TransactionFilters): Promise<TransactionsApiResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    return this.request<TransactionsApiResponse>(`${API_ENDPOINTS.transactions}?${params}`);
  }

  async getTransaction(id: string): Promise<TransactionApiResponse> {
    return this.request<TransactionApiResponse>(API_ENDPOINTS.transaction(id));
  }

  async createTransaction(transaction: Partial<DailyTransaction>): Promise<TransactionApiResponse> {
    return this.request<TransactionApiResponse>(API_ENDPOINTS.transactions, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id: string, updates: Partial<DailyTransaction>): Promise<TransactionApiResponse> {
    return this.request<TransactionApiResponse>(API_ENDPOINTS.transaction(id), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTransaction(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(API_ENDPOINTS.transaction(id), {
      method: 'DELETE',
    });
  }

  async getAnalytics(filters?: TransactionFilters): Promise<{ data: TransactionAnalytics }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, JSON.stringify(value));
        }
      });
    }

    return this.request<{ data: TransactionAnalytics }>(`${API_ENDPOINTS.analytics}?${params}`);
  }
}

// Create API client instance
const apiClient = new TransactionApiClient();

// Local storage utilities
const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

// Default analytics for fallback
const createDefaultAnalytics = (transactions: DailyTransaction[]): TransactionAnalytics => ({
  totalTransactions: transactions.length,
  totalVolume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
  totalProfit: transactions.reduce((sum, tx) => sum + tx.profit, 0),
  averageProfit: transactions.length > 0 ? transactions.reduce((sum, tx) => sum + tx.profit, 0) / transactions.length : 0,
  profitMargin: 0,
  currencyBreakdown: {},
  statusBreakdown: {},
  dailyTrends: [],
  paymentAnalytics: {
    totalOutstanding: transactions.reduce((sum, tx) => sum + tx.remainingBalance, 0),
    totalOverdue: 0,
    averageDaysOverdue: 0,
    collectionRate: 0,
    paymentScheduleBreakdown: {},
    overdueBreakdown: []
  }
});

// Custom hook for transaction management
export function useTransactions() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TransactionFilters>(() => 
    storage.get(STORAGE_KEYS.filters, {})
  );
  const [preferences, setPreferences] = useState(() => 
    storage.get(STORAGE_KEYS.preferences, {
      pageSize: 20,
      sortBy: 'transactionDate',
      sortOrder: 'desc' as 'asc' | 'desc',
    })
  );

  // Save filters to localStorage when they change
  useEffect(() => {
    storage.set(STORAGE_KEYS.filters, filters);
  }, [filters]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    storage.set(STORAGE_KEYS.preferences, preferences);
  }, [preferences]);

  // Query for transactions with fallback to localStorage
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: [QUERY_KEYS.transactions, filters],
    queryFn: () => apiClient.getTransactions(filters),
    ...CACHE_CONFIG,
    // Fallback to localStorage if API is not available
    placeholderData: () => {
      const localData = storage.get<DailyTransaction[]>(STORAGE_KEYS.transactions, []);
      return {
        success: true,
        data: {
          transactions: localData,
          pagination: {
            page: 1,
            limit: localData.length,
            total: localData.length,
            totalPages: 1,
          },
          filters,
        },
      };
    },
  });

  // Query for analytics with fallback
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
  } = useQuery({
    queryKey: [QUERY_KEYS.analytics, filters],
    queryFn: () => apiClient.getAnalytics(filters),
    ...CACHE_CONFIG,
    placeholderData: () => {
      const localData = storage.get<DailyTransaction[]>(STORAGE_KEYS.transactions, []);
      return {
        success: true,
        data: createDefaultAnalytics(localData)
      };
    },
  });

  // Mutations with localStorage fallback
  const createTransactionMutation = useMutation({
    mutationFn: (transaction: Partial<DailyTransaction>) => 
      apiClient.createTransaction(transaction),
    onSuccess: (data) => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
      
      // Update local storage as fallback
      const currentTransactions = storage.get<DailyTransaction[]>(STORAGE_KEYS.transactions, []);
      const newTransaction = data.data as DailyTransaction;
      storage.set(STORAGE_KEYS.transactions, [newTransaction, ...currentTransactions]);
    },
    onError: (error) => {
      console.error('Failed to create transaction:', error);
      // For offline mode, still save to localStorage
      const currentTransactions = storage.get<DailyTransaction[]>(STORAGE_KEYS.transactions, []);
      // We don't have the transaction data here, so we'll handle it in the component
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DailyTransaction> }) =>
      apiClient.updateTransaction(id, updates),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
      
      // Update local storage
      const currentTransactions = storage.get<DailyTransaction[]>(STORAGE_KEYS.transactions, []);
      const updatedTransaction = data.data as DailyTransaction;
      const updatedTransactions = currentTransactions.map(tx =>
        tx.id === updatedTransaction.id ? updatedTransaction : tx
      );
      storage.set(STORAGE_KEYS.transactions, updatedTransactions);
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteTransaction(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
      
      // Update local storage
      const currentTransactions = storage.get<DailyTransaction[]>(STORAGE_KEYS.transactions, []);
      const filteredTransactions = currentTransactions.filter(tx => tx.id !== id);
      storage.set(STORAGE_KEYS.transactions, filteredTransactions);
    },
  });

  // Computed values with safe fallbacks
  const transactions = useMemo(() => 
    transactionsData?.data?.transactions || [], 
    [transactionsData]
  );

  const analytics = useMemo(() => 
    analyticsData?.data || createDefaultAnalytics(transactions), 
    [analyticsData, transactions]
  );

  const pagination = useMemo(() => 
    transactionsData?.data?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    }, 
    [transactionsData]
  );

  // Action handlers
  const createTransaction = useCallback(async (transaction: Partial<DailyTransaction>) => {
    try {
      return await createTransactionMutation.mutateAsync(transaction);
    } catch (error) {
      // Fallback: save to localStorage for offline mode
      const newTransaction: DailyTransaction = {
        id: Date.now().toString(),
        currency: transaction.currency || 'USD',
        amount: transaction.amount || 0,
        status: transaction.status || 'pending',
        type: transaction.type || 'buy',
        nairaUsdtRate: transaction.nairaUsdtRate || 0,
        amountProcessed: transaction.amountProcessed || 0,
        usdcSpent: transaction.usdcSpent || 0,
        amountReceived: transaction.amountReceived || 0,
        profit: transaction.profit || 0,
        transactionDate: transaction.transactionDate || new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        originalAmount: transaction.originalAmount || 0,
        paidAmount: transaction.paidAmount || 0,
        remainingBalance: transaction.remainingBalance || 0,
        isFullyPaid: transaction.isFullyPaid || false,
        ...transaction
      } as DailyTransaction;

      const currentTransactions = storage.get<DailyTransaction[]>(STORAGE_KEYS.transactions, []);
      storage.set(STORAGE_KEYS.transactions, [newTransaction, ...currentTransactions]);
      
      // Force refresh queries to update UI
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
      
      return { success: true, data: newTransaction };
    }
  }, [createTransactionMutation, queryClient]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<DailyTransaction>) => {
    try {
      return await updateTransactionMutation.mutateAsync({ id, updates });
    } catch (error) {
      // Fallback: update localStorage
      const currentTransactions = storage.get<DailyTransaction[]>(STORAGE_KEYS.transactions, []);
      const updatedTransactions = currentTransactions.map(tx =>
        tx.id === id ? { ...tx, ...updates, updatedAt: new Date() } : tx
      );
      storage.set(STORAGE_KEYS.transactions, updatedTransactions);
      
      // Force refresh queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
      
      return { success: true, data: updatedTransactions.find(tx => tx.id === id) };
    }
  }, [updateTransactionMutation, queryClient]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      return await deleteTransactionMutation.mutateAsync(id);
    } catch (error) {
      // Fallback: remove from localStorage
      const currentTransactions = storage.get<DailyTransaction[]>(STORAGE_KEYS.transactions, []);
      const filteredTransactions = currentTransactions.filter(tx => tx.id !== id);
      storage.set(STORAGE_KEYS.transactions, filteredTransactions);
      
      // Force refresh queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
      
      return { success: true };
    }
  }, [deleteTransactionMutation, queryClient]);

  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<typeof preferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  // Export data
  const exportTransactions = useCallback(async (format: 'csv' | 'json' = 'csv') => {
    const data = transactions;
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export logic would go here
      console.log('CSV export not implemented yet');
    }
  }, [transactions]);

  return {
    // Data
    transactions,
    analytics,
    pagination,
    
    // Loading states
    isLoadingTransactions,
    isLoadingAnalytics,
    isLoading: isLoadingTransactions || isLoadingAnalytics,
    
    // Error states
    transactionsError,
    analyticsError,
    error: transactionsError || analyticsError,
    
    // Filters and preferences
    filters,
    preferences,
    updateFilters,
    clearFilters,
    updatePreferences,
    
    // Actions
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetchTransactions,
    exportTransactions,
    
    // Mutation states
    isCreating: createTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
  };
}
