import { getFinalResult, getObservationAndResult } from '@/services/deepseekApi';
import type { DialogueMessage, FinalResult, ObservationRecord, SoulPool, VisualAnalysisResult } from '@/types';

interface PrefetchSetters {
  setObservationRecord: (record: ObservationRecord | null) => void;
  setIsGeneratingObservation: (generating: boolean) => void;
  setObservationError: (error: string | null) => void;
  setFinalResult: (result: FinalResult | null) => void;
  setIsGeneratingResult: (generating: boolean) => void;
  setResultError: (error: string | null) => void;
}

let prefetchAbort: AbortController | null = null;
let prefetchGeneration = 0;

function friendlyMessage(err: unknown, context: 'observation' | 'result'): string {
  if (!(err instanceof Error)) {
    return context === 'observation' ? '观察记录生成失败，请重试' : '结果页文案生成失败，请重试';
  }

  const msg = err.message;
  if (msg.includes('API Key') || msg.includes('API 请求失败') || msg.includes('返回内容为空')) {
    return msg;
  }
  if (context === 'observation') {
    return '观察记录生成失败，请重试';
  }
  return '结果页文案生成失败，请重试';
}

export function prefetchObservationAndResult(
  analysis: VisualAnalysisResult,
  history: DialogueMessage[],
  pool: SoulPool,
  setters: PrefetchSetters
) {
  prefetchAbort?.abort();
  prefetchAbort = new AbortController();
  const generation = ++prefetchGeneration;
  const signal = prefetchAbort.signal;

  setters.setObservationRecord(null);
  setters.setFinalResult(null);
  setters.setObservationError(null);
  setters.setResultError(null);
  setters.setIsGeneratingObservation(true);
  setters.setIsGeneratingResult(true);

  getObservationAndResult(analysis, history, pool, signal)
    .then(({ observation, result }) => {
      if (signal.aborted || generation !== prefetchGeneration) return;

      setters.setObservationRecord(observation);
      setters.setIsGeneratingObservation(false);

      if (result) {
        setters.setFinalResult(result);
        setters.setIsGeneratingResult(false);
        return;
      }

      return getFinalResult(analysis, history, pool, observation)
        .then((finalResult) => {
          if (signal.aborted || generation !== prefetchGeneration) return;
          setters.setFinalResult(finalResult);
        })
        .catch((err) => {
          if (signal.aborted || generation !== prefetchGeneration) return;
          setters.setResultError(friendlyMessage(err, 'result'));
        })
        .finally(() => {
          if (signal.aborted || generation !== prefetchGeneration) return;
          setters.setIsGeneratingResult(false);
        });
    })
    .catch((err) => {
      if (signal.aborted || generation !== prefetchGeneration) return;
      setters.setObservationError(friendlyMessage(err, 'observation'));
      setters.setIsGeneratingObservation(false);
      setters.setIsGeneratingResult(false);
    });
}

export function prefetchFinalResult(
  analysis: VisualAnalysisResult,
  history: DialogueMessage[],
  pool: SoulPool,
  observationRecord: ObservationRecord,
  setters: Pick<PrefetchSetters, 'setFinalResult' | 'setIsGeneratingResult' | 'setResultError'>
) {
  setters.setFinalResult(null);
  setters.setResultError(null);
  setters.setIsGeneratingResult(true);

  getFinalResult(analysis, history, pool, observationRecord)
    .then((result) => {
      setters.setFinalResult(result);
      setters.setIsGeneratingResult(false);
    })
    .catch((err) => {
      setters.setResultError(friendlyMessage(err, 'result'));
      setters.setIsGeneratingResult(false);
    });
}
