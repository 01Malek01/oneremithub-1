// Updated rail data to match actual banking partners
export interface Rail {
  id: string;
  name: string;
  specialization: string[];
  pricingModel: 'bps' | 'bps_plus_fixed' | 'free';
  baseFee: number; // in basis points
  fixedFee?: number; // in USD
  corridorPricing?: {
    [key: string]: {
      baseFee: number;
      fixedFee?: number;
    };
  };
  processingTime: string;
  recommended: boolean;
  maxTransactionCap?: number;
  expectedTAT?: string;
  notes?: string;
  integrationStatus: 'manual' | 'api_ready' | 'api_integrated';
  supportedMethods: string[];
  regions: string[];
  status: 'online' | 'offline' | 'maintenance';
  lastStatusUpdate: string;
}

export const actualRailsData: Rail[] = [
  { 
    id: '1', 
    name: 'Dakota', 
    specialization: ['US Payouts', 'Domestic Transfers'],
    pricingModel: 'bps',
    baseFee: 10, // 10 basis points
    processingTime: '2-4 hours',
    recommended: true,
    maxTransactionCap: 1000000,
    expectedTAT: '4hr',
    notes: 'Primary US payout operations partner',
    integrationStatus: 'manual',
    supportedMethods: ['ACH', 'Wire Transfer', 'Real-time Payments'],
    regions: ['United States'],
    status: 'online',
    lastStatusUpdate: new Date().toISOString()
  },
  { 
    id: '2', 
    name: 'Backpack', 
    specialization: ['1st Party SWIFT'],
    pricingModel: 'free',
    baseFee: 0,
    processingTime: '24-48 hours',
    recommended: true,
    maxTransactionCap: 500000,
    expectedTAT: '48hr',
    notes: '1st party SWIFT transactions only - zero charges',
    integrationStatus: 'manual',
    supportedMethods: ['SWIFT MT103'],
    regions: ['Global'],
    status: 'online',
    lastStatusUpdate: new Date().toISOString()
  },
  { 
    id: '3', 
    name: 'Conduit', 
    specialization: ['Major Corridors', 'China Payments'],
    pricingModel: 'bps_plus_fixed',
    baseFee: 5, // 5bps for major corridors
    fixedFee: 55, // +$55 USD
    corridorPricing: {
      'major': { baseFee: 5, fixedFee: 55 },
      'china': { baseFee: 25, fixedFee: 55 }
    },
    processingTime: '12-24 hours',
    recommended: false,
    maxTransactionCap: 750000,
    expectedTAT: '24hr',
    notes: '5bps + $55 for major corridors, 25bps + $55 for China',
    integrationStatus: 'manual',
    supportedMethods: ['SWIFT', 'Local Rails'],
    regions: ['Europe', 'Asia-Pacific', 'China'],
    status: 'online',
    lastStatusUpdate: new Date().toISOString()
  },
  { 
    id: '4', 
    name: 'Nilos', 
    specialization: ['1st Party SWIFT', '3rd Party SWIFT', 'UK FPS'],
    pricingModel: 'bps',
    baseFee: 8, // Estimated
    processingTime: '1-24 hours',
    recommended: true,
    maxTransactionCap: 600000,
    expectedTAT: '24hr',
    notes: '1st and 3rd party SWIFT, UK FPS - API integration ready',
    integrationStatus: 'api_ready',
    supportedMethods: ['SWIFT MT103', 'SWIFT MT202', 'UK FPS'],
    regions: ['United Kingdom', 'Europe', 'Global'],
    status: 'online',
    lastStatusUpdate: new Date().toISOString()
  },
  { 
    id: '5', 
    name: 'Routefusion', 
    specialization: ['Multi-corridor', 'API Automation'],
    pricingModel: 'bps',
    baseFee: 12, // Estimated
    processingTime: '6-48 hours',
    recommended: false,
    maxTransactionCap: 800000,
    expectedTAT: '48hr',
    notes: 'API automation for fees and rates available',
    integrationStatus: 'api_ready',
    supportedMethods: ['SWIFT', 'Local Payment Rails', 'Digital Wallets'],
    regions: ['Global', 'Emerging Markets'],
    status: 'online',
    lastStatusUpdate: new Date().toISOString()
  },
];

// Enhanced transaction interface
export interface Transaction {
  id: string;
  date: string;
  rail: string;
  railId: string;
  amount: number;
  currency?: string;
  corridor?: string;
  fee: number;
  margin: number;
  status: string;
  tat: string;
  beneficiary: string;
  reference?: string;
  trackingNumber?: string;
  mt103File: string | null;
  notes: string;
  method?: string;
  region?: string;
}

// Updated transaction data
export const enhancedTransactions: Transaction[] = [
  {
    id: 'TX001',
    date: '2025-04-27',
    rail: 'Dakota',
    railId: '1',
    amount: 25000,
    currency: 'USD',
    corridor: 'US Domestic',
    fee: 25, // 10bps of 25000
    margin: 3.8,
    status: 'Completed',
    tat: '3 hours',
    beneficiary: 'Acme Corp Ltd.',
    reference: 'ORD-45678',
    trackingNumber: 'DKT20250427001',
    mt103File: null,
    notes: 'Monthly vendor payment via ACH',
    method: 'ACH',
    region: 'United States'
  },
  {
    id: 'TX002',
    date: '2025-04-26',
    rail: 'Conduit',
    railId: '3',
    amount: 35000,
    currency: 'EUR',
    corridor: 'Europe Major',
    fee: 230, // 5bps + $55
    margin: 4.2,
    status: 'Processing',
    tat: '18 hours',
    beneficiary: 'Global Imports Inc.',
    reference: 'ORD-45679',
    trackingNumber: 'CDT20250426005',
    mt103File: null,
    notes: 'Equipment purchase - major corridor',
    method: 'SWIFT',
    region: 'Europe'
  },
  {
    id: 'TX003',
    date: '2025-04-25',
    rail: 'Backpack',
    railId: '2',
    amount: 18000,
    currency: 'GBP',
    corridor: 'UK',
    fee: 0, // Zero charges
    margin: 2.5,
    status: 'Pending',
    tat: 'Pending',
    beneficiary: 'Tech Solutions LLC',
    reference: 'ORD-45680',
    mt103File: null,
    notes: '1st party SWIFT - no charges',
    method: 'SWIFT MT103',
    region: 'United Kingdom'
  },
  {
    id: 'TX004',
    date: '2025-04-24',
    rail: 'Nilos',
    railId: '4',
    amount: 22000,
    currency: 'GBP',
    corridor: 'UK FPS',
    fee: 176, // 8bps estimated
    margin: 3.8,
    status: 'Completed',
    tat: '45 minutes',
    beneficiary: 'Fast Payments Ltd.',
    reference: 'ORD-45681',
    mt103File: null,
    notes: 'UK FPS instant payment',
    method: 'UK FPS',
    region: 'United Kingdom'
  },
];

// Beneficiaries data (keep existing)
export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName?: string;
  swiftCode?: string;
}

export const beneficiariesData: Beneficiary[] = [
  { id: '1', name: 'Acme Corp Ltd.', accountNumber: 'AC123456789', bankName: 'Bank of America', swiftCode: 'BOFAUS3N' },
  { id: '2', name: 'Global Imports Inc.', accountNumber: 'GI987654321', bankName: 'Chase Bank', swiftCode: 'CHASUS33' },
  { id: '3', name: 'Tech Solutions LLC', accountNumber: 'TS543216789', bankName: 'Wells Fargo', swiftCode: 'WFBIUS6S' },
];

// Legacy exports for compatibility
export const initialRailsData = actualRailsData;
export const initialTransactions = enhancedTransactions;
