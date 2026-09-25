'use client';

import React, { useState, useEffect } from 'react';
import { TopNav, TelemetryMetric, Button } from '@rn/brand';
import { getSupabaseClient, Client } from '@rn/db';
import { useAuth, AuthGuard, UserRole } from '@rn/auth';
import { ClientMatrix } from '../components/ClientMatrix';
import { ClientHealthRadar } from '../components/ClientHealthRadar';
import { OnboardClientModal } from '../components/OnboardClientModal';

export default function AtlasPage() {
  const { role, switchRole } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSupabaseConnected(true);
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase.from('clients').select('*');
        if (!error && data && data.length > 0) {
          setClients(data as Client[]);
        }
      } catch (err) {
        console.warn('Supabase fetch fallback:', err);
      }
    };
    fetchClients();
  }, []);

  const handleOnboardClient = async (
    newClient: Omit<Client, 'id' | 'created_at'>
  ) => {
    const record: Client = {
      ...newClient,
      id: `client-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setClients((prev) => [record, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase as any).from('clients').insert(newClient);
      } catch (err) {
        console.warn('Supabase insertion warning:', err);
      }
    }
  };

  const activeCount = clients.filter((c) => c.status === 'active').length;
  const totalMrr = clients.reduce((acc, c) => acc + (c.mrr || 0), 0);
  const enterpriseCount = clients.filter((c) => c.tier === 'enterprise').length;

  const navItems = [
    { label: 'PORTFOLIO MATRIX', href: '#portfolio', active: true },
    { label: 'HEALTH RADAR', href: '#radar', active: false },
    { label: 'CONTRACTS', href: '#contracts', active: false },
  ];

  return (
    <AuthGuard requiredApp="atlas">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav
          currentApp="atlas"
          navItems={navItems}
          rightAction={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setOnboardModalOpen(true)}
            >
              + ONBOARD
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
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.12em',
                    color: 'var(--nexus-cyan)',
                    textTransform: 'uppercase',
                  }}
                >
                  // RIPPLE NEXUS ATLAS
                </span>
                <span style={{ color: 'var(--nexus-border)' }}>•</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: supabaseConnected ? 'var(--status-nominal)' : 'var(--nexus-slate)',
                  }}
                >
                  {supabaseConnected ? 'SUPABASE CLOUD ACTIVE' : 'LOCAL CLUSTER MODE'}
                </span>
                <span style={{ color: 'var(--nexus-border)' }}>•</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--nexus-slate)' }}>
                    CLEARANCE:
                  </span>
                  <select
                    value={role}
                    onChange={(e) => switchRole(e.target.value as UserRole)}
                    className="rn-input"
                    style={{ width: 'auto', padding: '0.15rem 0.4rem', fontSize: '0.625rem', fontFamily: 'var(--font-mono)' }}
                  >
                    <option value="executive_admin">EXECUTIVE ADMIN</option>
                    <option value="systems_architect">SYSTEMS ARCHITECT</option>
                    <option value="operations_lead">OPERATIONS LEAD</option>
                    <option value="auditor">AUDITOR</option>
                  </select>
                </div>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.875rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF',
                  marginTop: '0.25rem',
                }}
              >
                Client Relationship &amp; Intelligence Matrix
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setOnboardModalOpen(true)}
              >
                + ONBOARD CLIENT
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="hub-metric-grid" style={{ marginBottom: '1.5rem' }}>
            <TelemetryMetric
              label="TOTAL ACCOUNTS"
              value={clients.length}
              subValue="Contracted entities"
              trend="up"
              statusColor="var(--nexus-cobalt)"
            />
            <TelemetryMetric
              label="ACTIVE CONTRACTS"
              value={activeCount}
              subValue="In production"
              trend="up"
              statusColor="var(--status-nominal)"
            />
            <TelemetryMetric
              label="ENTERPRISE TIERS"
              value={enterpriseCount}
              subValue="P0 SLA priority"
              trend="neutral"
              statusColor="var(--nexus-cyan)"
            />
            <TelemetryMetric
              label="TOTAL RUNRATE MRR"
              value={`$${(totalMrr / 1000).toFixed(0)}k`}
              subValue="Monthly recurring"
              trend="up"
              statusColor="var(--nexus-cobalt)"
            />
            <TelemetryMetric
              label="AVERAGE HEALTH"
              value="98.2%"
              subValue="Zero churn risk"
              trend="up"
              statusColor="var(--status-nominal)"
            />
            <TelemetryMetric
              label="SLA FIDELITY"
              value="100%"
              subValue="Zero violations"
              trend="up"
              statusColor="var(--status-nominal)"
            />
          </div>

          {/* Layout Columns */}
          <div className="atlas-layout-columns">
            <ClientMatrix
              clients={clients}
              onOpenOnboard={() => setOnboardModalOpen(true)}
            />
            <ClientHealthRadar clients={clients} />
          </div>
        </main>

        <OnboardClientModal
          isOpen={onboardModalOpen}
          onClose={() => setOnboardModalOpen(false)}
          onSubmit={handleOnboardClient}
        />
      </div>
    </AuthGuard>
  );
}
