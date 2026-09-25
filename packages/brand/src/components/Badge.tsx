import React from 'react';

export type BadgeVariant = 'default' | 'cobalt' | 'live' | 'nominal' | 'warn' | 'critical';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  return (
    <span className={`rn-badge rn-badge-${variant} ${className}`}>
      {children}
    </span>
  );
};
