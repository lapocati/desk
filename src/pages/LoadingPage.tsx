import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { LOADING_MESSAGES, SPIRITS } from '@/constants';
import ParticleEffect from '@/components/ParticleEffect';
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

  // 流式文案效果
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

  // 调用 Qwen-VL-Plus 分析图片
  useEffect(() => {
    if (!photoUrl) return;

    const abortController = new AbortController();
    let cancelled = false;

    // #region agent log
    fetch('http://127.0.0.1:7911/ingest/801965d5-3f5c-4d14-80b2-cf170cfa8be7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c6a3d3'},body:JSON.stringify({sessionId:'c6a3d3',runId:'loading-fix',hypothesisId:'B-E',location:'LoadingPage.tsx:effect-start',message:'Analysis effect started',data:{photoUrlLength:photoUrl.length},timestamp:Date.now()})}).catch(()=>{});
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

        // #region agent log
        fetch('http://127.0.0.1:7911/ingest/801965d5-3f5c-4d14-80b2-cf170cfa8be7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c6a3d3'},body:JSON.stringify({sessionId:'c6a3d3',runId:'loading-fix',hypothesisId:'A-D',location:'LoadingPage.tsx:analysis-success',message:'Analysis complete, navigating',data:{objectCount:analysis.objects.length,hiddenDoubtsLen:analysis.hiddenDoubts.length},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        setVisualAnalysis(analysis);
        updateSoulPool(analysis.spiritScores);
        setCurrentSpeaker('wisdom');
        setCurrentRound(1);
        setStage('dialogue');
        setLoading(false);
        navigate('/dialogue');
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return;

        const message = err instanceof Error ? err.message : '图片分析失败，请重试';
        // #region agent log
        fetch('http://127.0.0.1:7911/ingest/801965d5-3f5c-4d14-80b2-cf170cfa8be7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c6a3d3'},body:JSON.stringify({sessionId:'c6a3d3',runId:'loading-fix',hypothesisId:'C-E',location:'LoadingPage.tsx:analysis-error',message:'Analysis failed',data:{errorMessage:message},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        setAnalysisError(message);
        setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [photoUrl, navigate, setVisualAnalysis, setCurrentSpeaker, setCurrentRound, setStage, setLoading, updateSoulPool]);

  const spiritList = Object.values(SPIRITS);

  if (analysisError) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-3xl mb-4">😔</p>
        <p className="text-lg font-song text-amber-light mb-2">灵宠们迷路了……</p>
        <p className="text-sm text-amber-light/60 font-hei mb-8 max-w-xs">{analysisError}</p>
        <button
          onClick={() => { window.history.back(); }}
          className="btn-primary"
        >
          返回重试
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 粒子效果 */}
      <ParticleEffect />

      {/* 灵宠巡查动画 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="relative w-80 h-80">
          {spiritList.map((spirit, index) => {
            const angle = (index * 72) * (Math.PI / 180); // 五灵宠均匀分布
            const radius = 120;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                key={spirit.type}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: 0,
                }}
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
                <motion.div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl"
                  style={{
                    backgroundColor: `${spirit.color}30`,
                    border: `2px solid ${spirit.color}`,
                    boxShadow: `0 0 20px ${spirit.color}40`,
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <SpiritAvatar spirit={spirit} size="small" className="w-14 h-14" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 中央照片预览 */}
      {photoUrl && (
        <motion.div
          className="absolute w-32 h-32 rounded-full overflow-hidden border-4 border-amber-gold/50 glow-amber"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <img
            src={photoUrl}
            alt="桌面"
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* 流式文案 */}
      <motion.div
        className="absolute bottom-32 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <motion.p
          className="text-xl font-song text-amber-light"
          key={currentMessageIndex}
        >
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

      {/* 进度指示 */}
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
                index <= currentMessageIndex
                  ? 'bg-amber-gold'
                  : 'bg-amber-gold/30'
              }`}
              animate={
                index === currentMessageIndex
                  ? { scale: [1, 1.3, 1] }
                  : {}
              }
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingPage;