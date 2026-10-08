'use client';

import React, { useState } from 'react';
import { Button } from '@rn/brand';
import { calculatePaymentQuote, getPaymentMethodOptions, type Invoice, type PaymentMethod } from '@rn/db';

interface IssueInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: Omit<Invoice, 'id' | 'created_at'>) => Promise<void>;
}

export const IssueInvoiceModal: React.FC<IssueInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [clientId, setClientId] = useState('HELIOS-AI');
  const [clientName, setClientName] = useState('Helios Autonomous Labs');
  const [amount, setAmount] = useState<number>(45000);
  const [currency, setCurrency] = useState('USD');
  const [countryCode, setCountryCode] = useState('US');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || amount <= 0) return;

    const invoiceNum = `INV-RN-${Date.now().toString().slice(-6)}`;
    const selectedMethod = paymentOptions.find((option) => option.method === paymentMethod);
    if (!selectedMethod || selectedMethod.availability !== 'available' || !quote) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        client_id: clientId.trim().toUpperCase(),
        client_name: clientName.trim(),
        country_code: countryCode,
        invoice_number: invoiceNum,
        amount: quote.totalPayable,
        currency,
        payment_method: paymentMethod,
        payment_provider: selectedMethod.provider,
        subtotal: quote.subtotal,
        discount_rate: quote.discountRate,
        discount_amount: quote.discountAmount,
        tax_rate: quote.taxRate,
        tax_amount: quote.taxAmount,
        processing_fee: quote.processingFee,
        gateway_fee_rate: quote.gatewayFeeRate,
        gateway_fixed_fee: quote.gatewayFixedFee,
        settlement_status: 'pending',
        status: 'issued',
        due_date: dueDate,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentOptions = getPaymentMethodOptions(countryCode, currency);
  const selectedOption = paymentOptions.find((option) => option.method === paymentMethod) || paymentOptions[0];
  const quote = selectedOption?.availability === 'available' && Number(amount) > 0
    ? calculatePaymentQuote({
        subtotal: Number(amount),
        currency,
        countryCode,
        paymentMethod: selectedOption.method,
      })
    : null;

  const handleCountryChange = (nextCountryCode: string) => {
    setCountryCode(nextCountryCode);
    setCurrency(nextCountryCode === 'IN' ? 'INR' : 'USD');
    setPaymentMethod(nextCountryCode === 'IN' ? 'razorpay_domestic' : 'paypal');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 13, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#141923',
          border: '1px solid #1F2633',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 25px rgba(0, 82, 255, 0.1)',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.12em',
                  color: 'var(--nexus-cyan, #00D2FF)',
                }}
              >
                LEDGER // FINANCIAL VECTOR
              </span>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#FFFFFF',
                marginTop: '0.25rem',
              }}
            >
              Issue Institutional Invoice
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8A99AD',
              fontSize: '1.25rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                color: '#8A99AD',
                marginBottom: '0.5rem',
              }}
            >
              CLIENT CODE / TENANT ID
            </label>
            <input
              type="text"
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g. HELIOS-AI"
              style={{
                width: '100%',
                backgroundColor: '#1A212E',
                border: '1px solid #1F2633',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8125rem',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                color: '#8A99AD',
                marginBottom: '0.5rem',
              }}
            >
              CLIENT INSTITUTION NAME
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Helios Autonomous Labs"
              style={{
                width: '100%',
                backgroundColor: '#1A212E',
                border: '1px solid #1F2633',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: '0.8125rem',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  color: '#8A99AD',
                  marginBottom: '0.5rem',
                }}
              >
                BILLING COUNTRY
              </label>
              <select
                value={countryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1A212E',
                  border: '1px solid #1F2633',
                  padding: '0.65rem 0.85rem',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.8125rem',
                }}
              >
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="AE">United Arab Emirates</option>
                <option value="SG">Singapore</option>
                <option value="CA">Canada</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  color: '#8A99AD',
                  marginBottom: '0.5rem',
                }}
              >
                AMOUNT
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{
                  width: '100%',
                  backgroundColor: '#1A212E',
                  border: '1px solid #1F2633',
                  padding: '0.65rem 0.85rem',
                  color: '#00D2FF',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.8125rem',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  color: '#8A99AD',
                  marginBottom: '0.5rem',
                }}
              >
                CURRENCY
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1A212E',
                  border: '1px solid #1F2633',
                  padding: '0.65rem 0.85rem',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.8125rem',
                }}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                color: '#8A99AD',
                marginBottom: '0.5rem',
              }}
            >
              PAYMENT METHOD
            </label>
            <select
              value={selectedOption?.method || paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              style={{
                width: '100%',
                backgroundColor: '#1A212E',
                border: '1px solid #1F2633',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8125rem',
              }}
            >
              {paymentOptions.map((option) => (
                <option key={option.method} value={option.method} disabled={option.availability !== 'available'}>
                  {option.label}{option.availability === 'planned' ? ' (PLANNED)' : ''}
                </option>
              ))}
            </select>
          </div>

          {quote && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.5rem 1rem',
                padding: '0.85rem',
                backgroundColor: '#0A0D12',
                border: '1px solid #1F2633',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                color: '#8A99AD',
              }}
            >
              <span>SUBTOTAL</span><strong style={{ color: '#FFFFFF' }}>{quote.subtotal.toFixed(2)} {currency}</strong>
              <span>GST / TAX ({(quote.taxRate * 100).toFixed(1)}%)</span><strong style={{ color: '#FFFFFF' }}>{quote.taxAmount.toFixed(2)} {currency}</strong>
              <span>PROCESSING RECOVERY</span><strong style={{ color: '#FFFFFF' }}>{quote.processingFee.toFixed(2)} {currency}</strong>
              <span>TOTAL PAYABLE</span><strong style={{ color: '#00D2FF' }}>{quote.totalPayable.toFixed(2)} {currency}</strong>
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                color: '#8A99AD',
                marginBottom: '0.5rem',
              }}
            >
              SETTLEMENT DUE DATE
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#1A212E',
                border: '1px solid #1F2633',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8125rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'DISPATCHING...' : 'DISPATCH INVOICE'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
