
import { 
  DailyTransaction, 
  FXTransaction, 
  PaymentSchedule, 
  PaymentInstallment, 
  PaymentHistory,
  PaymentCalculations,
  PaymentScheduleType,
  TransactionStatus
} from '@/types/transactions';

// Payment calculation utilities
export const paymentCalculations: PaymentCalculations = {
  calculateRemainingBalance: (transaction: DailyTransaction | FXTransaction): number => {
    const originalAmount = transaction.originalAmount || transaction.amount;
    const paidAmount = transaction.paidAmount || 0;
    return Math.max(0, originalAmount - paidAmount);
  },

  calculateLateFees: (transaction: DailyTransaction | FXTransaction): number => {
    if (!transaction.paymentSchedule || transaction.isFullyPaid) {
      return 0;
    }

    const { lateFeeRate = 0, gracePeriod = 0 } = transaction.paymentSchedule;
    if (lateFeeRate === 0) return 0;

    const daysOverdue = paymentCalculations.calculateDaysOverdue(transaction);
    if (daysOverdue <= gracePeriod) return 0;

    const overdueAmount = paymentCalculations.calculateRemainingBalance(transaction);
    const overdueDays = daysOverdue - gracePeriod;
    
    // Calculate daily late fee rate
    const dailyRate = lateFeeRate / 100 / 365;
    return overdueAmount * dailyRate * overdueDays;
  },

  calculateNextPaymentDue: (transaction: DailyTransaction | FXTransaction): Date | null => {
    if (!transaction.paymentSchedule || transaction.isFullyPaid) {
      return null;
    }

    const { installments, nextPaymentDate } = transaction.paymentSchedule;
    
    // If there's a next payment date set, use it
    if (nextPaymentDate) {
      return nextPaymentDate;
    }

    // Find the next unpaid installment
    const nextInstallment = installments
      .filter(inst => inst.status === 'pending')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];

    return nextInstallment?.dueDate || null;
  },

  calculateDaysOverdue: (transaction: DailyTransaction | FXTransaction): number => {
    if (transaction.isFullyPaid) return 0;

    const nextDue = paymentCalculations.calculateNextPaymentDue(transaction);
    if (!nextDue) return 0;

    const today = new Date();
    const diffTime = today.getTime() - nextDue.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  },

  isPaymentOverdue: (transaction: DailyTransaction | FXTransaction): boolean => {
    return paymentCalculations.calculateDaysOverdue(transaction) > 0;
  },

  getPaymentProgress: (transaction: DailyTransaction | FXTransaction) => {
    const originalAmount = transaction.originalAmount || transaction.amount;
    const paidAmount = transaction.paidAmount || 0;
    const remainingAmount = originalAmount - paidAmount;
    const percentage = originalAmount > 0 ? (paidAmount / originalAmount) * 100 : 0;

    return {
      percentage: Math.min(100, Math.max(0, percentage)),
      paidAmount,
      remainingAmount: Math.max(0, remainingAmount),
      totalAmount: originalAmount
    };
  }
};

// Payment schedule utilities
export const paymentScheduleUtils = {
  // Create a payment schedule for a transaction
  createPaymentSchedule: (
    transactionId: string,
    totalAmount: number,
    type: PaymentScheduleType,
    options: {
      frequency?: string;
      numberOfInstallments?: number;
      startDate: Date;
      gracePeriod?: number;
      lateFeeRate?: number;
      autoCharge?: boolean;
    }
  ): PaymentSchedule => {
    const { 
      frequency, 
      numberOfInstallments, 
      startDate, 
      gracePeriod = 0, 
      lateFeeRate = 0, 
      autoCharge = false 
    } = options;

    let installments: PaymentInstallment[] = [];
    let endDate: Date | undefined;

    switch (type) {
      case PaymentScheduleType.LUMP_SUM:
        installments = [{
          id: `${transactionId}-inst-1`,
          transactionId,
          installmentNumber: 1,
          dueDate: startDate,
          amount: totalAmount,
          paidAmount: 0,
          status: 'pending'
        }];
        endDate = startDate;
        break;

      case PaymentScheduleType.INSTALLMENTS:
        if (!numberOfInstallments || numberOfInstallments < 2) {
          throw new Error('Number of installments must be at least 2');
        }
        
        const installmentAmount = totalAmount / numberOfInstallments;
        installments = Array.from({ length: numberOfInstallments }, (_, index) => {
          const installmentNumber = index + 1;
          const dueDate = new Date(startDate);
          
          // Calculate due date based on frequency
          if (frequency === 'monthly') {
            dueDate.setMonth(dueDate.getMonth() + index);
          } else if (frequency === 'weekly') {
            dueDate.setDate(dueDate.getDate() + (index * 7));
          } else if (frequency === 'biweekly') {
            dueDate.setDate(dueDate.getDate() + (index * 14));
          } else {
            // Default to monthly
            dueDate.setMonth(dueDate.getMonth() + index);
          }

          return {
            id: `${transactionId}-inst-${installmentNumber}`,
            transactionId,
            installmentNumber,
            dueDate,
            amount: installmentAmount,
            paidAmount: 0,
            status: 'pending'
          };
        });
        
        endDate = installments[installments.length - 1].dueDate;
        break;

      case PaymentScheduleType.FLEXIBLE:
        // For flexible payments, we don't create installments upfront
        // They will be created as payments are made
        installments = [];
        break;

      case PaymentScheduleType.RECURRING:
        // For recurring payments, create installments based on frequency
        if (!frequency) {
          throw new Error('Frequency is required for recurring payments');
        }
        
        const recurringAmount = totalAmount; // For recurring, each payment is the full amount
        installments = [{
          id: `${transactionId}-inst-1`,
          transactionId,
          installmentNumber: 1,
          dueDate: startDate,
          amount: recurringAmount,
          paidAmount: 0,
          status: 'pending'
        }];
        break;
    }

    return {
      id: `${transactionId}-schedule`,
      transactionId,
      type,
      frequency: frequency as any,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      startDate,
      endDate,
      installments,
      gracePeriod,
      lateFeeRate,
      autoCharge,
      nextPaymentDate: installments[0]?.dueDate
    };
  },

  // Process a payment and update the schedule
  processPayment: (
    schedule: PaymentSchedule,
    payment: PaymentHistory
  ): PaymentSchedule => {
    const updatedSchedule = { ...schedule };
    updatedSchedule.paidAmount += payment.amount;
    updatedSchedule.remainingAmount = Math.max(0, schedule.totalAmount - updatedSchedule.paidAmount);

    // Update installment if payment is for a specific installment
    if (payment.installmentId) {
      const installmentIndex = updatedSchedule.installments.findIndex(
        inst => inst.id === payment.installmentId
      );
      
      if (installmentIndex !== -1) {
        const installment = { ...updatedSchedule.installments[installmentIndex] };
        installment.paidAmount += payment.amount;
        
        if (installment.paidAmount >= installment.amount) {
          installment.status = 'paid';
          installment.paidDate = payment.paymentDate;
        }
        
        updatedSchedule.installments[installmentIndex] = installment;
      }
    } else {
      // If no specific installment, apply payment to oldest unpaid installment
      const unpaidInstallments = updatedSchedule.installments
        .filter(inst => inst.status !== 'paid')
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

      let remainingPayment = payment.amount;
      
      for (const installment of unpaidInstallments) {
        if (remainingPayment <= 0) break;
        
        const installmentIndex = updatedSchedule.installments.findIndex(
          inst => inst.id === installment.id
        );
        
        const amountToPay = Math.min(remainingPayment, installment.amount - installment.paidAmount);
        const updatedInstallment = { ...installment };
        updatedInstallment.paidAmount += amountToPay;
        
        if (updatedInstallment.paidAmount >= updatedInstallment.amount) {
          updatedInstallment.status = 'paid';
          updatedInstallment.paidDate = payment.paymentDate;
        }
        
        updatedSchedule.installments[installmentIndex] = updatedInstallment;
        remainingPayment -= amountToPay;
      }
    }

    // Update next payment date
    const nextUnpaidInstallment = updatedSchedule.installments
      .filter(inst => inst.status !== 'paid')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
    
    updatedSchedule.nextPaymentDate = nextUnpaidInstallment?.dueDate;

    return updatedSchedule;
  },

  // Add a new installment for flexible payments
  addInstallment: (
    schedule: PaymentSchedule,
    installment: Omit<PaymentInstallment, 'id' | 'transactionId'>
  ): PaymentSchedule => {
    const newInstallment: PaymentInstallment = {
      ...installment,
      id: `${schedule.transactionId}-inst-${schedule.installments.length + 1}`,
      transactionId: schedule.transactionId,
      paidAmount: 0,
      status: 'pending'
    };

    return {
      ...schedule,
      installments: [...schedule.installments, newInstallment],
      totalAmount: schedule.totalAmount + installment.amount,
      remainingAmount: schedule.remainingAmount + installment.amount
    };
  },

  // Calculate late fees for all overdue installments
  calculateTotalLateFees: (schedule: PaymentSchedule): number => {
    if (!schedule.lateFeeRate || schedule.lateFeeRate === 0) return 0;

    const today = new Date();
    let totalLateFees = 0;

    for (const installment of schedule.installments) {
      if (installment.status === 'paid') continue;

      const daysOverdue = Math.ceil(
        (today.getTime() - installment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue > (schedule.gracePeriod || 0)) {
        const overdueAmount = installment.amount - installment.paidAmount;
        const overdueDays = daysOverdue - (schedule.gracePeriod || 0);
        const dailyRate = schedule.lateFeeRate / 100 / 365;
        totalLateFees += overdueAmount * dailyRate * overdueDays;
      }
    }

    return totalLateFees;
  },

  // Get payment summary
  getPaymentSummary: (schedule: PaymentSchedule) => {
    const totalInstallments = schedule.installments.length;
    const paidInstallments = schedule.installments.filter(inst => inst.status === 'paid').length;
    const overdueInstallments = schedule.installments.filter(inst => 
      inst.status !== 'paid' && new Date() > inst.dueDate
    ).length;
    
    const totalLateFees = paymentScheduleUtils.calculateTotalLateFees(schedule);
    const isFullyPaid = schedule.remainingAmount <= 0;

    return {
      totalInstallments,
      paidInstallments,
      overdueInstallments,
      pendingInstallments: totalInstallments - paidInstallments,
      totalLateFees,
      isFullyPaid,
      progressPercentage: totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0
    };
  }
};

// Transaction status utilities
export const transactionStatusUtils = {
  // Update transaction status based on payment progress
  updateTransactionStatus: (transaction: DailyTransaction | FXTransaction): TransactionStatus => {
    if (transaction.isFullyPaid) {
      return TransactionStatus.COMPLETED;
    }

    if (paymentCalculations.isPaymentOverdue(transaction)) {
      return TransactionStatus.OVERDUE;
    }

    if (transaction.paidAmount > 0) {
      return TransactionStatus.PARTIALLY_PAID;
    }

    if (transaction.paymentSchedule?.type === PaymentScheduleType.RECURRING) {
      return TransactionStatus.SCHEDULED;
    }

    return TransactionStatus.PENDING;
  },

  // Get status color for UI
  getStatusColor: (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TransactionStatus.PARTIALLY_PAID:
        return 'bg-blue-100 text-blue-800';
      case TransactionStatus.OVERDUE:
        return 'bg-red-100 text-red-800';
      case TransactionStatus.SCHEDULED:
        return 'bg-purple-100 text-purple-800';
      case TransactionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case TransactionStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
};

// Payment validation utilities
export const paymentValidationUtils = {
  // Validate payment amount
  validatePaymentAmount: (
    amount: number, 
    transaction: DailyTransaction | FXTransaction
  ): { isValid: boolean; error?: string } => {
    if (amount <= 0) {
      return { isValid: false, error: 'Payment amount must be greater than 0' };
    }

    const remainingBalance = paymentCalculations.calculateRemainingBalance(transaction);
    
    if (amount > remainingBalance) {
      return { 
        isValid: false, 
        error: `Payment amount cannot exceed remaining balance of ${remainingBalance}` 
      };
    }

    return { isValid: true };
  },

  // Validate installment creation
  validateInstallment: (
    installment: Omit<PaymentInstallment, 'id' | 'transactionId'>,
    schedule: PaymentSchedule
  ): { isValid: boolean; error?: string } => {
    if (installment.amount <= 0) {
      return { isValid: false, error: 'Installment amount must be greater than 0' };
    }

    if (installment.dueDate < new Date()) {
      return { isValid: false, error: 'Due date cannot be in the past' };
    }

    return { isValid: true };
  }
};
