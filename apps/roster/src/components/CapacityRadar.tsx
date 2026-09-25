'use client';

import React from 'react';
import { Card, Badge } from '@rn/brand';
import type { TeamMember } from '@rn/db';

interface CapacityRadarProps {
  members: TeamMember[];
}

export const CapacityRadar: React.FC<CapacityRadarProps> = ({ members }) => {
  const activeCount = members.filter((m) => m.active_status === 'active').length;
  const onCallCount = members.filter((m) => m.active_status === 'on_call').length;
  const awayCount = members.filter((m) => m.active_status === 'away').length;

  const totalAllocation = members.reduce((sum, m) => sum + (m.allocation_percentage || 0), 0);
  const avgAllocation = members.length > 0 ? Math.round(totalAllocation / members.length) : 0;

  return (
    <Card className="roster-capacity-radar">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              color: 'var(--nexus-cyan, #00D2FF)',
            }}
          >
            SQUAD CAPACITY // VELOCITY RADAR
          </span>
        </div>
        <Badge variant={avgAllocation > 90 ? 'critical' : 'nominal'}>
          {avgAllocation > 90 ? 'CAPACITY ALERT' : 'BALANCED LOAD'}
        </Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ backgroundColor: '#1A212E', padding: '0.75rem', borderRadius: '4px', border: '1px solid #1F2633' }}>
          <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono, monospace)', color: '#00E599' }}>
            ACTIVE (ONLINE)
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#00E599', marginTop: '2px' }}>
            {activeCount}
          </div>
        </div>

        <div style={{ backgroundColor: '#1A212E', padding: '0.75rem', borderRadius: '4px', border: '1px solid #1F2633' }}>
          <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono, monospace)', color: '#00D2FF' }}>
            ON-CALL
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#00D2FF', marginTop: '2px' }}>
            {onCallCount}
          </div>
        </div>

        <div style={{ backgroundColor: '#1A212E', padding: '0.75rem', borderRadius: '4px', border: '1px solid #1F2633' }}>
          <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono, monospace)', color: '#8A99AD' }}>
            AWAY / LEAVE
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#8A99AD', marginTop: '2px' }}>
            {awayCount}
          </div>
        </div>
      </div>

      {/* Capacity Utilization Bar */}
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono, monospace)', color: '#8A99AD', marginBottom: '4px' }}>
          <span>AVG SQUAD UTILIZATION</span>
          <span style={{ color: avgAllocation > 90 ? '#EF4444' : '#00D2FF', fontWeight: 700 }}>
            {avgAllocation}% {avgAllocation > 90 ? '(HEAVY LOAD)' : '(OPTIMAL)'}
          </span>
        </div>
        <div style={{ height: '6px', backgroundColor: '#1A212E', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(avgAllocation, 100)}%`,
              backgroundColor: avgAllocation > 90 ? '#EF4444' : avgAllocation > 75 ? '#FFB800' : '#0052FF',
              transition: 'width 300ms ease',
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem', borderTop: '1px solid #1F2633', paddingTop: '0.75rem' }}>
        <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono, monospace)', color: '#8A99AD', display: 'flex', justifyContent: 'space-between' }}>
          <span>BURNOUT RISK INDEX:</span>
          <span style={{ color: '#00E599', fontWeight: 700 }}>LOW (ROTATION ACTIVE)</span>
        </div>
      </div>
    </Card>
  );
};
