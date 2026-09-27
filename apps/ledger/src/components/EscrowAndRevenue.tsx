'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import { useAuth } from '@rn/auth';
import type { Invoice } from '@rn/db';

// ─────────────────────────────────────────────
// Escrow Milestone Tracker
// ─────────────────────────────────────────────

interface EscrowMilestone {
  id: string;
  name: string;
  amount: number;
  status: 'locked' | 'pending_release' | 'released';
  client_name: string;
  release_condition: string;
}

export const EscrowMilestoneTracker: React.FC = () => {
  const { role } = useAuth();
  const [milestones, setMilestones] = useState<EscrowMilestone[]>([
    {
      id: 'escrw-001',
      name: 'Architecture Design Approval',
      amount: 25000,
      status: 'released',
      client_name: 'HELIOS-AI',
      release_condition: 'Client sign-off on tech stack',
    },
    {
      id: 'escrw-002',
      name: 'Sprint 1 Delivery',
      amount: 40000,
      status: 'released',
      client_name: 'HELIOS-AI',
      release_condition: 'UAT pass — 0 P0 bugs',
    },
    {
      id: 'escrw-003',
      name: 'Sprint 2 Delivery',
      amount: 40000,
      status: 'pending_release',
      client_name: 'HELIOS-AI',
      release_condition: 'Security audit clearance pending',
    },
    {
      id: 'escrw-004',
      name: 'Final Deployment & Sign-off',
      amount: 20000,
      status: 'locked',
      client_name: 'HELIOS-AI',
      release_condition: 'Production deployment and 30-day warranty',
    },
  ]);

  const canRelease = role === 'executive_admin';

  const totalLocked = milestones.filter((m) => m.status === 'locked').reduce((acc, m) => acc + m.amount, 0);
  const totalPending = milestones.filter((m) => m.status === 'pending_release').reduce((acc, m) => acc + m.amount, 0);
  const totalReleased = milestones.filter((m) => m.status === 'released').reduce((acc, m) => acc + m.amount, 0);
  const totalContract = milestones.reduce((acc, m) => acc + m.amount, 0);

  const releaseEscrow = (id: string) => {
    if (!canRelease) return;
    setMilestones((prev) =>
      prev.map((m) => (m.id === id && m.status === 'pending_release' ? { ...m, status: 'released' } : m))
    );
  };

  const statusColor = {
    locked: '#8A99AD',
    pending_release: '#F59E0B',
    released: '#00E599',
  };

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--nexus-border, #1F2633)',
          paddingBottom: '0.75rem',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            margin: 0,
          }}
        >
          ESCROW MILESTONE TRACKER
        </h3>
        <Badge variant="cobalt">${(totalContract / 1000).toFixed(0)}K CONTRACT</Badge>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'RELEASED', value: totalReleased, color: '#00E599' },
          { label: 'PENDING', value: totalPending, color: '#F59E0B' },
          { label: 'LOCKED', value: totalLocked, color: '#8A99AD' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: '0.5rem',
              backgroundColor: 'var(--nexus-surface3, #1A212E)',
              borderRadius: '4px',
              border: '1px solid var(--nexus-border, #1F2633)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#8A99AD', marginBottom: '2px' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.875rem', fontWeight: 700, color: s.color }}>
              ${(s.value / 1000).toFixed(0)}K
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ height: '6px', borderRadius: '3px', overflow: 'hidden', backgroundColor: '#1F2633', display: 'flex' }}>
          <div style={{ height: '100%', width: `${(totalReleased / totalContract) * 100}%`, backgroundColor: '#00E599' }} />
          <div style={{ height: '100%', width: `${(totalPending / totalContract) * 100}%`, backgroundColor: '#F59E0B' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#8A99AD', marginTop: '4px', textAlign: 'right' }}>
          {Math.round((totalReleased / totalContract) * 100)}% of contract collected
        </div>
      </div>

      {/* Milestone rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {milestones.map((ms) => (
          <div
            key={ms.id}
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--nexus-surface3, #1A212E)',
              borderRadius: '4px',
              border: `1px solid ${ms.status === 'pending_release' ? 'rgba(245,158,11,0.4)' : 'var(--nexus-border, #1F2633)'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '2px' }}>
                  {ms.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5625rem', color: '#8A99AD' }}>
                  {ms.release_condition}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: statusColor[ms.status],
                  }}
                >
                  ${ms.amount.toLocaleString()}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.5rem',
                    color: statusColor[ms.status],
                    textTransform: 'uppercase',
                  }}
                >
                  {ms.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {ms.status === 'pending_release' && (
              <div style={{ marginTop: '0.5rem' }}>
                {canRelease ? (
                  <Button variant="primary" size="sm" onClick={() => releaseEscrow(ms.id)}>
                    AUTHORIZE RELEASE → ${ms.amount.toLocaleString()}
                  </Button>
                ) : (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.5625rem',
                      color: '#F59E0B',
                      padding: '4px 8px',
                      border: '1px solid rgba(245,158,11,0.3)',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(245,158,11,0.08)',
                    }}
                  >
                    AWAITING EXECUTIVE ADMIN AUTHORIZATION
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────────
// Revenue Velocity Chart
// ─────────────────────────────────────────────

interface RevenueVelocityProps {
  invoices: Invoice[];
}

export const RevenueVelocityChart: React.FC<RevenueVelocityProps> = ({ invoices }) => {
  // Generate last 6 months
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const monthlyRevenue = [48000, 52000, 61000, 55000, 72000, 89000];
  const maxRevenue = Math.max(...monthlyRevenue);
  const currentMRR = monthlyRevenue[monthlyRevenue.length - 1];
  const prevMRR = monthlyRevenue[monthlyRevenue.length - 2];
  const growth = (((currentMRR - prevMRR) / prevMRR) * 100).toFixed(1);

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--nexus-border, #1F2633)',
          paddingBottom: '0.75rem',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            margin: 0,
          }}
        >
          REVENUE VELOCITY (6M)
        </h3>
        <Badge variant="nominal">+{growth}% MoM</Badge>
      </div>

      {/* Bar chart */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end',
          height: '120px',
          marginBottom: '0.5rem',
        }}
      >
        {monthlyRevenue.map((rev, i) => (
          <div
            key={months[i]}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.5rem',
                color: '#8A99AD',
                marginBottom: '4px',
              }}
            >
              ${(rev / 1000).toFixed(0)}k
            </div>
            <div
              style={{
                width: '100%',
                height: `${(rev / maxRevenue) * 80}%`,
                backgroundColor: i === monthlyRevenue.length - 1 ? '#00D2FF' : '#0052FF',
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.4s ease',
                boxShadow: i === monthlyRevenue.length - 1 ? '0 0 8px rgba(0,210,255,0.4)' : undefined,
              }}
            />
          </div>
        ))}
      </div>

      {/* Month labels */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {months.map((m) => (
          <div
            key={m}
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.5rem',
              color: '#8A99AD',
            }}
          >
            {m}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div
        style={{
          marginTop: '0.75rem',
          padding: '0.5rem',
          backgroundColor: 'var(--nexus-surface3, #1A212E)',
          borderRadius: '4px',
          border: '1px solid var(--nexus-border, #1F2633)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#8A99AD' }}>CURRENT MRR</div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1rem', fontWeight: 700, color: '#00D2FF' }}>
            ${(currentMRR / 1000).toFixed(0)}K
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#8A99AD' }}>ARR RUN RATE</div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1rem', fontWeight: 700, color: '#00E599' }}>
            ${((currentMRR * 12) / 1000).toFixed(0)}K
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#8A99AD' }}>MoM GROWTH</div>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1rem', fontWeight: 700, color: '#00E599' }}>
            +{growth}%
          </div>
        </div>
      </div>
    </Card>
  );
};
