'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import { getStoredItem, setStoredItem } from '@rn/db';

export interface BuildJob {
  id: string;
  sha: string;
  branch: string;
  environment: 'production' | 'staging' | 'canary';
  cluster: string;
  duration: string;
  status: 'deployed' | 'building' | 'failed' | 'rolled_back';
  timestamp: string;
}

export const DeploymentPipelines: React.FC = () => {
  const [builds, setBuilds] = useState<BuildJob[]>([]);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [customBranch, setCustomBranch] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('iad-primary-01');
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    const stored = getStoredItem<BuildJob[]>('forge_build_jobs', []);
    setBuilds(stored);
  }, []);

  const saveBuilds = (updated: BuildJob[]) => {
    setBuilds(updated);
    setStoredItem('forge_build_jobs', updated);
  };

  const handleDispatch = () => {
    setIsDeploying(true);
    const branchToDeploy = customBranch.trim() || selectedBranch;
    setTimeout(() => {
      const newJob: BuildJob = {
        id: `b-${Math.floor(1000 + Math.random() * 9000)}`,
        sha: Math.random().toString(36).substring(2, 9),
        branch: branchToDeploy,
        environment: branchToDeploy === 'main' ? 'production' : branchToDeploy.startsWith('canary') ? 'canary' : 'staging',
        cluster: selectedCluster,
        duration: '18s',
        status: 'deployed',
        timestamp: 'Just now',
      };
      saveBuilds([newJob, ...builds]);
      setIsDeploying(false);
      setDispatchModalOpen(false);
      setCustomBranch('');
    }, 1200);
  };

  const handleRollback = (id: string) => {
    const updated = builds.map((b) =>
      b.id === id ? { ...b, status: 'rolled_back' as const } : b
    );
    saveBuilds(updated);
  };

  const handleDelete = (id: string) => {
    const updated = builds.filter((b) => b.id !== id);
    saveBuilds(updated);
  };

  const badgeVariant = (status: BuildJob['status']) => {
    switch (status) {
      case 'deployed': return 'nominal';
      case 'building': return 'live';
      case 'failed': return 'critical';
      case 'rolled_back': return 'warn';
      default: return 'default';
    }
  };

  return (
    <Card className="forge-deployment-pipelines">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--nexus-border, #1F2633)',
          paddingBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-nominal, #00E599)',
              boxShadow: '0 0 6px var(--status-nominal, #00E599)',
            }}
          />
          <h3
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.875rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--nexus-white, #FFFFFF)',
              margin: 0,
            }}
          >
            CLUSTER DEPLOYMENT PIPELINES
          </h3>
          <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--nexus-slate)' }}>
            ({builds.length})
          </span>
        </div>

        <Button variant="primary" size="sm" onClick={() => setDispatchModalOpen(true)}>
          + DISPATCH BUILD
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {builds.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              color: 'var(--nexus-slate, #8A99AD)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
            }}
          >
            No active deployment pipelines executed yet. Click <strong>+ DISPATCH BUILD</strong> to trigger your first cluster rollout.
          </div>
        ) : (
          builds.map((b) => (
            <div
              key={b.id}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--nexus-surface3, #1A212E)',
                borderRadius: '4px',
                border: '1px solid var(--nexus-border, #1F2633)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--nexus-cyan, #00D2FF)',
                    }}
                  >
                    {b.branch}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.6875rem',
                      color: 'var(--nexus-slate, #8A99AD)',
                    }}
                  >
                    ({b.sha})
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'var(--nexus-slate, #8A99AD)',
                    marginTop: '2px',
                  }}
                >
                  CLUSTER: {b.cluster} • {b.timestamp}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Badge variant={badgeVariant(b.status)}>
                  {b.status.toUpperCase()}
                </Badge>
                <Badge variant={b.environment === 'production' ? 'nominal' : 'cobalt'}>
                  {b.environment.toUpperCase()}
                </Badge>
                {b.status === 'deployed' && (
                  <button
                    type="button"
                    onClick={() => handleRollback(b.id)}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#F59E0B',
                      borderRadius: '3px',
                      padding: '2px 6px',
                      fontSize: '0.625rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                    title="Rollback this deployment"
                  >
                    ROLLBACK
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8A99AD',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                  title="Remove log entry"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispatch Build Modal */}
      {dispatchModalOpen && (
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
              backgroundColor: 'var(--nexus-carbon, #141923)',
              border: '1px solid var(--nexus-border, #1F2633)',
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
              DISPATCH CLUSTER DEPLOYMENT
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--nexus-slate)', marginBottom: '4px' }}>
                  BRANCH PRESET
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="rn-input"
                >
                  <option value="main">main (Production Release)</option>
                  <option value="staging">staging (Pre-flight Validation)</option>
                  <option value="canary">canary (Traffic Partition)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--nexus-slate)', marginBottom: '4px' }}>
                  CUSTOM BRANCH (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. feat/payment-gateway"
                  value={customBranch}
                  onChange={(e) => setCustomBranch(e.target.value)}
                  className="rn-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--nexus-slate)', marginBottom: '4px' }}>
                  TARGET EDGE CLUSTER
                </label>
                <select
                  value={selectedCluster}
                  onChange={(e) => setSelectedCluster(e.target.value)}
                  className="rn-input"
                >
                  <option value="iad-primary-01">iad-primary-01 (US-East)</option>
                  <option value="fra-edge-02">fra-edge-02 (EU-Central)</option>
                  <option value="sin-edge-03">sin-edge-03 (AP-South)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Button variant="ghost" size="sm" onClick={() => setDispatchModalOpen(false)}>
                  CANCEL
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDispatch}
                  disabled={isDeploying}
                >
                  {isDeploying ? 'DISPATCHING...' : 'TRIGGER DISPATCH'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
