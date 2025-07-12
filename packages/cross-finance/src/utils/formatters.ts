import { Currency } from '@/types/transactions';

// Currency formatting options
const currencyOptions: Record<Currency, { symbol: string; locale: string; minimumFractionDigits: number }> = {
  NGN: { symbol: '₦', locale: 'en-NG', minimumFractionDigits: 2 },
  USD: { symbol: '$', locale: 'en-US', minimumFractionDigits: 2 },
  GBP: { symbol: '£', locale: 'en-GB', minimumFractionDigits: 2 },
  CAD: { symbol: 'C$', locale: 'en-CA', minimumFractionDigits: 2 },
  EUR: { symbol: '€', locale: 'en-EU', minimumFractionDigits: 2 }
};

/**
 * Format currency amount with proper symbol and formatting
 * @param amount - The amount to format
 * @param currency - The currency code (defaults to NGN)
 * @param options - Additional formatting options
 */
export const formatCurrency = (
  amount: number, 
  currency: Currency = 'NGN',
  options?: {
    showSymbol?: boolean;
    compact?: boolean;
    minimumFractionDigits?: number;
  }
): string => {
  const { showSymbol = true, compact = false, minimumFractionDigits } = options || {};
  const currencyConfig = currencyOptions[currency];
  
  if (isNaN(amount) || !isFinite(amount)) {
    return showSymbol ? `${currencyConfig.symbol}0.00` : '0.00';
  }

  const formatterOptions: Intl.NumberFormatOptions = {
    style: 'decimal',
    minimumFractionDigits: minimumFractionDigits ?? currencyConfig.minimumFractionDigits,
    maximumFractionDigits: 2,
    ...(compact && { notation: 'compact', compactDisplay: 'short' })
  };

  const formattedNumber = new Intl.NumberFormat(currencyConfig.locale, formatterOptions).format(amount);
  
  return showSymbol ? `${currencyConfig.symbol}${formattedNumber}` : formattedNumber;
};

/**
 * Format Naira amount specifically (most common use case)
 * @param amount - The amount in Naira
 * @param options - Additional formatting options
 */
export const formatNaira = (
  amount: number,
  options?: {
    showSymbol?: boolean;
    compact?: boolean;
    minimumFractionDigits?: number;
  }
): string => {
  return formatCurrency(amount, 'NGN', options);
};

/**
 * Format date with various options
 * @param date - The date to format
 * @param options - Formatting options
 */
export const formatDate = (
  date: Date | string,
  options: {
    format?: 'short' | 'long' | 'time' | 'relative' | 'input';
    includeTime?: boolean;
  } = {}
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const { format = 'short', includeTime = false } = options;

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(includeTime && {
          hour: '2-digit',
          minute: '2-digit'
        })
      });

    case 'long':
      return dateObj.toLocaleDateString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...(includeTime && {
          hour: '2-digit',
          minute: '2-digit'
        })
      });

    case 'time':
      return dateObj.toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit'
      });

    case 'input':
      return dateObj.toISOString().split('T')[0];

    case 'relative':
      return getRelativeTimeString(dateObj);

    default:
      return dateObj.toLocaleDateString('en-NG');
  }
};

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * @param date - The date to compare
 */
const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Format percentage
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (isNaN(value) || !isFinite(value)) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with K, M, B suffixes
 * @param value - The number to format
 * @param currency - The currency for formatting
 */
export const formatCompactNumber = (value: number, currency: Currency = 'NGN'): string => {
  const currencyConfig = currencyOptions[currency];
  
  if (isNaN(value) || !isFinite(value)) {
    return `${currencyConfig.symbol}0`;
  }

  const formatter = new Intl.NumberFormat(currencyConfig.locale, {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  return `${currencyConfig.symbol}${formatter.format(value)}`;
};

/**
 * Format phone number for Nigerian format
 * @param phoneNumber - The phone number to format
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle Nigerian phone numbers
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // Convert 08012345678 to +234 801 234 5678
    return `+234 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 14 && cleaned.startsWith('234')) {
    // Convert 2348012345678 to +234 801 234 5678
    return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  } else if (cleaned.length === 10) {
    // Convert 8012345678 to +234 801 234 5678
    return `+234 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  // Return as is if no pattern matches
  return phoneNumber;
};

/**
 * Format account number for Nigerian banks
 * @param accountNumber - The account number to format
 */
export const formatAccountNumber = (accountNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = accountNumber.replace(/\D/g, '');
  
  // Format as XXXX-XXXX-XXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
  }
  
  return accountNumber;
};

/**
 * Format amount for display in Nigerian context
 * @param amount - The amount in Naira
 * @param options - Formatting options
 */
export const formatNigerianAmount = (
  amount: number,
  options: {
    showKobo?: boolean;
    compact?: boolean;
    showWords?: boolean;
  } = {}
): string => {
  const { showKobo = true, compact = false, showWords = false } = options;
  
  if (isNaN(amount) || !isFinite(amount)) {
    return '₦0.00';
  }

  // Format the number
  let formatted = formatNaira(amount, { 
    showSymbol: true, 
    compact,
    minimumFractionDigits: showKobo ? 2 : 0 
  });

  // Add words if requested
  if (showWords && amount > 0) {
    const words = numberToWords(amount);
    formatted += ` (${words})`;
  }

  return formatted;
};

/**
 * Convert number to words (Nigerian English)
 * @param num - The number to convert
 */
const numberToWords = (num: number): string => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

  if (num === 0) return 'zero';
  if (num < 0) return 'negative ' + numberToWords(Math.abs(num));

  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  }
  if (num < 1000) {
    return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' and ' + numberToWords(num % 100) : '');
  }
  if (num < 1000000) {
    return numberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
  }
  if (num < 1000000000) {
    return numberToWords(Math.floor(num / 1000000)) + ' million' + (num % 1000000 !== 0 ? ' ' + numberToWords(num % 1000000) : '');
  }
  
  return numberToWords(Math.floor(num / 1000000000)) + ' billion' + (num % 1000000000 !== 0 ? ' ' + numberToWords(num % 1000000000) : '');
};

// Number formatting utilities
export const formatNumber = (
  value: number, 
  options: {
    decimals?: number;
    locale?: string;
    compact?: boolean;
  } = {}
): string => {
  const { decimals = 2, locale = 'en-US', compact = false } = options;
  
  if (compact) {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: decimals,
    }).format(value);
  }
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Credit card number formatting
export const formatCreditCard = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})(\d{4})$/);
  
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  
  return cardNumber;
};

// Truncate text with ellipsis
export const truncateText = (
  text: string, 
  maxLength: number, 
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

// Format transaction ID
export const formatTransactionId = (id: string): string => {
  if (id.length <= 8) return id;
  return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
};

// Format amount with currency symbol
export const formatAmount = (
  amount: number, 
  currency: string = 'USD'
): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    NGN: '₦',
  };
  
  const symbol = symbols[currency] || currency;
  return `${symbol}${formatNumber(amount)}`;
};

// Format profit/loss with color
export const formatProfitLoss = (value: number): {
  formatted: string;
  isPositive: boolean;
  color: string;
} => {
  const isPositive = value >= 0;
  const formatted = formatCurrency(Math.abs(value));
  
  return {
    formatted: `${isPositive ? '+' : '-'}${formatted}`,
    isPositive,
    color: isPositive ? 'text-green-600' : 'text-red-600',
  };
}; 