import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import type { FinalResult, SpiritInfo } from '@/types';
import { SPIRITS } from '@/constants';
import SpiritAvatar from './SpiritAvatar';
import { BookmarkRibbon, PushPin, PaperClip } from './ScrapbookDecor';

interface MemoryArchiveCardProps {
  finalResult: FinalResult;
  id?: string;
  compact?: boolean;
  spirit?: SpiritInfo;
  resonance?: number;
  personalityTag?: string;
  label?: string;
}

const ResonanceRing = ({ value, color, size = 64 }: { value: number; color: string; size?: number }) => {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#F6EAD8"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-song fill-journal-text"
        style={{ fontSize: size * 0.22 }}
      >
        {value}%
      </text>
    </svg>
  );
};

const MemoryArchiveCard = ({
  finalResult,
  id = 'memory-archive-card',
  compact = false,
  spirit: compactSpirit,
  resonance,
  personalityTag,
  label,
}: MemoryArchiveCardProps) => {
  if (compact && compactSpirit) {
    return (
      <div className="archive-card p-6 flex flex-col items-center text-center">
        <SpiritAvatar spirit={compactSpirit} size="large" className="w-24 h-24 mb-3" />
        <h3 className="text-lg font-song font-bold" style={{ color: compactSpirit.color }}>
          {compactSpirit.name}
        </h3>
        <p className="text-xs text-journal-muted mb-1">{compactSpirit.title}</p>
        {resonance != null && (
          <p className="text-sm font-song text-journal-text">共鸣度 {resonance}%</p>
        )}
        {personalityTag && (
          <span className="mt-2 px-3 py-1 rounded-full bg-journal-secondary border border-journal-border text-xs font-song text-journal-text">
            {personalityTag}
          </span>
        )}
        {label && <p className="mt-2 text-xs text-journal-muted">{label}</p>}
      </div>
    );
  }

  const primarySpirit = SPIRITS[finalResult.primarySpirit];

  return (
    <div id={id} className="archive-card p-6 md:p-8 max-w-lg w-full relative">
      <BookmarkRibbon label="档案卡" className="absolute -top-1 left-6" />

      <div className="text-center mb-4 pt-4">
        <p className="text-xs font-song text-journal-muted tracking-widest">桌灵档案馆 · 回忆档案</p>
      </div>

      {/* Hero section */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${primarySpirit.color}12`,
            border: `2px solid ${primarySpirit.color}`,
          }}
        >
          <SpiritAvatar spirit={primarySpirit} size="large" className="w-16 h-16" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-song font-bold" style={{ color: primarySpirit.color }}>
            {primarySpirit.name}
          </h2>
          <p className="text-sm text-journal-muted font-hei">{primarySpirit.title}</p>
          <p className="text-xs text-journal-muted/80 font-hei mt-1 line-clamp-2">
            {primarySpirit.description}
          </p>
        </div>
        <ResonanceRing value={finalResult.primaryResonance} color={primarySpirit.color} />
      </div>

      {/* Personality stamp */}
      <div className="relative journal-card p-4 mb-4 text-center">
        <PushPin className="-top-1.5 left-1/2 -translate-x-1/2" />
        <Sparkles className="w-4 h-4 text-journal-accent mx-auto mb-1" />
        <span className="text-lg font-song font-bold text-journal-text">
          {finalResult.personalityTag}
        </span>
        <p className="text-sm text-journal-muted font-hei italic mt-2">
          {finalResult.personalityTagline}
        </p>
      </div>

      {/* Personality portrait - merged tagline + dynamic */}
      <div className="journal-card p-4 mb-4 relative">
        <h4 className="text-sm font-song font-bold text-journal-text mb-2 flex items-center gap-1">
          💭 人格画像
        </h4>
        <p className="text-sm font-hei text-journal-text/90 italic leading-relaxed">
          「{finalResult.dynamicPersonality}」
        </p>
      </div>

      {/* Top 3 polaroid strip */}
      <div className="mb-4">
        <h4 className="text-sm font-song font-bold text-journal-text mb-3">灵居共鸣 Top 3</h4>
        <div className="flex gap-3 justify-center">
          {finalResult.top3Spirits.map((item, index) => {
            const spirit = SPIRITS[item.spirit];
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <motion.div
                key={item.spirit}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div
                  className="w-14 h-16 bg-journal-card border border-journal-border shadow-sm p-1 flex flex-col items-center"
                  style={{ transform: `rotate(${index === 0 ? -2 : index === 1 ? 1 : -1}deg)` }}
                >
                  <span className="text-xs">{medals[index]}</span>
                  <SpiritAvatar spirit={spirit} size="small" className="w-10 h-10" />
                </div>
                <span className="text-xs font-song mt-1" style={{ color: spirit.color }}>
                  {spirit.name}
                </span>
                <span className="text-[10px] text-journal-muted tabular-nums">{item.resonance}%</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Resonance reasons */}
      <div className="journal-card p-4 mb-4 relative">
        <PaperClip className="absolute -top-1 right-4" />
        <h4 className="text-sm font-song font-bold text-journal-text mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-journal-accent" />
          共鸣原因
        </h4>
        <ul className="space-y-2">
          {finalResult.resonanceReasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-journal-text/85 font-hei">
              <span className="w-4 h-4 rounded-full bg-journal-secondary flex items-center justify-center text-[10px] text-journal-accent shrink-0 mt-0.5">
                ✓
              </span>
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MemoryArchiveCard;
