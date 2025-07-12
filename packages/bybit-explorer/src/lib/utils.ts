import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: string | number): string {
  if (!value || value === '' || isNaN(Number(value))) {
    console.debug('formatNumber: Invalid value:', { value, type: typeof value });
    return value?.toString() || '';
  }
  
  const num = Number(value);
  console.debug('formatNumber: Processing value:', { original: value, converted: num });
  return num.toLocaleString();
}

export function formatTokenQuantity(value: string | number): string {
  if (!value || value === '' || isNaN(Number(value))) {
    console.debug('formatTokenQuantity: Invalid value:', { value, type: typeof value });
    return value?.toString() || '';
  }
  
  const num = Number(value);
  console.debug('formatTokenQuantity: Processing value:', { original: value, converted: num });
  return num.toFixed(2);
}

export function formatNairaAmount(value: string | number): string {
  if (!value || value === '' || isNaN(Number(value))) {
    console.debug('formatNairaAmount: Invalid value:', { value, type: typeof value });
    return value?.toString() || '';
  }
  
  // The value from the API is already in NGN, no need for conversion
  const amount = Number(value);
  console.debug('formatNairaAmount: Processing value:', { 
    original: value, 
    amount
  });
  
  return amount.toLocaleString('en-NG', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}
