
import { Input } from '@/components/ui/input';
import { DailyTransaction } from '@/types/transactions';

interface Props {
  transaction: DailyTransaction;
  field: keyof DailyTransaction;
  value: number;
  formatter?: (val: number) => string;
  isEditing: boolean;
  editValue: string;
  onEdit: (transactionId: string, field: keyof DailyTransaction, currentValue: any) => void;
  onSave: (transactionId: string, field: keyof DailyTransaction) => void;
  onKeyDown: (e: React.KeyboardEvent, transactionId: string, field: keyof DailyTransaction) => void;
  onEditValueChange: (value: string) => void;
}

export function EditableCell({
  transaction,
  field,
  value,
  formatter,
  isEditing,
  editValue,
  onEdit,
  onSave,
  onKeyDown,
  onEditValueChange
}: Props) {
  const isEditable = ['nairaUsdtRate', 'amountProcessed', 'usdcSpent'].includes(field);

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => onEditValueChange(e.target.value)}
        onBlur={() => onSave(transaction.id, field)}
        onKeyDown={(e) => onKeyDown(e, transaction.id, field)}
        className="h-8 text-xs font-mono border-blue-500 focus:border-blue-600 text-black bg-white"
        autoFocus
      />
    );
  }

  return (
    <div
      className={`py-1 px-2 rounded text-center text-gray-900 font-semibold ${
        isEditable ? 'hover:bg-blue-50 cursor-pointer' : ''
      }`}
      onClick={() => isEditable && onEdit(transaction.id, field, value)}
    >
      {formatter ? formatter(value) : value.toLocaleString()}
    </div>
  );
}
