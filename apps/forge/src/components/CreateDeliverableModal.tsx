'use client';

import React, { useState } from 'react';
import { Button } from '@rn/brand';
import type { Deliverable } from '@rn/db';

interface CreateDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deliverable: Omit<Deliverable, 'id' | 'created_at'>) => void;
}

export const CreateDeliverableModal: React.FC<CreateDeliverableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [briefId, setBriefId] = useState('brief-01');
  const [assignee, setAssignee] = useState('lead.architect');
  const [days, setDays] = useState('3');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const targetDate = new Date(Date.now() + parseInt(days, 10) * 86400 * 1000).toISOString();

    onSubmit({
      brief_id: briefId,
      title,
      status: 'pending',
      assignee,
      target_date: targetDate,
    });

    onClose();
  };

  return (
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
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--nexus-carbon, #141923)',
          border: '1px solid var(--nexus-border, #1F2633)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--nexus-border, #1F2633)',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
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
            DISPATCH NEW ENGINEERING DELIVERABLE
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#8A99AD', fontSize: '1.25rem', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '4px' }}>
              DELIVERABLE MISSION TITLE *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Multi-Cluster Redis Cache Partitioning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rn-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '4px' }}>
                ASSIGNED LEAD
              </label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="rn-input"
              >
                <option value="lead.architect">lead.architect</option>
                <option value="systems.eng">systems.eng</option>
                <option value="security.auditor">security.auditor</option>
                <option value="infra.squad">infra.squad</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '4px' }}>
                TARGET WINDOW
              </label>
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="rn-input"
              >
                <option value="1">24 Hours (Fast-Track)</option>
                <option value="3">3 Days (Sprint Target)</option>
                <option value="7">7 Days (Full Cycle)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary" size="sm">
              DISPATCH DELIVERABLE
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
