'use client';

import React, { useState, useEffect } from 'react';
import { TopNav, TelemetryMetric, Button } from '@rn/brand';
import { getSupabaseClient, Brief } from '@rn/db';
import { useAuth, AuthGuard, filterByTenantBoundary, UserRole } from '@rn/auth';
import { SLARadar } from '../components/SLARadar';
import { PipelineMatrix } from '../components/PipelineMatrix';
import { SystemTelemetryPanel } from '../components/SystemTelemetryPanel';
import { QuickIntakeModal } from '../components/QuickIntakeModal';
import { AuditTrailStream } from '../components/AuditTrailStream';

export default function HubPage() {
  const { session, role, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'radar' | 'pipeline' | 'telemetry'>('overview');
  const [briefs, setBriefs] = useState<Brief[]>([]);

  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSupabaseConnected(true);
    const fetchBriefs = async () => {
      try {
        const { data, error } = await supabase.from('briefs').select('*');
        if (!error && data && data.length > 0) {
          setBriefs(data as Brief[]);
        }
      } catch (err) {
        console.warn('Supabase initialization fallback:', err);
      }
    };
    fetchBriefs();
  }, []);

  const handleCreateBrief = async (
    newBriefData: Omit<Brief, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const briefRecord: Brief = {
      ...newBriefData,
      id: `brief-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setBriefs((prev) => [briefRecord, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase as any).from('briefs').insert(newBriefData);
      } catch (err) {
        console.warn('Supabase insertion warning:', err);
      }
    }
  };

  const visibleBriefs = filterByTenantBoundary(briefs, session);
  const criticalCount = visibleBriefs.filter((b) => b.priority === 'p0_critical').length;
  const inFlightCount = visibleBriefs.filter((b) => b.status === 'in_progress').length;
  const totalBudget = visibleBriefs.reduce((acc, curr) => acc + (curr.budget || 0), 0);

  const navItems = [
    { label: 'OVERVIEW', href: '#overview', active: activeTab === 'overview' },
    { label: 'SLA RADAR', href: '#radar', active: activeTab === 'radar' },
    { label: 'PIPELINE', href: '#pipeline', active: activeTab === 'pipeline' },
    { label: 'TELEMETRY', href: '#telemetry', active: activeTab === 'telemetry' },
  ];

  return (
    <AuthGuard requiredApp="hub">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav
          currentApp="hub"
          navItems={navItems}
          rightAction={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIntakeModalOpen(true)}
            >
              + INTAKE
            </Button>
          }
        />

        <main className="rn-container" style={{ flex: 1, paddingTop: '1.5rem', paddingBottom: '3rem' }}>
          {/* Header Title & Subtitle */}
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
                  // RIPPLE NEXUS OPERATIONS
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
                    <option value="client_contractor">CLIENT CONTRACTOR [HELIOS-AI]</option>
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
                Executive Command &amp; Radar
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('overview')}
              >
                FULL MATRIX
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIntakeModalOpen(true)}
              >
                + NEW BRIEF
              </Button>
            </div>
          </div>

        {/* Executive Metrics Bar (Responsive 1 to 6 columns) */}
        <div className="hub-metric-grid" style={{ marginBottom: '1.5rem' }}>
          <TelemetryMetric
            label="ACTIVE BRIEFS"
            value={visibleBriefs.length}
            subValue="+2 this week"
            trend="up"
            statusColor="var(--nexus-cobalt)"
          />
          <TelemetryMetric
            label="SLA COMPLIANCE"
            value="99.4%"
            subValue="Target: 99.0%"
            trend="up"
            statusColor="var(--status-nominal)"
          />
          <TelemetryMetric
            label="P0 CRITICAL"
            value={criticalCount}
            subValue={criticalCount > 0 ? "Under watch" : "Clear"}
            trend={criticalCount > 0 ? "down" : "neutral"}
            statusColor={criticalCount > 0 ? "var(--status-critical)" : undefined}
          />
          <TelemetryMetric
            label="IN FLIGHT"
            value={inFlightCount}
            subValue="3 Squads allocated"
            trend="neutral"
            statusColor="var(--nexus-cyan)"
          />
          <TelemetryMetric
            label="PIPELINE VALUE"
            value={`$${(totalBudget / 1000).toFixed(0)}k`}
            subValue="Active Q3"
            trend="up"
            statusColor="var(--nexus-cobalt)"
          />
          <TelemetryMetric
            label="CLUSTER LATENCY"
            value="14ms"
            subValue="Nominal"
            trend="up"
            statusColor="var(--status-nominal)"
          />
        </div>

        {/* Main Content Multi-Column Layout */}
        <div className="hub-layout-columns">
          {/* Left Column: SLA Radar + Pipeline Matrix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SLARadar briefs={visibleBriefs} />
            <PipelineMatrix
              briefs={visibleBriefs}
              onOpenIntake={() => setIntakeModalOpen(true)}
            />
          </div>

          {/* Right Column: Telemetry + Audit Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SystemTelemetryPanel />
            <AuditTrailStream />
          </div>
        </div>
      </main>

      {/* Quick Intake Drawer/Modal */}
      <QuickIntakeModal
        isOpen={intakeModalOpen}
        onClose={() => setIntakeModalOpen(false)}
        onSubmit={handleCreateBrief}
      />
    </div>
  </AuthGuard>
  );
}
