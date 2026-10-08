'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import { useAuth } from '@rn/auth';
import { getStoredItem, setStoredItem } from '@rn/db';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  tier: 'enterprise' | 'growth' | 'all';
  rollout_pct: number;
}

const DEFAULT_FLAGS: FeatureFlag[] = [
  { id: 'ff-001', name: 'DISTRIBUTED_QUERY_CACHE', description: 'Multi-region edge query caching layer for sub-millisecond lookups', enabled: true, tier: 'enterprise', rollout_pct: 100 },
  { id: 'ff-002', name: 'MULTI_REGION_DEPLOY', description: 'One-click multi-cluster deployment to US/EU/AP edge nodes', enabled: true, tier: 'enterprise', rollout_pct: 100 },
  { id: 'ff-003', name: 'ADVANCED_TELEMETRY', description: 'p99 latency histograms, flame graphs, and distributed tracing', enabled: true, tier: 'growth', rollout_pct: 50 },
  { id: 'ff-004', name: 'WHITE_LABEL_PORTAL', description: 'Custom tenant domain and cryptographic branding for client portal', enabled: false, tier: 'enterprise', rollout_pct: 0 },
  { id: 'ff-005', name: 'AUTOMATED_RETAINER', description: 'Auto-generate recurring retainer invoices on scheduled billing cycles', enabled: true, tier: 'all', rollout_pct: 100 },
];

export const FeatureFlagPanel: React.FC = () => {
  const { role } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagDesc, setNewFlagDesc] = useState('');
  const [newFlagTier, setNewFlagTier] = useState<'enterprise' | 'growth' | 'all'>('enterprise');

  useEffect(() => {
    const stored = getStoredItem<FeatureFlag[]>('forge_feature_flags', DEFAULT_FLAGS);
    setFlags(stored);
  }, []);

  const saveFlags = (updated: FeatureFlag[]) => {
    setFlags(updated);
    setStoredItem('forge_feature_flags', updated);
  };

  const canEdit = role === 'executive_admin' || role === 'operations_lead';

  const toggleFlag = (id: string) => {
    if (!canEdit) return;
    const updated = flags.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    saveFlags(updated);
  };

  const setRollout = (id: string, pct: number) => {
    if (!canEdit) return;
    const updated = flags.map((f) => (f.id === id ? { ...f, rollout_pct: pct } : f));
    saveFlags(updated);
  };

  const handleCreateFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagName.trim()) return;
    const created: FeatureFlag = {
      id: `ff-${Date.now()}`,
      name: newFlagName.trim().toUpperCase().replace(/\s+/g, '_'),
      description: newFlagDesc.trim() || 'Custom runtime feature flag',
      enabled: false,
      tier: newFlagTier,
      rollout_pct: 0,
    };
    saveFlags([created, ...flags]);
    setNewFlagName('');
    setNewFlagDesc('');
    setModalOpen(false);
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
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            FEATURE FLAG MATRIX
          </h3>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.625rem',
              color: '#8A99AD',
            }}
          >
            {flags.filter((f) => f.enabled).length}/{flags.length} ENABLED
          </span>
        </div>

        {canEdit && (
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>
            + NEW FLAG
          </Button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {flags.map((flag) => (
          <div
            key={flag.id}
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--nexus-surface3, #1A212E)',
              borderRadius: '4px',
              border: `1px solid ${flag.enabled ? 'rgba(0,229,153,0.3)' : 'var(--nexus-border, #1F2633)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: flag.enabled ? '#00E599' : '#8A99AD',
                }}
              >
                {flag.name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant={flag.tier === 'enterprise' ? 'cobalt' : flag.tier === 'growth' ? 'nominal' : 'live'}>
                  {flag.tier.toUpperCase()}
                </Badge>
                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => toggleFlag(flag.id)}
                  disabled={!canEdit}
                  style={{
                    width: '36px',
                    height: '20px',
                    borderRadius: '10px',
                    backgroundColor: flag.enabled ? '#00E599' : '#1F2633',
                    border: 'none',
                    cursor: canEdit ? 'pointer' : 'not-allowed',
                    position: 'relative',
                    transition: 'background-color 0.2s ease',
                  }}
                  aria-label={`Toggle ${flag.name}`}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '3px',
                      left: flag.enabled ? '18px' : '3px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      transition: 'left 0.2s ease',
                    }}
                  />
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '6px' }}>
              {flag.description}
            </div>

            {flag.enabled && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#8A99AD' }}>
                    TRAFFIC ROLLOUT
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#00D2FF' }}>
                    {flag.rollout_pct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={flag.rollout_pct}
                  disabled={!canEdit}
                  onChange={(e) => setRollout(flag.id, parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#0052FF' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="rn-card"
            style={{
              maxWidth: '440px',
              width: '100%',
              backgroundColor: '#141923',
              border: '1px solid #1F2633',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.875rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                marginBottom: '1rem',
              }}
            >
              CREATE FEATURE FLAG
            </h3>
            <form onSubmit={handleCreateFlag} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '4px' }}>
                  FLAG KEY NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ENABLE_EVENT_STREAM"
                  value={newFlagName}
                  onChange={(e) => setNewFlagName(e.target.value)}
                  className="rn-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '4px' }}>
                  DESCRIPTION
                </label>
                <input
                  type="text"
                  placeholder="Operational purpose of this toggle"
                  value={newFlagDesc}
                  onChange={(e) => setNewFlagDesc(e.target.value)}
                  className="rn-input"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '4px' }}>
                  TIER REQUIREMENT
                </label>
                <select
                  value={newFlagTier}
                  onChange={(e) => setNewFlagTier(e.target.value as typeof newFlagTier)}
                  className="rn-input"
                >
                  <option value="enterprise">ENTERPRISE ONLY</option>
                  <option value="growth">GROWTH</option>
                  <option value="all">ALL TIERS</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                  CANCEL
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  SAVE FLAG
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────
// Deployment Heatmap Calendar
// ─────────────────────────────────────────────

export const DeploymentHeatmap: React.FC = () => {
  // Generate 90 days of deploy cadence
  const days = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (89 - i));
    return {
      date,
      deploys: (i % 7 === 0 || i % 5 === 0) ? Math.floor((i % 4) + 1) : 0,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const maxDeploys = Math.max(...days.map((d) => d.deploys), 1);

  const getCellColor = (count: number) => {
    if (count === 0) return '#141923';
    const intensity = count / maxDeploys;
    if (intensity < 0.3) return 'rgba(0,82,255,0.3)';
    if (intensity < 0.6) return 'rgba(0,82,255,0.6)';
    return '#0052FF';
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
          DEPLOYMENT CADENCE (90D)
        </h3>
        <Badge variant="cobalt">
          {days.reduce((acc, d) => acc + d.deploys, 0)} CADENCE CYCLES
        </Badge>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3px',
        }}
      >
        {days.map((day, i) => (
          <div
            key={i}
            title={`${day.label}: ${day.deploys} deployment${day.deploys !== 1 ? 's' : ''}`}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '2px',
              backgroundColor: getCellColor(day.deploys),
              cursor: 'default',
              transition: 'background-color 0.2s ease',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#8A99AD' }}>LESS</span>
        {[0, 1, 3, 5].map((count) => (
          <div
            key={count}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              backgroundColor: getCellColor(count),
            }}
          />
        ))}
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5rem', color: '#8A99AD' }}>MORE</span>
      </div>
    </Card>
  );
};
