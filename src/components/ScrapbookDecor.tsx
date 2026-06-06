import type { ReactNode } from 'react';

interface DecorProps {
  className?: string;
  color?: string;
}

export const WashiTape = ({ className = '', color = '#E7B96A' }: DecorProps) => (
  <div
    className={`absolute h-5 opacity-70 ${className}`}
    style={{
      backgroundColor: color,
      width: '60px',
      transform: 'rotate(-3deg)',
      maskImage: 'linear-gradient(90deg, transparent 2%, black 8%, black 92%, transparent 98%)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent 2%, black 8%, black 92%, transparent 98%)',
    }}
  />
);

export const PushPin = ({ className = '' }: { className?: string }) => (
  <div className={`absolute w-3 h-3 rounded-full bg-journal-accent shadow-sm ${className}`}>
    <div className="absolute inset-0.5 rounded-full bg-amber-gold/60" />
  </div>
);

export const Sticker = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-journal-secondary border border-journal-border text-xs font-song text-journal-muted ${className}`}
  >
    {children}
  </div>
);

export const PawPrint = ({ className = '' }: { className?: string }) => (
  <span className={`text-journal-muted/40 text-sm select-none ${className}`}>🐾</span>
);

export const BookmarkRibbon = ({
  label,
  className = '',
}: {
  label?: string;
  className?: string;
}) => (
  <div className={`relative ${className}`}>
    <div
      className="bg-journal-accent text-journal-text text-xs font-song px-3 py-1.5 shadow-sm"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }}
    >
      {label}
    </div>
  </div>
);

export const PaperClip = ({ className = '' }: { className?: string }) => (
  <span className={`text-2xl text-journal-muted/60 ${className}`}>📎</span>
);

export const FeatherPen = ({ className = '' }: { className?: string }) => (
  <span className={`text-lg opacity-50 ${className}`}>🪶</span>
);
