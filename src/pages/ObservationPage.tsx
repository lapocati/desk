import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Sparkles, Users, RefreshCw, Loader2, MessageCircle, Map } from 'lucide-react';
import { useAppStore } from '@/store';
import { SPIRITS } from '@/constants';
import { prefetchFinalResult, prefetchObservationAndResult } from '@/utils/prefetchOutcome';
import SpiritAvatar from '@/components/SpiritAvatar';
import PageShell from '@/components/PageShell';
import { WashiTape } from '@/components/ScrapbookDecor';
import type { SpiritType } from '@/types';

const LABEL_TO_SPIRIT: Record<string, SpiritType> = {
  智慧灵: 'wisdom',
  活力灵: 'vitality',
  治愈灵: 'healing',
  奇想灵: 'fantasy',
  守护灵: 'guardian',
};

function getSpiritByLabel(label: string, fallback: SpiritType): (typeof SPIRITS)[SpiritType] {
  const type = LABEL_TO_SPIRIT[label] ?? fallback;
  return SPIRITS[type];
}

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
      <PageShell ambience="focus">
        <motion.div
          className="min-h-screen flex flex-col items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {observationError ? (
            <>
              <p className="text-journal-muted font-hei mb-4 text-center">{observationError}</p>
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
              <Loader2 className="w-10 h-10 animate-spin text-journal-accent mb-4" />
              <p className="text-journal-muted font-hei">灵宠正在整理观察记录……</p>
            </>
          )}
        </motion.div>
      </PageShell>
    );
  }

  const resultReady = !!finalResult && !isGeneratingResult;

  return (
    <PageShell ambience="focus">
    <motion.div
      className="min-h-screen flex flex-col px-4 py-8 max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-song font-bold text-gradient-warm mb-2">
          观察记录
        </h2>
        <p className="text-journal-muted font-hei">
          灵宠们留下的桌面笔记 · {topSpirit.name}为你整理
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 min-h-[280px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* 列1：本轮发现 */}
        <motion.div
          className="journal-card p-4 h-full overflow-hidden flex flex-col relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <WashiTape className="-top-2 left-4" color="#E7B96A" />
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-journal-accent shrink-0" />
            <h3 className="text-base font-song font-bold text-journal-text">本轮发现</h3>
          </div>
          <ul className="space-y-2 flex-1">
            {observationRecord.discoveries.map((item, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-2 text-sm text-journal-text/90 font-hei"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <span className="text-journal-accent shrink-0">✓</span>
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* 列2：灵宠吐槽 */}
        <motion.div
          className="journal-card p-4 h-full overflow-hidden flex flex-col relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 shrink-0 text-journal-accent" />
            <h3 className="text-base font-song font-bold text-journal-text">灵宠吐槽</h3>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1">
            {observationRecord.spiritComments.slice(0, 2).map((comment, index) => {
              const spirit = getSpiritByLabel(comment.speaker, sortedPool[0][0] as SpiritType);
              return (
                <motion.div
                  key={index}
                  className="flex gap-3 items-start"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.08 }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${spirit.color}20`,
                      border: `2px solid ${spirit.color}`,
                    }}
                  >
                    <SpiritAvatar spirit={spirit} size="small" className="w-7 h-7" />
                  </div>
                  <div
                    className="flex-1 journal-card px-3 py-2 text-sm font-hei text-journal-text/90 leading-relaxed"
                    style={{ borderLeft: `3px solid ${spirit.color}` }}
                  >
                    <span className="text-xs block mb-1" style={{ color: spirit.color }}>
                      {comment.speaker}
                    </span>
                    「{comment.quote}」
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 列3：灵居共鸣图 */}
        <motion.div
          className="journal-card p-4 h-full overflow-hidden flex flex-col"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Map className="w-4 h-4 text-journal-accent shrink-0" />
            <h3 className="text-base font-song font-bold text-journal-text">灵居共鸣图</h3>
          </div>
          <div className="space-y-2 flex-1">
            {observationRecord.resonanceZones.map((zone, index) => {
              const zoneSpirit = getSpiritByLabel(zone.guardian, sortedPool[0][0] as SpiritType);
              return (
                <motion.div
                  key={index}
                  className="space-y-0.5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-song font-bold text-journal-text shrink-0">
                      {zone.name}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: `${zoneSpirit.color}20`,
                        color: zoneSpirit.color,
                      }}
                    >
                      {zone.guardian}
                    </span>
                    <span className="text-[10px] text-journal-accent tabular-nums shrink-0">
                      {zone.value}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-journal-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${zone.value}%`,
                        backgroundColor: zoneSpirit.color,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-journal-muted font-hei truncate">{zone.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div className="journal-card p-4">
          <h4 className="text-base font-song font-bold text-journal-text mb-3">
            科学收纳建议
          </h4>
          <ul className="space-y-2">
            {observationRecord.scientificAdvice.map((advice, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-2 text-sm text-journal-muted font-hei"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <span className="w-5 h-5 rounded-full bg-journal-secondary flex items-center justify-center text-xs text-journal-accent">
                  {index + 1}
                </span>
                {advice}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="journal-card p-4"
          style={{ borderColor: `${topSpirit.color}40` }}
        >
          <h4 className="text-base font-song font-bold mb-3" style={{ color: topSpirit.color }}>
            灵居气息建议
          </h4>
          <ul className="space-y-2">
            {observationRecord.spiritAdvice.map((advice, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-2 text-sm text-journal-muted font-hei"
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
          <p className="text-journal-muted font-hei text-sm mb-2">{resultError}</p>
          <button onClick={handleRetryResult} className="text-sm text-journal-accent hover:underline">
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
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        className="text-center mt-8 text-sm text-journal-muted/70"
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
    </PageShell>
  );
};

export default ObservationPage;
