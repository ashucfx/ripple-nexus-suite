import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: '0.35rem 0.65rem', fontSize: '0.75rem' },
    md: { padding: '0.5rem 1rem', fontSize: '0.8125rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '0.9375rem' },
  };

  return (
    <button
      className={`rn-btn rn-btn-${variant} ${className}`}
      style={sizeStyles[size]}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
