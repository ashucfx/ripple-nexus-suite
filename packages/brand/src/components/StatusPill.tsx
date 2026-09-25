import React from 'react';

export type StatusVariant = 'live' | 'nominal' | 'warn' | 'critical' | 'offline';

interface StatusPillProps {
  label: string;
  variant?: StatusVariant;
  pulse?: boolean;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  variant = 'nominal',
  pulse = true,
  className = '',
}) => {
  const colorMap: Record<StatusVariant, { text: string; bg: string; dot: string; ring: string }> = {
    live: {
      text: '#00D2FF',
      bg: 'rgba(0, 210, 255, 0.1)',
      dot: '#00D2FF',
      ring: 'rgba(0, 210, 255, 0.4)',
    },
    nominal: {
      text: '#10B981',
      bg: 'rgba(16, 185, 129, 0.1)',
      dot: '#10B981',
      ring: 'rgba(16, 185, 129, 0.4)',
    },
    warn: {
      text: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
      dot: '#F59E0B',
      ring: 'rgba(245, 158, 11, 0.4)',
    },
    critical: {
      text: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      dot: '#EF4444',
      ring: 'rgba(239, 68, 68, 0.4)',
    },
    offline: {
      text: '#8A99AD',
      bg: 'rgba(138, 153, 173, 0.1)',
      dot: '#8A99AD',
      ring: 'rgba(138, 153, 173, 0.3)',
    },
  };

  const current = colorMap[variant] || colorMap.nominal;

  return (
    <span
      className={`rn-status-pill ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 8px',
        borderRadius: '9999px',
        backgroundColor: current.bg,
        border: `1px solid ${current.ring}`,
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.6875rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        color: current.text,
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: current.dot,
          boxShadow: pulse ? `0 0 6px ${current.ring}` : 'none',
        }}
      />
      {label}
    </span>
  );
};
