export interface Rail {
  id: string;
  name: string;
  volume: number;
  transactions: number;
  averageTime: string;
  fees: number;
  status: 'active' | 'inactive';
  pricingModel?: string;
  baseFee?: number;
  fixedFee?: number;
  recommended?: boolean;
  processingTime?: string;
  specialization?: string[];
}

export const railsData: Rail[] = [
  {
    id: '1',
    name: 'SWIFT',
    volume: 1250000,
    transactions: 450,
    averageTime: '24h',
    fees: 25,
    status: 'active',
    pricingModel: 'percentage',
    baseFee: 25,
    fixedFee: 10,
    recommended: true,
    processingTime: '24h',
    specialization: ['International']
  },
  {
    id: '2', 
    name: 'ACH',
    volume: 890000,
    transactions: 320,
    averageTime: '2-3 days',
    fees: 5,
    status: 'active',
    pricingModel: 'fixed',
    baseFee: 5,
    fixedFee: 2,
    recommended: false,
    processingTime: '2-3 days',
    specialization: ['Domestic']
  },
  {
    id: '3',
    name: 'Wire Transfer',
    volume: 2100000,
    transactions: 180,
    averageTime: '1-2h',
    fees: 45,
    status: 'active',
    pricingModel: 'fixed',
    baseFee: 45,
    fixedFee: 20,
    recommended: false,
    processingTime: '1-2h',
    specialization: ['Express']
  }
];