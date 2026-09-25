import React from 'react';

interface TelemetryMetricProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  statusColor?: string;
  className?: string;
}

export const TelemetryMetric: React.FC<TelemetryMetricProps> = ({
  label,
  value,
  subValue,
  trend,
  statusColor,
  className = '',
}) => {
  return (
    <div
      className={`rn-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        borderLeft: statusColor ? `3px solid ${statusColor}` : undefined,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--nexus-slate, #8A99AD)',
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--nexus-white, #FFFFFF)',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
        {subValue && (
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              color:
                trend === 'up'
                  ? 'var(--status-nominal, #10B981)'
                  : trend === 'down'
                  ? 'var(--status-critical, #EF4444)'
                  : 'var(--nexus-slate, #8A99AD)',
            }}
          >
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};
