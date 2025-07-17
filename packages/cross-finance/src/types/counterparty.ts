export interface Counterparty {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  // Add any other fields that your counterparties table has
}

export interface AddCounterpartyData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}
