'use client';

import React from 'react';
import { Badge, Button } from '@rn/brand';
import type { Brief, BriefStatus } from '@rn/db';

interface BriefDetailModalProps {
  brief: Brief | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: BriefStatus) => void;
  onDelete: (id: string) => void;
}

export const BriefDetailModal: React.FC<BriefDetailModalProps> = ({
  brief,
  isOpen,
  onClose,
  onUpdateStatus,
  onDelete,
}) => {
  if (!isOpen || !brief) return null;

  const statuses: BriefStatus[] = ['intake', 'in_progress', 'review', 'delivered', 'blocked'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 13, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="rn-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#141923',
          border: '1px solid #1F2633',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1F2633',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.625rem',
                color: 'var(--nexus-cyan, #00D2FF)',
                letterSpacing: '0.08em',
              }}
            >
              BRIEF TELEMETRY // {brief.id}
            </span>
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: '0.25rem 0 0',
              }}
            >
              {brief.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8A99AD',
              fontSize: '1.25rem',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: '#8A99AD' }}>CLIENT IDENTIFIER</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--nexus-cyan)', marginTop: '2px' }}>
              {brief.client_name || brief.client_id}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: '#8A99AD' }}>PRIORITY LEVEL</div>
            <div style={{ marginTop: '2px' }}>
              <Badge variant={brief.priority === 'p0_critical' ? 'critical' : brief.priority === 'p1_high' ? 'warn' : 'cobalt'}>
                {brief.priority.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: '#8A99AD' }}>BUDGET ALLOCATION</div>
            <div style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', color: '#FFFFFF', marginTop: '2px' }}>
              {brief.budget ? `$${brief.budget.toLocaleString()}` : 'Unallocated'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: '#8A99AD' }}>SLA DEADLINE</div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#FFFFFF', marginTop: '2px' }}>
              {new Date(brief.sla_deadline).toLocaleString()}
            </div>
          </div>
        </div>

        {brief.scope && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: '#8A99AD', marginBottom: '4px' }}>
              SCOPE DESCRIPTION
            </div>
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#0A0D12',
                border: '1px solid #1F2633',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#CBD5E1',
                lineHeight: 1.5,
              }}
            >
              {brief.scope}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: '#8A99AD', marginBottom: '6px' }}>
            UPDATE LIFECYCLE STATUS
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {statuses.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onUpdateStatus(brief.id, st)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  border: brief.status === st ? '1px solid #0052FF' : '1px solid #1F2633',
                  backgroundColor: brief.status === st ? 'rgba(0, 82, 255, 0.25)' : '#1A212E',
                  color: brief.status === st ? '#00D2FF' : '#8A99AD',
                  cursor: 'pointer',
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #1F2633' }}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to remove this brief?')) {
                onDelete(brief.id);
                onClose();
              }
            }}
          >
            DELETE BRIEF
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  );
};
