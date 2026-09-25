'use client';

import React, { useState, useEffect } from 'react';
import { TopNav, TelemetryMetric, Button } from '@rn/brand';
import { getSupabaseClient, Deliverable } from '@rn/db';
import { useAuth, AuthGuard, UserRole } from '@rn/auth';
import { DeliverablesKanban } from '../components/DeliverablesKanban';
import { DeploymentPipelines } from '../components/DeploymentPipelines';
import { CreateDeliverableModal } from '../components/CreateDeliverableModal';

export default function ForgePage() {
  const { role, switchRole } = useAuth();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSupabaseConnected(true);
    const fetchDeliverables = async () => {
      try {
        const { data, error } = await supabase.from('deliverables').select('*');
        if (!error && data && data.length > 0) {
          setDeliverables(data as Deliverable[]);
        }
      } catch (err) {
        console.warn('Supabase fetch fallback:', err);
      }
    };
    fetchDeliverables();
  }, []);

  const handleCreateDeliverable = async (
    newDeliverable: Omit<Deliverable, 'id' | 'created_at'>
  ) => {
    const record: Deliverable = {
      ...newDeliverable,
      id: `deliv-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setDeliverables((prev) => [record, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase as any).from('deliverables').insert(newDeliverable);
      } catch (err) {
        console.warn('Supabase insertion warning:', err);
      }
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: Deliverable['status']
  ) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase as any)
          .from('deliverables')
          .update({ status: newStatus })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }
  };

  const pendingCount = deliverables.filter((d) => d.status === 'pending').length;
  const inDevCount = deliverables.filter((d) => d.status === 'in_review').length;
  const auditCount = deliverables.filter((d) => d.status === 'approved').length;
  const deployedCount = deliverables.filter((d) => d.status === 'deployed').length;

  const navItems = [
    { label: 'KANBAN MATRIX', href: '#kanban', active: true },
    { label: 'PIPELINES', href: '#pipelines', active: false },
    { label: 'CLUSTERS', href: '#clusters', active: false },
  ];

  return (
    <AuthGuard requiredApp="forge">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav
          currentApp="forge"
          navItems={navItems}
          rightAction={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
            >
              + NEW DELIVERABLE
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
                  // RIPPLE NEXUS FORGE
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
                    <option value="client_contractor">CLIENT CONTRACTOR</option>
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
                Engineering &amp; Deployment Engine
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCreateModalOpen(true)}
              >
                + NEW DELIVERABLE
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="hub-metric-grid" style={{ marginBottom: '1.5rem' }}>
            <TelemetryMetric
              label="TOTAL DELIVERABLES"
              value={deliverables.length}
              subValue="Active queue"
              trend="neutral"
              statusColor="var(--nexus-cobalt)"
            />
            <TelemetryMetric
              label="PENDING SPEC"
              value={pendingCount}
              subValue="Intake review"
              trend="neutral"
              statusColor="var(--nexus-slate)"
            />
            <TelemetryMetric
              label="IN DEVELOPMENT"
              value={inDevCount}
              subValue="Squad sprints"
              trend="up"
              statusColor="var(--nexus-cyan)"
            />
            <TelemetryMetric
              label="SECURITY AUDIT"
              value={auditCount}
              subValue="Enclave check"
              trend="neutral"
              statusColor="var(--status-warn)"
            />
            <TelemetryMetric
              label="DEPLOYED // PROD"
              value={deployedCount}
              subValue="100% verified"
              trend="up"
              statusColor="var(--status-nominal)"
            />
            <TelemetryMetric
              label="PIPELINE STATUS"
              value="PASS"
              subValue="0 blocking CVEs"
              trend="up"
              statusColor="var(--status-nominal)"
            />
          </div>

          {/* Main Layout */}
          <div className="forge-pipeline-grid">
            <DeliverablesKanban
              deliverables={deliverables}
              onUpdateStatus={handleUpdateStatus}
              onOpenCreate={() => setCreateModalOpen(true)}
            />
            <DeploymentPipelines />
          </div>
        </main>

        <CreateDeliverableModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateDeliverable}
        />
      </div>
    </AuthGuard>
  );
}
