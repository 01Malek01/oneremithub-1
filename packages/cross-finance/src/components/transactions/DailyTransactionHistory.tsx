
import { useState } from 'react';
import { DailyTransaction } from '@/types/transactions';
import { Table } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransactionTableHeader } from './TransactionTableHeader';
import { TransactionTableBody } from './TransactionTableBody';

interface Props {
  transactions: DailyTransaction[];
  onUpdateTransaction?: (updatedTransaction: DailyTransaction) => void;
}

export function DailyTransactionHistory({ transactions, onUpdateTransaction }: Props) {
  const [editingCell, setEditingCell] = useState<{
    transactionId: string;
    field: keyof DailyTransaction;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground p-6">
            No transactions recorded yet. Start recording your daily transactions above.
          </div>
        ) : (
          <div className="px-6 pb-6">
            <Table className="w-full border border-gray-200 bg-white">
              <TransactionTableHeader />
              <TransactionTableBody
                transactions={sortedTransactions}
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
