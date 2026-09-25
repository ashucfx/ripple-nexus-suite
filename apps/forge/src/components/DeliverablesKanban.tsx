'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import type { Deliverable } from '@rn/db';

interface DeliverablesKanbanProps {
  deliverables: Deliverable[];
  onUpdateStatus: (id: string, newStatus: Deliverable['status']) => void;
  onOpenCreate: () => void;
}

const COLUMNS: { id: Deliverable['status']; label: string; badgeVariant: 'default' | 'cobalt' | 'warn' | 'nominal' }[] = [
  { id: 'pending', label: 'PENDING SPEC', badgeVariant: 'default' },
  { id: 'in_review', label: 'IN DEVELOPMENT', badgeVariant: 'cobalt' },
  { id: 'approved', label: 'SECURITY AUDIT', badgeVariant: 'warn' },
  { id: 'deployed', label: 'DEPLOYED // PROD', badgeVariant: 'nominal' },
];

export const DeliverablesKanban: React.FC<DeliverablesKanbanProps> = ({
  deliverables,
  onUpdateStatus,
  onOpenCreate,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = deliverables.filter((d) =>
    d.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    d.assignee.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <Card className="forge-kanban-section">
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
              ENGINEERING DELIVERABLES MATRIX
            </h3>
          </div>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--nexus-slate, #8A99AD)',
              marginTop: '2px',
            }}
          >
            Live production release vectors and squad allocation
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search deliverables..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="rn-input"
            style={{ width: '200px', padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          />
          <Button variant="primary" size="sm" onClick={onOpenCreate}>
            + NEW DELIVERABLE
          </Button>
        </div>
      </div>

      {deliverables.length === 0 ? (
        <div
          style={{
            padding: '2.5rem 1rem',
            textAlign: 'center',
            backgroundColor: 'var(--nexus-surface3, #1A212E)',
            borderRadius: '4px',
            border: '1px solid var(--nexus-border, #1F2633)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.8125rem',
              color: 'var(--nexus-slate, #8A99AD)',
              marginBottom: '0.75rem',
            }}
          >
            [FORGE PIPELINE NOMINAL] Zero pending deliverables in flight.
          </div>
          <Button variant="primary" size="sm" onClick={onOpenCreate}>
            DISPATCH FIRST DELIVERABLE
          </Button>
        </div>
      ) : (
        <div className="forge-kanban-board">
          {COLUMNS.map((col) => {
            const colItems = filtered.filter((d) => d.status === col.id);
            return (
              <div
                key={col.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  backgroundColor: 'var(--nexus-surface3, #1A212E)',
                  borderRadius: '6px',
                  border: '1px solid var(--nexus-border, #1F2633)',
                  padding: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--nexus-border, #1F2633)',
                    paddingBottom: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: 'var(--nexus-white, #FFFFFF)',
                    }}
                  >
                    {col.label}
                  </span>
                  <Badge variant={col.badgeVariant}>{colItems.length}</Badge>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '120px' }}>
                  {colItems.length === 0 ? (
                    <div
                      style={{
                        padding: '1.5rem 0.5rem',
                        textAlign: 'center',
                        color: 'var(--nexus-slate-dark, #5A6A80)',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      (EMPTY QUEUE)
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: 'var(--nexus-carbon, #141923)',
                          border: '1px solid var(--nexus-border, #1F2633)',
                          borderRadius: '4px',
                          padding: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'var(--font-sans, sans-serif)',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: 'var(--nexus-white, #FFFFFF)',
                            lineHeight: 1.3,
                          }}
                        >
                          {item.title}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.6875rem',
                            fontFamily: 'var(--font-mono, monospace)',
                            color: 'var(--nexus-slate, #8A99AD)',
                          }}
                        >
                          <span>@{item.assignee}</span>
                          <span>
                            {new Date(item.target_date).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Status Transition Control */}
                        <div
                          style={{
                            borderTop: '1px solid var(--nexus-border, #1F2633)',
                            paddingTop: '0.4rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ fontSize: '0.625rem', color: 'var(--nexus-slate-dark)' }}>
                            MOVE TO:
                          </span>
                          <select
                            value={item.status}
                            onChange={(e) =>
                              onUpdateStatus(item.id, e.target.value as Deliverable['status'])
                            }
                            className="rn-input"
                            style={{
                              width: 'auto',
                              padding: '2px 4px',
                              fontSize: '0.625rem',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            <option value="pending">PENDING</option>
                            <option value="in_review">IN DEV</option>
                            <option value="approved">AUDIT</option>
                            <option value="deployed">DEPLOYED</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
