import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Sparkles, Users, RefreshCw, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { SPIRITS } from '@/constants';
import { prefetchFinalResult, prefetchObservationAndResult } from '@/utils/prefetchOutcome';

const ObservationPage = () => {
  const navigate = useNavigate();

  const visualAnalysis = useAppStore((state) => state.visualAnalysis);
  const dialogueHistory = useAppStore((state) => state.dialogueHistory);
  const hiddenSoulPool = useAppStore((state) => state.hiddenSoulPool);
  const observationRecord = useAppStore((state) => state.observationRecord);
  const isGeneratingObservation = useAppStore((state) => state.isGeneratingObservation);
  const observationError = useAppStore((state) => state.observationError);
  const finalResult = useAppStore((state) => state.finalResult);
  const isGeneratingResult = useAppStore((state) => state.isGeneratingResult);
  const resultError = useAppStore((state) => state.resultError);
  const setStage = useAppStore((state) => state.setStage);
  const setPhotoUrl = useAppStore((state) => state.setPhotoUrl);
  const setCurrentRound = useAppStore((state) => state.setCurrentRound);
  const setCurrentSpeaker = useAppStore((state) => state.setCurrentSpeaker);
  const setDialogueHistory = useAppStore((state) => state.setDialogueHistory);
  const setFinalResult = useAppStore((state) => state.setFinalResult);
  const setObservationRecord = useAppStore((state) => state.setObservationRecord);
  const setIsGeneratingObservation = useAppStore((state) => state.setIsGeneratingObservation);
  const setObservationError = useAppStore((state) => state.setObservationError);
  const setIsGeneratingResult = useAppStore((state) => state.setIsGeneratingResult);
  const setResultError = useAppStore((state) => state.setResultError);
  const clearFriendPk = useAppStore((state) => state.clearFriendPk);

  const sortedPool = Object.entries(hiddenSoulPool).sort(([, a], [, b]) => b - a);
  const topSpirit = SPIRITS[sortedPool[0][0]];

  const prefetchSetters = {
    setObservationRecord,
    setIsGeneratingObservation,
    setObservationError,
    setFinalResult,
    setIsGeneratingResult,
    setResultError,
  };

  const handleRetry = () => {
    if (!visualAnalysis) return;
    prefetchObservationAndResult(visualAnalysis, dialogueHistory, hiddenSoulPool, prefetchSetters);
  };

  const handleRetryResult = () => {
    if (!visualAnalysis || !observationRecord) return;
    prefetchFinalResult(visualAnalysis, dialogueHistory, hiddenSoulPool, observationRecord, {
      setFinalResult,
      setIsGeneratingResult,
      setResultError,
    });
  };

  const handleContinue = () => {
    setPhotoUrl(null);
    setCurrentRound(0);
    setCurrentSpeaker(null);
    setDialogueHistory([]);
    setObservationRecord(null);
    setObservationError(null);
    setIsGeneratingObservation(false);
    setFinalResult(null);
    setResultError(null);
    setIsGeneratingResult(false);
    setStage('upload');
    navigate('/upload');
  };

  const handleGenerateResult = () => {
    if (!finalResult || isGeneratingResult) return;
    setStage('result');
    navigate('/result');
  };

  const handleCompare = () => {
    if (!finalResult || isGeneratingResult) return;
    clearFriendPk();
    setStage('compare');
    navigate('/compare');
  };

  if (isGeneratingObservation || !observationRecord) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {observationError ? (
          <>
            <p className="text-amber-light/70 font-hei mb-4 text-center">{observationError}</p>
            <motion.button
              onClick={handleRetry}
              className="btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>重新生成观察记录</span>
            </motion.button>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-amber-gold mb-4" />
            <p className="text-amber-light/70 font-hei">灵宠正在整理观察记录……</p>
          </>
        )}
      </motion.div>
    );
  }

  const resultReady = !!finalResult && !isGeneratingResult;

  return (
    <motion.div
      className="min-h-screen flex flex-col px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-song font-bold text-gradient mb-2">
          灵宠观察记录
        </h2>
        <p className="text-amber-light/70 font-hei">
          {topSpirit.name}为你整理的桌面洞察
        </p>
      </motion.div>

      <motion.div
        className="card mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-gold" />
          <h3 className="text-lg font-song font-bold text-amber-light">
            证据链推理
          </h3>
        </div>
        <p className="text-sm text-amber-light/70 font-hei leading-relaxed whitespace-pre-line">
          {observationRecord.evidenceChain}
        </p>
      </motion.div>

      <motion.div
        className="spirit-card mb-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        style={{ borderColor: `${topSpirit.color}30` }}
      >
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{
              backgroundColor: `${topSpirit.color}20`,
              border: `2px solid ${topSpirit.color}`,
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            {topSpirit.emoji}
          </motion.div>
          <h3 className="text-lg font-song font-bold" style={{ color: topSpirit.color }}>
            灵居气息观察
          </h3>
        </div>
        <p className="text-sm text-amber-light/70 font-hei leading-relaxed">
          {observationRecord.spiritObservation}
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div className="card">
          <h4 className="text-base font-song font-bold text-amber-light mb-3">
            科学收纳建议
          </h4>
          <ul className="space-y-2">
            {observationRecord.scientificAdvice.map((advice, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-2 text-sm text-amber-light/70 font-hei"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <span className="w-5 h-5 rounded-full bg-amber-gold/20 flex items-center justify-center text-xs text-amber-gold">
                  {index + 1}
                </span>
                {advice}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="card"
          style={{ borderColor: `${topSpirit.color}20` }}
        >
          <h4 className="text-base font-song font-bold mb-3" style={{ color: topSpirit.color }}>
            灵居气息建议
          </h4>
          <ul className="space-y-2">
            {observationRecord.spiritAdvice.map((advice, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-2 text-sm text-amber-light/70 font-hei"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: `${topSpirit.color}20`,
                    color: topSpirit.color,
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {index + 1}
                </motion.div>
                {advice}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {resultError && (
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-amber-light/70 font-hei text-sm mb-2">{resultError}</p>
          <button onClick={handleRetryResult} className="text-sm text-amber-gold hover:underline">
            重新生成结果页文案
          </button>
        </motion.div>
      )}

      <motion.div
        className="flex flex-col md:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <motion.button
          onClick={handleContinue}
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-4 h-4" />
          <span>继续优化</span>
        </motion.button>

        <motion.button
          onClick={handleGenerateResult}
          disabled={!resultReady}
          className="btn-primary flex items-center gap-2 glow-amber disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={resultReady ? { scale: 1.05 } : undefined}
          whileTap={resultReady ? { scale: 0.95 } : undefined}
        >
          {isGeneratingResult ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{isGeneratingResult ? '正在生成卡片…' : '生成卡片'}</span>
        </motion.button>

        <motion.button
          onClick={handleCompare}
          disabled={!resultReady}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={resultReady ? { scale: 1.05 } : undefined}
          whileTap={resultReady ? { scale: 0.95 } : undefined}
        >
          <Users className="w-4 h-4" />
          <span>好友PK</span>
        </motion.button>
      </motion.div>

      <motion.div
        className="text-center mt-8 text-sm text-amber-light/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>
          {isGeneratingResult
            ? '灵宠正在为你揭晓主人格标签…'
            : resultReady
              ? '主人格已就绪，点击生成卡片揭晓'
              : '你的主人格标签将在结果页揭晓...'}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ObservationPage;
