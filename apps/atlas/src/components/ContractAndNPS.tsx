'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import { useAuth } from '@rn/auth';
import type { Client } from '@rn/db';

// ─────────────────────────────────────────────
// Client Contract Timeline Gantt
// ─────────────────────────────────────────────

interface ContractMilestone {
  name: string;
  start_week: number;
  duration_weeks: number;
  status: 'completed' | 'in_progress' | 'upcoming';
}

interface ClientContractProps {
  client: Client;
}

export const ClientContractGantt: React.FC<ClientContractProps> = ({ client }) => {
  const milestones: ContractMilestone[] = [
    { name: 'Discovery & Scoping', start_week: 0, duration_weeks: 2, status: 'completed' },
    { name: 'SOW Finalization', start_week: 2, duration_weeks: 1, status: 'completed' },
    { name: 'Sprint 1 Delivery', start_week: 3, duration_weeks: 3, status: 'completed' },
    { name: 'Sprint 2 Delivery', start_week: 6, duration_weeks: 3, status: 'in_progress' },
    { name: 'Security Audit', start_week: 9, duration_weeks: 1, status: 'upcoming' },
    { name: 'UAT & Sign-off', start_week: 10, duration_weeks: 2, status: 'upcoming' },
  ];

  const totalWeeks = 12;

  const statusColors = {
    completed: '#00E599',
    in_progress: '#0052FF',
    upcoming: '#1F2633',
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
        <div>
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
            CONTRACT TIMELINE
          </h3>
          <div
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: '0.75rem',
              color: '#00D2FF',
              marginTop: '2px',
            }}
          >
            {client.name} · {client.code}
          </div>
        </div>
        <Badge variant={client.tier === 'enterprise' ? 'cobalt' : 'nominal'}>
          {client.tier.toUpperCase()}
        </Badge>
      </div>

      {/* Week header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `140px repeat(${totalWeeks}, 1fr)`,
          gap: '2px',
          marginBottom: '0.5rem',
        }}
      >
        <div />
        {Array.from({ length: totalWeeks }, (_, i) => (
          <div
            key={i}
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.5rem',
              color: '#8A99AD',
              textAlign: 'center',
            }}
          >
            W{i + 1}
          </div>
        ))}
      </div>

      {/* Milestone rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {milestones.map((ms) => (
          <div
            key={ms.name}
            style={{
              display: 'grid',
              gridTemplateColumns: `140px repeat(${totalWeeks}, 1fr)`,
              gap: '2px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: '0.625rem',
                color: '#8A99AD',
                paddingRight: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={ms.name}
            >
              {ms.name}
            </div>
            {Array.from({ length: totalWeeks }, (_, w) => {
              const inRange = w >= ms.start_week && w < ms.start_week + ms.duration_weeks;
              return (
                <div
                  key={w}
                  style={{
                    height: '16px',
                    borderRadius: '2px',
                    backgroundColor: inRange ? statusColors[ms.status] : 'transparent',
                    opacity: inRange ? 1 : 0.1,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: color }} />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#8A99AD' }}>
              {status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────────
// NPS & Sentiment Tracker
// ─────────────────────────────────────────────

interface NPSEntry {
  client_name: string;
  score: number;
  comment: string;
  date: string;
}

export const NPSSentimentTracker: React.FC = () => {
  const { role } = useAuth();
  const [responses] = useState<NPSEntry[]>([
    { client_name: 'HELIOS-AI', score: 9, comment: 'Fast turnarounds, very responsive team.', date: '2026-09-15' },
    { client_name: 'ACME-CORP', score: 7, comment: 'Good work, but dashboard reporting needs more depth.', date: '2026-09-10' },
    { client_name: 'NOVA-FINTECH', score: 10, comment: 'Exceptional security practices. SOC-2 audit prep was smooth.', date: '2026-09-05' },
    { client_name: 'ORION-HEALTH', score: 6, comment: 'Deliverables met SLA but communication could improve.', date: '2026-08-28' },
  ]);

  const canView = role !== 'client_contractor';

  const promoters = responses.filter((r) => r.score >= 9).length;
  const passives = responses.filter((r) => r.score >= 7 && r.score < 9).length;
  const detractors = responses.filter((r) => r.score < 7).length;
  const npsScore = Math.round(((promoters - detractors) / responses.length) * 100);

  if (!canView) {
    return null;
  }

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
          NPS & CLIENT SENTIMENT
        </h3>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '1.25rem',
            fontWeight: 900,
            color: npsScore >= 50 ? '#00E599' : npsScore >= 20 ? '#F59E0B' : '#EF4444',
          }}
        >
          NPS: {npsScore > 0 ? '+' : ''}{npsScore}
        </div>
      </div>

      {/* Score distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
        {[
          { label: 'PROMOTERS', count: promoters, color: '#00E599' },
          { label: 'PASSIVES', count: passives, color: '#F59E0B' },
          { label: 'DETRACTORS', count: detractors, color: '#EF4444' },
        ].map((seg) => (
          <div
            key={seg.label}
            style={{
              padding: '0.5rem',
              backgroundColor: 'var(--nexus-surface3, #1A212E)',
              borderRadius: '4px',
              border: '1px solid var(--nexus-border, #1F2633)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#8A99AD' }}>
              {seg.label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1.125rem', fontWeight: 900, color: seg.color }}>
              {seg.count}
            </div>
          </div>
        ))}
      </div>

      {/* Recent responses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {responses.map((r) => (
          <div
            key={r.client_name}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--nexus-surface3, #1A212E)',
              borderRadius: '4px',
              border: '1px solid var(--nexus-border, #1F2633)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  color: '#00D2FF',
                  fontWeight: 700,
                }}
              >
                {r.client_name}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.8125rem',
                  fontWeight: 900,
                  color: r.score >= 9 ? '#00E599' : r.score >= 7 ? '#F59E0B' : '#EF4444',
                }}
              >
                {r.score}/10
              </span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#8A99AD', fontStyle: 'italic' }}>
              "{r.comment}"
            </div>
            <div style={{ fontSize: '0.5rem', color: '#1F2633', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
              {r.date}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
