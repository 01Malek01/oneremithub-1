
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rail, Transaction } from '@/data/railsData';
import { FilterBar } from './transaction/FilterBar';
import { TransactionTable } from './transaction/TransactionTable';

interface TransactionTrackerProps {
  transactions: Transaction[];
  railsData: Rail[];
  filterStatus: string | null;
  filterRail: string | null;
  dateFilter: [Date | null, Date | null];
  searchQuery: string;
  setFilterStatus: (status: string | null) => void;
  setFilterRail: (rail: string | null) => void;
  setDateFilter: (dates: [Date | null, Date | null]) => void;
  setSearchQuery: (query: string) => void;
  onAddTransaction: () => void;
  onViewRemittance: (transaction: Transaction) => void;
  onUploadMT103: (transaction: Transaction) => void;
  onStatusUpdate: (transaction: Transaction, status: string) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
}

export function TransactionTracker({
  transactions,
  railsData,
  filterStatus,
  filterRail,
  dateFilter,
  searchQuery,
  setFilterStatus,
  setFilterRail,
  setDateFilter,
  setSearchQuery,
  onAddTransaction,
  onViewRemittance,
  onUploadMT103,
  onStatusUpdate,
  onDeleteTransaction
}: TransactionTrackerProps) {
  
  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter(tx => {
    // Status filter
    if (filterStatus && tx.status !== filterStatus) return false;
    
    // Rail filter
    if (filterRail && tx.rail !== filterRail) return false;
    
    // Date range filter
    if (dateFilter[0] && dateFilter[1]) {
      const txDate = new Date(tx.date);
      const startDate = dateFilter[0];
      const endDate = dateFilter[1];
      
      if (txDate < startDate || txDate > endDate) return false;
    }
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesId = tx.id.toLowerCase().includes(query);
      const matchesBeneficiary = tx.beneficiary.toLowerCase().includes(query);
      const matchesReference = tx.reference?.toLowerCase().includes(query) || false;
      
      if (!matchesId && !matchesBeneficiary && !matchesReference) return false;
    }
    
    return true;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>SWIFT Tracker</CardTitle>
          <CardDescription>Track and manage international wire payments</CardDescription>
        </div>
        <Button onClick={onAddTransaction}>+ Add New Transaction</Button>
      </CardHeader>
      
      <CardContent>
        <FilterBar 
          filterStatus={filterStatus}
          filterRail={filterRail}
          dateFilter={dateFilter}
          searchQuery={searchQuery}
          setFilterStatus={setFilterStatus}
          setFilterRail={setFilterRail}
          setDateFilter={setDateFilter}
          setSearchQuery={setSearchQuery}
          railsData={railsData}
        />
        
        <TransactionTable 
          transactions={filteredTransactions}
          onViewRemittance={onViewRemittance}
          onUploadMT103={onUploadMT103}
          onStatusUpdate={onStatusUpdate}
          onDeleteTransaction={onDeleteTransaction}
        />
      </CardContent>
    </Card>
  );
}
