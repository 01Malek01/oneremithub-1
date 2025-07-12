
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { DailyTransaction } from '@/types/transactions';
import { Table } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Filter } from 'lucide-react';
import { TransactionTableHeader } from './TransactionTableHeader';
import { TransactionTableBody } from './TransactionTableBody';

interface EnhancedTransactionTableProps {
  transactions: DailyTransaction[];
  onUpdateTransaction?: (updatedTransaction: DailyTransaction) => void;
}

export function EnhancedTransactionTable({ transactions, onUpdateTransaction }: EnhancedTransactionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'profit' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingCell, setEditingCell] = useState<{
    transactionId: string;
    field: keyof DailyTransaction;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter(tx => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        tx.id.toLowerCase().includes(query) ||
        tx.currency.toLowerCase().includes(query) ||
        format(new Date(tx.transactionDate), 'MM-dd-yyyy').includes(query)
      );
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue: number | Date;
      let bValue: number | Date;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.transactionDate);
          bValue = new Date(b.transactionDate);
          break;
        case 'profit':
          aValue = a.profit;
          bValue = b.profit;
          break;
        case 'amount':
          aValue = a.amountProcessed;
          bValue = b.amountProcessed;
          break;
        default:
          aValue = new Date(a.transactionDate);
          bValue = new Date(b.transactionDate);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, searchQuery, sortBy, sortOrder]);

  const handleCellClick = (transactionId: string, field: keyof DailyTransaction, currentValue: any) => {
    if (!['nairaUsdtRate', 'amountProcessed', 'usdcSpent'].includes(field)) return;
    
    setEditingCell({ transactionId, field });
    setEditValue(currentValue.toString());
  };

  const handleSaveEdit = (transactionId: string, field: keyof DailyTransaction) => {
    if (!onUpdateTransaction) return;

    const transaction = transactions.find(tx => tx.id === transactionId);
    if (!transaction) return;

    const numericValue = parseFloat(editValue);
    if (isNaN(numericValue)) return;

    const updatedTransaction = { ...transaction, [field]: numericValue };
    
    // Recalculate dependent values
    if (field === 'nairaUsdtRate' || field === 'amountProcessed') {
      updatedTransaction.amountReceived = updatedTransaction.nairaUsdtRate * updatedTransaction.amountProcessed;
      updatedTransaction.profit = updatedTransaction.amountReceived - updatedTransaction.usdcSpent;
    } else if (field === 'usdcSpent') {
      updatedTransaction.profit = updatedTransaction.amountReceived - updatedTransaction.usdcSpent;
    }

    onUpdateTransaction(updatedTransaction);
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, transactionId: string, field: keyof DailyTransaction) => {
    if (e.key === 'Enter') {
      handleSaveEdit(transactionId, field);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Transaction History ({filteredAndSortedTransactions.length})</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {filteredAndSortedTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground p-6">
            {searchQuery ? 'No transactions match your search.' : 'No transactions recorded yet. Start recording your daily transactions above.'}
          </div>
        ) : (
          <div className="px-6 pb-6">
            <Table className="w-full border border-gray-200 bg-white">
              <TransactionTableHeader />
              <TransactionTableBody
                transactions={filteredAndSortedTransactions}
                editingCell={editingCell}
                editValue={editValue}
                onCellEdit={handleCellClick}
                onSaveEdit={handleSaveEdit}
                onKeyDown={handleKeyDown}
                onEditValueChange={setEditValue}
              />
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
