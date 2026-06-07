import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { SPIRITS } from '@/constants';
import {
  SPIRIT_NAME_TO_TYPE,
  TIMELINE_INTRO,
  NODE_LONG_AGO,
  NODE_FIRST_MEET,
  NODE_NOW_FALLBACK,
  NODE_FUTURE_QUESTION,
  NODE_FUTURE_REVEAL,
  NODE_FUTURE_FAREWELL,
  TIMELINE_ARCHIVED,
  TIMELINE_RETURN_LABEL,
  TIMELINE_NODE_TITLES,
} from '@/constants/timeline';
import { getTimelineMoment } from '@/services/deepseekApi';
import type { SpiritType, TimelineComment } from '@/types';
import PageShell from '@/components/PageShell';
import SpiritAvatar from '@/components/SpiritAvatar';

type Phase =
  | 'intro'
  | 'node1'
  | 'node2'
  | 'node3'
  | 'future-q'
  | 'future-reveal'
  | 'future-farewell'
  | 'archived'
  | 'done';

const NODE_LABELS = [
  TIMELINE_NODE_TITLES.longAgo,
  TIMELINE_NODE_TITLES.firstMeet,
  TIMELINE_NODE_TITLES.now,
  TIMELINE_NODE_TITLES.future,
];

const PHASE_NODE_INDEX: Record<Phase, number> = {
  intro: -1,
  node1: 0,
  node2: 1,
  node3: 2,
  'future-q': 3,
  'future-reveal': 3,
  'future-farewell': 3,
  archived: 3,
  done: 3,
};

const PHASE_PROGRESS: Record<Phase, number> = {
  intro: 0,
  node1: 0.25,
  node2: 0.5,
  node3: 0.75,
  'future-q': 0.9,
  'future-reveal': 0.92,
  'future-farewell': 0.95,
  archived: 1,
  done: 1,
};

const NODE_CONTENT_LEFT: Record<'node1' | 'node2' | 'node3', CSSProperties['left']> = {
  node1: '0%',
  node2: 'clamp(0px, calc(33.333% - 10rem), calc(100% - 20rem))',
  node3: 'clamp(0px, calc(66.666% - 10rem), calc(100% - 20rem))',
};

function spiritInfo(name: string) {
  const type = SPIRIT_NAME_TO_TYPE[name] as SpiritType | undefined;
  return type ? SPIRITS[type] : null;
}

const Typewriter = ({ text, speed = 130 }: { text: string; speed?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    const id = setInterval(() => {
      setCount((prev) => {
        if (prev >= text.length) {
          clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return <span>{text.slice(0, count)}</span>;
};

const CommentLine = ({
  comment,
  delay = 0,
}: {
  comment: TimelineComment;
  delay?: number;
}) => {
  const info = spiritInfo(comment.spirit);
  return (
    <motion.div
      className="journal-card glow-spirit w-full px-4 py-3 flex items-start gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
    >
      {info && (
        <div className="w-8 h-8 shrink-0 rounded-full bg-journal-secondary/60 flex items-center justify-center overflow-hidden">
          <SpiritAvatar spirit={info} size="small" className="w-7 h-7" />
        </div>
      )}
      <div className="text-left">
        <p className="text-xs text-journal-muted font-song mb-0.5">{comment.spirit}</p>
        <p className="text-sm leading-relaxed text-journal-text font-hei">
          {comment.message}
        </p>
      </div>
    </motion.div>
  );
};

const CommentList = ({
  comments,
  align = 'left',
}: {
  comments: TimelineComment[];
  align?: 'left' | 'center';
}) => (
  <div
    className={`flex w-full max-w-[20rem] flex-col items-stretch gap-3 ${
      align === 'center' ? 'mx-auto' : ''
    }`}
  >
    {comments.map((c, i) => (
      <CommentLine key={`${c.spirit}-${i}`} comment={c} delay={i * 1.1} />
    ))}
  </div>
);

const TimelinePage = () => {
  const navigate = useNavigate();
  const finalResult = useAppStore((state) => state.finalResult);
  const visualAnalysis = useAppStore((state) => state.visualAnalysis);
  const dialogueHistory = useAppStore((state) => state.dialogueHistory);
  const reset = useAppStore((state) => state.reset);

  const [phase, setPhase] = useState<Phase>('intro');
  const [nowComments, setNowComments] = useState<TimelineComment[] | null>(null);
  const nowCommentsRef = useRef<TimelineComment[] | null>(null);

  const setNow = (comments: TimelineComment[]) => {
    nowCommentsRef.current = comments;
    setNowComments(comments);
  };

  // 预取「此刻」节点的大模型评论（唯一调用大模型处）
  useEffect(() => {
    if (!finalResult) return;
    let cancelled = false;

    const topSpirits = finalResult.top3Spirits.map((s) => SPIRITS[s.spirit].name);
    const visualFeatures: string[] = [];
    if (visualAnalysis) {
      for (const obj of visualAnalysis.objects) {
        visualFeatures.push(
          `${obj.name}（位于画面 x:${Math.round(obj.position.x)}% y:${Math.round(obj.position.y)}%）`
        );
      }
      if (visualAnalysis.summary) visualFeatures.push(`整体印象：${visualAnalysis.summary}`);
      if (visualAnalysis.hiddenDoubts) visualFeatures.push(`隐藏疑点：${visualAnalysis.hiddenDoubts}`);
    }
    const conversationSummary = dialogueHistory
      .filter((m) => m.role === 'user')
      .map((m) => m.content);

    getTimelineMoment({
      personality: finalResult.personalityTag,
      subPersonality: finalResult.dynamicPersonality,
      topSpirits,
      visualFeatures,
      conversationSummary,
    })
      .then((comments) => {
        if (!cancelled) setNow(comments);
      })
      .catch(() => {
        if (!cancelled) setNow(NODE_NOW_FALLBACK);
      });

    return () => {
      cancelled = true;
    };
  }, [finalResult, visualAnalysis, dialogueHistory]);

  // 守卫：无结果时返回结果页
  useEffect(() => {
    if (!finalResult) navigate('/result');
  }, [finalResult, navigate]);

  // 叙事时序编排
  useEffect(() => {
    if (!finalResult) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    const run = async () => {
      await sleep(2000);
      if (cancelled) return;
      setPhase('node1');
      await sleep(3400);
      if (cancelled) return;
      setPhase('node2');
      await sleep(3400);
      if (cancelled) return;
      setPhase('node3');
      // 等待大模型评论就绪（最多约 10 秒，超时回退）
      let waited = 0;
      while (!cancelled && nowCommentsRef.current === null && waited < 10000) {
        await sleep(150);
        waited += 150;
      }
      if (cancelled) return;
      if (nowCommentsRef.current === null) setNow(NODE_NOW_FALLBACK);
      await sleep(3800);
      if (cancelled) return;
      setPhase('future-q');
      await sleep(1500); // 问号独自停留 1.5 秒
      if (cancelled) return;
      setPhase('future-reveal');
      await sleep(1800);
      if (cancelled) return;
      await sleep(1000); // 停顿 1 秒
      if (cancelled) return;
      setPhase('future-farewell');
      await sleep(NODE_FUTURE_FAREWELL.length * 1400 + 2200);
      if (cancelled) return;
      setPhase('archived');
      await sleep(2200);
      if (cancelled) return;
      setPhase('done');
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [finalResult]);

  const handleReturnHome = () => {
    reset();
    navigate('/');
  };

  if (!finalResult) return null;

  const activeIndex = PHASE_NODE_INDEX[phase];
  const progress = PHASE_PROGRESS[phase];
  const isDimmed = phase === 'archived' || phase === 'done';
  const isFuturePhase = phase === 'future-q' || phase === 'future-reveal' || phase === 'future-farewell';
  const commentPlacement = phase === 'node1' || phase === 'node2' || phase === 'node3' ? phase : null;

  const renderNodeContent = () => {
    switch (phase) {
      case 'node1':
        return <CommentList comments={NODE_LONG_AGO} />;
      case 'node2':
        return <CommentList comments={NODE_FIRST_MEET} />;
      case 'node3':
        return nowComments ? (
          <CommentList comments={nowComments} />
        ) : (
          <motion.p
            className="text-sm text-journal-muted font-song"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            灵宠们正在书写此刻……
          </motion.p>
        );
      case 'future-q':
        return (
          <motion.div
            className="text-6xl font-song text-gradient-warm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {NODE_FUTURE_QUESTION}
          </motion.div>
        );
      case 'future-reveal':
        return (
          <p className="text-2xl font-song text-journal-text min-h-[2.5rem]">
            <Typewriter text={NODE_FUTURE_REVEAL} />
          </p>
        );
      case 'future-farewell':
        return <CommentList comments={NODE_FUTURE_FAREWELL} align="center" />;
      default:
        return null;
    }
  };

  return (
    <PageShell ambience="celebration">
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* 开场文案 */}
        <AnimatePresence>
          {phase === 'intro' && (
            <motion.p
              key="intro"
              className="text-xl md:text-2xl font-song text-journal-text text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            >
              {TIMELINE_INTRO}
            </motion.p>
          )}
        </AnimatePresence>

        {/* 时间轴 + 节点内容 */}
        {phase !== 'intro' && (
          <motion.div
            className="w-full max-w-4xl flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* 时间轴可视化 */}
            <div className="relative w-full max-w-3xl h-20 mb-14 px-2 md:px-4">
              <div className="absolute top-1/2 left-2 right-2 h-[3px] -translate-y-1/2 bg-journal-border/60 md:left-4 md:right-4" />
              <motion.div
                className="absolute top-1/2 left-2 h-[3px] -translate-y-1/2 bg-gradient-to-r from-amber-gold to-journal-accent md:left-4"
                initial={{ width: '0%' }}
                animate={{ width: `calc(${progress * 100}% - ${progress > 0 ? '0.5rem' : '0px'})` }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              />
              {NODE_LABELS.map((label, i) => {
                const left = `${(i / (NODE_LABELS.length - 1)) * 100}%`;
                const reached = i <= activeIndex;
                const isActive = i === activeIndex;
                return (
                  <div
                    key={label}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                    style={{ left }}
                  >
                    <motion.div
                      className={`h-[18px] w-[18px] rounded-full border border-white/40 ${
                        reached ? 'bg-amber-gold' : 'bg-journal-border'
                      } ${isActive ? 'glow-amber' : ''}`}
                      animate={{ scale: isActive ? 1.55 : 1 }}
                      transition={{ duration: 0.5 }}
                    />
                    <span
                      className={`absolute top-8 whitespace-nowrap text-sm md:text-base font-song transition-colors ${
                        reached ? 'text-journal-text' : 'text-journal-muted/60'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 当前节点内容 */}
            <div className="w-full max-w-3xl min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className={`w-full ${
                    isFuturePhase
                      ? 'flex min-h-[220px] items-start justify-center'
                      : 'relative min-h-[220px]'
                  }`}
                >
                  {commentPlacement ? (
                    <div
                      className="w-full md:absolute md:top-0 md:w-[20rem]"
                      style={{ left: NODE_CONTENT_LEFT[commentPlacement] }}
                    >
                      {renderNodeContent()}
                    </div>
                  ) : (
                    renderNodeContent()
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 收尾：屏幕变暗 + 归档 + 返回按钮 */}
      <AnimatePresence>
        {isDimmed && (
          <motion.div
            className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-[#2b2118]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.96 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
          >
            <motion.p
              className="text-xl md:text-2xl font-song text-amber-light/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.8 }}
            >
              {TIMELINE_ARCHIVED}
            </motion.p>

            {phase === 'done' && (
              <motion.button
                onClick={handleReturnHome}
                className="btn-primary mt-10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {TIMELINE_RETURN_LABEL}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default TimelinePage;
