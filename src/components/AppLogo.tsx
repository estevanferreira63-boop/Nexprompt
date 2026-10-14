import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* High-Tech Glowing Hexagonal Database Emblem */}
      <div className={`relative ${sizeMap[size]} flex-shrink-0 group`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />

        {/* SVG Emblem */}
        <svg
          viewBox="0 0 100 100"
          className="relative w-full h-full rounded-2xl bg-slate-950 p-1.5 border border-cyan-500/40 shadow-xl"
        >
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Hexagon Outline */}
          <polygon
            points="50,8 86,28 86,72 50,92 14,72 14,28"
            fill="none"
            stroke="url(#logoGrad)"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Database Layer Disks in Center */}
          <ellipse cx="50" cy="38" rx="20" ry="6" fill="#06b6d4" opacity="0.9" />
          <path d="M30 38 V48 C30 52 70 52 70 48 V38 Z" fill="#2563eb" opacity="0.8" />
          <ellipse cx="50" cy="48" rx="20" ry="6" fill="#1d4ed8" />
          <path d="M30 48 V58 C30 62 70 62 70 58 V48 Z" fill="#7c3aed" opacity="0.8" />
          <ellipse cx="50" cy="58" rx="20" ry="6" fill="#6d28d9" />

          {/* Center 100 text */}
          <text
            x="50"
            y="76"
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="14"
            fontWeight="900"
            fill="#ffffff"
          >
            100
          </text>
        </svg>
      </div>

      {/* Brand Name & Tag */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-sm sm:text-base tracking-tight font-sans truncate">
              NexusPrompt
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 flex-shrink-0">
              PRO
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono truncate">
            Estudos & Gerador de Prompts IA
          </span>
        </div>
      )}
    </div>
  );
};
