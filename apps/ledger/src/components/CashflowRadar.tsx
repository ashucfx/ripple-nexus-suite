'use client';

import React from 'react';
import { Card, Badge } from '@rn/brand';
import type { Invoice } from '@rn/db';

interface CashflowRadarProps {
  invoices: Invoice[];
}

export const CashflowRadar: React.FC<CashflowRadarProps> = ({ invoices }) => {
  const totalVolume = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const paidVolume = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const overdueVolume = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const issuedVolume = invoices
    .filter((inv) => inv.status === 'issued')
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const collectionRate = totalVolume > 0 ? Math.round((paidVolume / totalVolume) * 100) : 100;

  return (
    <Card className="ledger-cashflow-radar">
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
            FISCAL RADAR // LIQUIDITY MATRIX
          </span>
        </div>
        <Badge variant={overdueVolume > 0 ? 'critical' : 'nominal'}>
          {overdueVolume > 0 ? 'RISK DETECTED' : 'CAPITAL SECURE'}
        </Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ backgroundColor: '#1A212E', padding: '0.75rem', borderRadius: '4px', border: '1px solid #1F2633' }}>
          <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono, monospace)', color: '#8A99AD' }}>
            TOTAL BILLED
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
            ${totalVolume.toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: '#1A212E', padding: '0.75rem', borderRadius: '4px', border: '1px solid #1F2633' }}>
          <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono, monospace)', color: '#00E599' }}>
            SETTLED CAPITAL
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#00E599', marginTop: '2px' }}>
            ${paidVolume.toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: '#1A212E', padding: '0.75rem', borderRadius: '4px', border: '1px solid #1F2633' }}>
          <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono, monospace)', color: '#00D2FF' }}>
            IN-FLIGHT ESCROW
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#00D2FF', marginTop: '2px' }}>
            ${issuedVolume.toLocaleString()}
          </div>
        </div>

        <div style={{ backgroundColor: '#1A212E', padding: '0.75rem', borderRadius: '4px', border: '1px solid #1F2633' }}>
          <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono, monospace)', color: '#EF4444' }}>
            OVERDUE EXPOSURE
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: overdueVolume > 0 ? '#EF4444' : '#8A99AD', marginTop: '2px' }}>
            ${overdueVolume.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Settlement Ratio Bar */}
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono, monospace)', color: '#8A99AD', marginBottom: '4px' }}>
          <span>LIQUIDITY SETTLEMENT RATIO</span>
          <span style={{ color: '#00D2FF', fontWeight: 700 }}>{collectionRate}% NOMINAL</span>
        </div>
        <div style={{ height: '6px', backgroundColor: '#1A212E', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${collectionRate}%`,
              backgroundColor: overdueVolume > 0 ? '#FFB800' : '#0052FF',
              transition: 'width 300ms ease',
            }}
          />
        </div>
      </div>
    </Card>
  );
};
