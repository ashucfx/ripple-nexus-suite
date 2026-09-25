import React from 'react';

interface CardProps {
  children: React.ReactNode;
  elevated?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  interactive = false,
  className = '',
  onClick,
  style,
}) => {
  const classes = [
    elevated ? 'rn-card-elevated' : 'rn-card',
    interactive ? 'rn-card-interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} style={style}>
      {children}
    </div>
  );
};
