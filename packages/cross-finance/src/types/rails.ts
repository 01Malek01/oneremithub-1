
import { Transaction } from '@/data/railsData';

export interface RemittanceHistoryItem {
  id: number;
  transactionId: string;
  beneficiary: string;
  date: string;
  amount: number;
  currency: string;
}

export interface RemittanceFormData {
  beneficiary: string;
  beneficiaryBank: string;
  swiftCode: string;
  accountNumber: string;
  amount: number;
  currency: string;
  valueDate: string;
  reference: string;
  details: string;
}
