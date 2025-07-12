
import { Transaction } from '@/data/railsData';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileCheck, FileUp, FileText, MoreHorizontal, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TransactionRowProps {
  transaction: Transaction;
  onViewRemittance: (transaction: Transaction) => void;
  onUploadMT103: (transaction: Transaction) => void;
  onStatusUpdate: (transaction: Transaction, status: string) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
}

export function TransactionRow({
  transaction,
  onViewRemittance,
  onUploadMT103,
  onStatusUpdate,
  onDeleteTransaction
}: TransactionRowProps) {
  // Format currency display
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get style for status badge
  const getStatusBadgeStyle = (status: string) => {
    switch(status) {
      case 'Pending':
        return { variant: 'outline' as const, className: "bg-gray-100 text-gray-700" };
      case 'Processing':
        return { variant: 'default' as const, className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" };
      case 'Awaiting MT103':
        return { variant: 'default' as const, className: "bg-blue-100 text-blue-800 hover:bg-blue-100" };
      case 'MT103 Received':
        return { variant: 'default' as const, className: "bg-green-100 text-green-800 hover:bg-green-100" };
      case 'Completed':
        return { variant: 'default' as const, className: "bg-green-200 text-green-900 hover:bg-green-200" };
      default:
        return { variant: 'outline' as const, className: "" };
    }
  };

  const statusStyle = getStatusBadgeStyle(transaction.status);
  const hasOverdue = 
    (transaction.status !== 'Completed') && 
    transaction.tat !== 'Pending' && 
    Date.now() > new Date(transaction.date).getTime() + 3*24*60*60*1000; // 3 days

  return (
    <TableRow className={hasOverdue ? "bg-red-50/30" : undefined}>
      <TableCell>
        <span className="font-medium">{transaction.date}</span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{transaction.id}</span>
          <span className="text-xs text-muted-foreground">{transaction.reference}</span>
        </div>
      </TableCell>
      <TableCell>{transaction.currency || 'USD'}</TableCell>
      <TableCell className="font-mono">
        {formatCurrency(transaction.amount, transaction.currency)}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{transaction.rail}</span>
          <span className="text-xs text-muted-foreground">{transaction.beneficiary}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={statusStyle.variant} className={statusStyle.className}>
          {transaction.status}
        </Badge>
        {hasOverdue && (
          <div className="text-xs text-red-500 mt-1">Overdue</div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm">{transaction.trackingNumber || '—'}</span>
          <span className="text-xs text-muted-foreground">TAT: {transaction.tat}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex space-x-1">
          {transaction.status !== 'Completed' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onUploadMT103(transaction)}
              title="Upload MT103"
            >
              <FileUp className="h-4 w-4" />
              <span className="sr-only">Upload</span>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onViewRemittance(transaction)}
            title="Generate Remittance Advice"
          >
            <FileText className="h-4 w-4" />
            <span className="sr-only">Remittance</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {transaction.status !== 'Completed' && (
                <>
                  <DropdownMenuItem onClick={() => onStatusUpdate(transaction, 'Completed')}>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDeleteTransaction(transaction)}
              >
                Delete Transaction
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
