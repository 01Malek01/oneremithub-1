import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DailyTransaction, 
  FXTransaction, 
  PaymentScheduleType, 
  PaymentFrequency,
  PaymentInstallment 
} from '@/types/transactions';
import { paymentScheduleUtils } from '@/utils/paymentCalculations';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface PaymentSetupDialogProps {
  transaction: DailyTransaction | FXTransaction;
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: (schedule: any) => void;
}

export const PaymentSetupDialog: React.FC<PaymentSetupDialogProps> = ({
  transaction,
  isOpen,
  onClose,
  onSetupComplete
}) => {
  // Form state
  const [scheduleType, setScheduleType] = useState<PaymentScheduleType>(PaymentScheduleType.LUMP_SUM);
  const [originalAmount, setOriginalAmount] = useState(transaction.amount.toString());
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(PaymentFrequency.MONTHLY);
  const [numberOfInstallments, setNumberOfInstallments] = useState('3');
  const [gracePeriod, setGracePeriod] = useState('0');
  const [lateFeeRate, setLateFeeRate] = useState('5');
  const [autoCharge, setAutoCharge] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Preview state
  const [previewSchedule, setPreviewSchedule] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Update preview when form changes
  useEffect(() => {
    try {
      const amount = parseFloat(originalAmount);
      const installments = parseInt(numberOfInstallments);
      const grace = parseInt(gracePeriod);
      const lateFee = parseFloat(lateFeeRate);

      if (isNaN(amount) || amount <= 0) {
        setPreviewSchedule(null);
        return;
      }

      const schedule = paymentScheduleUtils.createPaymentSchedule(
        transaction.id,
        amount,
        scheduleType,
        {
          frequency: paymentFrequency,
          numberOfInstallments: installments,
          startDate: new Date(startDate),
          gracePeriod: grace,
          lateFeeRate: lateFee,
          autoCharge
        }
      );

      setPreviewSchedule(schedule);
      setValidationErrors([]);
    } catch (error) {
      setValidationErrors([error instanceof Error ? error.message : 'Invalid configuration']);
      setPreviewSchedule(null);
    }
  }, [
    scheduleType,
    originalAmount,
    paymentFrequency,
    numberOfInstallments,
    gracePeriod,
    lateFeeRate,
    autoCharge,
    startDate,
    transaction.id
  ]);

  const handleSubmit = () => {
    if (!previewSchedule || validationErrors.length > 0) return;

    onSetupComplete(previewSchedule);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setScheduleType(PaymentScheduleType.LUMP_SUM);
    setOriginalAmount(transaction.amount.toString());
    setPaymentFrequency(PaymentFrequency.MONTHLY);
    setNumberOfInstallments('3');
    setGracePeriod('0');
    setLateFeeRate('5');
    setAutoCharge(false);
    setStartDate(new Date().toISOString().split('T')[0]);
  };

  const getScheduleTypeDescription = (type: PaymentScheduleType) => {
    switch (type) {
      case PaymentScheduleType.LUMP_SUM:
        return 'Customer pays the full amount in one payment';
      case PaymentScheduleType.INSTALLMENTS:
        return 'Customer pays in equal installments over time';
      case PaymentScheduleType.FLEXIBLE:
        return 'Customer pays variable amounts as they can afford';
      case PaymentScheduleType.RECURRING:
        return 'Customer pays the same amount on a recurring basis';
      default:
        return '';
    }
  };

  const getScheduleTypeIcon = (type: PaymentScheduleType) => {
    switch (type) {
      case PaymentScheduleType.LUMP_SUM:
        return <DollarSign className="h-5 w-5" />;
      case PaymentScheduleType.INSTALLMENTS:
        return <TrendingUp className="h-5 w-5" />;
      case PaymentScheduleType.FLEXIBLE:
        return <Clock className="h-5 w-5" />;
      case PaymentScheduleType.RECURRING:
        return <CreditCard className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getScheduleTypeColor = (type: PaymentScheduleType) => {
    switch (type) {
      case PaymentScheduleType.LUMP_SUM:
        return 'bg-green-100 text-green-800';
      case PaymentScheduleType.INSTALLMENTS:
        return 'bg-blue-100 text-blue-800';
      case PaymentScheduleType.FLEXIBLE:
        return 'bg-orange-100 text-orange-800';
      case PaymentScheduleType.RECURRING:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Setup Payment Schedule
          </DialogTitle>
          <DialogDescription>
            Configure how the customer will pay for this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Form */}
          <div className="space-y-6">
            {/* Payment Schedule Type */}
            <div className="space-y-4">
              <Label>Payment Schedule Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(PaymentScheduleType).map((type) => (
                  <Card 
                    key={type}
                    className={`cursor-pointer transition-all ${
                      scheduleType === type 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setScheduleType(type)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getScheduleTypeColor(type)}`}>
                          {getScheduleTypeIcon(type)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getScheduleTypeDescription(type)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Amount Configuration */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="original-amount">Total Amount</Label>
                <Input
                  id="original-amount"
                  type="number"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  placeholder="Enter total amount"
                />
              </div>

              {/* Installment Configuration */}
              {scheduleType === PaymentScheduleType.INSTALLMENTS && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="installments">Number of Installments</Label>
                    <Input
                      id="installments"
                      type="number"
                      min="2"
                      max="60"
                      value={numberOfInstallments}
                      onChange={(e) => setNumberOfInstallments(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={paymentFrequency} onValueChange={(value) => setPaymentFrequency(value as PaymentFrequency)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PaymentFrequency.WEEKLY}>Weekly</SelectItem>
                        <SelectItem value={PaymentFrequency.BIWEEKLY}>Bi-weekly</SelectItem>
                        <SelectItem value={PaymentFrequency.MONTHLY}>Monthly</SelectItem>
                        <SelectItem value={PaymentFrequency.QUARTERLY}>Quarterly</SelectItem>
                        <SelectItem value={PaymentFrequency.YEARLY}>Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Recurring Configuration */}
              {scheduleType === PaymentScheduleType.RECURRING && (
                <div>
                  <Label htmlFor="recurring-frequency">Recurring Frequency</Label>
                  <Select value={paymentFrequency} onValueChange={(value) => setPaymentFrequency(value as PaymentFrequency)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentFrequency.WEEKLY}>Weekly</SelectItem>
                      <SelectItem value={PaymentFrequency.BIWEEKLY}>Bi-weekly</SelectItem>
                      <SelectItem value={PaymentFrequency.MONTHLY}>Monthly</SelectItem>
                      <SelectItem value={PaymentFrequency.QUARTERLY}>Quarterly</SelectItem>
                      <SelectItem value={PaymentFrequency.YEARLY}>Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Start Date */}
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* Late Fee Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grace-period">Grace Period (days)</Label>
                  <Input
                    id="grace-period"
                    type="number"
                    min="0"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="late-fee">Late Fee Rate (%)</Label>
                  <Input
                    id="late-fee"
                    type="number"
                    min="0"
                    step="0.1"
                    value={lateFeeRate}
                    onChange={(e) => setLateFeeRate(e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Auto Charge */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-charge"
                  checked={autoCharge}
                  onCheckedChange={setAutoCharge}
                />
                <Label htmlFor="auto-charge">Enable automatic charging</Label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Payment Schedule Preview</h3>
            
            {validationErrors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Configuration Errors</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {previewSchedule && (
              <div className="space-y-4">
                {/* Schedule Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Schedule Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-medium">{formatCurrency(previewSchedule.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Installments</p>
                        <p className="font-medium">{previewSchedule.installments.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium">{formatDate(previewSchedule.startDate, { format: 'short' })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p className="font-medium">
                          {previewSchedule.endDate 
                            ? formatDate(previewSchedule.endDate, { format: 'short' })
                            : 'Ongoing'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Installments Preview */}
                {previewSchedule.installments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Installments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {previewSchedule.installments.map((installment: PaymentInstallment, index: number) => (
                          <div 
                            key={installment.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">#{installment.installmentNumber}</Badge>
                              <div>
                                <p className="text-sm font-medium">
                                  {formatDate(installment.dueDate, { format: 'short' })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {paymentFrequency} payment
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatCurrency(installment.amount)}
                              </p>
                              {index === 0 && (
                                <p className="text-xs text-muted-foreground">First payment</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Terms Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Grace Period:</span>
                      <span>{gracePeriod} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Late Fee Rate:</span>
                      <span>{lateFeeRate}% per year</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto Charge:</span>
                      <span>{autoCharge ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!previewSchedule || validationErrors.length > 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Setup Payment Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 