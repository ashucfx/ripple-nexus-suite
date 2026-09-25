'use client';

import React, { useState } from 'react';
import { Button } from '@rn/brand';
import type { Invoice } from '@rn/db';

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
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || amount <= 0) return;

    setIsSubmitting(true);
    const invoiceNum = `INV-RN-${Date.now().toString().slice(-6)}`;

    await onSubmit({
      client_id: clientId.trim().toUpperCase(),
      client_name: clientName.trim(),
      invoice_number: invoiceNum,
      amount: Number(amount),
      currency,
      status: 'issued',
      due_date: dueDate,
    });

    setIsSubmitting(false);
    onClose();
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

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
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
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="USDC">USDC (Base)</option>
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
