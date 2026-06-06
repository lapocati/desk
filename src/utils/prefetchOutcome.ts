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
      setters.setFinalResult(result);
      setters.setIsGeneratingResult(false);
    })
    .catch((err) => {
      if (signal.aborted || generation !== prefetchGeneration) return;
      const message = err instanceof Error ? err.message : '生成失败，请重试';
      setters.setObservationError(message);
      setters.setResultError(message);
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
      setters.setResultError(err instanceof Error ? err.message : '结果页文案生成失败');
      setters.setIsGeneratingResult(false);
    });
}
