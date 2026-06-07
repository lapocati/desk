import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { SpiritInfo } from '@/types';
import SpiritAvatar from './SpiritAvatar';
import { PushPin, WashiTape, FeatherPen, PawPrint } from './ScrapbookDecor';

interface JournalEntryProps {
  role: 'spirit' | 'user' | 'loading';
  content?: string;
  spirit?: SpiritInfo;
  loadingText?: string;
  index?: number;
}

const JournalEntry = ({
  role,
  content = '',
  spirit,
  loadingText = '灵宠正在记录…',
  index = 0,
}: JournalEntryProps) => {
  if (role === 'loading') {
    return (
      <motion.div
        className="relative journal-card p-4 max-w-[90%]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PushPin className="-top-1.5 left-4" />
        <div className="flex items-center gap-2">
          {spirit && (
            <SpiritAvatar spirit={spirit} size="small" className="w-8 h-8" />
          )}
          <Loader2 className="w-4 h-4 animate-spin text-journal-accent" />
          <span className="text-sm text-journal-muted font-hei italic">{loadingText}</span>
        </div>
      </motion.div>
    );
  }

  if (role === 'user') {
    return (
      <motion.div
        className="relative ml-auto max-w-[85%]"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="journal-card-tilt paper-texture p-4 rotate-[0.5deg]">
          <WashiTape className="-top-2 right-6" color="#D4A574" />
          <p className="text-sm md:text-base font-hei text-journal-text leading-relaxed pr-6">
            {content}
          </p>
          <FeatherPen className="absolute bottom-2 right-3" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative max-w-[90%]"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className="journal-card p-4 relative"
        style={{ borderLeft: spirit ? `3px solid ${spirit.color}` : undefined }}
      >
        <PushPin className="-top-1.5 left-4" />
        {spirit && (
          <WashiTape className="-top-2 left-8" color={`${spirit.color}99`} />
        )}
        <div className="flex items-center gap-2 mb-2">
          {spirit && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${spirit.color}15`,
                border: `1.5px solid ${spirit.color}`,
              }}
            >
              <SpiritAvatar spirit={spirit} size="small" className="w-6 h-6" />
            </div>
          )}
          {spirit && (
            <span className="text-xs font-song font-bold" style={{ color: spirit.color }}>
              {spirit.name}
            </span>
          )}
        </div>
        <p className="text-sm md:text-base font-hei text-journal-text leading-relaxed">
          {content}
        </p>
        <PawPrint className="absolute bottom-1 right-2" />
      </div>
    </motion.div>
  );
};

export default JournalEntry;
