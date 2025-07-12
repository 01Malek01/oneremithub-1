
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerSectionProps {
  transactionDate: Date;
  onDateChange: (date: Date) => void;
}

export function DatePickerSection({ transactionDate, onDateChange }: DatePickerSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="date">Transaction Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !transactionDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {transactionDate ? (
              format(transactionDate, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={transactionDate}
            onSelect={(date) => onDateChange(date || new Date())}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
