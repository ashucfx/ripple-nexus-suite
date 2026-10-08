export type PaymentProvider = 'razorpay' | 'paypal' | 'bank_transfer' | 'cashfree' | 'stripe';
export type PaymentMethod =
  | 'razorpay_domestic'
  | 'razorpay_international'
  | 'paypal'
  | 'bank_native'
  | 'bank_swift'
  | 'cashfree'
  | 'stripe';

export type PaymentAvailability = 'available' | 'planned' | 'unavailable';

export interface PaymentMethodOption {
  method: PaymentMethod;
  provider: PaymentProvider;
  availability: PaymentAvailability;
  currency: string;
  label: string;
  feeRate: number;
  fixedFee: number;
  disabledReason?: string;
}

export interface PaymentQuoteInput {
  subtotal: number;
  currency: string;
  countryCode: string;
  paymentMethod: PaymentMethod;
  discountRate?: number;
  taxRate?: number;
}

export interface PaymentQuote {
  currency: string;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  taxRate: number;
  taxAmount: number;
  gatewayFeeRate: number;
  gatewayFixedFee: number;
  processingFee: number;
  totalPayable: number;
  expectedNetSettlement: number;
}

export const PAYMENT_FEE_RATES: Record<PaymentMethod, { rate: number; fixedFee: number }> = {
  razorpay_domestic: { rate: 0.0295, fixedFee: 0 },
  razorpay_international: { rate: 0.0554, fixedFee: 0 },
  paypal: { rate: 0.09, fixedFee: 0.3 },
  bank_native: { rate: 0.0118, fixedFee: 0 },
  bank_swift: { rate: 0.0354, fixedFee: 0 },
  cashfree: { rate: 0, fixedFee: 0 },
  stripe: { rate: 0, fixedFee: 0 },
};

const roundCurrency = (amount: number, currency: string): number => {
  const zeroDecimalCurrencies = new Set(['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'TWD', 'HUF', 'UGX']);
  return zeroDecimalCurrencies.has(currency.toUpperCase())
    ? Math.ceil(amount)
    : Math.ceil(amount * 100) / 100;
};

const isIndia = (countryCode: string): boolean => countryCode.trim().toUpperCase() === 'IN';

export function getPaymentMethodOptions(countryCode: string, currency: string): PaymentMethodOption[] {
  const india = isIndia(countryCode);
  const normalizedCurrency = currency.trim().toUpperCase();

  if (india) {
    return [
      {
        method: 'razorpay_domestic',
        provider: 'razorpay',
        availability: 'available',
        currency: normalizedCurrency || 'INR',
        label: 'Razorpay UPI, NetBanking and Cards',
        feeRate: PAYMENT_FEE_RATES.razorpay_domestic.rate,
        fixedFee: 0,
      },
      {
        method: 'cashfree',
        provider: 'cashfree',
        availability: 'planned',
        currency: normalizedCurrency || 'INR',
        label: 'Cashfree Domestic Payments',
        feeRate: 0,
        fixedFee: 0,
        disabledReason: 'Cashfree access is planned and not configured yet.',
      },
      {
        method: 'paypal',
        provider: 'paypal',
        availability: 'unavailable',
        currency: normalizedCurrency || 'INR',
        label: 'PayPal',
        feeRate: PAYMENT_FEE_RATES.paypal.rate,
        fixedFee: PAYMENT_FEE_RATES.paypal.fixedFee,
        disabledReason: 'PayPal is disabled for domestic India invoices.',
      },
    ];
  }

  return [
    {
      method: 'paypal',
      provider: 'paypal',
      availability: 'available',
      currency: normalizedCurrency || 'USD',
      label: 'PayPal Invoice',
      feeRate: PAYMENT_FEE_RATES.paypal.rate,
      fixedFee: PAYMENT_FEE_RATES.paypal.fixedFee,
    },
    {
      method: 'bank_native',
      provider: 'bank_transfer',
      availability: 'available',
      currency: normalizedCurrency || 'USD',
      label: 'Local Bank Transfer',
      feeRate: PAYMENT_FEE_RATES.bank_native.rate,
      fixedFee: 0,
    },
    {
      method: 'bank_swift',
      provider: 'bank_transfer',
      availability: 'available',
      currency: normalizedCurrency || 'USD',
      label: 'SWIFT Bank Transfer',
      feeRate: PAYMENT_FEE_RATES.bank_swift.rate,
      fixedFee: 0,
    },
    {
      method: 'razorpay_international',
      provider: 'razorpay',
      availability: 'available',
      currency: normalizedCurrency || 'USD',
      label: 'Razorpay International',
      feeRate: PAYMENT_FEE_RATES.razorpay_international.rate,
      fixedFee: 0,
    },
    {
      method: 'stripe',
      provider: 'stripe',
      availability: 'planned',
      currency: normalizedCurrency || 'USD',
      label: 'Stripe',
      feeRate: 0,
      fixedFee: 0,
      disabledReason: 'Stripe access is planned and not configured yet.',
    },
  ];
}

export function calculatePaymentQuote(input: PaymentQuoteInput): PaymentQuote {
  if (!Number.isFinite(input.subtotal) || input.subtotal <= 0) {
    throw new Error('Subtotal must be a positive finite amount.');
  }

  const discountRate = Math.min(Math.max(input.discountRate || 0, 0), 1);
  const discountAmount = roundCurrency(input.subtotal * discountRate, input.currency);
  const subtotalAfterDiscount = roundCurrency(input.subtotal - discountAmount, input.currency);
  const taxRate = input.taxRate ?? (isIndia(input.countryCode) ? 0.18 : 0);
  const taxAmount = roundCurrency(subtotalAfterDiscount * Math.max(taxRate, 0), input.currency);
  const taxableTotal = subtotalAfterDiscount + taxAmount;
  const fees = PAYMENT_FEE_RATES[input.paymentMethod];

  if (!fees) throw new Error(`Unsupported payment method: ${input.paymentMethod}`);
  if (input.paymentMethod === 'stripe' || input.paymentMethod === 'cashfree') {
    throw new Error(`${input.paymentMethod} is not configured.`);
  }

  const totalPayable = roundCurrency(
    (taxableTotal + fees.fixedFee) / (1 - fees.rate),
    input.currency,
  );
  const processingFee = roundCurrency(totalPayable - taxableTotal, input.currency);
  const expectedNetSettlement = roundCurrency(
    totalPayable * (1 - fees.rate) - fees.fixedFee,
    input.currency,
  );

  return {
    currency: input.currency.toUpperCase(),
    subtotal: roundCurrency(input.subtotal, input.currency),
    discountRate,
    discountAmount,
    subtotalAfterDiscount,
    taxRate,
    taxAmount,
    gatewayFeeRate: fees.rate,
    gatewayFixedFee: fees.fixedFee,
    processingFee,
    totalPayable,
    expectedNetSettlement,
  };
}
