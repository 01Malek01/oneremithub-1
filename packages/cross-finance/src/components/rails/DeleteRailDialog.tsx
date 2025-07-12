
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rail } from '@/data/railsData';

interface DeleteRailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  rail: Rail | null;
}

export function DeleteRailDialog({
  open,
  onOpenChange,
  onDelete,
  rail
}: DeleteRailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            {rail && (
              <>Are you sure you want to delete rail "{rail.name}"? This action cannot be undone.</>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onDelete}>
            Delete Rail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
