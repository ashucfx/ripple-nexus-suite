'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import type { Client } from '@rn/db';

interface ClientMatrixProps {
  clients: Client[];
  onOpenOnboard: () => void;
  onSelectClient?: (client: Client) => void;
}

export const ClientMatrix: React.FC<ClientMatrixProps> = ({
  clients,
  onOpenOnboard,
  onSelectClient,
}) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_email.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <Card className="atlas-client-matrix">
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
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--nexus-cyan, #00D2FF)',
                boxShadow: '0 0 8px var(--nexus-cyan, #00D2FF)',
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
              ENTERPRISE CLIENT RELATIONSHIPS
            </h3>
          </div>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--nexus-slate, #8A99AD)',
              marginTop: '2px',
            }}
          >
            Live portfolio accounts, contract tiers, and health metrics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search accounts or emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rn-input"
            style={{ width: '220px', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          />

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="rn-input"
            style={{
              width: '130px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <option value="all">ALL TIERS</option>
            <option value="enterprise">ENTERPRISE</option>
            <option value="growth">GROWTH</option>
            <option value="stealth">STEALTH</option>
          </select>

          <Button variant="primary" size="sm" onClick={onOpenOnboard}>
            + ONBOARD CLIENT
          </Button>
        </div>
      </div>

      <div className="rn-table-container">
        <table className="rn-table">
          <thead>
            <tr>
              <th>CODE</th>
              <th>CLIENT / ENTITY</th>
              <th>TIER</th>
              <th>STATUS</th>
              <th>HEALTH</th>
              <th>MRR</th>
              <th>CONTACT</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--nexus-slate)' }}>
                  [ATLAS MATRIX READY] Zero accounts matching criteria. Click <strong>+ ONBOARD CLIENT</strong> to register enterprise account.
                </td>
              </tr>
            ) : (
              filtered.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => onSelectClient?.(client)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--nexus-cyan)' }}>
                    {client.code}
                  </td>
                  <td style={{ fontWeight: 600 }}>{client.name}</td>
                  <td>
                    <Badge variant={client.tier === 'enterprise' ? 'nominal' : 'cobalt'}>
                      {client.tier.toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={client.status === 'active' ? 'live' : 'warn'}>
                      {client.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: client.health_score > 90 ? '#10B981' : '#F59E0B',
                        }}
                      >
                        {client.health_score}%
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    ${client.mrr?.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--nexus-slate)' }}>
                    {client.contact_email}
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
