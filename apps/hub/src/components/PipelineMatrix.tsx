'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import type { Brief, BriefStatus } from '@rn/db';

interface PipelineMatrixProps {
  briefs: Brief[];
  onOpenIntake: () => void;
  onSelectBrief?: (brief: Brief) => void;
}

export const PipelineMatrix: React.FC<PipelineMatrixProps> = ({
  briefs,
  onOpenIntake,
  onSelectBrief,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBriefs = briefs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.client_name && b.client_name.toLowerCase().includes(search.toLowerCase())) ||
      b.priority.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadgeVariant = (priority: string) => {
    if (priority === 'p0_critical') return 'critical';
    if (priority === 'p1_high') return 'warn';
    return 'cobalt';
  };

  const getStatusBadgeVariant = (status: BriefStatus) => {
    switch (status) {
      case 'in_progress':
        return 'live';
      case 'delivered':
        return 'nominal';
      case 'blocked':
        return 'critical';
      case 'review':
        return 'warn';
      default:
        return 'default';
    }
  };

  return (
    <Card className="hub-pipeline-matrix">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--nexus-cobalt, #0052FF)',
                boxShadow: '0 0 8px var(--nexus-cobalt, #0052FF)',
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
              PIPELINE EXECUTION MATRIX
            </h3>
          </div>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--nexus-slate, #8A99AD)',
              marginTop: '2px',
            }}
          >
            Live synchronization with Supabase operations cluster
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search briefs or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rn-input"
            style={{ width: '220px', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rn-input"
            style={{
              width: '130px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <option value="all">ALL STATUS</option>
            <option value="intake">INTAKE</option>
            <option value="in_progress">IN PROGRESS</option>
            <option value="review">REVIEW</option>
            <option value="delivered">DELIVERED</option>
            <option value="blocked">BLOCKED</option>
          </select>

          <Button variant="primary" size="sm" onClick={onOpenIntake}>
            + NEW BRIEF
          </Button>
        </div>
      </div>

      {/* Table container for desktop */}
      <div className="rn-table-container">
        <table className="rn-table">
          <thead>
            <tr>
              <th>CLIENT</th>
              <th>BRIEF TITLE</th>
              <th>PRIORITY</th>
              <th>STATUS</th>
              <th>BUDGET</th>
              <th>SLA DEADLINE</th>
            </tr>
          </thead>
          <tbody>
            {filteredBriefs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--nexus-slate)' }}>
                  No active briefs match the query. Click <strong>+ NEW BRIEF</strong> to initiate operations intake.
                </td>
              </tr>
            ) : (
              filteredBriefs.map((brief) => (
                <tr
                  key={brief.id}
                  onClick={() => onSelectBrief?.(brief)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--nexus-cyan)' }}>
                    {brief.client_name || brief.client_id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{brief.title}</td>
                  <td>
                    <Badge variant={getPriorityBadgeVariant(brief.priority)}>
                      {brief.priority.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={getStatusBadgeVariant(brief.status)}>
                      {brief.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {brief.budget ? `$${brief.budget.toLocaleString()}` : '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--nexus-slate)' }}>
                    {new Date(brief.sla_deadline).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
