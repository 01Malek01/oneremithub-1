
import { format } from 'date-fns';
import { FXTransaction } from '@/types/transactions';
import { formatCurrency } from '@/utils/transactionCalculations';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  transactions: FXTransaction[];
}

export function TransactionHistory({ transactions }: Props) {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );

  const totalProfit = transactions.reduce((sum, tx) => sum + tx.profit, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Transaction History</CardTitle>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Profit</div>
            <div className={`text-lg font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground p-6">
            No transactions recorded yet. Create your first transaction above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-xs font-medium text-center py-2 px-3">Date</TableHead>
                  <TableHead className="text-xs font-medium text-center py-2 px-3">Currency</TableHead>
                  <TableHead className="text-xs font-medium text-center py-2 px-3">Amount</TableHead>
                  <TableHead className="text-xs font-medium text-center py-2 px-3">Rate Sold</TableHead>
                  <TableHead className="text-xs font-medium text-center py-2 px-3">Rate Bought</TableHead>
                  <TableHead className="text-xs font-medium text-center py-2 px-3">USDT</TableHead>
                  <TableHead className="text-xs font-medium text-center py-2 px-3">NGN Received</TableHead>
                  <TableHead className="text-xs font-medium text-center py-2 px-3">NGN Cost</TableHead>
                  <TableHead className="text-xs font-medium text-center py-2 px-3">Profit</TableHead>
                  <TableHead className="text-xs font-medium text-center py-2 px-3">Client</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50 border-b">
                    <TableCell className="text-xs py-2 px-3 text-center">
                      {format(new Date(transaction.transactionDate), 'MMM dd')}
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3 text-center">
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {transaction.currency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3 text-center font-mono">
                      {transaction.customerAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3 text-center font-mono">
                      {transaction.rateSold.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3 text-center font-mono">
                      {transaction.rateBought.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3 text-center font-mono">
                      {transaction.usdtEquivalent.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3 text-center font-mono">
                      ₦{transaction.totalNgnReceived.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3 text-center font-mono">
                      ₦{transaction.totalNgnCost.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3 text-center font-mono">
                      <span className={transaction.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₦{transaction.profit.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs py-2 px-3 text-center">
                      {transaction.clientName || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
