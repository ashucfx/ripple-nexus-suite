'use client';

import React, { useState, useEffect } from 'react';
import { TopNav, TelemetryMetric, Button } from '@rn/brand';
import { getSupabaseClient, TeamMember } from '@rn/db';
import { useAuth, AuthGuard } from '@rn/auth';
import { SquadMatrix } from '../components/SquadMatrix';
import { CapacityRadar } from '../components/CapacityRadar';
import { AssignSquadModal } from '../components/AssignSquadModal';
import { BurnoutAlertEngine, OnCallScheduler, SquadSkillMatrix } from '../components/BurnoutAndScheduler';

export default function RosterPage() {
  const { role } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSupabaseConnected(true);
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase.from('team_members').select('*');
        if (!error && data && data.length > 0) {
          setMembers(data as TeamMember[]);
        }
      } catch (err) {
        console.warn('Supabase fetch fallback:', err);
      }
    };
    fetchMembers();
  }, []);

  const handleAssignMember = async (
    newMember: Omit<TeamMember, 'id' | 'created_at'>
  ) => {
    const record: TeamMember = {
      ...newMember,
      id: `tm-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    setMembers((prev) => [record, ...prev]);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase as any).from('team_members').insert(newMember);
      } catch (err) {
        console.warn('Supabase insertion warning:', err);
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: TeamMember['active_status']) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active_status: newStatus } : m))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase as any)
          .from('team_members')
          .update({ active_status: newStatus })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update warning:', err);
      }
    }
  };

  const activeCount = members.filter((m) => m.active_status === 'active').length;
  const onCallCount = members.filter((m) => m.active_status === 'on_call').length;
  const totalAllocation = members.reduce((sum, m) => sum + (m.allocation_percentage || 0), 0);
  const avgAllocation = members.length > 0 ? Math.round(totalAllocation / members.length) : 0;

  const navItems = [
    { label: 'SQUAD MATRIX', href: '#squads', active: true },
    { label: 'CAPACITY RADAR', href: '#capacity', active: false },
    { label: 'ON-CALL SCHEDULE', href: '#oncall', active: false },
  ];

  return (
    <AuthGuard requiredApp="roster" requiredPermission="team:schedule">
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopNav
          currentApp="roster"
          navItems={navItems}
          rightAction={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAssignModalOpen(true)}
            >
              + ASSIGN TALENT
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
                  RIPPLE NEXUS // WORKFORCE ALLOCATION
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
                Talent Scheduling & Squad Allocation Matrix
              </h1>
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
              label="TOTAL SQUAD TALENT"
              value={members.length.toString()}
              subValue={`${activeCount} Online Right Now`}
              trend="up"
              statusColor="var(--nexus-cobalt)"
            />
            <TelemetryMetric
              label="ON-CALL COVERAGE"
              value={`${onCallCount} ENGINEERS`}
              subValue="Tier 1 Incident Rotation"
              trend="up"
              statusColor="var(--status-nominal)"
            />
            <TelemetryMetric
              label="SQUAD LOAD EFFICIENCY"
              value={`${avgAllocation}%`}
              subValue={avgAllocation > 90 ? 'High Utilization' : 'Nominal Velocity'}
              trend={avgAllocation > 90 ? 'down' : 'up'}
              statusColor={avgAllocation > 90 ? 'var(--status-critical)' : 'var(--status-nominal)'}
            />
            <TelemetryMetric
              label="SPRINT SQUAD VELOCITY"
              value="98.2%"
              subValue="Zero Blocker Rate"
              trend="up"
              statusColor="var(--status-nominal)"
            />
          </div>

          {/* Main Layout Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <SquadMatrix
                members={members}
                onOpenAssign={() => setAssignModalOpen(true)}
                onUpdateStatus={handleUpdateStatus}
              />
              <BurnoutAlertEngine members={members} />
              <SquadSkillMatrix members={members} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <CapacityRadar members={members} />
              <OnCallScheduler members={members} />
            </div>
          </div>
        </main>

        <AssignSquadModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onSubmit={handleAssignMember}
        />
      </div>
    </AuthGuard>
  );
}
