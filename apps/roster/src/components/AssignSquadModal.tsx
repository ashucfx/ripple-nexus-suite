'use client';

import React, { useState } from 'react';
import { Button } from '@rn/brand';
import type { TeamMember } from '@rn/db';

interface AssignSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: Omit<TeamMember, 'id' | 'created_at'>) => Promise<void>;
}

export const AssignSquadModal: React.FC<AssignSquadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Senior Systems Architect');
  const [squad, setSquad] = useState('Alpha Systems');
  const [allocation, setAllocation] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    await onSubmit({
      full_name: fullName.trim(),
      email: email.trim(),
      role,
      squad,
      active_status: 'active',
      allocation_percentage: Number(allocation),
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 13, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#141923',
          border: '1px solid #1F2633',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 25px rgba(0, 82, 255, 0.1)',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.12em',
                  color: 'var(--nexus-cyan, #00D2FF)',
                }}
              >
                ROSTER // SQUAD CAPACITY ALLOCATION
              </span>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#FFFFFF',
                marginTop: '0.25rem',
              }}
            >
              Assign Talent to Engineering Squad
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
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                color: '#8A99AD',
                marginBottom: '0.5rem',
              }}
            >
              FULL NAME
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              style={{
                width: '100%',
                backgroundColor: '#1A212E',
                border: '1px solid #1F2633',
                padding: '0.65rem 0.85rem',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontFamily: 'var(--font-sans, sans-serif)',
                fontSize: '0.8125rem',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                letterSpacing: '0.08em',
                color: '#8A99AD',
                marginBottom: '0.5rem',
              }}
            >
              CORPORATE / CONTRACTOR EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. elena@theripplenexus.com"
              style={{
                width: '100%',
                backgroundColor: '#1A212E',
                border: '1px solid #1F2633',
                padding: '0.65rem 0.85rem',
                color: '#00D2FF',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8125rem',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  color: '#8A99AD',
                  marginBottom: '0.5rem',
                }}
              >
                ROLE CLASSIFICATION
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1A212E',
                  border: '1px solid #1F2633',
                  padding: '0.65rem 0.85rem',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontSize: '0.8125rem',
                }}
              >
                <option value="Lead Systems Architect">Lead Systems Architect</option>
                <option value="Senior AI Engineer">Senior AI Engineer</option>
                <option value="Security Enclave Specialist">Security Enclave Specialist</option>
                <option value="DevOps & Cluster Engineer">DevOps & Cluster Engineer</option>
                <option value="Fullstack Product Engineer">Fullstack Product Engineer</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  color: '#8A99AD',
                  marginBottom: '0.5rem',
                }}
              >
                ASSIGN SQUAD
              </label>
              <select
                value={squad}
                onChange={(e) => setSquad(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1A212E',
                  border: '1px solid #1F2633',
                  padding: '0.65rem 0.85rem',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-sans, sans-serif)',
                  fontSize: '0.8125rem',
                }}
              >
                <option value="Alpha Systems">Alpha Systems</option>
                <option value="Beta Enclave">Beta Enclave</option>
                <option value="Gamma DevOps">Gamma DevOps</option>
                <option value="Delta Mobile">Delta Mobile</option>
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  color: '#8A99AD',
                }}
              >
                CAPACITY ALLOCATION (%)
              </label>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: '#00D2FF', fontWeight: 700 }}>
                {allocation}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={allocation}
              onChange={(e) => setAllocation(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0052FF' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              CANCEL
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'ASSIGNING...' : 'CONFIRM SQUAD ALLOCATION'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
