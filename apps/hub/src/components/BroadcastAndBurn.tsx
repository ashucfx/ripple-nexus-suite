'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import type { Brief } from '@rn/db';
import { useAuth } from '@rn/auth';

interface BroadcastBannerProps {
  message?: string;
}

export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({ message: initialMessage }) => {
  const { role } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(initialMessage || '');
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState('');
  const [severity, setSeverity] = useState<'maintenance' | 'incident' | 'info'>('info');

  const canEdit = role === 'executive_admin' || role === 'operations_lead';

  const severityColor = {
    maintenance: '#F59E0B',
    incident: '#EF4444',
    info: '#0052FF',
  }[severity];

  if (!isVisible && !canEdit) return null;

  if (!isVisible && canEdit) {
    return (
      <div
        style={{
          borderBottom: '1px solid var(--nexus-border, #1F2633)',
          backgroundColor: 'var(--nexus-carbon, #141923)',
          padding: '0.5rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.625rem',
            color: 'var(--nexus-slate, #8A99AD)',
            letterSpacing: '0.06em',
          }}
        >
          BROADCAST ENGINE // NO ACTIVE ALERT
        </span>
        <Button variant="secondary" size="sm" onClick={() => { setEditMode(true); setIsVisible(true); }}>
          + BROADCAST ALERT
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        borderBottom: `1px solid ${severityColor}`,
        backgroundColor: `rgba(${severity === 'incident' ? '239,68,68' : severity === 'maintenance' ? '245,158,11' : '0,82,255'}, 0.08)`,
        padding: '0.65rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: severityColor,
            boxShadow: `0 0 8px ${severityColor}`,
            flexShrink: 0,
          }}
        />
        {editMode && canEdit ? (
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1, flexWrap: 'wrap' }}>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as typeof severity)}
              className="rn-input"
              style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.625rem', fontFamily: 'var(--font-mono, monospace)' }}
            >
              <option value="info">INFO</option>
              <option value="maintenance">MAINTENANCE</option>
              <option value="incident">INCIDENT</option>
            </select>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Enter broadcast message for all 6 subnets..."
              className="rn-input"
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--nexus-border, #1F2633)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: '0.8125rem',
              }}
            />
          </div>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: '0.8125rem',
              color: '#FFFFFF',
              fontWeight: 500,
            }}
          >
            <strong style={{ color: severityColor, marginRight: '0.5rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.625rem' }}>
              [{severity.toUpperCase()}]
            </strong>
            {message}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {editMode && canEdit ? (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (draft.trim()) {
                  setMessage(draft.trim());
                  setDraft('');
                  setEditMode(false);
                }
              }}
            >
              PUBLISH
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { setEditMode(false); if (!message) setIsVisible(false); }}>
              CANCEL
            </Button>
          </>
        ) : (
          <>
            {canEdit && (
              <Button variant="secondary" size="sm" onClick={() => { setDraft(message); setEditMode(true); }}>
                EDIT
              </Button>
            )}
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#8A99AD',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0 4px',
              }}
              title="Dismiss"
            >
              ×
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Budget Burn Tracker
// ─────────────────────────────────────────────

interface BudgetBurnTrackerProps {
  briefs: Brief[];
}

export const BudgetBurnTracker: React.FC<BudgetBurnTrackerProps> = ({ briefs }) => {
  const { role, session } = useAuth();

  // Contractors only see their own brief's budget
  const visibleBriefs = role === 'client_contractor'
    ? briefs.filter((b) => b.client_id === session?.clientId)
    : briefs;

  const totalBudget = visibleBriefs.reduce((acc, b) => acc + (b.budget || 0), 0);
  // Simulate 60% burn rate for demo purposes
  const burnedAmount = Math.round(totalBudget * 0.6);
  const burnPct = totalBudget > 0 ? (burnedAmount / totalBudget) * 100 : 0;

  const burnColor = burnPct > 85 ? '#EF4444' : burnPct > 65 ? '#F59E0B' : '#00D2FF';

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
          OPERATIONAL BUDGET BURN
        </h3>
        <Badge variant={burnPct > 85 ? 'critical' : burnPct > 65 ? 'warn' : 'nominal'}>
          {burnPct.toFixed(1)}% UTILIZED
        </Badge>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: '#8A99AD' }}>
          BURNED: ${(burnedAmount / 1000).toFixed(1)}k
        </span>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: '#8A99AD' }}>
          CAP: ${(totalBudget / 1000).toFixed(1)}k
        </span>
      </div>

      {/* Burn Rate Bar */}
      <div
        style={{
          height: '8px',
          borderRadius: '4px',
          backgroundColor: '#1F2633',
          overflow: 'hidden',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, burnPct)}%`,
            backgroundColor: burnColor,
            boxShadow: `0 0 6px ${burnColor}`,
            transition: 'width 0.5s ease',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Per-brief breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {visibleBriefs.slice(0, 4).map((brief) => {
          const briefBudget = brief.budget || 0;
          const briefBurned = Math.round(briefBudget * 0.6);
          const pct = briefBudget > 0 ? (briefBurned / briefBudget) * 100 : 0;

          return (
            <div
              key={brief.id}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--nexus-surface3, #1A212E)',
                borderRadius: '4px',
                border: '1px solid var(--nexus-border, #1F2633)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#FFFFFF', fontWeight: 500 }}>{brief.title}</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.625rem', color: '#8A99AD' }}>
                  ${briefBurned.toLocaleString()} / ${briefBudget.toLocaleString()}
                </span>
              </div>
              <div style={{ height: '3px', borderRadius: '2px', backgroundColor: '#1F2633', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, pct)}%`,
                    backgroundColor: pct > 85 ? '#EF4444' : '#0052FF',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>
          );
        })}
        {visibleBriefs.length === 0 && (
          <div style={{ textAlign: 'center', color: '#8A99AD', fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)', padding: '1rem' }}>
            No budget data. Add briefs with budget allocation.
          </div>
        )}
      </div>
    </Card>
  );
};
