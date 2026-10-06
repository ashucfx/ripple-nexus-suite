'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import { getStoredItem } from '@rn/db';

export interface SuiteAuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  type: 'security' | 'deploy' | 'brief' | 'sla' | 'invoice';
}

export function appendAuditLog(entry: Omit<SuiteAuditLog, 'id' | 'time'>): void {
  if (typeof window === 'undefined') return;
  const current = getStoredItem<SuiteAuditLog[]>('suite_audit_logs', []);
  const newEntry: SuiteAuditLog = {
    ...entry,
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    time: new Date().toISOString().replace('T', ' ').slice(11, 19) + ' UTC',
  };
  const updated = [newEntry, ...current].slice(0, 50);
  try {
    localStorage.setItem('rn_ops_suite_audit_logs', JSON.stringify(updated));
    window.dispatchEvent(new Event('rn_audit_log_updated'));
  } catch (e) {
    console.warn('[RN-Audit] Storage warning:', e);
  }
}

export const AuditTrailStream: React.FC = () => {
  const [logs, setLogs] = useState<SuiteAuditLog[]>([]);

  const loadLogs = () => {
    const stored = getStoredItem<SuiteAuditLog[]>('suite_audit_logs', []);
    setLogs(stored);
  };

  useEffect(() => {
    loadLogs();
    const handleUpdate = () => loadLogs();
    window.addEventListener('rn_audit_log_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('rn_audit_log_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rn_ops_suite_audit_logs');
      setLogs([]);
    }
  };

  const badgeVariant = (type: SuiteAuditLog['type']) => {
    switch (type) {
      case 'security': return 'critical';
      case 'deploy': return 'cobalt';
      case 'brief': return 'nominal';
      case 'sla': return 'warn';
      default: return 'default';
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            REAL-TIME AUDIT STREAM
          </h4>
          <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--nexus-slate)' }}>
            ({logs.length})
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="live">LIVE</Badge>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--nexus-slate, #8A99AD)',
                fontSize: '0.625rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
              title="Clear session audit logs"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '1.75rem 1rem',
              color: 'var(--nexus-slate, #8A99AD)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.6875rem',
            }}
          >
            No audit events recorded yet. Actions across the operations suite stream here in real-time.
          </div>
        ) : (
          logs.map((log) => (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Badge variant={badgeVariant(log.type)}>{log.type.toUpperCase()}</Badge>
                  <span>{log.actor}</span>
                </div>
                <span>{log.time}</span>
              </div>
              <div style={{ color: 'var(--nexus-white, #FFFFFF)', lineHeight: 1.3, marginTop: '2px' }}>
                {log.action}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
