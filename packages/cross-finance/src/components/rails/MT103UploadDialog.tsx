
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transaction } from '@/data/railsData';
import { useState } from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface MT103UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MT103FormData) => void;
  transaction: Transaction | null;
}

export interface MT103FormData {
  file: File | null;
  trackingNumber: string;
}

export function MT103UploadDialog({
  open,
  onOpenChange,
  onSubmit,
  transaction
}: MT103UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const form = useForm<MT103FormData>({
    defaultValues: {
      file: null,
      trackingNumber: transaction?.trackingNumber || '',
    },
  });

  const handleFormSubmit = (data: MT103FormData) => {
    onSubmit({
      ...data,
      file: file
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload MT103 Document</DialogTitle>
          <DialogDescription>
            {transaction && (
              <>Upload MT103 document and provide tracking number for transaction {transaction.id}</>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="mt103">MT103 Document (PDF)</Label>
              <Input 
                id="mt103" 
                type="file" 
                accept=".pdf" 
                required 
                onChange={handleFileChange}
              />
            </div>
            
            <FormField
              control={form.control}
              name="trackingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking Number (IMAD/EUTR)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tracking number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the IMAD, EUTR or other tracking number for this transaction
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Upload Document</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
