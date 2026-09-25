'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import type { Brief, PriorityLevel } from '@rn/db';

interface SLARadarProps {
  briefs: Brief[];
  onSelectBrief?: (brief: Brief) => void;
}

export const SLARadar: React.FC<SLARadarProps> = ({ briefs, onSelectBrief }) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'urgent' | 'nominal'>('all');
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateRemaining = (deadline: string) => {
    const target = new Date(deadline).getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { diff, text: 'BREACHED', urgency: 'critical' as const };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const text = `${hours}h ${pad(mins)}m ${pad(secs)}s`;

    if (hours < 4) {
      return { diff, text, urgency: 'critical' as const };
    } else if (hours < 24) {
      return { diff, text, urgency: 'urgent' as const };
    }
    return { diff, text, urgency: 'nominal' as const };
  };

  const processedBriefs = briefs.map((b) => ({
    ...b,
    countdown: calculateRemaining(b.sla_deadline),
  }));

  const filteredBriefs = processedBriefs.filter((b) => {
    if (filter === 'critical') return b.countdown.urgency === 'critical';
    if (filter === 'urgent') return b.countdown.urgency === 'urgent';
    if (filter === 'nominal') return b.countdown.urgency === 'nominal';
    return true;
  });

  return (
    <Card className="hub-sla-radar">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1rem',
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
              ACTIVE SLA RADAR
            </h3>
          </div>
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--nexus-slate, #8A99AD)',
              marginTop: '2px',
              fontFamily: 'var(--font-sans, sans-serif)',
            }}
          >
            Live countdown timers synchronized across high-tension vectors
          </p>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {(['all', 'critical', 'urgent', 'nominal'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                border: filter === key
                  ? '1px solid var(--nexus-cobalt, #0052FF)'
                  : '1px solid var(--nexus-border, #1F2633)',
                backgroundColor: filter === key
                  ? 'rgba(0, 82, 255, 0.2)'
                  : 'var(--nexus-surface3, #1A212E)',
                color: filter === key ? 'var(--nexus-cyan, #00D2FF)' : 'var(--nexus-slate, #8A99AD)',
                cursor: 'pointer',
              }}
            >
              {key} ({processedBriefs.filter((b) => key === 'all' || b.countdown.urgency === key).length})
            </button>
          ))}
        </div>
      </div>

      {filteredBriefs.length === 0 ? (
        <div
          style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            color: 'var(--nexus-slate, #8A99AD)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.8125rem',
          }}
        >
          [RADAR CLEAR] No briefs matching filter criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredBriefs.map((item) => {
            const isCritical = item.countdown.urgency === 'critical';
            return (
              <div
                key={item.id}
                onClick={() => onSelectBrief?.(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  backgroundColor: 'var(--nexus-surface3, #1A212E)',
                  border: isCritical
                    ? '1px solid rgba(239, 68, 68, 0.6)'
                    : '1px solid var(--nexus-border, #1F2633)',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease, background 150ms ease',
                }}
              >
                <div style={{ minWidth: '200px', flex: '1 1 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.6875rem',
                        color: 'var(--nexus-cyan, #00D2FF)',
                        fontWeight: 600,
                      }}
                    >
                      {item.client_name || 'CLIENT'}
                    </span>
                    <span style={{ color: 'var(--nexus-border, #1F2633)' }}>|</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: 'var(--nexus-white, #FFFFFF)',
                      }}
                    >
                      {item.title}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '4px',
                    }}
                  >
                    <Badge variant={item.priority === 'p0_critical' ? 'critical' : 'cobalt'}>
                      {item.priority.replace('_', ' ')}
                    </Badge>
                    <Badge variant="nominal">{item.status.toUpperCase()}</Badge>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: isCritical
                          ? 'var(--status-critical, #EF4444)'
                          : item.countdown.urgency === 'urgent'
                          ? 'var(--status-warn, #F59E0B)'
                          : 'var(--nexus-cyan, #00D2FF)',
                      }}
                    >
                      {item.countdown.text}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.625rem',
                        color: 'var(--nexus-slate, #8A99AD)',
                      }}
                    >
                      DEADLINE: {new Date(item.sla_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
