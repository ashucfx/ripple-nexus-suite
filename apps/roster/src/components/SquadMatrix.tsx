'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import type { TeamMember } from '@rn/db';

interface SquadMatrixProps {
  members: TeamMember[];
  onOpenAssign: () => void;
  onUpdateStatus: (id: string, newStatus: TeamMember['active_status']) => void;
}

export const SquadMatrix: React.FC<SquadMatrixProps> = ({
  members,
  onOpenAssign,
  onUpdateStatus,
}) => {
  const [search, setSearch] = useState('');
  const [squadFilter, setSquadFilter] = useState('all');

  const filtered = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase());
    const matchesSquad = squadFilter === 'all' || m.squad === squadFilter;
    return matchesSearch && matchesSquad;
  });

  const getStatusVariant = (status: TeamMember['active_status']) => {
    switch (status) {
      case 'active':
        return 'nominal';
      case 'on_call':
        return 'live';
      case 'away':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Card className="roster-squad-matrix">
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
              TALENT INFRASTRUCTURE // SQUAD LOAD
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
            Engineering Squad Roster ({filtered.length})
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={squadFilter}
            onChange={(e) => setSquadFilter(e.target.value)}
            style={{
              backgroundColor: '#1A212E',
              border: '1px solid #1F2633',
              borderRadius: '4px',
              padding: '6px 12px',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <option value="all">ALL SQUADS</option>
            <option value="Alpha Systems">ALPHA SYSTEMS</option>
            <option value="Beta Enclave">BETA ENCLAVE</option>
            <option value="Gamma DevOps">GAMMA DEVOPS</option>
            <option value="Delta Mobile">DELTA MOBILE</option>
          </select>

          <input
            type="text"
            placeholder="Search talent..."
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
              minWidth: '180px',
            }}
          />

          <Button variant="primary" size="sm" onClick={onOpenAssign}>
            + ADD TALENT
          </Button>
        </div>
      </div>

      <div className="roster-table-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1F2633', fontSize: '0.6875rem', fontFamily: 'var(--font-mono, monospace)', color: '#8A99AD' }}>
              <th style={{ padding: '0.6rem 0.75rem' }}>ENGINEER / PROFILE</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>ROLE</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>SQUAD</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>CAPACITY ALLOCATION</th>
              <th style={{ padding: '0.6rem 0.75rem' }}>STATUS</th>
              <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>SHIFT TOGGLE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: '#8A99AD',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                  }}
                >
                  ZERO TALENT PROFILES ASSIGNED IN ROSTER
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr
                  key={m.id}
                  style={{
                    borderBottom: '1px solid #1F2633',
                    fontSize: '0.8125rem',
                    transition: 'background-color 150ms ease',
                  }}
                >
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{m.full_name}</div>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.6875rem', color: '#8A99AD' }}>
                      {m.email}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono, monospace)', color: '#00D2FF', fontSize: '0.75rem' }}>
                    {m.role}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <Badge variant="default">{m.squad}</Badge>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '5px', backgroundColor: '#1A212E', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(m.allocation_percentage, 100)}%`,
                            backgroundColor: m.allocation_percentage > 90 ? '#FFB800' : '#0052FF',
                          }}
                        />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.6875rem', color: '#FFFFFF' }}>
                        {m.allocation_percentage}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <Badge variant={getStatusVariant(m.active_status)}>
                      {m.active_status.toUpperCase().replace('_', ' ')}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                    <select
                      value={m.active_status}
                      onChange={(e) => onUpdateStatus(m.id, e.target.value as TeamMember['active_status'])}
                      style={{
                        backgroundColor: '#1A212E',
                        border: '1px solid #1F2633',
                        color: '#00D2FF',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      <option value="active">ACTIVE</option>
                      <option value="on_call">ON-CALL</option>
                      <option value="away">AWAY</option>
                    </select>
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
