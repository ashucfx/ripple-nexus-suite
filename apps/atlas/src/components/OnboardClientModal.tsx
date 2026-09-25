'use client';

import React, { useState } from 'react';
import { Button } from '@rn/brand';
import type { Client } from '@rn/db';

interface OnboardClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (client: Omit<Client, 'id' | 'created_at'>) => void;
}

export const OnboardClientModal: React.FC<OnboardClientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [tier, setTier] = useState<Client['tier']>('enterprise');
  const [mrr, setMrr] = useState('25000');
  const [contactEmail, setContactEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    onSubmit({
      name,
      code: code.toUpperCase(),
      tier,
      status: 'active',
      health_score: 98,
      mrr: mrr ? parseInt(mrr, 10) : 0,
      contact_email: contactEmail || `ops@${code.toLowerCase()}.com`,
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
            ONBOARD ENTERPRISE CLIENT
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
              CLIENT LEGAL ENTITY NAME *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Helios Artificial Intelligence Inc."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!code) {
                  setCode(e.target.value.substring(0, 8).toUpperCase().replace(/\s+/g, '-'));
                }
              }}
              className="rn-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '4px' }}>
                CLIENT CODE / SLUG *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HELIOS-AI"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="rn-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '4px' }}>
                CONTRACT TIER
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as Client['tier'])}
                className="rn-input"
              >
                <option value="enterprise">ENTERPRISE SLA</option>
                <option value="growth">GROWTH</option>
                <option value="stealth">STEALTH VECTOR</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '4px' }}>
                CONTRACT MRR (USD)
              </label>
              <input
                type="number"
                placeholder="25000"
                value={mrr}
                onChange={(e) => setMrr(e.target.value)}
                className="rn-input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', color: '#8A99AD', marginBottom: '4px' }}>
                PRIMARY CONTACT EMAIL
              </label>
              <input
                type="email"
                placeholder="lead@helios-ai.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="rn-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary" size="sm">
              ONBOARD CLIENT
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
