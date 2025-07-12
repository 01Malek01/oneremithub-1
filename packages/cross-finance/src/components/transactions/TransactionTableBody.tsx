
import { format } from 'date-fns';
import { DailyTransaction } from '@/types/transactions';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EditableCell } from './EditableCell';

interface Props {
  transactions: DailyTransaction[];
  editingCell: { transactionId: string; field: keyof DailyTransaction } | null;
  editValue: string;
  onCellEdit: (transactionId: string, field: keyof DailyTransaction, currentValue: any) => void;
  onSaveEdit: (transactionId: string, field: keyof DailyTransaction) => void;
  onKeyDown: (e: React.KeyboardEvent, transactionId: string, field: keyof DailyTransaction) => void;
  onEditValueChange: (value: string) => void;
}

export function TransactionTableBody({
  transactions,
  editingCell,
  editValue,
  onCellEdit,
  onSaveEdit,
  onKeyDown,
  onEditValueChange
}: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <TableBody>
      {transactions.map((transaction, index) => (
        <TableRow 
          key={transaction.id} 
          className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-gray-100`}
        >
          <TableCell className="py-4 px-4 text-center font-medium text-gray-900 border-r border-gray-200">
            {format(new Date(transaction.transactionDate), 'MM-dd-yyyy')}
          </TableCell>
          <TableCell className="py-4 px-4 text-center border-r border-gray-200">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
              {transaction.currency}
            </Badge>
          </TableCell>
          <TableCell className="py-4 px-4 text-center font-mono border-r border-gray-200">
            <EditableCell
              transaction={transaction}
              field="nairaUsdtRate"
              value={transaction.nairaUsdtRate}
              formatter={(val) => `₦${val.toLocaleString()}`}
              isEditing={editingCell?.transactionId === transaction.id && editingCell?.field === 'nairaUsdtRate'}
              editValue={editValue}
              onEdit={onCellEdit}
              onSave={onSaveEdit}
              onKeyDown={onKeyDown}
              onEditValueChange={onEditValueChange}
            />
          </TableCell>
          <TableCell className="py-4 px-4 text-center font-mono border-r border-gray-200">
            <EditableCell
              transaction={transaction}
              field="amountProcessed"
              value={transaction.amountProcessed}
              formatter={(val) => `${val.toLocaleString()} ${transaction.currency}`}
              isEditing={editingCell?.transactionId === transaction.id && editingCell?.field === 'amountProcessed'}
              editValue={editValue}
              onEdit={onCellEdit}
              onSave={onSaveEdit}
              onKeyDown={onKeyDown}
              onEditValueChange={onEditValueChange}
            />
          </TableCell>
          <TableCell className="py-4 px-4 text-center font-mono border-r border-gray-200">
            <div className="py-2 px-3 bg-green-50 rounded-md text-green-700 font-semibold">
              {formatCurrency(transaction.amountReceived)}
            </div>
          </TableCell>
          <TableCell className="py-4 px-4 text-center font-mono border-r border-gray-200">
            <EditableCell
              transaction={transaction}
              field="usdcSpent"
              value={transaction.usdcSpent}
              formatter={(val) => formatCurrency(val)}
              isEditing={editingCell?.transactionId === transaction.id && editingCell?.field === 'usdcSpent'}
              editValue={editValue}
              onEdit={onCellEdit}
              onSave={onSaveEdit}
              onKeyDown={onKeyDown}
              onEditValueChange={onEditValueChange}
            />
          </TableCell>
          <TableCell className="py-4 px-4 text-center font-mono">
            <div className={`py-2 px-3 rounded-md font-semibold ${
              transaction.profit >= 0 
                ? 'text-green-700 bg-green-50' 
                : 'text-red-700 bg-red-50'
            }`}>
              {formatCurrency(transaction.profit)}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
