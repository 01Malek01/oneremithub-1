import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { DailyTransaction, FXTransaction, TransactionFilters, TransactionAnalytics } from '@/types/transactions';

// Action types for the reducer
type TransactionAction =
  | { type: 'SET_TRANSACTIONS'; payload: (DailyTransaction | FXTransaction)[] }
  | { type: 'ADD_TRANSACTION'; payload: DailyTransaction | FXTransaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<DailyTransaction | FXTransaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_FILTERS'; payload: TransactionFilters }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_ANALYTICS'; payload: TransactionAnalytics }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_TRANSACTION'; payload: DailyTransaction | FXTransaction | null }
  | { type: 'SET_BULK_SELECTION'; payload: string[] }
  | { type: 'CLEAR_SELECTION' };

// State interface
interface TransactionState {
  transactions: (DailyTransaction | FXTransaction)[];
  analytics: TransactionAnalytics | null;
  filters: TransactionFilters;
  selectedTransaction: DailyTransaction | FXTransaction | null;
  selectedIds: string[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Initial state
const initialState: TransactionState = {
  transactions: [],
  analytics: null,
  filters: {},
  selectedTransaction: null,
  selectedIds: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Reducer function
function transactionReducer(state: TransactionState, action: TransactionAction): TransactionState {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
        lastUpdated: new Date(),
        error: null,
      };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        lastUpdated: new Date(),
        error: null,
      };

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === action.payload.id
            ? { ...tx, ...action.payload.updates, updatedAt: new Date() }
            : tx
        ),
        selectedTransaction: state.selectedTransaction?.id === action.payload.id
          ? { ...state.selectedTransaction, ...action.payload.updates, updatedAt: new Date() }
          : state.selectedTransaction,
        lastUpdated: new Date(),
        error: null,
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(tx => tx.id !== action.payload),
        selectedTransaction: state.selectedTransaction?.id === action.payload
          ? null
          : state.selectedTransaction,
        selectedIds: state.selectedIds.filter(id => id !== action.payload),
        lastUpdated: new Date(),
        error: null,
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {},
      };

    case 'SET_ANALYTICS':
      return {
        ...state,
        analytics: action.payload,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_SELECTED_TRANSACTION':
      return {
        ...state,
        selectedTransaction: action.payload,
      };

    case 'SET_BULK_SELECTION':
      return {
        ...state,
        selectedIds: action.payload,
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedTransaction: null,
        selectedIds: [],
      };

    default:
      return state;
  }
}

// Context interface
interface TransactionContextType {
  state: TransactionState;
  dispatch: React.Dispatch<TransactionAction>;
  
  // Computed values
  filteredTransactions: (DailyTransaction | FXTransaction)[];
  selectedTransactions: (DailyTransaction | FXTransaction)[];
  totalVolume: number;
  totalProfit: number;
  currencyBreakdown: Record<string, { count: number; volume: number; profit: number }>;
  
  // Actions
  addTransaction: (transaction: DailyTransaction | FXTransaction) => void;
  updateTransaction: (id: string, updates: Partial<DailyTransaction | FXTransaction>) => void;
  deleteTransaction: (id: string) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
  selectTransaction: (transaction: DailyTransaction | FXTransaction | null) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  bulkDelete: () => void;
  exportSelected: (format: 'csv' | 'json') => void;
}

// Create context
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Provider component
interface TransactionProviderProps {
  children: React.ReactNode;
  initialTransactions?: (DailyTransaction | FXTransaction)[];
  initialAnalytics?: TransactionAnalytics;
}

export function TransactionProvider({ 
  children, 
  initialTransactions = [], 
  initialAnalytics = null 
}: TransactionProviderProps) {
  const [state, dispatch] = useReducer(transactionReducer, {
    ...initialState,
    transactions: initialTransactions,
    analytics: initialAnalytics,
  });

  // Computed values
  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions;

    // Apply currency filter
    if (state.filters.currency) {
      filtered = filtered.filter(tx => tx.currency === state.filters.currency);
    }

    // Apply status filter
    if (state.filters.status) {
      filtered = filtered.filter(tx => tx.status === state.filters.status);
    }

    // Apply type filter
    if (state.filters.type) {
      filtered = filtered.filter(tx => tx.type === state.filters.type);
    }

    // Apply date range filter
    if (state.filters.dateRange) {
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.transactionDate);
        return txDate >= state.filters.dateRange!.start && txDate <= state.filters.dateRange!.end;
      });
    }

    // Apply amount range filter
    if (state.filters.minAmount !== undefined) {
      filtered = filtered.filter(tx => tx.amount >= state.filters.minAmount!);
    }
    if (state.filters.maxAmount !== undefined) {
      filtered = filtered.filter(tx => tx.amount <= state.filters.maxAmount!);
    }

    // Apply search filter
    if (state.filters.search) {
      const searchLower = state.filters.search.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(searchLower) ||
        (tx as DailyTransaction).clientName?.toLowerCase().includes(searchLower) ||
        (tx as DailyTransaction).reference?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [state.transactions, state.filters]);

  const selectedTransactions = useMemo(() => 
    state.transactions.filter(tx => state.selectedIds.includes(tx.id)),
    [state.transactions, state.selectedIds]
  );

  const totalVolume = useMemo(() => 
    filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions]
  );

  const totalProfit = useMemo(() => 
    filteredTransactions.reduce((sum, tx) => {
      if ('profit' in tx) {
        return sum + tx.profit;
      }
      return sum;
    }, 0),
    [filteredTransactions]
  );

  const currencyBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; volume: number; profit: number }> = {};
    
    filteredTransactions.forEach(tx => {
      if (!breakdown[tx.currency]) {
        breakdown[tx.currency] = { count: 0, volume: 0, profit: 0 };
      }
      
      breakdown[tx.currency].count++;
      breakdown[tx.currency].volume += tx.amount;
      
      if ('profit' in tx) {
        breakdown[tx.currency].profit += tx.profit;
      }
    });
    
    return breakdown;
  }, [filteredTransactions]);

  // Actions
  const addTransaction = useCallback((transaction: DailyTransaction | FXTransaction) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<DailyTransaction | FXTransaction>) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates } });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  }, []);

  const setFilters = useCallback((filters: Partial<TransactionFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const selectTransaction = useCallback((transaction: DailyTransaction | FXTransaction | null) => {
    dispatch({ type: 'SET_SELECTED_TRANSACTION', payload: transaction });
  }, []);

  const toggleSelection = useCallback((id: string) => {
    const newSelection = state.selectedIds.includes(id)
      ? state.selectedIds.filter(selectedId => selectedId !== id)
      : [...state.selectedIds, id];
    dispatch({ type: 'SET_BULK_SELECTION', payload: newSelection });
  }, [state.selectedIds]);

  const selectAll = useCallback(() => {
    dispatch({ type: 'SET_BULK_SELECTION', payload: filteredTransactions.map(tx => tx.id) });
  }, [filteredTransactions]);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const bulkDelete = useCallback(() => {
    state.selectedIds.forEach(id => {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    });
    dispatch({ type: 'CLEAR_SELECTION' });
  }, [state.selectedIds]);

  const exportSelected = useCallback((format: 'csv' | 'json') => {
    const data = selectedTransactions;
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selected-transactions-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV export logic would go here
      console.log('CSV export not implemented yet');
    }
  }, [selectedTransactions]);

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    filteredTransactions,
    selectedTransactions,
    totalVolume,
    totalProfit,
    currencyBreakdown,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    clearFilters,
    selectTransaction,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkDelete,
    exportSelected,
  }), [
    state,
    filteredTransactions,
    selectedTransactions,
    totalVolume,
    totalProfit,
    currencyBreakdown,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    clearFilters,
    selectTransaction,
    toggleSelection,
    selectAll,
    clearSelection,
    bulkDelete,
    exportSelected,
  ]);

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
}

// Custom hook to use the context
export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
}

// Error boundary for transaction context
export class TransactionErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Transaction context error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Something went wrong with the transaction system
          </h2>
          <p className="text-muted-foreground mb-4">
            Please refresh the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 