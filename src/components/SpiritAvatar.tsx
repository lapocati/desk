import type { SpiritInfo } from '@/types';

interface SpiritAvatarProps {
  spirit: SpiritInfo;
  size?: 'large' | 'small';
  className?: string;
}

const SpiritAvatar = ({ spirit, size = 'large', className = '' }: SpiritAvatarProps) => {
  const iconSrc = size === 'small' ? spirit.iconSmall : spirit.iconLarge;

  if (iconSrc) {
    return (
      <img
        src={iconSrc}
        alt={spirit.name}
        className={`object-contain ${size === 'large' ? 'p-1' : 'p-0'} ${className}`}
        draggable={false}
      />
    );
  }

  const emojiSize = size === 'large' ? 'text-5xl' : 'text-lg';
  return <span className={emojiSize}>{spirit.emoji}</span>;
};

export default SpiritAvatar;
