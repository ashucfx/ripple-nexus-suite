'use client';

import React from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Subnet unavailable',
  message = 'The operational view failed to load. Retry the request or contact the platform administrator.',
  onRetry,
}) => (
  <main
    role="alert"
    style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '1.5rem',
      backgroundColor: '#0A0D12',
      color: '#FFFFFF',
      fontFamily: 'var(--font-sans, sans-serif)',
    }}
  >
    <section
      style={{
        width: 'min(100%, 30rem)',
        maxWidth: '30rem',
        padding: '2rem',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '8px',
        backgroundColor: '#141923',
      }}
    >
      <p
        style={{
          margin: '0 0 0.5rem',
          color: '#EF4444',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Runtime boundary active
      </p>
      <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.25rem' }}>{title}</h1>
      <p style={{ margin: '0 0 1.25rem', color: '#8A99AD', lineHeight: 1.5 }}>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            border: '1px solid #0052FF',
            borderRadius: '4px',
            padding: '0.65rem 1rem',
            backgroundColor: '#0052FF',
            color: '#FFFFFF',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          RETRY SUBNET
        </button>
      )}
    </section>
  </main>
);
