import type { FinalResult, SoulPool, SpiritType } from '@/types';
import { matchPersonality } from './matchPersonality';

const SPIRIT_TIE_BREAK: SpiritType[] = ['wisdom', 'vitality', 'healing', 'fantasy', 'guardian'];

export type FinalResultBase = Pick<
  FinalResult,
  'primarySpirit' | 'primaryResonance' | 'top3Spirits' | 'personalityTag' | 'personalityTagline' | 'personalityId'
>;

function sortSoulPoolEntries(pool: SoulPool): [SpiritType, number][] {
  return (Object.entries(pool) as [SpiritType, number][]).sort(([spiritA, scoreA], [spiritB, scoreB]) => {
    if (scoreB !== scoreA) return scoreB - scoreA;
    return SPIRIT_TIE_BREAK.indexOf(spiritA) - SPIRIT_TIE_BREAK.indexOf(spiritB);
  });
}

export function buildFinalResultBase(soulPool: SoulPool): FinalResultBase {
  const sorted = sortSoulPoolEntries(soulPool);
  const personality = matchPersonality(soulPool);

  return {
    primarySpirit: sorted[0][0],
    primaryResonance: sorted[0][1],
    top3Spirits: sorted.slice(0, 3).map(([spirit, resonance]) => ({ spirit, resonance })),
    personalityTag: personality.name,
    personalityTagline: personality.tagline,
    personalityId: personality.id,
  };
}
