import type { ReactNode } from 'react';
import ArchiveAmbience, { type AmbienceProfile, type AmbienceVariant } from './ArchiveAmbience';

interface PageShellProps {
  children: ReactNode;
  ambience?: AmbienceVariant;
  ambienceProfile?: AmbienceProfile;
  photoUrl?: string | null;
  bgClass?: string;
  className?: string;
}

const PageShell = ({
  children,
  ambience = 'focus',
  ambienceProfile = 'default',
  photoUrl,
  bgClass,
  className = '',
}: PageShellProps) => (
  <div className={`min-h-screen relative overflow-hidden ${className}`}>
    <ArchiveAmbience
      variant={ambience}
      profile={ambienceProfile}
      photoUrl={photoUrl}
      bgClass={bgClass}
    />
    <div className="relative z-10">{children}</div>
  </div>
);

export default PageShell;
