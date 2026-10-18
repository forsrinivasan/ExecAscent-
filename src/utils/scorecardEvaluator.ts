import type { AIScorecardResult, AspirantProgression, STARMetrics } from '../types/index.ts';

/**
 * Calculates weighted STAR compliance score based on Situation, Task, Action, and Result components
 */
export function calculateSTARMetrics(
  situation: number,
  task: number,
  action: number,
  result: number
): STARMetrics {
  const clamp = (val: number) => Math.min(10, Math.max(1, Math.round(val)));
  const s = clamp(situation);
  const t = clamp(task);
  const a = clamp(action);
  const r = clamp(result);
  const average = Number(((s * 0.2 + t * 0.2 + a * 0.35 + r * 0.25)).toFixed(1));

  return {
    situationScore: s,
    taskScore: t,
    actionScore: a,
    resultScore: r,
    average,
  };
}

/**
 * Evaluates candidate responses for STAR indicators, filler words, and executive presence
 */
export function evaluateCandidateResponse(
  transcript: string,
  targetRole: string
): {
  starMetrics: STARMetrics;
  overallReadiness: number;
  toneScore: number;
  concisenessScore: number;
  fillerWordDensity: string;
  strengths: string[];
  improvementAreas: string[];
} {
  const text = transcript.toLowerCase();
  
  // Heuristics for STAR components in transcript
  const hasSituation = /(context|situation|background|when i was|at my previous|project started)/.test(text);
  const hasTask = /(goal|objective|tasked with|responsibility was|needed to achieve|challenge was)/.test(text);
  const hasAction = /(i initiated|i architected|i led|i designed|i collaborated|implemented|decided to|action taken)/.test(text);
  const hasResult = /(resulted in|delivered|reduced|increased|optimized|saved|achieved|outcome was|metrics)/.test(text);

  const sScore = hasSituation ? 8.5 : 5.0;
  const tScore = hasTask ? 8.0 : 4.5;
  const aScore = hasAction ? 9.0 : 5.5;
  const rScore = hasResult ? 8.5 : 4.0;

  const starMetrics = calculateSTARMetrics(sScore, tScore, aScore, rScore);

  // Filler words check
  const fillerRegex = /\b(um|uh|like|you know|sort of|kind of|basically|actually)\b/g;
  const words = transcript.split(/\s+/).filter(Boolean);
  const fillerCount = (transcript.match(fillerRegex) || []).length;
  const wordCount = Math.max(1, words.length);
  const fillerRatio = (fillerCount / wordCount) * 100;

  let fillerWordDensity = 'Low (<2%)';
  let toneScore = 9;
  if (fillerRatio > 5) {
    fillerWordDensity = `High (${fillerRatio.toFixed(1)}%)`;
    toneScore = 6;
  } else if (fillerRatio > 2) {
    fillerWordDensity = `Moderate (${fillerRatio.toFixed(1)}%)`;
    toneScore = 8;
  }

  const concisenessScore = wordCount > 40 && wordCount < 350 ? 9 : wordCount >= 350 ? 7 : 6;
  
  // Calculate readiness percentage (0 - 100%)
  const overallReadiness = Math.min(100, Math.round(
    (starMetrics.average * 0.5 + toneScore * 0.25 + concisenessScore * 0.25) * 10
  ));

  const strengths: string[] = [];
  const improvementAreas: string[] = [];

  if (hasAction) strengths.push('Strong ownership and active framing ("I led", "I architected").');
  if (hasResult) strengths.push('Quantified outcome and measurable business impact.');
  if (hasSituation && hasTask) strengths.push('Clear problem framing and strategic task definition.');
  if (strengths.length === 0) strengths.push('Good high-level technical conceptual grasp.');

  if (!hasResult) improvementAreas.push('Anchor the answer with quantified business results and ROI metrics.');
  if (!hasAction) improvementAreas.push('Focus on what YOU specifically decided and executed rather than generic team actions.');
  if (fillerRatio > 3) improvementAreas.push('Reduce filler pauses to project authoritative executive presence.');
  if (wordCount < 40) improvementAreas.push('Expand on the situational context and architectural trade-offs considered.');

  return {
    starMetrics,
    overallReadiness,
    toneScore,
    concisenessScore,
    fillerWordDensity,
    strengths,
    improvementAreas,
  };
}

/**
 * Evaluates Aspirant Career Progression Level:
 * Level 1 (Explorer): Profile created, 3 AI mock interviews completed.
 * Level 2 (Practitioner): 1 Human mock interview completed, active community participation.
 * Level 3 (Executive Ready): Score >= 85% on mock evaluations, verified by Admin/Coordinator.
 */
export function calculateAspirantLevel(data: {
  hasProfile: boolean;
  aiMocksCount: number;
  humanMocksCount: number;
  communityContributions: number;
  highestScore: number;
  isCoordinatorVerified: boolean;
}): AspirantProgression {
  const reqsForL2: string[] = [];
  const reqsForL3: string[] = [];

  if (data.humanMocksCount < 1) reqsForL2.push('Complete at least 1 Human Mock Interview');
  if (data.communityContributions < 1) reqsForL2.push('Participate in community Q&A or webinar discussion');

  if (data.highestScore < 85) reqsForL3.push('Achieve score >= 85% on a Mock Interview evaluation');
  if (!data.isCoordinatorVerified) reqsForL3.push('Coordinator review & endorsement');

  let currentLevel: 1 | 2 | 3 = 1;
  let levelName: 'Explorer' | 'Practitioner' | 'Executive Ready' = 'Explorer';
  let nextLevelRequirements: string[] = [];

  // Check Level 3
  if (
    data.hasProfile &&
    data.humanMocksCount >= 1 &&
    data.highestScore >= 85 &&
    data.isCoordinatorVerified
  ) {
    currentLevel = 3;
    levelName = 'Executive Ready';
    nextLevelRequirements = ['Maintain continuous mentoring and explore transition to IT Leader role!'];
  } else if (data.hasProfile && data.humanMocksCount >= 1 && data.communityContributions >= 1) {
    currentLevel = 2;
    levelName = 'Practitioner';
    nextLevelRequirements = reqsForL3;
  } else {
    currentLevel = 1;
    levelName = 'Explorer';
    nextLevelRequirements = reqsForL2;
  }

  return {
    currentLevel,
    levelName,
    aiMocksCompleted: data.aiMocksCount,
    humanMocksCompleted: data.humanMocksCount,
    communityContributions: data.communityContributions,
    highestScore: data.highestScore,
    verifiedByCoordinator: data.isCoordinatorVerified,
    nextLevelRequirements,
  };
}

/**
 * Calculates Leader Impact Points & Volunteer Badges
 */
export function calculateLeaderImpact(stats: {
  mockInterviewsConducted: number;
  webinarsHosted: number;
  communityAnswersGiven: number;
  endorsementsCount: number;
}): {
  impactPoints: number;
  volunteerBadges: string[];
} {
  const points =
    stats.mockInterviewsConducted * 50 +
    stats.webinarsHosted * 100 +
    stats.communityAnswersGiven * 15 +
    stats.endorsementsCount * 25;

  const badges: string[] = ['Volunteer Contributor'];
  if (stats.mockInterviewsConducted >= 3) badges.push('Executive Interviewer');
  if (stats.webinarsHosted >= 1) badges.push('Masterclass Host');
  if (stats.communityAnswersGiven >= 5) badges.push('Top Thought Leader');
  if (points >= 300) badges.push('Pillar of ExecAscent');

  return {
    impactPoints: points,
    volunteerBadges: badges,
  };
}
