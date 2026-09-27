'use client';

import React, { useState, useCallback } from 'react';
import { Card, Badge, Button } from '@rn/brand';
import { useAuth } from '@rn/auth';
import type { TeamMember } from '@rn/db';

// ─────────────────────────────────────────────
// Burnout & Utilization Alert Engine
// ─────────────────────────────────────────────

interface BurnoutAlertProps {
  members: TeamMember[];
}

export const BurnoutAlertEngine: React.FC<BurnoutAlertProps> = ({ members }) => {
  const { role } = useAuth();

  const canView = role === 'executive_admin' || role === 'operations_lead';
  if (!canView) return null;

  const atRisk = members.filter((m) => m.allocation_percentage >= 80);
  const overloaded = members.filter((m) => m.allocation_percentage >= 95);

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--nexus-border, #1F2633)',
          paddingBottom: '0.75rem',
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
          BURNOUT RISK MONITOR
        </h3>
        {overloaded.length > 0 ? (
          <Badge variant="critical">{overloaded.length} OVERLOADED</Badge>
        ) : atRisk.length > 0 ? (
          <Badge variant="warn">{atRisk.length} AT RISK</Badge>
        ) : (
          <Badge variant="nominal">ALL CLEAR</Badge>
        )}
      </div>

      {(atRisk.length === 0) && (
        <div
          style={{
            padding: '1rem',
            textAlign: 'center',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            color: '#00E599',
          }}
        >
          ✓ TEAM WORKLOAD WITHIN HEALTHY BOUNDS (&lt;80% allocation)
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {atRisk.map((member) => {
          const isOverloaded = member.allocation_percentage >= 95;

          return (
            <div
              key={member.id}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--nexus-surface3, #1A212E)',
                borderRadius: '4px',
                border: `1px solid ${isOverloaded ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.3)'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF' }}>{member.full_name}</div>
                  <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5625rem', color: '#8A99AD' }}>
                    {member.squad} · {member.role}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '1.125rem',
                    fontWeight: 900,
                    color: isOverloaded ? '#EF4444' : '#F59E0B',
                  }}
                >
                  {member.allocation_percentage}%
                </span>
              </div>

              <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#1F2633', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, member.allocation_percentage)}%`,
                    backgroundColor: isOverloaded ? '#EF4444' : '#F59E0B',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: '6px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.5rem',
                  color: isOverloaded ? '#EF4444' : '#F59E0B',
                }}
              >
                {isOverloaded
                  ? '⚠ CRITICAL: Immediate reallocation required — breach of 95% threshold'
                  : '⚠ AT RISK: Consider redistributing workload before next sprint'}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────────
// On-Call Rotation Scheduler
// ─────────────────────────────────────────────

interface OnCallSlot {
  week: string;
  primary: string;
  secondary: string;
  status: 'active' | 'upcoming' | 'past';
}

export const OnCallScheduler: React.FC<{ members: TeamMember[] }> = ({ members }) => {
  const { role } = useAuth();

  const [slots, setSlots] = useState<OnCallSlot[]>([
    { week: 'Sep 22–28', primary: 'Alex Chen', secondary: 'Priya Sharma', status: 'past' },
    { week: 'Sep 29–Oct 5', primary: 'Marcus Lee', secondary: 'Jordan Kim', status: 'active' },
    { week: 'Oct 6–12', primary: 'Elena Vasquez', secondary: 'Alex Chen', status: 'upcoming' },
    { week: 'Oct 13–19', primary: 'Jordan Kim', secondary: 'Marcus Lee', status: 'upcoming' },
    { week: 'Oct 20–26', primary: 'Priya Sharma', secondary: 'Elena Vasquez', status: 'upcoming' },
  ]);

  const statusColors = {
    active: '#00E599',
    upcoming: '#00D2FF',
    past: '#8A99AD',
  };

  const canEdit = role === 'executive_admin' || role === 'operations_lead';

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--nexus-border, #1F2633)',
          paddingBottom: '0.75rem',
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
          ON-CALL ROTATION MATRIX
        </h3>
        <Badge variant="live">ACTIVE</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {slots.map((slot) => (
          <div
            key={slot.week}
            style={{
              padding: '0.65rem 0.75rem',
              backgroundColor: slot.status === 'active' ? 'rgba(0,229,153,0.06)' : 'var(--nexus-surface3, #1A212E)',
              borderRadius: '4px',
              border: `1px solid ${slot.status === 'active' ? 'rgba(0,229,153,0.3)' : 'var(--nexus-border, #1F2633)'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.625rem',
                  color: statusColors[slot.status],
                  fontWeight: 700,
                  marginBottom: '2px',
                }}
              >
                {slot.status === 'active' ? '● ACTIVE: ' : ''}{slot.week}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#FFFFFF', fontWeight: 500 }}>
                {slot.primary} <span style={{ color: '#8A99AD', fontSize: '0.625rem' }}>PRIMARY</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#8A99AD' }}>
                {slot.secondary} <span style={{ fontSize: '0.5rem' }}>SECONDARY</span>
              </div>
            </div>
            {slot.status === 'active' && (
              <div
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'rgba(0,229,153,0.1)',
                  border: '1px solid rgba(0,229,153,0.3)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.5rem',
                  color: '#00E599',
                  fontWeight: 700,
                }}
              >
                ON DUTY
              </div>
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <div style={{ marginTop: '0.75rem' }}>
          <Button variant="secondary" size="sm">
            EDIT ROTATION SCHEDULE
          </Button>
        </div>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────────
// Squad Skill Matrix
// ─────────────────────────────────────────────

export const SquadSkillMatrix: React.FC<{ members: TeamMember[] }> = ({ members }) => {
  const skills = ['React', 'Node.js', 'Supabase', 'DevOps', 'Security', 'AI/ML'];

  // Synthetic skill scores for demo — in production, read from DB
  const getSkillScore = (memberId: string, skill: string): number => {
    const hash = memberId.charCodeAt(memberId.length - 1) + skill.charCodeAt(0);
    return Math.min(5, Math.max(1, hash % 5 + 1));
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return '#00E599';
    if (score >= 3) return '#00D2FF';
    if (score >= 2) return '#F59E0B';
    return '#EF4444';
  };

  const displayMembers = members.slice(0, 5);

  return (
    <Card>
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#FFFFFF',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--nexus-border, #1F2633)',
        }}
      >
        SQUAD SKILL MATRIX
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '4px 8px', textAlign: 'left', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.5625rem', color: '#8A99AD', fontWeight: 400 }}>
                MEMBER
              </th>
              {skills.map((skill) => (
                <th
                  key={skill}
                  style={{
                    padding: '4px 8px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.5rem',
                    color: '#8A99AD',
                    fontWeight: 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {skill}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayMembers.length === 0 ? (
              <tr>
                <td colSpan={skills.length + 1} style={{ textAlign: 'center', padding: '1.5rem', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: '#8A99AD' }}>
                  No squad members loaded.
                </td>
              </tr>
            ) : (
              displayMembers.map((member) => (
                <tr key={member.id}>
                  <td style={{ padding: '6px 8px', fontSize: '0.6875rem', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
                    {member.full_name}
                  </td>
                  {skills.map((skill) => {
                    const score = getSkillScore(member.id, skill);
                    return (
                      <td key={skill} style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: getScoreColor(score),
                          }}
                        >
                          {'■'.repeat(score)}{'□'.repeat(5 - score)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
