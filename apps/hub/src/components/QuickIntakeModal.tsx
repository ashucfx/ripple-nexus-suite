'use client';

import React, { useState } from 'react';
import { Button } from '@rn/brand';
import type { Brief, PriorityLevel } from '@rn/db';

interface QuickIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (brief: Omit<Brief, 'id' | 'created_at' | 'updated_at'>) => void;
}

export const QuickIntakeModal: React.FC<QuickIntakeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [clientName, setClientName] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('p1_high');
  const [slaHours, setSlaHours] = useState('24');
  const [budget, setBudget] = useState('15000');
  const [scope, setScope] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientName) return;

    const deadline = new Date(
      Date.now() + parseInt(slaHours, 10) * 3600 * 1000
    ).toISOString();

    onSubmit({
      client_id: clientName.toUpperCase().replace(/\s+/g, '-'),
      client_name: clientName,
      title,
      scope,
      status: 'intake',
      priority,
      budget: budget ? parseInt(budget, 10) : undefined,
      sla_deadline: deadline,
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
          maxWidth: '540px',
          backgroundColor: 'var(--nexus-carbon, #141923)',
          border: '1px solid var(--nexus-border, #1F2633)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          position: 'relative',
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
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.9375rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--nexus-white, #FFFFFF)',
                margin: 0,
              }}
            >
              OPERATIONS INTAKE // NEW BRIEF
            </h3>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--nexus-slate, #8A99AD)',
                marginTop: '2px',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              DISPATCH DIRECTLY INTO RADAR EXECUTION
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--nexus-slate, #8A99AD)',
              fontSize: '1.25rem',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                color: 'var(--nexus-slate, #8A99AD)',
                marginBottom: '4px',
              }}
            >
              CLIENT IDENTIFIER / CODE *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ACME-CORP or HELIOS-AI"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="rn-input"
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                color: 'var(--nexus-slate, #8A99AD)',
                marginBottom: '4px',
              }}
            >
              BRIEF MISSION TITLE *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Autonomous Telemetry Ingestion Engine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rn-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  color: 'var(--nexus-slate, #8A99AD)',
                  marginBottom: '4px',
                }}
              >
                PRIORITY LEVEL
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="rn-input"
              >
                <option value="p0_critical">P0 CRITICAL (SLA Urgent)</option>
                <option value="p1_high">P1 HIGH</option>
                <option value="p2_medium">P2 MEDIUM</option>
                <option value="p3_low">P3 LOW</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  color: 'var(--nexus-slate, #8A99AD)',
                  marginBottom: '4px',
                }}
              >
                SLA WINDOW (HOURS)
              </label>
              <select
                value={slaHours}
                onChange={(e) => setSlaHours(e.target.value)}
                className="rn-input"
              >
                <option value="4">4 Hours (Emergency P0)</option>
                <option value="12">12 Hours (High Tension)</option>
                <option value="24">24 Hours (Standard)</option>
                <option value="48">48 Hours</option>
                <option value="72">72 Hours (3-Day Cycle)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  color: 'var(--nexus-slate, #8A99AD)',
                  marginBottom: '4px',
                }}
              >
                BUDGET ALLOCATION (USD)
              </label>
              <input
                type="number"
                placeholder="15000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="rn-input"
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  color: 'var(--nexus-slate, #8A99AD)',
                  marginBottom: '4px',
                }}
              >
                INITIAL SQUAD
              </label>
              <select className="rn-input">
                <option>ALPHA (Systems Architecture)</option>
                <option>BETA (AI Engineering)</option>
                <option>GAMMA (Infrastructure Ops)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                color: 'var(--nexus-slate, #8A99AD)',
                marginBottom: '4px',
              }}
            >
              TECHNICAL SCOPE & DELIVERABLES SPEC
            </label>
            <textarea
              rows={3}
              placeholder="Outline architecture parameters, target outputs, dependencies..."
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="rn-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '0.5rem',
            }}
          >
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary" size="sm">
              SUBMIT TO RADAR
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
