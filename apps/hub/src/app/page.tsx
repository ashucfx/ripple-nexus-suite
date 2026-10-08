'use client';

import React, { useState, useEffect } from 'react';
import { TopNav, TelemetryMetric, Button } from '@rn/brand';
import { getSupabaseClient, getStoredItem, setStoredItem, Brief, BriefStatus } from '@rn/db';
import { useAuth, AuthGuard, filterByTenantBoundary } from '@rn/auth';
import { SLARadar } from '../components/SLARadar';
import { PipelineMatrix } from '../components/PipelineMatrix';
import { SystemTelemetryPanel } from '../components/SystemTelemetryPanel';
import { QuickIntakeModal } from '../components/QuickIntakeModal';
import { AuditTrailStream, appendAuditLog } from '../components/AuditTrailStream';
import { WarBoard } from '../components/WarBoard';
import { BroadcastBanner, BudgetBurnTracker } from '../components/BroadcastAndBurn';
import { ComplianceExportPanel, OperationalHealthIndex } from '../components/ComplianceAndHealth';
import { BriefDetailModal } from '../components/BriefDetailModal';

export default function HubPage() {
  const { session, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'radar' | 'pipeline' | 'telemetry' | 'compliance'>('overview');
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
  const [warBoardActive, setWarBoardActive] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Load from persistent local storage first, then check Supabase
  useEffect(() => {
    const local = getStoredItem<Brief[]>('hub_briefs', []);
    setBriefs(local);

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSupabaseConnected(true);
    const fetchBriefs = async () => {
      try {
        const { data, error } = await supabase.from('briefs').select('*');
        if (!error && data && data.length > 0) {
          setBriefs(data as Brief[]);
          setStoredItem('hub_briefs', data);
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

    const updated = [briefRecord, ...briefs];
    setBriefs(updated);
    setStoredItem('hub_briefs', updated);

    appendAuditLog({
      actor: session?.email || 'operator',
      action: `Created operational brief: ${briefRecord.title} for client [${briefRecord.client_name || briefRecord.client_id}]`,
      type: 'brief',
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase as any).from('briefs').insert(newBriefData);
      } catch (err) {
        console.warn('Supabase insertion warning:', err);
      }
    }
  };

  const handleUpdateBriefStatus = async (id: string, newStatus: BriefStatus) => {
    const updated = briefs.map((b) =>
      b.id === id ? { ...b, status: newStatus, updated_at: new Date().toISOString() } : b
    );
    setBriefs(updated);
    setStoredItem('hub_briefs', updated);

    if (selectedBrief && selectedBrief.id === id) {
      setSelectedBrief({ ...selectedBrief, status: newStatus });
    }

    appendAuditLog({
      actor: session?.email || 'operator',
      action: `Updated status to [${newStatus.toUpperCase()}] for brief #${id}`,
      type: 'brief',
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase as any)
          .from('briefs')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }
  };

  const handleDeleteBrief = async (id: string) => {
    const updated = briefs.filter((b) => b.id !== id);
    setBriefs(updated);
    setStoredItem('hub_briefs', updated);
    setSelectedBrief(null);

    appendAuditLog({
      actor: session?.email || 'operator',
      action: `Removed brief #${id} from active pipeline`,
      type: 'brief',
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase as any).from('briefs').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete warning:', err);
      }
    }
  };

  const handleExportBriefs = () => {
    const payload = JSON.stringify(visibleBriefs, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hub-briefs-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
    { label: 'COMPLIANCE', href: '#compliance', active: activeTab === 'compliance' },
  ];

  const warBoardAllowed = role === 'executive_admin' || role === 'operations_lead';

  return (
    <AuthGuard requiredApp="hub">
      {/* WAR BOARD OVERLAY */}
      {warBoardActive && (
        <WarBoard
          briefs={visibleBriefs}
          onExitWarBoard={() => setWarBoardActive(false)}
        />
      )}

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* BROADCAST ALERT BANNER — cross-subnet emergency notice */}
        <BroadcastBanner />

        <TopNav
          currentApp="hub"
          navItems={navItems}
          rightAction={
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {warBoardAllowed && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setWarBoardActive(true)}
                >
                  ⚡ WAR BOARD
                </Button>
              )}
              {visibleBriefs.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportBriefs}
                  title="Export briefs to JSON"
                >
                  EXPORT
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIntakeModalOpen(true)}
              >
                + INTAKE
              </Button>
            </div>
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
                  {supabaseConnected ? 'SUPABASE CLOUD ACTIVE' : 'SECURE LOCAL PERSISTENCE'}
                </span>
                <span style={{ color: 'var(--nexus-border)' }}>•</span>
                <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--nexus-slate)' }}>
                  CLEARANCE: {role.toUpperCase()}
                </span>
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

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('compliance')}
              >
                COMPLIANCE PKG
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

          {/* Executive Metrics Bar */}
          <div className="rn-metrics-bar" style={{ marginBottom: '1.5rem' }}>
            <TelemetryMetric
              label="ACTIVE BRIEFS"
              value={visibleBriefs.length}
              subValue={visibleBriefs.length === 0 ? 'Awaiting intake' : `${visibleBriefs.length} registered`}
              trend={visibleBriefs.length > 0 ? 'up' : 'neutral'}
              statusColor="var(--nexus-cobalt)"
            />
            <TelemetryMetric
              label="SLA COMPLIANCE"
              value={visibleBriefs.length === 0 ? '100%' : '99.8%'}
              subValue="Target: 99.0%"
              trend="up"
              statusColor="var(--status-nominal)"
            />
            <TelemetryMetric
              label="P0 CRITICAL"
              value={criticalCount}
              subValue={criticalCount > 0 ? 'Under escalation' : 'Clear'}
              trend={criticalCount > 0 ? 'down' : 'neutral'}
              statusColor={criticalCount > 0 ? 'var(--status-critical)' : undefined}
            />
            <TelemetryMetric
              label="IN FLIGHT"
              value={inFlightCount}
              subValue="Squad execution"
              trend="neutral"
              statusColor="var(--nexus-cyan)"
            />
            <TelemetryMetric
              label="PIPELINE VALUE"
              value={`$${(totalBudget / 1000).toFixed(0)}k`}
              subValue="Active allocation"
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

          {/* Tab: Compliance */}
          {activeTab === 'compliance' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              <ComplianceExportPanel />
              <OperationalHealthIndex briefs={visibleBriefs} />
              <BudgetBurnTracker briefs={visibleBriefs} />
            </div>
          ) : (
            /* Main Content Multi-Column Layout */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
              {/* Column 1: SLA Radar + Pipeline Matrix + Budget Burn */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <SLARadar
                  briefs={visibleBriefs}
                  onSelectBrief={(b) => setSelectedBrief(b)}
                />
                <PipelineMatrix
                  briefs={visibleBriefs}
                  onOpenIntake={() => setIntakeModalOpen(true)}
                  onSelectBrief={(b) => setSelectedBrief(b)}
                />
                <BudgetBurnTracker briefs={visibleBriefs} />
              </div>

              {/* Column 2: Health Index + Telemetry + Audit Stream */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <OperationalHealthIndex briefs={visibleBriefs} />
                <SystemTelemetryPanel />
                <AuditTrailStream />
              </div>
            </div>
          )}
        </main>

        {/* Quick Intake Drawer/Modal */}
        <QuickIntakeModal
          isOpen={intakeModalOpen}
          onClose={() => setIntakeModalOpen(false)}
          onSubmit={handleCreateBrief}
        />

        {/* Brief Detail & Lifecycle Modal */}
        <BriefDetailModal
          brief={selectedBrief}
          isOpen={!!selectedBrief}
          onClose={() => setSelectedBrief(null)}
          onUpdateStatus={handleUpdateBriefStatus}
          onDelete={handleDeleteBrief}
        />
      </div>
    </AuthGuard>
  );
}
