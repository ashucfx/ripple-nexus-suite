'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import type { Invoice } from '@rn/db';

interface InvoiceMatrixProps {
  invoices: Invoice[];
  onOpenIssue: () => void;
  onUpdateStatus: (id: string, newStatus: Invoice['status']) => void;
}

export const InvoiceMatrix: React.FC<InvoiceMatrixProps> = ({
  invoices,
  onOpenIssue,
  onUpdateStatus,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.client_id && inv.client_id.toLowerCase().includes(search.toLowerCase())) ||
      (inv.client_name && inv.client_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'nominal';
      case 'issued':
        return 'live';
      case 'overdue':
        return 'critical';
      default:
        return 'default';
    }
  };

  return (
    <Card className="ledger-invoice-matrix">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--nexus-border, #1F2633)',
          paddingBottom: '0.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--nexus-cobalt, #0052FF)',
                boxShadow: '0 0 8px var(--nexus-cobalt, #0052FF)',
              }}
            />
            <h3
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--nexus-white, #FFFFFF)',
                margin: 0,
              }}
            >
              INSTITUTIONAL BILLING MATRIX
            </h3>
          </div>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--nexus-slate, #8A99AD)',
              marginTop: '2px',
            }}
          >
            Real-time accounts receivable and capital settlement ledger
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search invoice # or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rn-input"
            style={{ width: '220px', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rn-input"
            style={{
              width: '130px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <option value="all">ALL INVOICES</option>
            <option value="draft">DRAFT</option>
            <option value="issued">ISSUED</option>
            <option value="paid">PAID</option>
            <option value="overdue">OVERDUE</option>
          </select>

          <Button variant="primary" size="sm" onClick={onOpenIssue}>
            + ISSUE INVOICE
          </Button>
        </div>
      </div>

      <div className="rn-table-container">
        <table className="rn-table">
          <thead>
            <tr>
              <th>INVOICE #</th>
              <th>CLIENT CODE</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>DUE DATE</th>
              <th>SETTLEMENT</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--nexus-slate)' }}>
                  [LEDGER CLEAR] Zero invoices recorded. Click <strong>+ ISSUE INVOICE</strong> to generate billing vector.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--nexus-cyan)' }}>
                    {inv.invoice_number}
                  </td>
                  <td style={{ fontWeight: 600 }}>{inv.client_id}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    ${inv.amount.toLocaleString()} {inv.currency || 'USD'}
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(inv.status)}>
                      {inv.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--nexus-slate)' }}>
                    {new Date(inv.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: inv.paid_date ? '#10B981' : 'var(--nexus-slate)' }}>
                    {inv.paid_date ? `Paid ${new Date(inv.paid_date).toLocaleDateString()}` : 'Pending'}
                  </td>
                  <td>
                    {inv.status !== 'paid' ? (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(inv.id, 'paid')}
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid #10B981',
                          color: '#10B981',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.625rem',
                          fontFamily: 'var(--font-mono)',
                          cursor: 'pointer',
                        }}
                      >
                        MARK PAID
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.6875rem', color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                        ✓ SETTLED
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
