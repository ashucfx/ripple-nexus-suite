'use client';

import React from 'react';
import { Card, Badge } from '@rn/brand';
import type { Client } from '@rn/db';

interface ClientHealthRadarProps {
  clients: Client[];
}

export const ClientHealthRadar: React.FC<ClientHealthRadarProps> = ({ clients }) => {
  const avgHealth =
    clients.length > 0
      ? Math.round(clients.reduce((acc, c) => acc + c.health_score, 0) / clients.length)
      : 100;

  const totalMrr = clients.reduce((acc, c) => acc + (c.mrr || 0), 0);

  return (
    <Card className="atlas-health-radar">
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
        <h4
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--nexus-white, #FFFFFF)',
            margin: 0,
          }}
        >
          PORTFOLIO HEALTH RADAR
        </h4>
        <Badge variant="nominal">NOMINAL</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--nexus-surface3, #1A212E)',
            borderRadius: '4px',
            border: '1px solid var(--nexus-border, #1F2633)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--nexus-slate)' }}>
              AGGREGATE HEALTH SCORE
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-sans)' }}>
              {avgHealth}%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--nexus-slate)' }}>
              TOTAL RUNRATE
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#00D2FF', fontFamily: 'var(--font-mono)' }}>
              ${(totalMrr / 1000).toFixed(0)}k/mo
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--nexus-slate)', textTransform: 'uppercase' }}>
            TIER DISTRIBUTION
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--nexus-surface3)', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--nexus-slate)', fontFamily: 'var(--font-mono)' }}>ENTERPRISE</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                {clients.filter((c) => c.tier === 'enterprise').length}
              </div>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--nexus-surface3)', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--nexus-slate)', fontFamily: 'var(--font-mono)' }}>GROWTH</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                {clients.filter((c) => c.tier === 'growth').length}
              </div>
            </div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--nexus-surface3)', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.625rem', color: 'var(--nexus-slate)', fontFamily: 'var(--font-mono)' }}>STEALTH</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                {clients.filter((c) => c.tier === 'stealth').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
