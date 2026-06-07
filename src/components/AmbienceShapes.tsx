type ShapeProps = {
  className?: string;
  opacity?: number;
};

export const SunlightWindow = ({ className = '', opacity = 0.25 }: ShapeProps) => (
  <svg
    className={`absolute inset-0 w-full h-full ${className}`}
    viewBox="0 0 400 300"
    preserveAspectRatio="xMinYMin slice"
    aria-hidden
  >
    <defs>
      <linearGradient id="sunShaft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E7B96A" stopOpacity={opacity} />
        <stop offset="40%" stopColor="#F6EAD8" stopOpacity={opacity * 0.4} />
        <stop offset="100%" stopColor="#FAF7F0" stopOpacity="0" />
      </linearGradient>
    </defs>
    <polygon points="0,0 180,0 320,300 0,300" fill="url(#sunShaft)" />
    <polygon points="20,0 120,0 200,180 20,180" fill="#E7B96A" fillOpacity={opacity * 0.3} />
  </svg>
);

export const BookshelfSilhouette = ({
  className = '',
  opacity = 0.22,
}: ShapeProps) => (
  <svg
    className={`absolute inset-0 w-full h-full ${className}`}
    viewBox="0 0 400 300"
    preserveAspectRatio="none"
    aria-hidden
  >
    {/* Left edge books */}
    <rect x="0" y="20" width="28" height="80" rx="2" fill="#E6D5B8" fillOpacity={opacity} />
    <rect x="4" y="30" width="22" height="70" rx="1" fill="#D4A574" fillOpacity={opacity * 0.8} />
    <rect x="0" y="110" width="24" height="60" rx="2" fill="#E8DCC8" fillOpacity={opacity} />
    <rect x="6" y="180" width="20" height="50" rx="1" fill="#E6D5B8" fillOpacity={opacity * 0.9} />

    {/* Right edge books */}
    <rect x="372" y="25" width="28" height="75" rx="2" fill="#E6D5B8" fillOpacity={opacity} />
    <rect x="376" y="35" width="22" height="65" rx="1" fill="#D4A574" fillOpacity={opacity * 0.8} />
    <rect x="374" y="115" width="26" height="55" rx="2" fill="#E8DCC8" fillOpacity={opacity} />

    {/* Top shelf hint */}
    <rect x="0" y="12" width="400" height="6" fill="#D4A574" fillOpacity={opacity * 0.6} />
    <rect x="30" y="0" width="18" height="12" rx="1" fill="#E6D5B8" fillOpacity={opacity} />
    <rect x="52" y="2" width="14" height="10" rx="1" fill="#E8DCC8" fillOpacity={opacity} />
    <rect x="340" y="0" width="16" height="12" rx="1" fill="#E6D5B8" fillOpacity={opacity} />
    <rect x="360" y="1" width="20" height="11" rx="1" fill="#D4A574" fillOpacity={opacity * 0.8} />

    {/* Bottom shelf */}
    <rect x="0" y="268" width="400" height="8" fill="#D4A574" fillOpacity={opacity * 0.7} />
    <rect x="20" y="240" width="360" height="28" fill="#E8DCC8" fillOpacity={opacity * 0.35} />
    <rect x="40" y="248" width="22" height="18" rx="1" fill="#E6D5B8" fillOpacity={opacity} />
    <rect x="68" y="250" width="18" height="16" rx="1" fill="#D4A574" fillOpacity={opacity * 0.9} />
    <rect x="92" y="246" width="24" height="20" rx="1" fill="#E6D5B8" fillOpacity={opacity} />
    <rect x="280" y="248" width="20" height="18" rx="1" fill="#E8DCC8" fillOpacity={opacity} />
    <rect x="306" y="250" width="26" height="16" rx="1" fill="#D4A574" fillOpacity={opacity * 0.85} />
    <rect x="338" y="246" width="22" height="20" rx="1" fill="#E6D5B8" fillOpacity={opacity} />
  </svg>
);

export const ArchiveCabinet = ({ className = '', opacity = 0.2 }: ShapeProps) => (
  <svg
    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(90%,480px)] h-32 ${className}`}
    viewBox="0 0 480 128"
    preserveAspectRatio="xMidYMax meet"
    aria-hidden
  >
    <rect x="40" y="20" width="400" height="100" rx="4" fill="#E8DCC8" fillOpacity={opacity} />
    <rect x="40" y="20" width="400" height="8" fill="#D4A574" fillOpacity={opacity * 1.2} />
    <rect x="60" y="40" width="110" height="60" rx="2" fill="#E6D5B8" fillOpacity={opacity * 0.8} />
    <rect x="185" y="40" width="110" height="60" rx="2" fill="#E6D5B8" fillOpacity={opacity * 0.8} />
    <rect x="310" y="40" width="110" height="60" rx="2" fill="#E6D5B8" fillOpacity={opacity * 0.8} />
    <circle cx="155" cy="70" r="4" fill="#D4A574" fillOpacity={opacity * 1.5} />
    <circle cx="280" cy="70" r="4" fill="#D4A574" fillOpacity={opacity * 1.5} />
    <circle cx="405" cy="70" r="4" fill="#D4A574" fillOpacity={opacity * 1.5} />
  </svg>
);

export const DisplayShelf = ({ className = '', opacity = 0.28 }: ShapeProps) => (
  <svg
    className={`absolute left-1/2 -translate-x-1/2 w-[min(95%,640px)] h-24 ${className}`}
    style={{ top: '38%' }}
    viewBox="0 0 640 96"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden
  >
    <ellipse cx="320" cy="80" rx="280" ry="12" fill="#D4A574" fillOpacity={opacity * 0.4} />
    <rect x="40" y="60" width="560" height="6" rx="2" fill="#D4A574" fillOpacity={opacity} />
    <rect x="60" y="66" width="520" height="4" fill="#E6D5B8" fillOpacity={opacity * 0.6} />
    <rect x="80" y="48" width="8" height="18" fill="#E8DCC8" fillOpacity={opacity * 0.5} />
    <rect x="552" y="48" width="8" height="18" fill="#E8DCC8" fillOpacity={opacity * 0.5} />
  </svg>
);
