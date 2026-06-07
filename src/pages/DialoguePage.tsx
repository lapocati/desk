import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { SPIRITS } from '@/constants';
import SpiritAvatar from '@/components/SpiritAvatar';
import PageShell from '@/components/PageShell';
import JournalEntry from '@/components/JournalEntry';
import { BookmarkRibbon, FeatherPen } from '@/components/ScrapbookDecor';
import type { SpiritType } from '@/types';
import { getDialogueResponse } from '@/services/deepseekApi';
import type { DeepSeekDialogueResponse } from '@/services/deepseekApi';
import type { DialogueMessage, SoulPool, VisualAnalysisResult } from '@/types';
import { prefetchObservationAndResult } from '@/utils/prefetchOutcome';

const OBSERVATION_NAV_DELAY_MS = 5000;
const INITIAL_DIALOGUE_PENDING_TIMEOUT_MS = 12000;

const DialoguePage = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPendingObservationNav, setIsPendingObservationNav] = useState(false);
  const round1Initialized = useRef(false);
  const pendingNavStartRef = useRef(0);
  const observationNavTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  const photoUrl = useAppStore((state) => state.photoUrl);
  const setObservationRecord = useAppStore((state) => state.setObservationRecord);
  const setIsGeneratingObservation = useAppStore((state) => state.setIsGeneratingObservation);
  const setObservationError = useAppStore((state) => state.setObservationError);
  const setFinalResult = useAppStore((state) => state.setFinalResult);
  const setIsGeneratingResult = useAppStore((state) => state.setIsGeneratingResult);
  const setResultError = useAppStore((state) => state.setResultError);
  const observationRecord = useAppStore((state) => state.observationRecord);
  const isGeneratingObservation = useAppStore((state) => state.isGeneratingObservation);
  const observationError = useAppStore((state) => state.observationError);
  const initialDialogueStatus = useAppStore((state) => state.initialDialogueStatus);
  const initialDialogueResponse = useAppStore((state) => state.initialDialogueResponse);
  const initialDialogueError = useAppStore((state) => state.initialDialogueError);
  const resetInitialDialoguePrefetch = useAppStore((state) => state.resetInitialDialoguePrefetch);

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

  const applyInitialDialogueResponse = (resp: DeepSeekDialogueResponse) => {
    addDialogueMessage({
      role: 'spirit',
      speaker: resp.speaker as SpiritType,
      content: resp.message,
      timestamp: Date.now(),
    });
    setCurrentSpeaker(resp.speaker as SpiritType);
    updateSoulPool(resp.soul_pool);
    resetInitialDialoguePrefetch();
  };

  const requestInitialDialogue = async () => {
    if (!visualAnalysis) return;

    round1Initialized.current = true;
    setIsFetching(true);
    setFetchError(null);
    resetInitialDialoguePrefetch();

    try {
      const resp = await getDialogueResponse(1, [], visualAnalysis.hiddenDoubts, hiddenSoulPool);
      applyInitialDialogueResponse(resp);
    } catch (err) {
      round1Initialized.current = false;
      setFetchError(err instanceof Error ? err.message : '灵宠走神了，请稍后重试');
    } finally {
      setIsFetching(false);
    }
  };

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

  useEffect(() => {
    if (currentRound !== 1 || dialogueHistory.length !== 0 || !visualAnalysis) return;
    if (initialDialogueStatus === 'ready' && initialDialogueResponse) {
      if (round1Initialized.current) return;
      round1Initialized.current = true;
      setFetchError(null);
      setIsFetching(false);
      applyInitialDialogueResponse(initialDialogueResponse);
      return;
    }

    if (initialDialogueStatus === 'pending') {
      setFetchError(null);
      setIsFetching(true);
      return;
    }

    if (initialDialogueStatus === 'error') {
      round1Initialized.current = false;
      setIsFetching(false);
      setFetchError(initialDialogueError ?? '灵宠走神了，请稍后重试');
      return;
    }

    if (round1Initialized.current) return;
    void requestInitialDialogue();
  }, [
    currentRound,
    dialogueHistory.length,
    visualAnalysis,
    hiddenSoulPool,
    initialDialogueStatus,
    initialDialogueResponse,
    initialDialogueError,
  ]);

  useEffect(() => {
    if (currentRound !== 1 || dialogueHistory.length !== 0) return;
    if (initialDialogueStatus !== 'pending') return;

    const timer = window.setTimeout(() => {
      round1Initialized.current = false;
      resetInitialDialoguePrefetch();
      setIsFetching(false);
      setFetchError('灵宠响应超时，请点击重试');
    }, INITIAL_DIALOGUE_PENDING_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [
    currentRound,
    dialogueHistory.length,
    initialDialogueStatus,
    resetInitialDialoguePrefetch,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    return () => clearTimeout(timer);
  }, [dialogueHistory, isFetching, isPendingObservationNav, fetchError]);

  const handleSend = async () => {
    if (!userInput.trim() || !currentSpeaker || isFetching || isPendingObservationNav) return;

    const userText = userInput.trim();
    setUserInput('');
    setFetchError(null);

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

  const handleRetry = () => {
    setFetchError(null);
    if (dialogueHistory.length === 0 && currentRound === 1) {
      void requestInitialDialogue();
      return;
    }
    void handleSend();
  };

  return (
    <PageShell ambience="focus" photoUrl={photoUrl}>
      <motion.div
        className="min-h-screen flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Progress ribbon */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20">
          <BookmarkRibbon label={`第 ${currentRound}/3 页`} />
        </div>

        {/* Round tabs */}
        <div className="fixed top-16 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {[1, 2, 3].map((round) => (
            <div
              key={round}
              className={`px-3 py-1 rounded-md text-xs font-song border transition-colors ${
                round <= currentRound
                  ? 'bg-journal-accent/30 border-journal-accent text-journal-text'
                  : 'bg-journal-card border-journal-border text-journal-muted'
              }`}
              style={
                round === currentRound && currentSpirit
                  ? { borderColor: currentSpirit.color }
                  : undefined
              }
            >
              记录 {round}
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center px-4 pt-28 pb-36 max-w-2xl mx-auto w-full">
          {/* Open journal notebook */}
          <div className="journal-card w-full p-5 md:p-6 relative paper-texture min-h-[400px]">
            {/* Spirit stamp header */}
            {currentSpirit && (
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-journal-border/50">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${currentSpirit.color}12`,
                    border: `2px solid ${currentSpirit.color}`,
                  }}
                >
                  <SpiritAvatar spirit={currentSpirit} size="large" className="w-11 h-11" />
                </div>
                <div>
                  <p className="text-xs text-journal-muted font-hei">当前记录者</p>
                  <p className="text-lg font-song font-bold" style={{ color: currentSpirit.color }}>
                    {currentSpirit.name}
                  </p>
                </div>
                <span className="ml-auto text-2xl opacity-30">🌸</span>
              </div>
            )}

            {/* Journal entries timeline */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {dialogueHistory.map((message, index) => {
                const spirit = SPIRITS[message.speaker];
                return (
                  <div
                    key={index}
                    className={message.role === 'user' ? 'flex justify-end' : ''}
                  >
                    <JournalEntry
                      role={message.role}
                      content={message.content}
                      spirit={message.role === 'spirit' ? spirit : undefined}
                      index={index}
                    />
                  </div>
                );
              })}

              {isFetching && currentSpirit && (
                <JournalEntry role="loading" spirit={currentSpirit} loadingText="灵宠正在感知……" />
              )}

              {isPendingObservationNav && currentSpirit && (
                <JournalEntry
                  role="loading"
                  spirit={currentSpirit}
                  loadingText={
                    reportReadyForNav ? '即将进入观察记录…' : '灵宠正在整理观察记录…'
                  }
                />
              )}

              {fetchError && (
                <div className="text-center py-2">
                  <p className="text-xs text-red-500/80 font-hei">{fetchError}</p>
                  <button
                    className="mt-1 text-xs text-journal-accent underline"
                    onClick={handleRetry}
                  >
                    重试
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input area - lined paper style */}
        {!isPendingObservationNav && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 p-4 bg-journal-card/90 backdrop-blur-sm border-t border-journal-border z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-3 items-end">
                <FeatherPen className="mb-3 shrink-0" />
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="简短回答即可"
                  className="flex-1 px-4 py-3 rounded-lg bg-journal-bg paper-texture text-journal-text placeholder:text-journal-muted/60 border border-journal-border focus:border-journal-accent focus:outline-none transition-all font-hei"
                  disabled={isFetching || isPendingObservationNav}
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!userInput.trim() || isFetching || isPendingObservationNav}
                  className={`px-5 py-3 rounded-lg bg-journal-accent text-journal-text flex items-center gap-2 font-song ${
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
    </PageShell>
  );
};

export default DialoguePage;
