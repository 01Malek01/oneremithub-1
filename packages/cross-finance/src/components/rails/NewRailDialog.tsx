
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NewRailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: any) => void;
}

export function NewRailDialog({
  open,
  onOpenChange,
  onSubmit
}: NewRailDialogProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      fee: '',
      margin: '',
      processingTime: '',
      recommended: false
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Rail</DialogTitle>
          <DialogDescription>
            Create a new SWIFT rail for your system.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rail Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter rail name" 
                      {...field} 
                      required 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Percentage</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="E.g. 1.2" 
                      {...field} 
                      type="number" 
                      step="0.1"
                      min="0"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="margin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Margin Percentage</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="E.g. 3.5" 
                      {...field} 
                      type="number" 
                      step="0.1"
                      min="0"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="processingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Processing Time</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="E.g. 24-48 hours" 
                      {...field} 
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recommended"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                {...form.register("recommended")}
              />
              <Label htmlFor="recommended">Mark as recommended rail</Label>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Rail</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
