
import { useState } from 'react';
import { Rail, Transaction } from '@/data/railsData';
import { TransactionTracker } from '@/components/rails/TransactionTracker';
import { NewTransactionDialog } from '@/components/rails/NewTransactionDialog';
import { MT103UploadDialog, MT103FormData } from '@/components/rails/MT103UploadDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';

interface TransactionTrackerContainerProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  railsData: Rail[];
  onViewRemittance: (transaction: Transaction) => void;
  selectedRail?: Rail | null;
}

export function TransactionTrackerContainer({
  transactions,
  setTransactions,
  railsData,
  onViewRemittance,
  selectedRail
}: TransactionTrackerContainerProps) {
  const [newTxDialogOpen, setNewTxDialogOpen] = useState(false);
  const [mt103DialogOpen, setMt103DialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Add state for filtering and searching
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterRail, setFilterRail] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<[Date | null, Date | null]>([null, null]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const handleNewTransaction = (data: any) => {
    const newTransaction: Transaction = {
      id: `TX${String(transactions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      rail: data.rail ? railsData.find(r => r.id === data.rail)?.name || 'Unknown' : (selectedRail?.name || 'Unknown'),
      railId: data.rail || selectedRail?.id || '',
      amount: Number(data.amount),
      currency: data.currency,
      fee: Number(data.fee),
      margin: Number(data.margin),
      status: 'Pending',
      tat: 'Pending',
      beneficiary: data.beneficiary,
      reference: data.reference || '',
      trackingNumber: '',
      mt103File: null,
      notes: data.notes || ''
    };
    
    setTransactions([newTransaction, ...transactions]);
    setNewTxDialogOpen(false);
  };
  
  // Fix the function signature to match MT103FormData
  const handleMT103Upload = (data: MT103FormData) => {
    if (!selectedTransaction) return;
    
    setTransactions(transactions.map(tx => 
      tx.id === selectedTransaction.id ? { 
        ...tx, 
        mt103File: data.file ? data.file.name : null, 
        trackingNumber: data.trackingNumber,
        status: 'Processing' 
      } : tx
    ));
    setMt103DialogOpen(false);
    setSelectedTransaction(null);
  };
  
  const handleUploadMT103 = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setMt103DialogOpen(true);
  };
  
  // Add handlers for status updates and deleting transactions
  const handleStatusUpdate = (transaction: Transaction, status: string) => {
    setTransactions(transactions.map(tx => 
      tx.id === transaction.id ? { ...tx, status } : tx
    ));
  };
  
  const handleDeleteTransaction = (transaction: Transaction) => {
    setTransactions(transactions.filter(tx => tx.id !== transaction.id));
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Transaction Tracker</CardTitle>
            <CardDescription>Monitor all SWIFT transactions</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setMt103DialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload MT103
            </Button>
            <Button onClick={() => setNewTxDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <TransactionTracker 
            transactions={transactions} 
            railsData={railsData}
            filterStatus={filterStatus}
            filterRail={filterRail}
            dateFilter={dateFilter}
            searchQuery={searchQuery}
            setFilterStatus={setFilterStatus}
            setFilterRail={setFilterRail}
            setDateFilter={setDateFilter}
            setSearchQuery={setSearchQuery}
            onAddTransaction={() => setNewTxDialogOpen(true)}
            onViewRemittance={onViewRemittance}
            onUploadMT103={handleUploadMT103}
            onStatusUpdate={handleStatusUpdate}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </CardContent>
      </Card>
      
      {/* New Transaction Dialog */}
      <NewTransactionDialog 
        open={newTxDialogOpen}
        onOpenChange={setNewTxDialogOpen}
        onSubmit={handleNewTransaction}
        railsData={railsData}
        defaultRail={selectedRail}
      />
      
      {/* MT103 Upload Dialog */}
      <MT103UploadDialog 
        open={mt103DialogOpen}
        onOpenChange={setMt103DialogOpen}
        onSubmit={handleMT103Upload}
        transaction={selectedTransaction}
      />
    </>
  );
}
