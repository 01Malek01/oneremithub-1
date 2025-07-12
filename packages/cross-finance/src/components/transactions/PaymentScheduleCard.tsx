
import React, { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DailyTransaction, 
  FXTransaction, 
  PaymentSchedule, 
  PaymentInstallment,
  PaymentHistory,
  PaymentScheduleType,
  PaymentFrequency
} from '@/types/transactions';
import { 
  paymentCalculations, 
  paymentScheduleUtils, 
  transactionStatusUtils 
} from '@/utils/paymentCalculations';
import { formatNaira, formatDate } from '@/utils/formatters';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  CreditCard,
  TrendingUp
} from 'lucide-react';

interface PaymentScheduleCardProps {
  transaction: DailyTransaction | FXTransaction;
  onPaymentReceived: (payment: PaymentHistory) => void;
  onInstallmentAdded?: (installment: Omit<PaymentInstallment, 'id' | 'transactionId'>) => void;
  className?: string;
}

export const PaymentScheduleCard = memo(({
  transaction,
  onPaymentReceived,
  onInstallmentAdded,
  className
}: PaymentScheduleCardProps) => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showInstallmentDialog, setShowInstallmentDialog] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<PaymentInstallment | null>(null);
  
  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Installment form state
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [installmentDueDate, setInstallmentDueDate] = useState('');
  const [installmentNotes, setInstallmentNotes] = useState('');

  const schedule = transaction.paymentSchedule;
  if (!schedule) return null;

  const progress = paymentCalculations.getPaymentProgress(transaction);
  const isOverdue = paymentCalculations.isPaymentOverdue(transaction);
  const lateFees = paymentCalculations.calculateLateFees(transaction);
  const nextPaymentDue = paymentCalculations.calculateNextPaymentDue(transaction);
  const paymentSummary = paymentScheduleUtils.getPaymentSummary(schedule);

  const handlePaymentSubmit = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const payment: PaymentHistory = {
      id: `payment-${Date.now()}`,
      transactionId: transaction.id,
      installmentId: selectedInstallment?.id,
      amount,
      paymentDate: new Date(),
      paymentMethod,
      reference: paymentReference || `PAY-${Date.now()}`,
      notes: paymentNotes,
      processedBy: 'current_user' // This would come from auth context
    };

    onPaymentReceived(payment);
    setShowPaymentDialog(false);
    resetPaymentForm();
  };

  const handleInstallmentSubmit = () => {
    const amount = parseFloat(installmentAmount);
    const dueDate = new Date(installmentDueDate);
    
    if (isNaN(amount) || amount <= 0 || isNaN(dueDate.getTime())) return;

    const installment = {
      installmentNumber: schedule.installments.length + 1,
      dueDate,
      amount,
      notes: installmentNotes,
      status: 'pending' as const,
      paidAmount: 0,
    };

    onInstallmentAdded?.(installment);
    setShowInstallmentDialog(false);
    resetInstallmentForm();
  };

  const resetPaymentForm = () => {
    setPaymentAmount('');
    setPaymentMethod('bank_transfer');
    setPaymentReference('');
    setPaymentNotes('');
    setSelectedInstallment(null);
  };

  const resetInstallmentForm = () => {
    setInstallmentAmount('');
    setInstallmentDueDate('');
    setInstallmentNotes('');
  };

  const getInstallmentStatusIcon = (installment: PaymentInstallment) => {
    if (installment.status === 'paid') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (new Date() > installment.dueDate) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getInstallmentStatusColor = (installment: PaymentInstallment) => {
    switch (installment.status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Schedule
            </CardTitle>
            <Badge variant={transaction.isFullyPaid ? 'default' : 'secondary'}>
              {transaction.isFullyPaid ? 'Fully Paid' : `${progress.percentage.toFixed(1)}% Paid`}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Progress</span>
              <span className="font-medium">
                {formatNaira(progress.paidAmount)} / {formatNaira(progress.totalAmount)}
              </span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Remaining: {formatNaira(progress.remainingAmount)}</span>
              {lateFees > 0 && (
                <span className="text-red-600">Late Fees: {formatNaira(lateFees)}</span>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Total Installments</p>
              <p className="font-medium">{paymentSummary.totalInstallments}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Paid Installments</p>
              <p className="font-medium text-green-600">{paymentSummary.paidInstallments}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Pending</p>
              <p className="font-medium text-yellow-600">{paymentSummary.pendingInstallments}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Overdue</p>
              <p className="font-medium text-red-600">{paymentSummary.overdueInstallments}</p>
            </div>
          </div>

          {/* Next Payment Due */}
          {nextPaymentDue && !transaction.isFullyPaid && (
            <div className={`p-3 rounded-lg border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
              <div className="flex items-center gap-2">
                <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : 'text-blue-500'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isOverdue ? 'text-red-800' : 'text-blue-800'}`}>
                    {isOverdue ? 'Payment Overdue' : 'Next Payment Due'}
                  </p>
                  <p className={`text-xs ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatDate(nextPaymentDue, { format: 'long' })}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setShowPaymentDialog(true)}
                  className={isOverdue ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Record Payment
                </Button>
              </div>
            </div>
          )}

          {/* Installments List */}
          {schedule.installments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Installments</h4>
                {schedule.type === PaymentScheduleType.FLEXIBLE && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowInstallmentDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Installment
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {schedule.installments.map((installment) => (
                  <div 
                    key={installment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {getInstallmentStatusIcon(installment)}
                      <div>
                        <p className="text-sm font-medium">
                          Installment #{installment.installmentNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDate(installment.dueDate, { format: 'short' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatNaira(installment.paidAmount)} / {formatNaira(installment.amount)}
                        </p>
                        {installment.lateFees && installment.lateFees > 0 && (
                          <p className="text-xs text-red-600">
                            Late fees: {formatNaira(installment.lateFees)}
                          </p>
                        )}
                      </div>
                      
                      <Badge className={getInstallmentStatusColor(installment)}>
                        {installment.status}
                      </Badge>
                      
                      {installment.status !== 'paid' && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setSelectedInstallment(installment);
                            setShowPaymentDialog(true);
                          }}
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={() => setShowPaymentDialog(true)}
              className="flex-1"
              disabled={transaction.isFullyPaid}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
            
            {schedule.type === PaymentScheduleType.FLEXIBLE && (
              <Button 
                variant="outline"
                onClick={() => setShowInstallmentDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Installment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for this transaction in Naira
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedInstallment && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Paying Installment #{selectedInstallment.installmentNumber}</p>
                <p className="text-xs text-muted-foreground">
                  Due: {formatDate(selectedInstallment.dueDate, { format: 'long' })}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount (₦)</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter payment amount in Naira"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="pos">POS</SelectItem>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-reference">Reference</Label>
              <Input
                id="payment-reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Payment reference or transaction ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes</Label>
              <Input
                id="payment-notes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentSubmit}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Installment Dialog */}
      <Dialog open={showInstallmentDialog} onOpenChange={setShowInstallmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Installment</DialogTitle>
            <DialogDescription>
              Add a new installment to the payment schedule in Naira
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="installment-amount">Amount (₦)</Label>
              <Input
                id="installment-amount"
                type="number"
                value={installmentAmount}
                onChange={(e) => setInstallmentAmount(e.target.value)}
                placeholder="Enter installment amount in Naira"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="installment-due-date">Due Date</Label>
              <Input
                id="installment-due-date"
                type="date"
                value={installmentDueDate}
                onChange={(e) => setInstallmentDueDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="installment-notes">Notes</Label>
              <Input
                id="installment-notes"
                value={installmentNotes}
                onChange={(e) => setInstallmentNotes(e.target.value)}
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInstallmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInstallmentSubmit}>
              Add Installment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

PaymentScheduleCard.displayName = 'PaymentScheduleCard';
