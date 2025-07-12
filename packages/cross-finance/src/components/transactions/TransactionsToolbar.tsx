import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Trash2, Filter } from 'lucide-react';

interface TransactionsToolbarProps {
  totalSelected: number;
  onExport: (format: 'csv' | 'json') => void;
  onCreateNew: () => void;
  onBulkDelete: () => void;
}

export const TransactionsToolbar = memo(({
  totalSelected,
  onExport,
  onCreateNew,
  onBulkDelete,
}: TransactionsToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-4">
        <Button onClick={onCreateNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
        
        {totalSelected > 0 && (
          <>
            <Badge variant="secondary">
              {totalSelected} selected
            </Badge>
            <Button 
              onClick={onBulkDelete} 
              variant="destructive" 
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button 
          onClick={() => onExport('csv')} 
          variant="outline" 
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button 
          onClick={() => onExport('json')} 
          variant="outline" 
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
      </div>
    </div>
  );
});

TransactionsToolbar.displayName = 'TransactionsToolbar'; 