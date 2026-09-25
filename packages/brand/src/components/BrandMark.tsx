import React from 'react';

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 800"
      width={size}
      height={size}
      className={className}
      aria-label="Ripple Nexus Monogram"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Background Canvas */}
      <rect width="800" height="800" rx="120" fill="#141923" stroke="#1F2633" strokeWidth="24" />

      {/* Master Monogram Geometry */}
      <g fill="#FFFFFF">
        {/* Left Load-Bearing Pillar (R-Stem) */}
        <path d="M 160 160 H 280 V 640 H 160 Z" />

        {/* Upper R-Bowl with Chamfered Shoulder */}
        <path
          d="M 280 160 H 440 L 520 240 V 320 L 440 400 H 280 Z M 280 250 H 400 L 430 280 V 280 L 400 310 H 280 Z"
          fillRule="evenodd"
        />

        {/* N-Diagonal / R-Leg Structural Shear Vector */}
        <path d="M 280 400 L 520 640 H 640 L 400 400 Z" />

        {/* Right Pylon (N-Right Stem) */}
        <path d="M 520 160 H 640 V 480 L 520 360 Z" />
      </g>

      {/* The Nexus Core: High-Tension Convergence Wedge */}
      <polygon points="400,400 520,360 480,480" fill="#0052FF" />
    </svg>
  );
};
