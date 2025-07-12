
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function TransactionTableHeader() {
  return (
    <TableHeader>
      <TableRow className="bg-blue-600 border-none hover:bg-blue-600">
        <TableHead className="text-white font-semibold text-center py-4 border-r border-blue-500 hover:bg-blue-600">
          Date
        </TableHead>
        <TableHead className="text-white font-semibold text-center py-4 border-r border-blue-500 hover:bg-blue-600">
          Currency
        </TableHead>
        <TableHead className="text-white font-semibold text-center py-4 border-r border-blue-500 hover:bg-blue-600">
          Rate (₦/USDT)
        </TableHead>
        <TableHead className="text-white font-semibold text-center py-4 border-r border-blue-500 hover:bg-blue-600">
          Amount Processed
        </TableHead>
        <TableHead className="text-white font-semibold text-center py-4 border-r border-blue-500 hover:bg-blue-600">
          Amount Received
        </TableHead>
        <TableHead className="text-white font-semibold text-center py-4 border-r border-blue-500 hover:bg-blue-600">
          USDC Spent
        </TableHead>
        <TableHead className="text-white font-semibold text-center py-4 hover:bg-blue-600">
          Profit/Loss
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
