import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { SPIRITS } from '@/constants';
import SpiritAvatar from '@/components/SpiritAvatar';
import type { SpiritType } from '@/types';
import { getDialogueResponse } from '@/services/deepseekApi';
import type { DialogueMessage, SoulPool, VisualAnalysisResult } from '@/types';
import { prefetchObservationAndResult } from '@/utils/prefetchOutcome';

const OBSERVATION_NAV_DELAY_MS = 5000;

const DialoguePage = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPendingObservationNav, setIsPendingObservationNav] = useState(false);
  const round1Initialized = useRef(false);
  const pendingNavStartRef = useRef(0);
  const observationNavTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dialogueHistory = useAppStore((state) => state.dialogueHistory);
  const addDialogueMessage = useAppStore((state) => state.addDialogueMessage);
  const currentRound = useAppStore((state) => state.currentRound);
  const currentSpeaker = useAppStore((state) => state.currentSpeaker);
  const setCurrentRound = useAppStore((state) => state.setCurrentRound);
  const setCurrentSpeaker = useAppStore((state) => state.setCurrentSpeaker);
  const hiddenSoulPool = useAppStore((state) => state.hiddenSoulPool);
  const updateSoulPool = useAppStore((state) => state.updateSoulPool);
  const setStage = useAppStore((state) => state.setStage);
  const visualAnalysis = useAppStore((state) => state.visualAnalysis);
  const setObservationRecord = useAppStore((state) => state.setObservationRecord);
  const setIsGeneratingObservation = useAppStore((state) => state.setIsGeneratingObservation);
  const setObservationError = useAppStore((state) => state.setObservationError);
  const setFinalResult = useAppStore((state) => state.setFinalResult);
  const setIsGeneratingResult = useAppStore((state) => state.setIsGeneratingResult);
  const setResultError = useAppStore((state) => state.setResultError);
  const observationRecord = useAppStore((state) => state.observationRecord);
  const isGeneratingObservation = useAppStore((state) => state.isGeneratingObservation);
  const observationError = useAppStore((state) => state.observationError);

  const prefetchOutcome = (
    analysis: VisualAnalysisResult,
    history: DialogueMessage[],
    pool: SoulPool
  ) => {
    prefetchObservationAndResult(analysis, history, pool, {
      setObservationRecord,
      setIsGeneratingObservation,
      setObservationError,
      setFinalResult,
      setIsGeneratingResult,
      setResultError,
    });
  };

  const currentSpirit = currentSpeaker ? SPIRITS[currentSpeaker] : null;

  const scheduleNavigateToObservation = () => {
    setStage('observation');
    pendingNavStartRef.current = Date.now();
    setIsPendingObservationNav(true);
  };

  useEffect(() => {
    if (!isPendingObservationNav) return;

    const reportDone =
      (!isGeneratingObservation && !!observationRecord) || !!observationError;

    if (!reportDone) return;

    const remaining = Math.max(
      0,
      OBSERVATION_NAV_DELAY_MS - (Date.now() - pendingNavStartRef.current)
    );

    if (observationNavTimer.current) {
      clearTimeout(observationNavTimer.current);
    }

    observationNavTimer.current = setTimeout(() => {
      observationNavTimer.current = null;
      setIsPendingObservationNav(false);
      navigate('/observation');
    }, remaining);

    return () => {
      if (observationNavTimer.current) {
        clearTimeout(observationNavTimer.current);
        observationNavTimer.current = null;
      }
    };
  }, [
    isPendingObservationNav,
    observationRecord,
    isGeneratingObservation,
    observationError,
    navigate,
  ]);

  // Round 1：智慧灵首发，调用 DeepSeek 生成个性化提问
  useEffect(() => {
    if (currentRound !== 1 || dialogueHistory.length !== 0 || !visualAnalysis) return;
    if (round1Initialized.current) return;
    round1Initialized.current = true;

    const initRound1 = async () => {
      setIsFetching(true);
      setFetchError(null);
      try {
        const resp = await getDialogueResponse(1, [], visualAnalysis.hiddenDoubts, hiddenSoulPool);
        addDialogueMessage({
          role: 'spirit',
          speaker: resp.speaker as SpiritType,
          content: resp.message,
          timestamp: Date.now(),
        });
        setCurrentSpeaker(resp.speaker as SpiritType);
        updateSoulPool(resp.soul_pool);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : '灵宠走神了，请稍后重试');
      } finally {
        setIsFetching(false);
      }
    };

    initRound1();
  }, [currentRound, dialogueHistory.length, visualAnalysis, hiddenSoulPool, addDialogueMessage, setCurrentSpeaker, updateSoulPool]);

  const handleSend = async () => {
    if (!userInput.trim() || !currentSpeaker || isFetching || isPendingObservationNav) return;

    const userText = userInput.trim();
    setUserInput('');
    setFetchError(null);

    // 先写入用户消息
    addDialogueMessage({
      role: 'user',
      speaker: currentSpeaker,
      content: userText,
      timestamp: Date.now(),
    });

    const nextRound = currentRound + 1;

    if (nextRound > 3) {
      const updatedHistory = [
        ...dialogueHistory,
        { role: 'user' as const, speaker: currentSpeaker, content: userText, timestamp: Date.now() },
      ];
      if (visualAnalysis) {
        prefetchOutcome(visualAnalysis, updatedHistory, hiddenSoulPool);
      }
      scheduleNavigateToObservation();
      return;
    }

    setIsFetching(true);
    try {
      // 构建包含用户刚才回答的最新 history（store 是异步更新，手动拼）
      const updatedHistory = [
        ...dialogueHistory,
        { role: 'user' as const, speaker: currentSpeaker, content: userText, timestamp: Date.now() },
      ];

      const resp = await getDialogueResponse(
        nextRound,
        updatedHistory,
        visualAnalysis?.hiddenDoubts ?? '',
        hiddenSoulPool
      );

      const spiritReplies: DialogueMessage[] = [
        {
          role: 'spirit',
          speaker: resp.speaker as SpiritType,
          content: resp.message,
          timestamp: Date.now(),
        },
      ];

      if (resp.interjection) {
        spiritReplies.push({
          role: 'spirit',
          speaker: resp.interjection.speaker as SpiritType,
          content: resp.interjection.message,
          timestamp: Date.now() + 1,
        });
      }

      spiritReplies.forEach((msg) => addDialogueMessage(msg));

      const finalHistory = [...updatedHistory, ...spiritReplies];

      updateSoulPool(resp.soul_pool);
      setCurrentRound(nextRound);
      setCurrentSpeaker(resp.speaker as SpiritType);

      if (visualAnalysis) {
        if (resp.is_complete) {
          prefetchOutcome(visualAnalysis, finalHistory, resp.soul_pool);
          scheduleNavigateToObservation();
        } else if (nextRound === 2) {
          prefetchOutcome(visualAnalysis, finalHistory, resp.soul_pool);
        }
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : '灵宠走神了，请稍后重试');
    } finally {
      setIsFetching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const reportReadyForNav =
    (!isGeneratingObservation && !!observationRecord) || !!observationError;

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 顶部进度条 */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-ink-light"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: currentRound / 3 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundColor: currentSpirit?.color || '#D4A574',
          transformOrigin: 'left',
        }}
      />

      {/* 进度指示 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <span className="text-sm text-amber-light/70 font-hei">
          Round {currentRound}/3
        </span>
        <div className="flex gap-1">
          {[1, 2, 3].map((round) => (
            <motion.div
              key={round}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                round <= currentRound
                  ? 'bg-amber-gold text-ink-blue'
                  : 'bg-ink-light text-amber-light/50'
              }`}
              animate={round === currentRound ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {round}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 灵宠形象区 */}
      <motion.div
        className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 px-4 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {currentSpirit && (
          <motion.div
            className="relative"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-4xl md:text-5xl glow-spirit"
              style={{
                backgroundColor: `${currentSpirit.color}20`,
                border: `3px solid ${currentSpirit.color}`,
                boxShadow: `0 0 30px ${currentSpirit.color}40`,
              }}
            >
              <SpiritAvatar spirit={currentSpirit} size="large" className="w-full h-full" />
            </div>
            <motion.div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{ color: currentSpirit.color }}
            >
              <span className="text-lg font-song font-bold">{currentSpirit.name}</span>
            </motion.div>
          </motion.div>
        )}

        {/* 对话区域 */}
        <div className="flex-1 max-w-xl space-y-4 overflow-y-auto px-4 pb-24">
          {dialogueHistory.map((message, index) => {
            const spirit = SPIRITS[message.speaker];
            return (
              <motion.div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {message.role === 'spirit' && (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{
                      backgroundColor: `${spirit.color}20`,
                      border: `2px solid ${spirit.color}`,
                    }}
                  >
                    <SpiritAvatar spirit={spirit} size="small" className="w-8 h-8" />
                  </div>
                )}

                <motion.div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-amber-gold/20 text-amber-light'
                      : 'bg-ink-light/50 text-amber-light'
                  }`}
                  style={
                    message.role === 'spirit'
                      ? { borderLeft: `3px solid ${spirit.color}` }
                      : {}
                  }
                >
                  <p className="text-sm md:text-base font-hei leading-relaxed">
                    {message.content}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}

          {/* 灵宠思考中动画 */}
          {isFetching && (
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {currentSpirit && (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{
                    backgroundColor: `${currentSpirit.color}20`,
                    border: `2px solid ${currentSpirit.color}`,
                  }}
                >
                  <SpiritAvatar spirit={currentSpirit} size="small" className="w-8 h-8" />
                </div>
              )}
              <div className="px-4 py-3 rounded-2xl bg-ink-light/50 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-gold" />
                <span className="text-sm text-amber-light/60 font-hei">灵宠正在感知……</span>
              </div>
            </motion.div>
          )}

          {isPendingObservationNav && (
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {currentSpirit && (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{
                    backgroundColor: `${currentSpirit.color}20`,
                    border: `2px solid ${currentSpirit.color}`,
                  }}
                >
                  <SpiritAvatar spirit={currentSpirit} size="small" className="w-8 h-8" />
                </div>
              )}
              <div className="px-4 py-3 rounded-2xl bg-ink-light/50 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-gold" />
                <span className="text-sm text-amber-light/60 font-hei">
                  {reportReadyForNav ? '即将进入观察记录…' : '灵宠正在整理观察记录…'}
                </span>
              </div>
            </motion.div>
          )}

          {/* 错误提示 */}
          {fetchError && (
            <motion.div
              className="text-center py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-xs text-red-400/80 font-hei">{fetchError}</p>
              <button
                className="mt-1 text-xs text-amber-gold underline"
                onClick={() => { setFetchError(null); handleSend(); }}
              >
                重试
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* 输入区域 */}
      {!isPendingObservationNav && (
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-4 bg-ink-blue/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-xl mx-auto">
          <div className="flex gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="简短回答即可（是/否/一句话）"
            className="flex-1 px-4 py-3 rounded-full bg-ink-light/50 text-amber-light placeholder:text-amber-light/50 border border-amber-gold/30 focus:border-amber-gold focus:outline-none transition-all"
            disabled={isFetching || isPendingObservationNav}
          />
          <motion.button
            onClick={handleSend}
            disabled={!userInput.trim() || isFetching || isPendingObservationNav}
            className={`px-6 py-3 rounded-full bg-amber-gold text-ink-blue flex items-center gap-2 ${
              !userInput.trim() || isFetching || isPendingObservationNav ? 'opacity-50' : ''
            }`}
            whileHover={userInput.trim() && !isFetching && !isPendingObservationNav ? { scale: 1.05 } : {}}
            whileTap={userInput.trim() && !isFetching && !isPendingObservationNav ? { scale: 0.95 } : {}}
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </motion.button>
          </div>
        </div>
      </motion.div>
      )}
    </motion.div>
  );
};

export default DialoguePage;
