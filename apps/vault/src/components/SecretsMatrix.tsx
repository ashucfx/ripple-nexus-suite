'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@rn/brand';

export interface EnclaveSecret {
  id: string;
  name: string;
  key_alias: string;
  scope: string;
  environment: 'production' | 'staging';
  last_rotated: string;
  status: 'active' | 'rotation_due' | 'revoked';
  masked_value: string;
}

interface SecretsMatrixProps {
  secrets: EnclaveSecret[];
  onOpenRotate: (secret: EnclaveSecret) => void;
  onOpenNewSecret: () => void;
}

export const SecretsMatrix: React.FC<SecretsMatrixProps> = ({
  secrets,
  onOpenRotate,
  onOpenNewSecret,
}) => {
  const [search, setSearch] = useState('');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filtered = secrets.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.key_alias.toLowerCase().includes(search.toLowerCase()) ||
      s.scope.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="vault-secrets-matrix">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--nexus-border, #1F2633)',
          paddingBottom: '0.75rem',
        }}
      >
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
              HSM SECRETS ENGINE // AES-GCM 256-BIT
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-sans, sans-serif)',
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginTop: '0.25rem',
            }}
          >
            Cryptographic Enclave Key Store ({filtered.length})
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search key alias or scope..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              backgroundColor: '#1A212E',
              border: '1px solid #1F2633',
              borderRadius: '4px',
              padding: '6px 12px',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
              minWidth: '220px',
            }}
          />
          <Button variant="primary" size="sm" onClick={onOpenNewSecret}>
            + PROVISION KEY
          </Button>
        </div>
      </div>

      <div className="vault-table-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1F2633', fontSize: '0.6875rem', fontFamily: 'var(--font-mono, monospace)', color: '#8A99AD' }}>
              <th style={{ padding: '0.6rem 0.75rem' }}>KEY ALIAS / IDENTIFIER</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>SCOPE</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>ENV</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>ENCLAVE VALUE</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>LAST ROTATED</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>STATUS</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: '#8A99AD',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                  }}
                >
                  ZERO SECRETS PROVISIONED IN ENCLAVE
                </td>
              </tr>
            ) : (
              filtered.map((sec) => (
                <tr
                  key={sec.id}
                  style={{
                    borderBottom: '1px solid #1F2633',
                    fontSize: '0.8125rem',
                    transition: 'background-color 150ms ease',
                  }}
                >
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{sec.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.6875rem', color: '#00D2FF' }}>
                      {sec.key_alias}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono, monospace)', color: '#8A99AD', fontSize: '0.75rem' }}>
                    {sec.scope.toUpperCase()}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <Badge variant={sec.environment === 'production' ? 'live' : 'default'}>
                      {sec.environment.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: revealedIds[sec.id] ? '#00E599' : '#8A99AD' }}>
                        {revealedIds[sec.id] ? sec.masked_value.replace(/•/g, 'a8f9') : sec.masked_value}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleReveal(sec.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#00D2FF',
                          fontSize: '0.6875rem',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono, monospace)',
                        }}
                      >
                        {revealedIds[sec.id] ? 'HIDE' : 'REVEAL'}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono, monospace)', color: '#8A99AD', fontSize: '0.75rem' }}>
                    {new Date(sec.last_rotated).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <Badge variant={sec.status === 'active' ? 'nominal' : sec.status === 'rotation_due' ? 'critical' : 'default'}>
                      {sec.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onOpenRotate(sec)}
                    >
                      ROTATE
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
