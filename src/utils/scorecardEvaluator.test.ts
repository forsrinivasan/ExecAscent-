import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSTARMetrics,
  evaluateCandidateResponse,
  calculateAspirantLevel,
  calculateLeaderImpact,
} from './scorecardEvaluator.ts';

test('calculateSTARMetrics clamps values and computes correct weighted average', () => {
  const metrics = calculateSTARMetrics(8, 7, 9, 8);
  assert.equal(metrics.situationScore, 8);
  assert.equal(metrics.taskScore, 7);
  assert.equal(metrics.actionScore, 9);
  assert.equal(metrics.resultScore, 8);
  // (8*0.2 + 7*0.2 + 9*0.35 + 8*0.25) = 1.6 + 1.4 + 3.15 + 2.0 = 8.15 -> 8.2 or 8.1
  assert.ok(metrics.average >= 8.1 && metrics.average <= 8.2);
});

test('evaluateCandidateResponse detects STAR presence and filler words', () => {
  const transcript =
    'In my previous background situation at CloudScale, our task was to migrate 400 microservices without downtime. ' +
    'I led the engineering strike team and architected an event-driven canary pipeline. ' +
    'This resulted in zero downtime and reduced cloud infrastructure expenditure by 34%.';

  const evaluation = evaluateCandidateResponse(transcript, 'Director of Engineering');
  assert.ok(evaluation.overallReadiness >= 75);
  assert.equal(evaluation.fillerWordDensity, 'Low (<2%)');
  assert.ok(evaluation.strengths.some((s) => s.includes('quantified business results') || s.includes('quantified') || s.includes('ownership') || s.includes('active framing')));
});

test('calculateAspirantLevel respects progression gates for Explorer, Practitioner, and Executive Ready', () => {
  // L1: Profile created, basic mocks
  const l1 = calculateAspirantLevel({
    hasProfile: true,
    aiMocksCount: 2,
    humanMocksCount: 0,
    communityContributions: 0,
    highestScore: 70,
    isCoordinatorVerified: false,
  });
  assert.equal(l1.currentLevel, 1);
  assert.equal(l1.levelName, 'Explorer');

  // L2: Has 1 human mock and community participation
  const l2 = calculateAspirantLevel({
    hasProfile: true,
    aiMocksCount: 3,
    humanMocksCount: 1,
    communityContributions: 2,
    highestScore: 78,
    isCoordinatorVerified: false,
  });
  assert.equal(l2.currentLevel, 2);
  assert.equal(l2.levelName, 'Practitioner');

  // L3: Score >= 85 and verified by Coordinator
  const l3 = calculateAspirantLevel({
    hasProfile: true,
    aiMocksCount: 4,
    humanMocksCount: 2,
    communityContributions: 5,
    highestScore: 88,
    isCoordinatorVerified: true,
  });
  assert.equal(l3.currentLevel, 3);
  assert.equal(l3.levelName, 'Executive Ready');
});

test('calculateLeaderImpact computes points and awards volunteer badges', () => {
  const impact = calculateLeaderImpact({
    mockInterviewsConducted: 4,
    webinarsHosted: 2,
    communityAnswersGiven: 6,
    endorsementsCount: 3,
  });

  // 4*50 (200) + 2*100 (200) + 6*15 (90) + 3*25 (75) = 565
  assert.equal(impact.impactPoints, 565);
  assert.ok(impact.volunteerBadges.includes('Executive Interviewer'));
  assert.ok(impact.volunteerBadges.includes('Masterclass Host'));
  assert.ok(impact.volunteerBadges.includes('Top Thought Leader'));
  assert.ok(impact.volunteerBadges.includes('Pillar of ExecAscent'));
});
