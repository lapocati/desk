import { useEffect, useRef, type CSSProperties } from 'react';
import {
  ArchiveCabinet,
  BookshelfSilhouette,
  DisplayShelf,
  SunlightWindow,
} from './AmbienceShapes';
import { PawPrint, WashiTape, FeatherPen } from './ScrapbookDecor';

export type AmbienceVariant = 'entrance' | 'focus' | 'celebration';
export type AmbienceProfile = 'default' | 'archive-showcase';

interface ArchiveAmbienceProps {
  variant?: AmbienceVariant;
  profile?: AmbienceProfile;
  photoUrl?: string | null;
  bgClass?: string;
}

type DecorDensity = 'explore' | 'full';

const DENSITY: Record<AmbienceVariant, DecorDensity> = {
  entrance: 'full',
  focus: 'explore',
  celebration: 'full',
};

const PARTICLE_COUNTS: Record<AmbienceVariant, number> = {
  entrance: 45,
  focus: 22,
  celebration: 30,
};

const VIGNETTE: Record<AmbienceVariant, string> = {
  focus: 'rgba(92, 75, 59, 0.03)',
  entrance: 'rgba(92, 75, 59, 0.04)',
  celebration: 'rgba(92, 75, 59, 0.08)',
};

const SHELF_OPACITY: Record<AmbienceVariant, number> = {
  focus: 0.18,
  entrance: 0.24,
  celebration: 0.32,
};

const MemoryFragment = ({ className = '' }: { className?: string }) => (
  <div
    className={`absolute bg-journal-card border border-journal-border shadow-sm ${className}`}
    style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}
  />
);

const Polaroid = ({
  className = '',
  style,
  photoUrl,
  placeholder,
}: {
  className?: string;
  style?: CSSProperties;
  photoUrl?: string | null;
  placeholder?: string;
}) => (
  <div
    className={`bg-journal-card border border-journal-border shadow-md ${className}`}
    style={{ padding: '3px 3px 14px', ...style }}
  >
    {photoUrl ? (
      <img src={photoUrl} alt="" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-journal-secondary flex items-center justify-center text-xs text-journal-muted">
        {placeholder ?? ''}
      </div>
    )}
  </div>
);

const ArchiveAmbience = ({
  variant = 'focus',
  profile = 'default',
  photoUrl,
  bgClass,
}: ArchiveAmbienceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const density = DENSITY[variant];
  const isFull = density === 'full';
  const isShowcase = profile === 'archive-showcase' && variant === 'celebration';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#E7B96A', '#D4A574', '#F6EAD8', '#E6D5B8'];
    const count = PARTICLE_COUNTS[variant];

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.33 + 0.12,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let frameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [variant]);

  const baseClass =
    bgClass ??
    (variant === 'celebration'
      ? 'ambience-base-celebration'
      : variant === 'entrance'
        ? 'ambience-base-entrance'
        : 'ambience-base-focus');

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* L0 — Base gradient */}
      <div className={`absolute inset-0 ${baseClass.startsWith('from-') ? `bg-gradient-to-br ${baseClass}` : baseClass}`} />
      {variant === 'focus' && <div className="absolute inset-0 ambience-warm-glow" />}
      {variant === 'celebration' && <div className="absolute inset-0 ambience-shelf-glow" />}

      {/* L1 — Paper / wood texture */}
      <div className="absolute inset-0 ambience-paper-texture" />
      {(variant === 'celebration' || variant === 'entrance') && (
        <div className="absolute bottom-0 left-0 right-0 h-[40%] ambience-wood-grain opacity-40" />
      )}

      {/* L2 — Environmental SVG */}
      <BookshelfSilhouette opacity={SHELF_OPACITY[variant]} />
      {(variant === 'focus' || variant === 'entrance') && <SunlightWindow opacity={variant === 'entrance' ? 0.3 : 0.22} />}
      {(variant === 'entrance' || variant === 'celebration') && (
        <ArchiveCabinet opacity={variant === 'entrance' ? 0.22 : 0.26} />
      )}
      {isShowcase && <DisplayShelf opacity={0.32} />}

      {/* L5 — Canvas particles (below decor) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />

      {/* L3 — Floating memorabilia */}
      <Polaroid
        className="absolute top-[7%] left-[4%] w-14 h-[72px] md:w-16 md:h-20 -rotate-[8deg] opacity-70"
        photoUrl={photoUrl}
      />
      <Polaroid
        className="absolute top-[14%] right-[6%] w-12 h-[60px] md:w-14 md:h-[72px] rotate-[6deg] opacity-65"
        placeholder="📷"
      />
      {(isFull || density === 'explore') && (
        <Polaroid
          className="absolute bottom-[22%] left-[8%] w-11 h-14 md:w-12 md:h-16 rotate-[4deg] opacity-60"
        />
      )}

      {isFull && (
        <>
          <Polaroid
            className="absolute top-[32%] left-[2%] w-10 h-12 rotate-[-5deg] opacity-55 hidden sm:block"
          />
          <Polaroid
            className="absolute bottom-[35%] right-[4%] w-10 h-12 rotate-[8deg] opacity-50 hidden sm:block animate-float"
            style={{ '--float-rotate': '8deg', animationDelay: '1s' } as CSSProperties}
          />
        </>
      )}

      {isShowcase && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <Polaroid
              key={i}
              className="absolute w-9 h-11 md:w-10 md:h-12 opacity-50 animate-float hidden sm:block"
              style={{
                top: `${18 + i * 8}%`,
                left: `${12 + i * 18}%`,
                '--float-rotate': `${-4 + i * 3}deg`,
                animationDelay: `${i * 0.7}s`,
              } as CSSProperties}
            />
          ))}
        </>
      )}

      <div
        className="absolute top-[24%] right-[12%] md:right-[14%] text-xl md:text-2xl opacity-60 animate-float"
        style={{ '--float-rotate': '15deg' } as CSSProperties}
      >
        ✈️
      </div>

      <div className="absolute bottom-[28%] right-[5%] w-14 h-10 md:w-20 md:h-14 bg-journal-card border border-journal-border/80 shadow-sm -rotate-[3deg] opacity-65">
        <div className="p-1 md:p-1.5 text-[7px] md:text-[8px] text-journal-muted font-song leading-tight">
          回忆碎片
        </div>
      </div>

      <div
        className="absolute top-0 right-[10%] md:right-[12%] w-5 h-14 md:w-6 md:h-16 bg-journal-accent/70 opacity-70"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)' }}
      />

      <div className="absolute bottom-[7%] left-[2%] text-2xl md:text-3xl opacity-55">🌿</div>
      <div className="absolute top-[42%] left-[1%] text-lg opacity-50 hidden sm:block">🌸</div>
      {isFull && (
        <div className="absolute bottom-[15%] right-[2%] text-xl opacity-50">🌿</div>
      )}

      <MemoryFragment className="top-[18%] left-[18%] w-8 h-6 -rotate-12 opacity-55 hidden sm:block" />
      <MemoryFragment className="bottom-[40%] right-[18%] w-7 h-5 rotate-6 opacity-50" />
      {isFull && (
        <MemoryFragment className="top-[55%] left-[6%] w-6 h-5 rotate-3 opacity-45 hidden md:block" />
      )}

      <WashiTape className="top-[12%] left-[22%] opacity-75" color="#E7B96A" />
      <WashiTape className="bottom-[32%] right-[20%] opacity-70" color="#F6EAD8" />
      {isFull && (
        <WashiTape className="top-[48%] left-[3%] opacity-65 hidden sm:block" color="#D4A574" />
      )}

      <PawPrint className="absolute top-[20%] left-[28%] text-base opacity-55" />
      <PawPrint className="absolute bottom-[25%] left-[15%] text-sm opacity-50" />
      <PawPrint className="absolute top-[60%] right-[8%] text-sm opacity-45 hidden sm:block" />
      {isFull && (
        <PawPrint className="absolute bottom-[12%] right-[22%] text-base opacity-50" />
      )}

      <span className="absolute top-[38%] right-[3%] text-lg opacity-55 hidden sm:block">📎</span>
      <span className="absolute bottom-[18%] left-[25%] text-base opacity-50">✨</span>
      {isFull && (
        <>
          <span className="absolute top-[8%] right-[28%] text-base opacity-55">📚</span>
          <span className="absolute bottom-[45%] left-[4%] text-sm opacity-50 hidden md:block">📝</span>
        </>
      )}

      {density === 'explore' && (
        <>
          <FeatherPen className="absolute top-[52%] right-[2%] opacity-55" />
          <div
            className="absolute top-[6%] left-[38%] w-4 h-12 bg-journal-accent/60 opacity-65 hidden md:block"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 88%, 0 100%)' }}
          />
        </>
      )}

      {/* L4 — Sun shafts & glow orbs */}
      {(variant === 'focus' || variant === 'entrance') && (
        <div className="absolute inset-0 ambience-sun-shaft" />
      )}
      {isShowcase && <div className="absolute inset-0 ambience-showcase-glow" />}

      <div className="absolute top-[10%] left-[15%] w-32 h-32 rounded-full bg-amber-gold/20 blur-3xl animate-breathe" />
      <div
        className="absolute bottom-[20%] right-[10%] w-40 h-40 rounded-full bg-journal-accent/15 blur-3xl animate-breathe"
        style={{ animationDelay: '1.5s' }}
      />
      {isFull && (
        <div
          className="absolute top-[50%] left-[50%] w-24 h-24 rounded-full bg-amber-light/20 blur-3xl animate-breathe"
          style={{ animationDelay: '0.8s' }}
        />
      )}

      {/* L6 — Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 50%, ${VIGNETTE[variant]} 100%)`,
        }}
      />
    </div>
  );
};

export default ArchiveAmbience;
