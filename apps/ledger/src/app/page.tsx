'use client';

import React, { useState, useEffect } from 'react';
import { TopNav, TelemetryMetric, Button } from '@rn/brand';
import { getSupabaseClient, Invoice } from '@rn/db';
import { useAuth, AuthGuard, filterByTenantBoundary, UserRole } from '@rn/auth';
import { InvoiceMatrix } from '../components/InvoiceMatrix';
import { CashflowRadar } from '../components/CashflowRadar';
import { IssueInvoiceModal } from '../components/IssueInvoiceModal';

export default function LedgerPage() {
  const { session, role, switchRole } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSupabaseConnected(true);
    const fetchInvoices = async () => {
      try {
        const { data, error } = await supabase.from('invoices').select('*');
        if (!error && data && data.length > 0) {
          setInvoices(data as Invoice[]);
        }
      } catch (err) {
        console.warn('Supabase fetch fallback:', err);
      }
    };
    fetchInvoices();
  }, []);

  const handleCreateInvoice = async (
    newInvoice: Omit<Invoice, 'id' | 'created_at'>
  ) => {
    const record: Invoice = {
      ...newInvoice,
      id: `inv-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setInvoices((prev) => [record, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase as any).from('invoices').insert(newInvoice);
      } catch (err) {
        console.warn('Supabase insertion warning:', err);
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: newStatus,
              paid_date: newStatus === 'paid' ? new Date().toISOString() : inv.paid_date,
            }
          : inv
      )
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase as any)
          .from('invoices')
          .update({
            status: newStatus,
            paid_date: newStatus === 'paid' ? new Date().toISOString() : undefined,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }
  };

  // Multi-tenant boundary filtering: Contractors only see their assigned invoices
  const visibleInvoices = filterByTenantBoundary(invoices, session);

  const totalBilled = visibleInvoices.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const settledTotal = visibleInvoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const overdueTotal = visibleInvoices
    .filter((i) => i.status === 'overdue')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const navItems = [
    { label: 'INVOICE MATRIX', href: '#invoices', active: true },
    { label: 'CASHFLOW RADAR', href: '#radar', active: false },
    { label: 'ESCROW ACCOUNTS', href: '#escrow', active: false },
  ];

  return (
    <AuthGuard requiredApp="ledger" requiredPermission="financial:read">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav
          currentApp="ledger"
          navItems={navItems}
          rightAction={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIssueModalOpen(true)}
            >
              + ISSUE INVOICE
            </Button>
          }
        />

        <main className="rn-container" style={{ flex: 1, paddingTop: '1.5rem', paddingBottom: '3rem' }}>
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: 'var(--nexus-cyan, #00D2FF)',
                    textTransform: 'uppercase',
                  }}
                >
                  RIPPLE NEXUS // FISCAL SUITE
                </span>
                <span style={{ color: 'var(--nexus-border, #1F2633)' }}>|</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    color: supabaseConnected ? 'var(--status-nominal, #00E599)' : 'var(--nexus-slate, #8A99AD)',
                  }}
                >
                  {supabaseConnected ? '● SUPABASE ENCLAVE ACTIVE' : '○ STANDALONE MODE'}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: 'var(--nexus-white, #FFFFFF)',
                  marginTop: '0.25rem',
                }}
              >
                Institutional Billing & Cashflow Matrix
              </h1>
            </div>

            {/* Quick Role Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  color: 'var(--nexus-slate, #8A99AD)',
                }}
              >
                RBAC TEST:
              </span>
              {(['executive_admin', 'finance_director', 'client_contractor'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => switchRole(r, r === 'client_contractor' ? 'HELIOS-AI' : undefined)}
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.625rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: role === r ? '1px solid var(--nexus-cobalt, #0052FF)' : '1px solid var(--nexus-border, #1F2633)',
                    backgroundColor: role === r ? 'var(--nexus-surface3, #1A212E)' : 'transparent',
                    color: role === r ? 'var(--nexus-cyan, #00D2FF)' : 'var(--nexus-slate, #8A99AD)',
                    cursor: 'pointer',
                  }}
                >
                  {r.split('_')[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Telemetry Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <TelemetryMetric
              label="TOTAL BILLED VOLUME"
              value={`$${totalBilled.toLocaleString()}`}
              subValue={`${visibleInvoices.length} Invoices Active`}
              trend="up"
              statusColor="var(--nexus-cobalt)"
            />
            <TelemetryMetric
              label="SETTLED CAPITAL"
              value={`$${settledTotal.toLocaleString()}`}
              subValue="Verified in Escrow"
              trend="up"
              statusColor="var(--status-nominal)"
            />
            <TelemetryMetric
              label="OVERDUE EXPOSURE"
              value={`$${overdueTotal.toLocaleString()}`}
              subValue={overdueTotal > 0 ? 'Action Required' : 'Zero Arrears'}
              trend={overdueTotal > 0 ? 'down' : 'up'}
              statusColor={overdueTotal > 0 ? 'var(--status-critical)' : 'var(--status-nominal)'}
            />
            <TelemetryMetric
              label="FISCAL SETTLEMENT SLA"
              value="99.4%"
              subValue="T+0 Instant Settlement"
              trend="up"
              statusColor="var(--status-nominal)"
            />
          </div>

          {/* Main Layout Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
            <InvoiceMatrix
              invoices={visibleInvoices}
              onOpenIssue={() => setIssueModalOpen(true)}
              onUpdateStatus={handleUpdateStatus}
            />
            <CashflowRadar invoices={visibleInvoices} />
          </div>
        </main>

        <IssueInvoiceModal
          isOpen={issueModalOpen}
          onClose={() => setIssueModalOpen(false)}
          onSubmit={handleCreateInvoice}
        />
      </div>
    </AuthGuard>
  );
}
