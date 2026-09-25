'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@rn/brand';

interface BuildJob {
  id: string;
  sha: string;
  branch: string;
  environment: 'production' | 'staging' | 'canary';
  cluster: string;
  duration: string;
  status: 'deployed' | 'building' | 'failed';
  timestamp: string;
}

export const DeploymentPipelines: React.FC = () => {
  const [builds, setBuilds] = useState<BuildJob[]>([
    {
      id: 'b-9481',
      sha: 'c15cbe7',
      branch: 'main',
      environment: 'production',
      cluster: 'iad-primary-01',
      duration: '42s',
      status: 'deployed',
      timestamp: '2m ago',
    },
    {
      id: 'b-9480',
      sha: '8f2910a',
      branch: 'feat/neural-mesh',
      environment: 'canary',
      cluster: 'fra-edge-02',
      duration: '58s',
      status: 'deployed',
      timestamp: '18m ago',
    },
    {
      id: 'b-9479',
      sha: '03d91bb',
      branch: 'staging',
      environment: 'staging',
      cluster: 'sin-edge-03',
      duration: '35s',
      status: 'deployed',
      timestamp: '1h ago',
    },
  ]);

  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [selectedCluster, setSelectedCluster] = useState('iad-primary-01');
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDispatch = () => {
    setIsDeploying(true);
    setTimeout(() => {
      const newJob: BuildJob = {
        id: `b-${Math.floor(1000 + Math.random() * 9000)}`,
        sha: Math.random().toString(36).substring(2, 9),
        branch: selectedBranch,
        environment: selectedBranch === 'main' ? 'production' : 'canary',
        cluster: selectedCluster,
        duration: '18s',
        status: 'deployed',
        timestamp: 'Just now',
      };
      setBuilds([newJob, ...builds]);
      setIsDeploying(false);
      setDispatchModalOpen(false);
    }, 1500);
  };

  return (
    <Card className="forge-deployment-pipelines">
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
        <div>
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
            ACTIVE DEPLOYMENT PIPELINES
          </h4>
          <span style={{ fontSize: '0.6875rem', color: 'var(--nexus-slate, #8A99AD)' }}>
            Zero-downtime rolling cluster telemetry
          </span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setDispatchModalOpen(true)}
        >
          + DISPATCH BUILD
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {builds.map((b) => (
          <div
            key={b.id}
            style={{
              padding: '0.65rem 0.75rem',
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
              <Badge variant={b.environment === 'production' ? 'nominal' : 'cobalt'}>
                {b.environment.toUpperCase()}
              </Badge>
              <Badge variant="live">{b.duration}</Badge>
            </div>
          </div>
        ))}
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
                  TARGET BRANCH / COMMIT
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="rn-input"
                >
                  <option value="main">main (Production Release)</option>
                  <option value="staging">staging (Pre-flight Validation)</option>
                  <option value="canary">canary (10% Traffic Partition)</option>
                </select>
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
