'use client';

import React from 'react';
import { Card, Badge } from '@rn/brand';
import type { EnclaveSecret } from './SecretsMatrix';

interface ComplianceRadarProps {
  secrets: EnclaveSecret[];
}

export const ComplianceRadar: React.FC<ComplianceRadarProps> = ({ secrets }) => {
  const activeCount = secrets.filter((s) => s.status === 'active').length;
  const rotationDueCount = secrets.filter((s) => s.status === 'rotation_due').length;

  return (
    <Card className="vault-compliance-radar">
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
            COMPLIANCE CITADEL // AUDIT MATRIX
          </span>
        </div>
        <Badge variant={rotationDueCount > 0 ? 'critical' : 'nominal'}>
          {rotationDueCount > 0 ? 'AUDIT ALERT' : 'FIPS 140-3 LEVEL 4'}
        </Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div
          style={{
            backgroundColor: '#1A212E',
            border: '1px solid #1F2633',
            borderRadius: '4px',
            padding: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFFFFF' }}>SOC-2 TYPE II ENCLAVE</div>
            <div style={{ fontSize: '0.6875rem', color: '#8A99AD', fontFamily: 'var(--font-mono, monospace)' }}>
              Continuous Automated Evidence Collection
            </div>
          </div>
          <Badge variant="nominal">COMPLIANT</Badge>
        </div>

        <div
          style={{
            backgroundColor: '#1A212E',
            border: '1px solid #1F2633',
            borderRadius: '4px',
            padding: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFFFFF' }}>ISO/IEC 27001:2022</div>
            <div style={{ fontSize: '0.6875rem', color: '#8A99AD', fontFamily: 'var(--font-mono, monospace)' }}>
              Information Security Governance & ISMS
            </div>
          </div>
          <Badge variant="nominal">CERTIFIED</Badge>
        </div>

        <div
          style={{
            backgroundColor: '#1A212E',
            border: '1px solid #1F2633',
            borderRadius: '4px',
            padding: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFFFFF' }}>HSM CLUSTER ENCRYPT-AT-REST</div>
            <div style={{ fontSize: '0.6875rem', color: '#8A99AD', fontFamily: 'var(--font-mono, monospace)' }}>
              Zero-Knowledge Multi-Party Computation
            </div>
          </div>
          <Badge variant="live">LIVE HSM</Badge>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1F2633', paddingTop: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono, monospace)', color: '#8A99AD', marginBottom: '6px' }}>
          <span>HSM KEY LIFECYCLE HEALTH</span>
          <span style={{ color: '#00D2FF', fontWeight: 700 }}>
            {activeCount}/{secrets.length} KEYS OPTIMAL
          </span>
        </div>
        <div style={{ height: '6px', backgroundColor: '#1A212E', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: secrets.length > 0 ? `${Math.round((activeCount / secrets.length) * 100)}%` : '100%',
              backgroundColor: rotationDueCount > 0 ? '#EF4444' : '#00E599',
              transition: 'width 300ms ease',
            }}
          />
        </div>
      </div>
    </Card>
  );
};
