
import { AlertCircle } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';

export function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={9} className="text-center py-8">
        <div className="flex flex-col items-center justify-center space-y-2">
          <AlertCircle className="h-8 w-8 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground font-medium">No transactions found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new transaction.</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
