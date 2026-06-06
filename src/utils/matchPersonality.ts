import { PERSONALITIES } from '@/constants';
import type { PersonalityDefinition, PersonalityTriggerCondition, SoulPool, SpiritType } from '@/types';

const POOL_KEYS: SpiritType[] = ['wisdom', 'vitality', 'healing', 'fantasy', 'guardian'];

function poolSpread(pool: SoulPool): number {
  const values = POOL_KEYS.map((key) => pool[key]);
  return Math.max(...values) - Math.min(...values);
}

function satisfiesCondition(pool: SoulPool, condition: PersonalityTriggerCondition): boolean {
  if (condition.requiresLowVariance) {
    if (POOL_KEYS.some((key) => pool[key] < 60)) return false;
    if (poolSpread(pool) >= 15) return false;
  }

  const mins: Array<[SpiritType, number | undefined]> = [
    ['wisdom', condition.wisdomMin],
    ['vitality', condition.vitalityMin],
    ['healing', condition.healingMin],
    ['fantasy', condition.fantasyMin],
    ['guardian', condition.guardianMin],
  ];
  for (const [key, min] of mins) {
    if (min !== undefined && pool[key] < min) return false;
  }

  const maxs: Array<[SpiritType, number | undefined]> = [
    ['wisdom', condition.wisdomMax],
    ['vitality', condition.vitalityMax],
    ['healing', condition.healingMax],
    ['fantasy', condition.fantasyMax],
    ['guardian', condition.guardianMax],
  ];
  for (const [key, max] of maxs) {
    if (max !== undefined && pool[key] > max) return false;
  }

  return true;
}

/** 匹配度：满足 min 的超出量 + 满足 max 的余量；未满足则按缺口扣分 */
function computeMatchScore(pool: SoulPool, condition: PersonalityTriggerCondition): number {
  let score = 0;

  if (condition.requiresLowVariance) {
    const spread = poolSpread(pool);
    if (POOL_KEYS.every((key) => pool[key] >= 60) && spread < 15) {
      score += 15 - spread;
    } else {
      score -= spread >= 15 ? spread - 15 : 0;
      score -= POOL_KEYS.reduce((penalty, key) => penalty + Math.max(0, 60 - pool[key]), 0);
    }
  }

  const mins: Array<[SpiritType, number | undefined]> = [
    ['wisdom', condition.wisdomMin],
    ['vitality', condition.vitalityMin],
    ['healing', condition.healingMin],
    ['fantasy', condition.fantasyMin],
    ['guardian', condition.guardianMin],
  ];
  for (const [key, min] of mins) {
    if (min === undefined) continue;
    if (pool[key] >= min) score += pool[key] - min;
    else score -= min - pool[key];
  }

  const maxs: Array<[SpiritType, number | undefined]> = [
    ['wisdom', condition.wisdomMax],
    ['vitality', condition.vitalityMax],
    ['healing', condition.healingMax],
    ['fantasy', condition.fantasyMax],
    ['guardian', condition.guardianMax],
  ];
  for (const [key, max] of maxs) {
    if (max === undefined) continue;
    if (pool[key] <= max) score += max - pool[key];
    else score -= pool[key] - max;
  }

  return score;
}

export function matchPersonality(pool: SoulPool): PersonalityDefinition {
  const ranked = PERSONALITIES.map((personality) => ({
    personality,
    matches: satisfiesCondition(pool, personality.triggerCondition),
    score: computeMatchScore(pool, personality.triggerCondition),
  })).sort((a, b) => {
    if (a.matches !== b.matches) return a.matches ? -1 : 1;
    return b.score - a.score;
  });

  return ranked[0].personality;
}
