
import React from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { beneficiariesData } from '@/data/railsData';

// List of common currencies
const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'SGD', name: 'Singapore Dollar' },
];

// List of delivery methods
const deliveryMethods = [
  { id: 'swift', name: 'SWIFT' },
  { id: 'sepa', name: 'SEPA' },
  { id: 'ach', name: 'ACH' },
  { id: 'wire', name: 'Wire Transfer' },
  { id: 'local', name: 'Local Transfer' },
];

// List of sender accounts
const senderAccounts = [
  { id: 'acc1', name: 'Oneremit Main Account (USD)', number: '1234567890' },
  { id: 'acc2', name: 'Oneremit EUR Account', number: '0987654321' },
  { id: 'acc3', name: 'Oneremit GBP Account', number: '1122334455' },
  { id: 'acc4', name: 'Oneremit Reserve Account', number: '5566778899' },
];

export interface RemittanceFormData {
  sender: string;
  senderAccount: string;
  senderAccountNumber: string;
  beneficiaryId: string;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  swiftCode: string;
  amount: number;
  currency: string;
  transferDate: string;
  reference: string;
  deliveryMethod: string;
  imadNumber: string;
  uetrNumber: string;
  notes: string;
}

interface RemittanceAdviceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
  onSubmit: (data: RemittanceFormData) => void;
}

export function RemittanceAdviceForm({ 
  open, 
  onOpenChange, 
  transaction, 
  onSubmit 
}: RemittanceAdviceFormProps) {
  const { toast } = useToast();
  const form = useForm<RemittanceFormData>({
    defaultValues: {
      sender: 'Oneremit Limited',
      senderAccount: senderAccounts[0].id,
      senderAccountNumber: senderAccounts[0].number,
      beneficiaryId: transaction?.beneficiaryId || '',
      beneficiaryName: transaction?.beneficiary || '',
      bankName: '',
      accountNumber: '',
      swiftCode: '',
      amount: transaction?.amount || 0,
      currency: 'USD',
      transferDate: transaction ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      reference: transaction?.notes || '',
      deliveryMethod: 'swift',
      imadNumber: transaction?.id ? `IM${transaction.id.slice(2)}` : '',
      uetrNumber: transaction?.id ? `UE${transaction.id.slice(2)}-OR` : '',
      notes: '',
    },
  });

  // When beneficiary selection changes, update related fields
  const handleBeneficiaryChange = (beneficiaryId: string) => {
    const selectedBeneficiary = beneficiariesData.find(ben => ben.id === beneficiaryId);
    if (selectedBeneficiary) {
      form.setValue('beneficiaryName', selectedBeneficiary.name);
      form.setValue('bankName', selectedBeneficiary.bankName || '');
      form.setValue('accountNumber', selectedBeneficiary.accountNumber || '');
      form.setValue('swiftCode', selectedBeneficiary.swiftCode || '');
    }
  };

  // When sender account changes
  const handleSenderAccountChange = (accountId: string) => {
    const selectedAccount = senderAccounts.find(acc => acc.id === accountId);
    if (selectedAccount) {
      form.setValue('senderAccountNumber', selectedAccount.number);
    }
  };

  const handleSubmit = (values: RemittanceFormData) => {
    if (!values.bankName || !values.accountNumber || !values.swiftCode) {
      toast({
        title: "Missing Information",
        description: "Please fill all required banking details.",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Remittance Advice</DialogTitle>
          <DialogDescription>
            Create a remittance advice document for transaction {transaction?.id}.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="senderAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Account</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleSenderAccountChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {senderAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="beneficiaryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Beneficiary</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleBeneficiaryChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Beneficiary" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {beneficiariesData.map((ben) => (
                          <SelectItem key={ben.id} value={ben.id}>
                            {ben.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="beneficiaryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficiary Name</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input {...field} required placeholder="Receiving Bank" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="swiftCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SWIFT/BIC Code</FormLabel>
                    <FormControl>
                      <Input {...field} required placeholder="e.g. CHASUS33" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number / IBAN</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="number" 
                          step="0.01" 
                          required
                          onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="transferDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transfer Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deliveryMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {deliveryMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="imadNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMAD Reference</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="IMAD Reference Number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="uetrNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UETR Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="UETR Reference" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Reference</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Payment Reference/Invoice Number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any additional notes for this remittance"
                      className="resize-none"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Generate PDF</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
