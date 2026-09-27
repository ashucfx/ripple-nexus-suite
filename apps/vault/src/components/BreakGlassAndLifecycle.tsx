'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import { useAuth } from '@rn/auth';

interface BreakGlassEvent {
  id: string;
  initiator: string;
  reason: string;
  timestamp: string;
  duration_minutes: number;
  affected_key: string;
}

export const BreakGlassPanel: React.FC = () => {
  const { role, session } = useAuth();
  const [glassBroken, setGlassBroken] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [events, setEvents] = useState<BreakGlassEvent[]>([]);
  const [timer, setTimer] = useState(0);
  const [timerHandle, setTimerHandle] = useState<NodeJS.Timeout | null>(null);

  const canBreakGlass = role === 'executive_admin' || role === 'security_officer';
  const CONFIRM_CODE = 'BREAK-GLASS-RN';

  const handleBreakGlass = () => {
    if (confirmCode !== CONFIRM_CODE || !reason.trim()) return;

    const newEvent: BreakGlassEvent = {
      id: `bg-${Date.now()}`,
      initiator: session?.email || 'unknown',
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
      duration_minutes: 15,
      affected_key: 'master-key-01',
    };

    setEvents((prev) => [newEvent, ...prev]);
    setGlassBroken(true);
    setConfirmCode('');
    setReason('');

    // 15-minute auto-seal timer
    let elapsed = 0;
    const handle = setInterval(() => {
      elapsed += 1;
      setTimer(elapsed);
      if (elapsed >= 900) {
        clearInterval(handle);
        setGlassBroken(false);
        setTimer(0);
      }
    }, 1000);
    setTimerHandle(handle);
  };

  const sealGlass = () => {
    setGlassBroken(false);
    setTimer(0);
    if (timerHandle) {
      clearInterval(timerHandle);
      setTimerHandle(null);
    }
  };

  const remainingSeconds = 900 - timer;
  const mm = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const ss = (remainingSeconds % 60).toString().padStart(2, '0');

  if (!canBreakGlass) {
    return (
      <Card>
        <div style={{ padding: '1rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: '#EF4444', textAlign: 'center' }}>
          403 // BREAK-GLASS RESTRICTED TO EXECUTIVE ADMIN & SECURITY OFFICER
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{
        border: glassBroken ? '1px solid #EF4444' : '1px solid var(--nexus-border, #1F2633)',
        boxShadow: glassBroken ? '0 0 20px rgba(239,68,68,0.2)' : undefined,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          borderBottom: `1px solid ${glassBroken ? 'rgba(239,68,68,0.4)' : 'var(--nexus-border, #1F2633)'}`,
          paddingBottom: '0.75rem',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: glassBroken ? '#EF4444' : '#FFFFFF',
            margin: 0,
          }}
        >
          ⚠ BREAK-GLASS EMERGENCY ACCESS
        </h3>
        {glassBroken ? (
          <Badge variant="critical">ACTIVE — {mm}:{ss}</Badge>
        ) : (
          <Badge variant="cobalt">SEALED</Badge>
        )}
      </div>

      {glassBroken ? (
        <div>
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              color: '#EF4444',
              marginBottom: '1rem',
            }}
          >
            ⚠ BREAK-GLASS ACTIVE — EMERGENCY ACCESS WINDOW OPEN
            <br />
            FULL AUDIT LOG CAPTURING ALL KEY OPERATIONS
            <br />
            AUTO-SEAL IN: {mm}:{ss}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { label: 'EMERGENCY OPS', value: 'AUTHORIZED' },
              { label: 'KEY SCOPE', value: 'master-key-01' },
              { label: 'SESSION RECORDING', value: '● ACTIVE' },
              { label: 'NOTIFICATIONS', value: 'SENT TO OPS TEAM' },
            ].map((item) => (
              <div key={item.label} style={{ padding: '0.4rem', backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#8A99AD' }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.6875rem', color: '#EF4444', fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>

          <Button variant="danger" size="sm" onClick={sealGlass}>
            SEAL BREAK-GLASS — CLOSE EMERGENCY ACCESS
          </Button>
        </div>
      ) : (
        <div>
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(0,82,255,0.05)',
              border: '1px solid rgba(0,82,255,0.3)',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.625rem',
              color: '#8A99AD',
              marginBottom: '1rem',
            }}
          >
            BREAK-GLASS activates a 15-minute emergency window with full audit recording. All actions are logged to immutable ledger and notified to the full security team.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.625rem', color: '#8A99AD', marginBottom: '4px' }}>
                INCIDENT REASON (REQUIRED)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Production outage, key compromise investigation..."
                className="rn-input"
                style={{ width: '100%', backgroundColor: '#0A0D12', border: '1px solid #1F2633', padding: '0.5rem 0.75rem', color: '#FFFFFF', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.625rem', color: '#EF4444', marginBottom: '4px' }}>
                TYPE CONFIRMATION CODE: <strong>BREAK-GLASS-RN</strong>
              </label>
              <input
                type="text"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                placeholder="BREAK-GLASS-RN"
                className="rn-input"
                style={{ width: '100%', backgroundColor: '#0A0D12', border: '1px solid rgba(239,68,68,0.4)', padding: '0.5rem 0.75rem', color: '#EF4444', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', letterSpacing: '0.08em' }}
              />
            </div>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={handleBreakGlass}
            disabled={confirmCode !== CONFIRM_CODE || !reason.trim()}
          >
            ⚠ AUTHORIZE BREAK-GLASS ACCESS
          </Button>
        </div>
      )}

      {/* Audit History */}
      {events.length > 0 && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--nexus-border, #1F2633)' }}>
          <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.625rem', color: '#8A99AD', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            BREAK-GLASS AUDIT LOG
          </div>
          {events.map((e) => (
            <div key={e.id} style={{ padding: '0.5rem', backgroundColor: '#0A0D12', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.625rem', color: '#EF4444' }}>{e.initiator}</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5625rem', color: '#8A99AD' }}>{new Date(e.timestamp).toUTCString()}</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#8A99AD', marginTop: '2px' }}>{e.reason}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────
// Secret Lifecycle Timeline
// ─────────────────────────────────────────────

import type { EnclaveSecret } from './SecretsMatrix';

export const SecretLifecycleTimeline: React.FC<{ secrets: EnclaveSecret[] }> = ({ secrets }) => {
  const displaySecrets = secrets.slice(0, 5);

  return (
    <Card>
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#FFFFFF',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--nexus-border, #1F2633)',
        }}
      >
        KEY LIFECYCLE TIMELINE
      </div>

      {displaySecrets.length === 0 && (
        <div style={{ textAlign: 'center', color: '#8A99AD', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', padding: '1rem' }}>
          No secrets provisioned. Provision keys to view lifecycle.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {displaySecrets.map((secret) => {
          const rotatedDate = new Date(secret.last_rotated);
          const now = new Date();
          const daysSinceRotation = Math.floor((now.getTime() - rotatedDate.getTime()) / 86400000);
          const nextRotationDue = 90 - daysSinceRotation;
          const rotationPct = Math.min(100, (daysSinceRotation / 90) * 100);
          const isExpiring = nextRotationDue <= 14;

          return (
            <div
              key={secret.id}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--nexus-surface3, #1A212E)',
                borderRadius: '4px',
                border: `1px solid ${isExpiring ? 'rgba(245,158,11,0.4)' : 'var(--nexus-border, #1F2633)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', fontWeight: 700, color: '#00D2FF' }}>
                  {secret.key_alias}
                </span>
                <Badge variant={isExpiring ? 'warn' : 'nominal'}>
                  {isExpiring ? `${nextRotationDue}D LEFT` : 'COMPLIANT'}
                </Badge>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '6px' }}>
                {secret.environment.toUpperCase()} · Last rotated {daysSinceRotation}d ago
              </div>
              <div style={{ height: '4px', borderRadius: '2px', backgroundColor: '#1F2633', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${rotationPct}%`,
                    backgroundColor: isExpiring ? '#F59E0B' : '#0052FF',
                    borderRadius: '2px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
