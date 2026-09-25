'use client';

import React, { useState, useEffect } from 'react';
import { Card, StatusPill } from '@rn/brand';

interface NodeTelemetry {
  region: string;
  name: string;
  latency: number;
  status: 'nominal' | 'live' | 'warn';
  load: number;
}

export const SystemTelemetryPanel: React.FC = () => {
  const [nodes, setNodes] = useState<NodeTelemetry[]>([
    { region: 'US-EAST', name: 'iad-primary-01', latency: 12, status: 'live', load: 38 },
    { region: 'EU-CENTRAL', name: 'fra-edge-02', latency: 28, status: 'nominal', load: 45 },
    { region: 'AP-SOUTH', name: 'sin-edge-03', latency: 64, status: 'nominal', load: 29 },
  ]);

  const [dbStatus, setDbStatus] = useState({
    poolConnected: true,
    activeConnections: 14,
    cacheHitRate: 99.4,
    replicationLagMs: 2,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live jitter for telemetry monitoring
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          latency: Math.max(8, n.latency + Math.floor(Math.random() * 5 - 2)),
          load: Math.min(95, Math.max(20, n.load + Math.floor(Math.random() * 7 - 3))),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="hub-telemetry-panel">
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
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-nominal, #10B981)',
              boxShadow: '0 0 8px var(--status-nominal, #10B981)',
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
            SYSTEM TELEMETRY
          </h3>
        </div>
        <StatusPill label="SYS NOMINAL" variant="nominal" />
      </div>

      {/* Cluster Nodes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.625rem',
            letterSpacing: '0.08em',
            color: 'var(--nexus-slate, #8A99AD)',
            textTransform: 'uppercase',
          }}
        >
          EDGE CLUSTERS
        </div>

        {nodes.map((node) => (
          <div
            key={node.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.75rem',
              backgroundColor: 'var(--nexus-surface3, #1A212E)',
              borderRadius: '4px',
              border: '1px solid var(--nexus-border, #1F2633)',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--nexus-white, #FFFFFF)',
                }}
              >
                {node.name}
              </div>
              <div
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--nexus-slate, #8A99AD)',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                {node.region} • LOAD: {node.load}%
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--nexus-cyan, #00D2FF)',
                }}
              >
                {node.latency}ms
              </span>
            </div>
          </div>
        ))}

        {/* Database Metrics */}
        <div
          style={{
            marginTop: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--nexus-border, #1F2633)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.625rem',
              letterSpacing: '0.08em',
              color: 'var(--nexus-slate, #8A99AD)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}
          >
            SUPABASE POSTGRESQL MATRIX
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--nexus-surface3, #1A212E)',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--nexus-border, #1F2633)',
              }}
            >
              <div style={{ fontSize: '0.625rem', color: 'var(--nexus-slate)', fontFamily: 'var(--font-mono)' }}>
                CACHE HIT RATIO
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#10B981', fontFamily: 'var(--font-sans)' }}>
                {dbStatus.cacheHitRate}%
              </div>
            </div>
            <div
              style={{
                backgroundColor: 'var(--nexus-surface3, #1A212E)',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid var(--nexus-border, #1F2633)',
              }}
            >
              <div style={{ fontSize: '0.625rem', color: 'var(--nexus-slate)', fontFamily: 'var(--font-mono)' }}>
                REPLICA LAG
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--nexus-cyan)', fontFamily: 'var(--font-mono)' }}>
                {dbStatus.replicationLagMs}ms
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
