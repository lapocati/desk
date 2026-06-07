import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { LOADING_MESSAGES, SPIRITS } from '@/constants';
import PageShell from '@/components/PageShell';
import SpiritAvatar from '@/components/SpiritAvatar';
import { analyzeImage } from '@/services/qwenApi';

const LoadingPage = () => {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const photoUrl = useAppStore((state) => state.photoUrl);
  const setVisualAnalysis = useAppStore((state) => state.setVisualAnalysis);
  const setCurrentSpeaker = useAppStore((state) => state.setCurrentSpeaker);
  const setCurrentRound = useAppStore((state) => state.setCurrentRound);
  const setStage = useAppStore((state) => state.setStage);
  const setLoading = useAppStore((state) => state.setLoading);
  const updateSoulPool = useAppStore((state) => state.updateSoulPool);
  const setObservationRecord = useAppStore((state) => state.setObservationRecord);
  const setIsGeneratingObservation = useAppStore((state) => state.setIsGeneratingObservation);
  const setObservationError = useAppStore((state) => state.setObservationError);
  const setFinalResult = useAppStore((state) => state.setFinalResult);
  const setIsGeneratingResult = useAppStore((state) => state.setIsGeneratingResult);
  const setResultError = useAppStore((state) => state.setResultError);

  useEffect(() => {
    const currentMessage = LOADING_MESSAGES[currentMessageIndex];
    let charIndex = 0;

    const typingInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);

        setTimeout(() => {
          if (currentMessageIndex < LOADING_MESSAGES.length - 1) {
            setCurrentMessageIndex((prev) => prev + 1);
            setDisplayedText('');
            setIsTyping(true);
          }
        }, 1500);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex]);

  useEffect(() => {
    if (!photoUrl) return;

    const abortController = new AbortController();
    let cancelled = false;
    const effectId = Math.random().toString(36).slice(2, 8);

    // #region agent log
    fetch('http://127.0.0.1:7911/ingest/801965d5-3f5c-4d14-80b2-cf170cfa8be7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6ad995'},body:JSON.stringify({sessionId:'6ad995',runId:'pre-fix',hypothesisId:'A-D',location:'LoadingPage.tsx:effect-start',message:'Analysis effect started',data:{effectId,photoUrlLength:photoUrl.length},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const run = async () => {
      setObservationRecord(null);
      setIsGeneratingObservation(false);
      setObservationError(null);
      setFinalResult(null);
      setIsGeneratingResult(false);
      setResultError(null);

      try {
        const analysis = await analyzeImage(photoUrl, abortController.signal);
        if (cancelled) return;

        setVisualAnalysis(analysis);
        updateSoulPool(analysis.spiritScores);
        setCurrentSpeaker('wisdom');
        setCurrentRound(1);
        setStage('dialogue');
        setLoading(false);
        navigate('/dialogue');
        // #region agent log
        fetch('http://127.0.0.1:7911/ingest/801965d5-3f5c-4d14-80b2-cf170cfa8be7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6ad995'},body:JSON.stringify({sessionId:'6ad995',runId:'pre-fix',hypothesisId:'A',location:'LoadingPage.tsx:analysis-success',message:'Analysis complete',data:{effectId},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      } catch (err) {
        const isAbort = err instanceof DOMException && err.name === 'AbortError';
        const errMsg = err instanceof Error ? err.message : String(err);
        // #region agent log
        fetch('http://127.0.0.1:7911/ingest/801965d5-3f5c-4d14-80b2-cf170cfa8be7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6ad995'},body:JSON.stringify({sessionId:'6ad995',runId:'pre-fix',hypothesisId:'A-D',location:'LoadingPage.tsx:analysis-catch',message:'Analysis error caught',data:{effectId,cancelled,isAbort,signalAborted:abortController.signal.aborted,errorName:err instanceof Error?err.name:'unknown',errorMessage:errMsg},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (cancelled || isAbort) return;

        const message = err instanceof Error ? err.message : '图片分析失败，请重试';
        setAnalysisError(message);
        setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      // #region agent log
      fetch('http://127.0.0.1:7911/ingest/801965d5-3f5c-4d14-80b2-cf170cfa8be7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6ad995'},body:JSON.stringify({sessionId:'6ad995',runId:'pre-fix',hypothesisId:'A-D',location:'LoadingPage.tsx:effect-cleanup',message:'Analysis effect cleanup',data:{effectId,signalAborted:abortController.signal.aborted},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      abortController.abort();
    };
  }, [photoUrl, navigate, setVisualAnalysis, setCurrentSpeaker, setCurrentRound, setStage, setLoading, updateSoulPool]);

  const spiritList = Object.values(SPIRITS);

  if (analysisError) {
    return (
      <PageShell ambience="focus">
        <motion.div
          className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-3xl mb-4">😔</p>
          <p className="text-lg font-song text-journal-text mb-2">灵宠们迷路了……</p>
          <p className="text-sm text-journal-muted font-hei mb-8 max-w-xs">{analysisError}</p>
          <button
            onClick={() => { window.history.back(); }}
            className="btn-primary"
          >
            返回重试
          </button>
        </motion.div>
      </PageShell>
    );
  }

  return (
    <PageShell ambience="focus" photoUrl={photoUrl}>
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Polaroid + spirit orbit anchored at photo content center */}
        {photoUrl && (
          <div className="relative" style={{ width: 140, height: 168 }}>
            <motion.div
              className="absolute left-1/2 pointer-events-none"
              style={{
                top: 68,
                width: 240,
                height: 240,
                transform: 'translate(-50%, -50%)',
                zIndex: 0,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative w-full h-full">
                {spiritList.map((spirit, index) => {
                  const angle = index * 72 * (Math.PI / 180);
                  const radius = 120;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <motion.div
                      key={spirit.type}
                      className="absolute"
                      style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: [0, x, x, 0],
                        y: [0, y, y, 0],
                        opacity: [0, 1, 1, 0.5],
                        scale: [0, 1, 1, 0.8],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        delay: index * 0.3,
                        ease: 'easeInOut',
                      }}
                    >
                      <SpiritAvatar spirit={spirit} size="small" className="w-12 h-12" />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              className="relative z-10 bg-journal-card border border-journal-border p-2 shadow-md rotate-[-2deg]"
              style={{ width: 140, height: 168 }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
            >
              <img src={photoUrl} alt="桌面" className="w-full h-[120px] object-cover" />
              <p className="text-[10px] text-journal-muted text-center mt-1 font-song">桌面快照</p>
            </motion.div>
          </div>
        )}

        {/* Typed message on lined paper */}
        <motion.div
          className="absolute bottom-32 text-center journal-card px-6 py-4 paper-texture max-w-md mx-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <motion.p className="text-lg font-song text-journal-text" key={currentMessageIndex}>
            {displayedText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                |
              </motion.span>
            )}
          </motion.p>
        </motion.div>

        {/* Progress dots */}
        <motion.div
          className="absolute bottom-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          <div className="flex gap-2">
            {LOADING_MESSAGES.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentMessageIndex ? 'bg-journal-accent' : 'bg-journal-border'
                }`}
                animate={index === currentMessageIndex ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </PageShell>
  );
};

export default LoadingPage;
