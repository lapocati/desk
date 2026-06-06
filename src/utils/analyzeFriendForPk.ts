import { getFinalResult } from '@/services/deepseekApi';
import { analyzeImage } from '@/services/qwenApi';
import type { FinalResult } from '@/types';

export async function analyzeFriendForPk(
  friendPhotoDataUrl: string,
  signal?: AbortSignal
): Promise<FinalResult> {
  const analysis = await analyzeImage(friendPhotoDataUrl, signal);
  const soulPool = analysis.spiritScores;
  return getFinalResult(analysis, [], soulPool, null);
}
