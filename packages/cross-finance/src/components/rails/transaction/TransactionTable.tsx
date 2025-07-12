
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Transaction } from '@/data/railsData';
import { EmptyState } from './EmptyState';
import { TransactionRow } from './TransactionRow';

interface TransactionTableProps {
  transactions: Transaction[];
  onViewRemittance: (transaction: Transaction) => void;
  onUploadMT103: (transaction: Transaction) => void;
  onStatusUpdate: (transaction: Transaction, status: string) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
}

export function TransactionTable({
  transactions,
  onViewRemittance,
  onUploadMT103,
  onStatusUpdate,
  onDeleteTransaction
}: TransactionTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Rail / Beneficiary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tracking #</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <EmptyState />
          ) : (
            transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onViewRemittance={onViewRemittance}
                onUploadMT103={onUploadMT103}
                onStatusUpdate={onStatusUpdate}
                onDeleteTransaction={onDeleteTransaction}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
