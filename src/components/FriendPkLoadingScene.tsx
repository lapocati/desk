import { useEffect, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { FinalResult } from '@/types';
import { getSpiritBeastName, SPIRITS } from '@/constants';
import { PaperClip, PushPin, Sticker, WashiTape } from './ScrapbookDecor';

type LoadingStage = 'analyzing-friend' | 'building-pk';

interface FriendPkLoadingSceneProps {
  userPhotoUrl: string | null;
  friendPhotoUrl: string | null;
  userResult: FinalResult;
  friendResult?: FinalResult | null;
  stage: LoadingStage;
  messageIndex: number;
}

type PuzzlePiece = {
  id: string;
  x: string;
  y: string;
  w: string;
  h: string;
  rotation: number;
  source: 'left' | 'right';
  label: string;
  accent: string;
  content: {
    type: 'polaroid' | 'note' | 'flower' | 'star' | 'doodle' | 'sticker' | 'badge' | 'memory';
    text: string;
  };
};

const MESSAGE_SETS: Record<LoadingStage, string[]> = {
  'analyzing-friend': [
    '正在收集友谊瞬间……',
    '寻找共同兴趣……',
    '整理灵感碎片……',
    '拼出你们的小默契……',
  ],
  'building-pk': [
    '准备有趣的挑战……',
    '拼合回忆与灵感……',
    '打造你专属的 PK 体验……',
    '马上就好……',
  ],
};

const PUZZLE_PIECES: PuzzlePiece[] = [
  {
    id: 'piece-polaroid',
    x: '8%',
    y: '9%',
    w: '26%',
    h: '22%',
    rotation: -5,
    source: 'left',
    label: '拍立得',
    accent: '#F2B6A0',
    content: { type: 'polaroid', text: '放学后的合照' },
  },
  {
    id: 'piece-note',
    x: '38%',
    y: '12%',
    w: '24%',
    h: '18%',
    rotation: 3,
    source: 'right',
    label: '手写便签',
    accent: '#F4C971',
    content: { type: 'note', text: '一起去吃那家新店' },
  },
  {
    id: 'piece-flower',
    x: '65%',
    y: '7%',
    w: '25%',
    h: '24%',
    rotation: 6,
    source: 'left',
    label: '小花',
    accent: '#E6B6C9',
    content: { type: 'flower', text: '花朵书签' },
  },
  {
    id: 'piece-doodle',
    x: '15%',
    y: '37%',
    w: '28%',
    h: '22%',
    rotation: -4,
    source: 'right',
    label: '涂鸦',
    accent: '#C9B28F',
    content: { type: 'doodle', text: '脑洞地图' },
  },
  {
    id: 'piece-star',
    x: '46%',
    y: '33%',
    w: '20%',
    h: '21%',
    rotation: 2,
    source: 'left',
    label: '星光',
    accent: '#F6D983',
    content: { type: 'star', text: '共同愿望' },
  },
  {
    id: 'piece-memory',
    x: '68%',
    y: '37%',
    w: '18%',
    h: '18%',
    rotation: -3,
    source: 'right',
    label: '回忆',
    accent: '#EDC0A9',
    content: { type: 'memory', text: '笑到停不下来' },
  },
  {
    id: 'piece-sticker',
    x: '11%',
    y: '64%',
    w: '24%',
    h: '18%',
    rotation: 4,
    source: 'left',
    label: '贴纸',
    accent: '#F8BE8F',
    content: { type: 'sticker', text: '可爱小奖励' },
  },
  {
    id: 'piece-badge',
    x: '39%',
    y: '59%',
    w: '25%',
    h: '22%',
    rotation: -2,
    source: 'right',
    label: '成就',
    accent: '#E0BC78',
    content: { type: 'badge', text: '默契 +1' },
  },
  {
    id: 'piece-friend',
    x: '66%',
    y: '61%',
    w: '22%',
    h: '23%',
    rotation: 5,
    source: 'left',
    label: '友谊时刻',
    accent: '#F3A8A8',
    content: { type: 'memory', text: '你们总能接住彼此的梗' },
  },
];

const PETALS = [
  { left: '8%', delay: 0, duration: 14 },
  { left: '23%', delay: 2.5, duration: 12.5 },
  { left: '51%', delay: 1.2, duration: 15.5 },
  { left: '72%', delay: 4.1, duration: 13.6 },
  { left: '88%', delay: 3.2, duration: 16.5 },
];

const FLOATING_STICKERS = [
  { text: '好友回忆', top: '15%', left: '8%', rotate: -8, delay: 0.4 },
  { text: '灵感拼贴', top: '19%', right: '10%', rotate: 7, delay: 1.2 },
  { text: '兴趣交集', top: '72%', left: '9%', rotate: -4, delay: 2.1 },
  { text: '默契碎片', top: '69%', right: '8%', rotate: 5, delay: 1.7 },
];

const DUST_PARTICLES = Array.from({ length: 12 }, (_, index) => ({
  id: `dust-${index}`,
  left: `${6 + index * 7}%`,
  top: `${14 + (index % 4) * 17}%`,
  delay: index * 0.35,
  duration: 5 + (index % 5),
}));

const BUTTERFLIES = [
  { top: '21%', delay: 1.8, duration: 12, scale: 0.9 },
  { top: '62%', delay: 5.4, duration: 14, scale: 0.75 },
];

const PIECE_INTERVAL = 2200;
const MESSAGE_INTERVAL = 2600;

const frameShadow =
  '0 14px 40px rgba(124, 96, 66, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.75)';

const renderPuzzleContent = (piece: PuzzlePiece) => {
  const common = 'w-full h-full rounded-[20px] border border-white/70 overflow-hidden';
  switch (piece.content.type) {
    case 'polaroid':
      return (
        <div className={`${common} bg-[#FFF9F3] p-2`}>
          <div className="h-full rounded-[14px] bg-gradient-to-br from-[#FFE9D8] via-[#FFF6EE] to-[#F4D7C8] p-2 flex flex-col justify-between">
            <div className="h-12 rounded-[10px] bg-white/70 border border-white/60 shadow-sm" />
            <p className="text-[10px] text-[#8B7355] font-song tracking-wide">{piece.content.text}</p>
          </div>
        </div>
      );
    case 'note':
      return (
        <div className={`${common} bg-[#FFF7D8] px-3 py-2 flex flex-col justify-between`}>
          <span className="text-[10px] text-[#9C7A4B] font-song">MEMO</span>
          <p className="text-[11px] leading-snug text-[#7A5C43] font-song">{piece.content.text}</p>
          <div className="space-y-1 opacity-50">
            <div className="h-px bg-[#D6BA85]" />
            <div className="h-px bg-[#D6BA85]" />
          </div>
        </div>
      );
    case 'flower':
      return (
        <div className={`${common} bg-gradient-to-br from-[#FFF7F5] to-[#F4E5D8] flex items-center justify-center text-3xl`}>
          <span>🌼</span>
        </div>
      );
    case 'star':
      return (
        <div className={`${common} bg-gradient-to-br from-[#FFF8D7] via-[#FFFBEF] to-[#F7E5B2] flex flex-col items-center justify-center`}>
          <span className="text-2xl">⭐</span>
          <span className="mt-1 text-[10px] text-[#8C6C42] font-song">{piece.content.text}</span>
        </div>
      );
    case 'doodle':
      return (
        <div className={`${common} bg-[#FFF8EE] relative`}>
          <div className="absolute inset-2 rounded-[14px] border border-dashed border-[#D7BFA8]" />
          <div className="absolute left-4 top-4 text-lg">↗</div>
          <div className="absolute right-4 top-6 text-xl">♥</div>
          <div className="absolute left-8 bottom-5 text-lg">☆</div>
          <p className="absolute bottom-3 right-4 text-[10px] text-[#8B7355] font-song">{piece.content.text}</p>
        </div>
      );
    case 'sticker':
      return (
        <div className={`${common} bg-gradient-to-br from-[#FFF3EB] to-[#FFE2CF] flex flex-col items-center justify-center`}>
          <span className="text-2xl">🎀</span>
          <span className="text-[10px] mt-1 text-[#8C624D] font-song">{piece.content.text}</span>
        </div>
      );
    case 'badge':
      return (
        <div className={`${common} bg-gradient-to-br from-[#FFF6DF] to-[#F5E0A8] flex flex-col items-center justify-center`}>
          <span className="text-xs text-[#8D6B2C] font-song">小成就</span>
          <span className="text-lg font-bold text-[#9A7233]">+1</span>
          <span className="text-[10px] text-[#8D6B2C] font-song">{piece.content.text}</span>
        </div>
      );
    case 'memory':
      return (
        <div className={`${common} bg-gradient-to-br from-[#FFF7F2] to-[#F6EAD8] px-3 py-2 flex flex-col justify-center`}>
          <span className="text-[10px] text-[#B88776] font-song mb-1">{piece.label}</span>
          <p className="text-[11px] leading-snug text-[#7A5C43] font-song">{piece.content.text}</p>
        </div>
      );
    default:
      return null;
  }
};

const ScrapbookAvatarFrame = ({
  title,
  caption,
  photoUrl,
  accent,
  sticker,
}: {
  title: string;
  caption: string;
  photoUrl: string | null;
  accent: string;
  sticker: string;
}) => (
  <motion.div
    className="relative w-32 sm:w-36 md:w-40"
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
  >
    <PaperClip className="absolute -top-2 left-3 z-20" />
    <WashiTape className="-top-2 right-3 z-10" color={accent} />
    <div className="paper-edge-shadow relative rounded-[2rem] border border-white/80 bg-[#FFF7EF]/95 p-3 backdrop-blur-sm">
      <PushPin className="left-1/2 top-2 -translate-x-1/2" />
      <div
        className="absolute right-2 top-3 rounded-full px-2 py-1 text-[10px] font-song text-[#7D614C] shadow-sm"
        style={{ backgroundColor: accent }}
      >
        {sticker}
      </div>
      <div className="relative rounded-[1.5rem] bg-[#FFFDF9] p-2 shadow-sm" style={{ boxShadow: frameShadow }}>
        <motion.div
          className="relative overflow-hidden rounded-[1.25rem] border border-[#F3E4D6] bg-gradient-to-br from-[#FFF9F5] to-[#F8EBDD] aspect-[4/5]"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl text-[#D4B28C]">
              <span>{title === '你' ? '☀' : '☁'}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#5C4B3B]/10 via-transparent to-white/35" />
        </motion.div>
        <div className="mt-3 space-y-1 px-1 text-center">
          <p className="text-sm font-song text-[#6D5443]">{title}</p>
          <p className="text-[11px] leading-snug text-[#8B7355]">{caption}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const FriendPkLoadingScene = ({
  userPhotoUrl,
  friendPhotoUrl,
  userResult,
  friendResult,
  stage,
  messageIndex,
}: FriendPkLoadingSceneProps) => {
  const [placedCount, setPlacedCount] = useState(1);
  const [activePieceIndex, setActivePieceIndex] = useState(0);
  const [localMessageIndex, setLocalMessageIndex] = useState(messageIndex);

  const messages = MESSAGE_SETS[stage];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPlacedCount((current) => {
        if (current >= PUZZLE_PIECES.length) {
          return current;
        }
        const next = current + 1;
        setActivePieceIndex(next - 1);
        return next;
      });
    }, PIECE_INTERVAL);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setLocalMessageIndex(messageIndex % messages.length);
  }, [messageIndex, messages.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLocalMessageIndex((current) => (current + 1) % messages.length);
    }, MESSAGE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [messages.length]);

  const completionRatio = Math.round((placedCount / PUZZLE_PIECES.length) * 100);
  const activeMessage = messages[localMessageIndex % messages.length];
  const friendSpirit = friendResult ? SPIRITS[friendResult.primarySpirit] : null;

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col justify-center overflow-hidden px-2 py-2 sm:px-4 sm:py-3 lg:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[12%] h-32 w-32 rounded-full bg-[#FFE6D5]/65 blur-3xl" />
        <div className="absolute right-[10%] top-[20%] h-40 w-40 rounded-full bg-[#FFF1B6]/50 blur-3xl" />
        <div className="absolute bottom-[10%] left-[20%] h-36 w-36 rounded-full bg-[#F7DAD9]/45 blur-3xl" />

        {DUST_PARTICLES.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute h-1.5 w-1.5 rounded-full bg-white/70"
            style={{ left: particle.left, top: particle.top }}
            animate={{ y: [0, -16, 0], x: [0, 8, -4, 0], opacity: [0.2, 0.75, 0.2] }}
            transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {PETALS.map((petal) => (
          <motion.span
            key={`${petal.left}-${petal.delay}`}
            className="absolute top-[-8%] text-lg opacity-75"
            style={{ left: petal.left }}
            animate={{ y: ['0vh', '118vh'], x: [0, 14, -10, 8], rotate: [0, 25, -10, 18], opacity: [0, 0.8, 0.7, 0] }}
            transition={{ duration: petal.duration, delay: petal.delay, repeat: Infinity, ease: 'linear' }}
          >
            🌸
          </motion.span>
        ))}

        {BUTTERFLIES.map((item) => (
          <motion.div
            key={`${item.top}-${item.delay}`}
            className="absolute text-lg opacity-70"
            style={{ top: item.top, scale: item.scale }}
            animate={{ x: ['-10vw', '112vw'], y: [0, -8, 4, -3, 0], opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            🦋
          </motion.div>
        ))}

        {FLOATING_STICKERS.map((item) => (
          <motion.div
            key={item.text}
            className="absolute hidden md:block"
            style={{ top: item.top, left: item.left, right: item.right }}
            animate={{ y: [0, -8, 0], rotate: [item.rotate, item.rotate + 2, item.rotate] }}
            transition={{ duration: 4.6, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sticker className="sticker-warm-bob bg-[#FFF7EE]/95 px-3 py-1.5 text-[11px] shadow-sm">
              {item.text}
            </Sticker>
          </motion.div>
        ))}

        <motion.div
          className="absolute left-[6%] top-[32%] hidden text-[#D2A989]/70 md:block"
          animate={{ rotate: [-10, -6, -10], y: [0, -3, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          ↺
        </motion.div>
        <motion.div
          className="absolute right-[7%] top-[59%] hidden text-[#D29B83]/75 md:block"
          animate={{ rotate: [6, 11, 6], y: [0, 4, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          ↗
        </motion.div>
      </div>

      <div className="relative z-10 grid h-full min-h-0 items-center gap-3 lg:grid-cols-[minmax(0,156px)_minmax(0,1fr)_minmax(0,156px)] lg:gap-4">
        <div className="order-2 flex justify-start self-start pt-1 lg:order-1 lg:justify-center lg:self-center">
          <ScrapbookAvatarFrame
            title="你"
            caption={`你的灵感碎片 · ${getSpiritBeastName(userResult.primarySpirit)}`}
            photoUrl={userPhotoUrl}
            accent="#F6D0BF"
            sticker={userResult.personalityTag}
          />
        </div>

        <div className="order-1 min-h-0 lg:order-2">
          <div className="relative mx-auto max-w-2xl rounded-[2rem] border border-white/70 bg-[#FFF8F0]/92 p-3 shadow-[0_18px_56px_rgba(120,94,66,0.14)] backdrop-blur-sm sm:p-4">
            <div className="pointer-events-none absolute inset-x-4 top-2.5 flex items-center justify-between text-[#CFAF88]">
              <div className="flex items-center gap-2">
                <PaperClip className="text-lg" />
                <span className="text-[11px] font-song uppercase tracking-[0.2em] text-[#9B7A5B]">Magic Puzzle</span>
              </div>
              <Sticker className="bg-[#FFF3E0]/95 px-3 py-1 text-[10px] shadow-sm">默契逐渐成形</Sticker>
            </div>

            <div className="mt-7 rounded-[1.7rem] border border-[#F1DEC9] bg-gradient-to-br from-[#FFFDF9] via-[#FFF6ED] to-[#F7E8D7] p-2.5 sm:p-3">
              <div className="scrapbook-board-texture scrapbook-dashed relative aspect-[1.22/1] overflow-hidden rounded-[1.35rem] border border-white/80 bg-[#FFF9F3] shadow-inner">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(246,208,191,0.3),transparent_32%)]" />
                <motion.div
                  className="absolute left-[24%] top-[23%] h-28 w-28 rounded-full bg-[#FFF1B8]/30 blur-3xl sm:h-32 sm:w-32"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />

                {PUZZLE_PIECES.map((piece, index) => {
                  const isPlaced = index < placedCount;
                  const isNew = index === activePieceIndex;
                  const pieceStyle = {
                    left: piece.x,
                    top: piece.y,
                    width: piece.w,
                    height: piece.h,
                    rotate: `${piece.rotation}deg`,
                    '--piece-accent': piece.accent,
                  } as CSSProperties;

                  return (
                    <div key={piece.id} className="absolute" style={pieceStyle}>
                      <div
                        className={`absolute inset-0 rounded-[20px] border border-dashed ${
                          isPlaced ? 'border-transparent opacity-0' : 'border-[#E7D3BE] opacity-100'
                        } bg-[#FFF3E6]/55 transition-all duration-500`}
                      />

                      {isPlaced && (
                        <motion.div
                          className="piece-glow-ring absolute -inset-2 rounded-[24px]"
                          initial={isNew ? { opacity: 0, scale: 0.6 } : false}
                          animate={isNew ? { opacity: [0, 0.9, 0], scale: [0.7, 1.1, 1.35] } : { opacity: [0.1, 0.25, 0.1] }}
                          transition={isNew ? { duration: 1.2, ease: 'easeOut' } : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}

                      {isPlaced && (
                        <motion.div
                          className="paper-edge-shadow absolute inset-0 rounded-[20px] border border-white/80 bg-[#FFFDF9] p-1.5 shadow-[0_10px_22px_rgba(122,92,67,0.12)] sm:p-2"
                          initial={
                            isNew
                              ? {
                                  x: piece.source === 'left' ? '-150%' : '150%',
                                  y: piece.source === 'left' ? '70%' : '-60%',
                                  rotate: piece.source === 'left' ? -18 : 18,
                                  scale: 0.78,
                                  opacity: 0.2,
                                }
                              : false
                          }
                          animate={{
                            x: 0,
                            y: 0,
                            rotate: piece.rotation,
                            scale: isNew ? [0.84, 1.06, 1] : 1,
                            opacity: 1,
                          }}
                          transition={isNew ? { duration: 1.15, ease: [0.22, 1, 0.36, 1] } : { duration: 0.4 }}
                        >
                          {renderPuzzleContent(piece)}
                          <div
                            className="absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-song text-[#7D614C] shadow-sm sm:right-2 sm:top-2 sm:px-2 sm:text-[9px]"
                            style={{ backgroundColor: piece.accent }}
                          >
                            {piece.label}
                          </div>
                        </motion.div>
                      )}

                      {isPlaced && isNew && (
                        <>
                          {[0, 1, 2].map((spark) => (
                            <motion.span
                              key={`${piece.id}-spark-${spark}`}
                              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#FFF2BA]"
                              initial={{ x: 0, y: 0, opacity: 0.95, scale: 0.7 }}
                              animate={{
                                x: spark === 0 ? -24 : spark === 1 ? 28 : -6,
                                y: spark === 0 ? -20 : spark === 1 ? 8 : 24,
                                opacity: 0,
                                scale: 1.2,
                              }}
                              transition={{ duration: 0.9, ease: 'easeOut' }}
                            />
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}

                <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2 rounded-[1rem] border border-white/70 bg-[#FFF8F0]/85 px-2.5 py-2 backdrop-blur-sm sm:bottom-3 sm:left-3 sm:right-3 sm:px-3">
                  <div className="flex items-center gap-2 text-[#8B7355]">
                    <Sparkles className="h-3.5 w-3.5 text-[#E8AE74]" />
                    <span className="text-[11px] font-song sm:text-xs">拼图板持续演变中</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8B7355]">已完成 {completionRatio}%</span>
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-[#F0DFCF]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#F5C8AA] via-[#F0D48B] to-[#E8AE74]"
                        animate={{ width: `${completionRatio}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="journal-card relative overflow-hidden rounded-[1.3rem] border-white/70 bg-[#FFF8EE]/92 px-4 py-3 sm:px-5">
                <div className="absolute -right-4 -top-4 h-10 w-10 rounded-full bg-[#FFEBC8]/65 blur-2xl" />
                <motion.div
                  className="paper-corner-lift absolute right-0 top-0 h-8 w-8 bg-[linear-gradient(135deg,rgba(255,255,255,0)_0%,rgba(241,219,199,0.95)_100%)] sm:h-10 sm:w-10"
                  style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
                />
                <div className="mb-2 flex items-center gap-2 text-[#A17B5A]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[11px] font-song tracking-[0.16em] sm:text-xs">正在进行中的拼图旁白</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${stage}-${localMessageIndex}`}
                    className="text-base font-song leading-relaxed text-[#6D5443] sm:text-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {activeMessage}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="flex gap-2 lg:pb-1">
                {messages.map((message, index) => (
                  <motion.span
                    key={message}
                    className={`h-2 rounded-full ${index === localMessageIndex ? 'bg-[#E7B177]' : 'bg-[#EADBCB]'}`}
                    animate={{ width: index === localMessageIndex ? 24 : 9, opacity: index === localMessageIndex ? 1 : 0.7 }}
                    transition={{ duration: 0.35 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="order-3 flex justify-end self-start pt-1 lg:justify-center lg:self-center">
          <ScrapbookAvatarFrame
            title="好友"
            caption={
              friendSpirit
                ? `${getSpiritBeastName(friendResult!.primarySpirit)} · 共鸣度 ${friendResult!.primaryResonance}%`
                : stage === 'analyzing-friend'
                  ? '好友回忆拼图中'
                  : '正在整理你们的有趣交集'
            }
            photoUrl={friendPhotoUrl}
            accent="#F7DFA1"
            sticker={friendSpirit ? friendResult!.personalityTag : '拼图进行中'}
          />
        </div>
      </div>
    </div>
  );
};

export default FriendPkLoadingScene;
