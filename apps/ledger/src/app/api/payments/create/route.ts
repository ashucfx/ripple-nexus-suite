import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database, Invoice, PaymentMethod } from '@rn/db';
import type { PostgrestError } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INTERNAL_ROLES = new Set([
  'executive_admin',
  'systems_architect',
  'operations_lead',
  'security_officer',
]);

interface InvoiceTable {
  select(columns: string): {
    eq(column: string, value: string): {
      single(): Promise<{ data: Invoice | null; error: PostgrestError | null }>;
    };
  };
  update(values: Partial<Invoice>): {
    eq(column: string, value: string): Promise<{ error: PostgrestError | null }>;
  };
}

interface PaymentAccountTable {
  select(columns: string): {
    eq(column: string, value: string): {
      eq(column: string, value: string): {
        eq(column: string, value: boolean): {
          limit(count: number): {
            maybeSingle(): Promise<{ data: PaymentAccount | null; error: PostgrestError | null }>;
          };
        };
      };
    };
  };
}

interface PaymentAccount {
  id: string;
  display_name: string;
  provider_reference?: string;
  encrypted_instructions?: string;
  currency: string;
  country?: string;
  rail: 'native' | 'swift';
}

const PAYPAL_SUPPORTED_CURRENCIES = new Set([
  'AUD', 'BRL', 'CAD', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF',
  'ILS', 'JPY', 'MYR', 'MXN', 'NOK', 'NZD', 'PHP', 'PLN', 'RUB', 'SGD',
  'SEK', 'CHF', 'TWD', 'THB', 'USD',
]);

const toSmallestUnit = (amount: number, currency: string): number => {
  const zeroDecimalCurrencies = new Set(['JPY', 'KRW', 'VND', 'IDR', 'CLP', 'TWD', 'HUF', 'UGX']);
  return zeroDecimalCurrencies.has(currency.toUpperCase())
    ? Math.round(amount)
    : Math.round(amount * 100);
};

const readError = async (response: Response): Promise<string> => {
  const body = await response.json().catch(() => ({}));
  return body?.error?.description || body?.message || `Provider returned ${response.status}`;
};

const getServerSupabase = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('Supabase server configuration is incomplete.');

  const cookieStore = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Cookie writes can fail in a read-only route context.
        }
      },
    },
  });
};

const createRazorpayLink = async (invoice: Invoice) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay is not configured.');

  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: toSmallestUnit(invoice.amount, invoice.currency),
      currency: invoice.currency,
      accept_partial: false,
      description: `Ripple Nexus invoice ${invoice.invoice_number}`,
      customer: {
        name: invoice.client_name,
        email: invoice.client_email,
      },
      notify: { email: true, sms: false },
      reminder_enable: true,
      notes: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        tenant_id: invoice.tenant_id,
      },
      expire_by: Math.floor(new Date(invoice.due_date).getTime() / 1000),
    }),
  });

  if (!response.ok) throw new Error(`Razorpay: ${await readError(response)}`);
  const data = await response.json();
  return { providerPaymentId: data.id as string, providerReference: data.short_url as string };
};

const getPaypalToken = async (): Promise<string> => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('PayPal is not configured.');

  const baseUrl = process.env.PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new Error(`PayPal auth: ${await readError(response)}`);
  const data = await response.json();
  return data.access_token as string;
};

const createPaypalInvoice = async (invoice: Invoice) => {
  if (!invoice.client_email) throw new Error('PayPal requires a billing email.');
  if (!PAYPAL_SUPPORTED_CURRENCIES.has(invoice.currency.toUpperCase())) {
    throw new Error(`PayPal does not support ${invoice.currency}; select bank transfer or Razorpay international.`);
  }

  const token = await getPaypalToken();
  const baseUrl = process.env.PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
  const response = await fetch(`${baseUrl}/v2/invoicing/invoices`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `rn-invoice-${invoice.id}`,
    },
    body: JSON.stringify({
      detail: {
        invoice_number: invoice.invoice_number,
        currency_code: invoice.currency.toUpperCase(),
        payment_term: { term_type: 'DUE_ON_DATE_SPECIFIED', due_date: invoice.due_date.split('T')[0] },
        memo: `Ripple Nexus invoice ${invoice.invoice_number}`,
      },
      primary_recipients: [{
        billing_info: {
          name: { full_name: invoice.client_name || invoice.client_id },
          email_address: invoice.client_email,
        },
      }],
      items: [{
        name: 'Ripple Nexus services',
        quantity: '1',
        unit_amount: { currency_code: invoice.currency.toUpperCase(), value: invoice.amount.toFixed(2) },
      }],
      configuration: { allow_tip: false, tax_inclusive: true },
    }),
  });

  if (!response.ok) throw new Error(`PayPal: ${await readError(response)}`);
  const location = response.headers.get('location') || '';
  const data = await response.json().catch(() => ({}));
  const providerPaymentId = (location.split('/').pop() || data.id) as string;
  if (!providerPaymentId) throw new Error('PayPal did not return an invoice identifier.');

  const sendResponse = await fetch(`${baseUrl}/v2/invoicing/invoices/${providerPaymentId}/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ send_to_recipient: true, send_to_invoicer: false }),
  });
  if (!sendResponse.ok) throw new Error(`PayPal send: ${await readError(sendResponse)}`);

  const payerBase = process.env.PAYPAL_ENV === 'sandbox'
    ? 'https://www.sandbox.paypal.com'
    : 'https://www.paypal.com';
  return {
    providerPaymentId,
    providerReference: `${payerBase}/invoice/p/#${providerPaymentId}`,
  };
};

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const role = userData.user?.app_metadata.role;
    if (userError || !userData.user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    if (typeof role !== 'string' || !INTERNAL_ROLES.has(role)) {
      return NextResponse.json({ error: 'Internal payment operator permission required.' }, { status: 403 });
    }

    const body = await request.json() as { invoiceId?: string; paymentMethod?: PaymentMethod };
    if (!body.invoiceId || !body.paymentMethod) {
      return NextResponse.json({ error: 'invoiceId and paymentMethod are required.' }, { status: 400 });
    }

    const invoiceTable = supabase.from('invoices') as unknown as InvoiceTable;
    const { data: invoice, error: invoiceError } = await invoiceTable
      .select('*')
      .eq('id', body.invoiceId)
      .single();
    if (invoiceError || !invoice) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
    if (invoice.status === 'paid') return NextResponse.json({ error: 'Invoice is already paid.' }, { status: 409 });

    if (body.paymentMethod === 'cashfree' || body.paymentMethod === 'stripe') {
      return NextResponse.json({ error: `${body.paymentMethod} is planned but not configured.` }, { status: 501 });
    }

    if (body.paymentMethod === 'bank_native' || body.paymentMethod === 'bank_swift') {
      const rail = body.paymentMethod === 'bank_swift' ? 'swift' : 'native';
      const paymentAccountTable = supabase.from('rn_payment_accounts') as unknown as PaymentAccountTable;
      const { data: account } = await paymentAccountTable
        .select('id, display_name, provider_reference, encrypted_instructions, currency, country, rail')
        .eq('currency', invoice.currency)
        .eq('rail', rail)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      if (!account) return NextResponse.json({ error: `No active ${rail} bank account is configured.` }, { status: 409 });
      return NextResponse.json({ method: body.paymentMethod, invoiceId: invoice.id, account });
    }

    const result = body.paymentMethod === 'paypal'
      ? await createPaypalInvoice(invoice)
      : await createRazorpayLink(invoice);
    const provider = body.paymentMethod === 'paypal' ? 'paypal' : 'razorpay';

    const { error: updateError } = await invoiceTable
      .update({
        payment_method: body.paymentMethod,
        payment_provider: provider,
        provider_payment_id: result.providerPaymentId,
        provider_reference: result.providerReference,
        settlement_status: 'pending',
        status: 'issued',
      })
      .eq('id', invoice.id);
    if (updateError) throw updateError;

    return NextResponse.json({
      invoiceId: invoice.id,
      provider,
      providerPaymentId: result.providerPaymentId,
      paymentUrl: result.providerReference,
    }, { status: 201 });
  } catch (error) {
    console.error('[Ledger payments] create failed:', error);
    return NextResponse.json({ error: 'Unable to create payment instruction.' }, { status: 500 });
  }
}
