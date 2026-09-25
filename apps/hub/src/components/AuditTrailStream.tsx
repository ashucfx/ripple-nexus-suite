'use client';

import React from 'react';
import { Card, Badge } from '@rn/brand';

interface LogEntry {
  id: string;
  time: string;
  actor: string;
  action: string;
  type: 'security' | 'deploy' | 'brief' | 'sla';
}

export const AuditTrailStream: React.FC = () => {
  const logs: LogEntry[] = [
    {
      id: 'log-1',
      time: '14:22:01 UTC',
      actor: 'system.daemon',
      action: 'SLA verification passed for vector [HELIOS-AI-CORE]',
      type: 'sla',
    },
    {
      id: 'log-2',
      time: '14:18:40 UTC',
      actor: 'ops.lead@theripplenexus.com',
      action: 'Approved architecture deliverable for ACME-CORP',
      type: 'brief',
    },
    {
      id: 'log-3',
      time: '13:55:12 UTC',
      actor: 'ci.runner',
      action: 'Zero-downtime deployment executed on cluster iad-primary-01',
      type: 'deploy',
    },
    {
      id: 'log-4',
      time: '13:30:00 UTC',
      actor: 'vault.enclave',
      action: 'Automated secret rotation verified across 6 operation nodes',
      type: 'security',
    },
  ];

  return (
    <Card className="hub-audit-trail">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          borderBottom: '1px solid var(--nexus-border, #1F2633)',
          paddingBottom: '0.5rem',
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
          LIVE AUDIT TRAIL & ENCLAVE LOGS
        </h4>
        <Badge variant="live">REAL-TIME</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              padding: '0.5rem 0.65rem',
              backgroundColor: 'var(--nexus-surface3, #1A212E)',
              borderRadius: '4px',
              border: '1px solid var(--nexus-border, #1F2633)',
              fontSize: '0.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.625rem',
                color: 'var(--nexus-slate, #8A99AD)',
                marginBottom: '2px',
              }}
            >
              <span>{log.actor}</span>
              <span>{log.time}</span>
            </div>
            <div style={{ color: 'var(--nexus-white, #FFFFFF)', lineHeight: 1.3 }}>
              {log.action}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
