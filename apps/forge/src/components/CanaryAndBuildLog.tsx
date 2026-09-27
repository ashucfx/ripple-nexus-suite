'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import { useAuth } from '@rn/auth';

interface CanaryDeployProps {
  onDeploy?: (percentage: number) => void;
}

export const CanaryDeployControl: React.FC<CanaryDeployProps> = ({ onDeploy }) => {
  const { role } = useAuth();
  const [canaryPct, setCanaryPct] = useState(0);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'deploying' | 'monitoring' | 'rolled_back' | 'success'>('idle');
  const [errorRate, setErrorRate] = useState(0);
  const [justification, setJustification] = useState('');

  const canDeploy = role === 'executive_admin' || role === 'operations_lead';
  const canarySteps = [10, 25, 50, 100];

  const startCanary = () => {
    if (!canaryPct || !justification.trim()) return;
    setDeployStatus('deploying');
    setTimeout(() => {
      setDeployStatus('monitoring');
      // Simulate error rate (normally would come from observability API)
      const simulatedErrorRate = Math.random() * 2;
      setErrorRate(parseFloat(simulatedErrorRate.toFixed(2)));

      // Auto-rollback if error rate > 1.5%
      if (simulatedErrorRate > 1.5) {
        setTimeout(() => {
          setDeployStatus('rolled_back');
          setCanaryPct(0);
        }, 2000);
      } else {
        setTimeout(() => {
          setDeployStatus('success');
          onDeploy?.(canaryPct);
        }, 3000);
      }
    }, 1500);
  };

  const statusColors = {
    idle: '#8A99AD',
    deploying: '#F59E0B',
    monitoring: '#00D2FF',
    rolled_back: '#EF4444',
    success: '#00E599',
  };

  if (!canDeploy) {
    return (
      <Card>
        <div style={{ padding: '1rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: '#EF4444' }}>
          403 // CANARY DEPLOY RESTRICTED TO EXECUTIVE ADMIN & OPERATIONS LEAD
        </div>
      </Card>
    );
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
          CANARY DEPLOYMENT CONTROL
        </h3>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.6875rem',
            color: statusColors[deployStatus],
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {deployStatus.replace('_', ' ')}
        </span>
      </div>

      {/* Traffic split indicator */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.625rem', color: '#8A99AD' }}>
            STABLE (BLUE) — {100 - canaryPct}%
          </span>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.625rem', color: '#00D2FF' }}>
            CANARY (GREEN) — {canaryPct}%
          </span>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', backgroundColor: '#1F2633' }}>
          <div
            style={{
              height: '100%',
              width: `${100 - canaryPct}%`,
              backgroundColor: '#0052FF',
              transition: 'width 0.4s ease',
            }}
          />
          <div
            style={{
              height: '100%',
              width: `${canaryPct}%`,
              backgroundColor: '#00E599',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Step selectors */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {canarySteps.map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => setCanaryPct(step)}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: canaryPct === step ? '1px solid #00D2FF' : '1px solid #1F2633',
              backgroundColor: canaryPct === step ? 'rgba(0,210,255,0.1)' : '#1A212E',
              color: canaryPct === step ? '#00D2FF' : '#8A99AD',
              cursor: 'pointer',
            }}
          >
            {step}%
          </button>
        ))}
      </div>

      {/* Justification input */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.625rem',
            color: '#8A99AD',
            marginBottom: '4px',
          }}
        >
          OPERATIONAL JUSTIFICATION (REQUIRED)
        </label>
        <input
          type="text"
          value={justification}
          onChange={(e) => setJustification(e.target.value)}
          placeholder="Ticket #, reason for canary deployment..."
          className="rn-input"
          style={{
            width: '100%',
            backgroundColor: '#0A0D12',
            border: '1px solid #1F2633',
            padding: '0.5rem 0.75rem',
            color: '#FFFFFF',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
          }}
        />
      </div>

      {/* Error rate during monitoring */}
      {deployStatus === 'monitoring' && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: errorRate > 1.5 ? 'rgba(239,68,68,0.1)' : 'rgba(0,229,153,0.08)',
            border: `1px solid ${errorRate > 1.5 ? 'rgba(239,68,68,0.4)' : 'rgba(0,229,153,0.3)'}`,
            borderRadius: '4px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            color: errorRate > 1.5 ? '#EF4444' : '#00E599',
          }}
        >
          LIVE ERROR RATE: {errorRate}% {errorRate > 1.5 ? '⚠ EXCEEDS 1.5% THRESHOLD — AUTO-ROLLBACK TRIGGERED' : '✓ WITHIN TOLERANCE'}
        </div>
      )}

      {deployStatus === 'rolled_back' && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            color: '#EF4444',
          }}
        >
          ⚠ CIRCUIT BREAKER ACTIVATED — Canary automatically rolled back to stable cluster. Error rate exceeded 1.5% safety threshold.
        </div>
      )}

      <Button
        variant={deployStatus === 'idle' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => {
          if (deployStatus === 'success' || deployStatus === 'rolled_back') {
            setDeployStatus('idle');
            setCanaryPct(0);
            setJustification('');
            setErrorRate(0);
          } else {
            startCanary();
          }
        }}
        disabled={deployStatus === 'deploying' || deployStatus === 'monitoring'}
      >
        {deployStatus === 'idle' ? `INITIATE ${canaryPct}% CANARY DEPLOY`
          : deployStatus === 'deploying' ? 'DEPLOYING TO CLUSTER...'
          : deployStatus === 'monitoring' ? 'MONITORING TRAFFIC...'
          : deployStatus === 'rolled_back' ? 'ROLLBACK COMPLETE — RESET'
          : 'DEPLOY SUCCESS — RESET'}
      </Button>
    </Card>
  );
};

// ─────────────────────────────────────────────
// Build Log Streaming Terminal
// ─────────────────────────────────────────────

export const BuildLogTerminal: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    '[00:00.000] Starting RN Enterprise Build Pipeline v4.1...',
    '[00:00.120] Checking out SHA: a3f81c2 (main)',
    '[00:00.450] Installing dependencies (frozen lockfile)...',
  ]);
  const [streaming, setStreaming] = useState(false);

  const startStream = () => {
    setStreaming(true);
    const events = [
      '[00:12.200] npm ci — 847 packages installed',
      '[00:13.100] TypeScript strict check — PASS',
      '[00:13.400] ESLint quality gate — PASS (0 warnings)',
      '[00:13.800] Container image build starting...',
      '[00:25.100] Step 1/8: FROM node:20-alpine',
      '[00:25.200] Step 2/8: WORKDIR /app',
      '[00:26.400] Step 3/8: COPY package*.json ./',
      '[00:27.800] Step 4/8: RUN npm ci --production',
      '[00:45.200] Step 5/8: COPY . .',
      '[00:46.000] Step 6/8: RUN npm run build',
      '[01:15.400] Step 7/8: EXPOSE 3000',
      '[01:15.500] Step 8/8: CMD ["node", "server.js"]',
      '[01:16.000] Image tagged: rn-hub:a3f81c2',
      '[01:16.200] CVE Scan — 0 critical, 0 high vulnerabilities',
      '[01:16.500] Pushing to registry: registry.theripplenexus.com/hub:a3f81c2',
      '[01:18.200] Smoke test endpoint: GET /api/health — 200 OK (12ms)',
      '[01:18.500] ✓ BUILD COMPLETE — ARTIFACT VERIFIED',
    ];

    events.forEach((line, i) => {
      setTimeout(() => {
        setLogs((prev) => [...prev.slice(-40), line]);
        if (i === events.length - 1) setStreaming(false);
      }, i * 300);
    });
  };

  const clearLogs = () => {
    setLogs([]);
    setStreaming(false);
  };

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        {/* Terminal window dots */}
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
          <span
            style={{
              marginLeft: '0.5rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.625rem',
              color: '#8A99AD',
            }}
          >
            rn-build-pipeline --stream
          </span>
          {streaming && (
            <span
              style={{
                marginLeft: '0.5rem',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#00D2FF',
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={clearLogs}>
            CLEAR
          </Button>
          <Button variant="primary" size="sm" onClick={startStream} disabled={streaming}>
            {streaming ? 'STREAMING...' : 'RUN BUILD'}
          </Button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#05070A',
          borderRadius: '4px',
          border: '1px solid #1F2633',
          padding: '0.75rem',
          height: '240px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.6875rem',
          lineHeight: 1.7,
        }}
      >
        {logs.map((line, i) => {
          const isError = line.includes('ERROR') || line.includes('failed');
          const isSuccess = line.includes('✓') || line.includes('PASS') || line.includes('COMPLETE');
          const isWarn = line.includes('⚠') || line.includes('WARN');

          return (
            <div
              key={i}
              style={{
                color: isError ? '#EF4444' : isSuccess ? '#00E599' : isWarn ? '#F59E0B' : '#8A99AD',
              }}
            >
              {line}
            </div>
          );
        })}
        {logs.length === 0 && (
          <span style={{ color: '#1F2633' }}>// No build logs — click RUN BUILD to stream</span>
        )}
      </div>
    </Card>
  );
};
