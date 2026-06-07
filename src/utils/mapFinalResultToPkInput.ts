import { SPIRITS } from '@/constants';
import type { FinalResult, PkUserInput } from '@/types';

export function mapFinalResultToPkInput(result: FinalResult): PkUserInput {
  const topReason = result.resonanceReasons[0]?.replace(/^·\s*/, '').trim();

  return {
    main_guardian: SPIRITS[result.primarySpirit].name,
    sub_persona: result.dynamicPersonality,
    ...(topReason ? { top_reason: topReason } : {}),
    resonance_rank: Object.fromEntries(
      result.top3Spirits.map(({ spirit, resonance }) => [SPIRITS[spirit].name, resonance])
    ),
  };
}
