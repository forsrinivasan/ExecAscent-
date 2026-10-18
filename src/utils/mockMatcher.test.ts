import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePriorityExpiration,
  isPreferredPriorityActive,
  getEffectiveMockRequestStatus,
  canLeaderClaimMockRequest,
  claimMockRequest,
} from './mockMatcher.ts';
import type { HumanMockRequest } from '../types/index.ts';

test('calculatePriorityExpiration adds 48 hours accurately', () => {
  const base = new Date('2026-10-18T12:00:00Z');
  const expiration = calculatePriorityExpiration(base, 48);
  assert.equal(expiration, '2026-10-20T12:00:00.000Z');
});

test('isPreferredPriorityActive returns true within 48h and false after expiration', () => {
  const createdAt = '2026-10-18T10:00:00Z';
  const expiresAt = '2026-10-20T10:00:00Z';

  const req = {
    status: 'PREFERRED_PENDING' as const,
    preferredLeaderId: 'leader-123',
    preferredExpiresAt: expiresAt,
  };

  // 12 hours after creation (still active)
  const activeNow = new Date('2026-10-18T22:00:00Z');
  assert.equal(isPreferredPriorityActive(req, activeNow), true);

  // 50 hours after creation (expired)
  const expiredNow = new Date('2026-10-20T12:00:00Z');
  assert.equal(isPreferredPriorityActive(req, expiredNow), false);
});

test('getEffectiveMockRequestStatus defaults to OPEN_BOARD once 48h priority window expires', () => {
  const req: HumanMockRequest = {
    id: 'req-1',
    aspirantId: 'asp-1',
    aspirantNickname: 'AliceEngineer',
    preferredLeaderId: 'lead-vip',
    preferredLeaderNickname: 'SarahVP',
    resumeUrl: '/resumes/alice.pdf',
    resumeFileName: 'alice_cv.pdf',
    jobDescription: 'Director of Platform Engineering',
    targetRole: 'Director of Engineering',
    interviewType: 'BEHAVIORAL',
    status: 'PREFERRED_PENDING',
    preferredExpiresAt: '2026-10-20T10:00:00Z',
    createdAt: '2026-10-18T10:00:00Z',
  };

  // During window
  assert.equal(
    getEffectiveMockRequestStatus(req, new Date('2026-10-19T10:00:00Z')),
    'PREFERRED_PENDING'
  );

  // After window
  assert.equal(
    getEffectiveMockRequestStatus(req, new Date('2026-10-21T10:00:00Z')),
    'OPEN_BOARD'
  );
});

test('canLeaderClaimMockRequest enforces preferred priority exclusivity, then allows public claims', () => {
  const req: HumanMockRequest = {
    id: 'req-2',
    aspirantId: 'asp-1',
    aspirantNickname: 'AliceEngineer',
    preferredLeaderId: 'lead-vip',
    preferredLeaderNickname: 'SarahVP',
    resumeUrl: '/resumes/alice.pdf',
    resumeFileName: 'alice_cv.pdf',
    jobDescription: 'Director of Platform Engineering',
    targetRole: 'Director of Engineering',
    interviewType: 'BEHAVIORAL',
    status: 'PREFERRED_PENDING',
    preferredExpiresAt: '2026-10-20T10:00:00Z',
    createdAt: '2026-10-18T10:00:00Z',
  };

  // Preferred leader can claim during priority
  const duringPriority = new Date('2026-10-19T00:00:00Z');
  const vipCheck = canLeaderClaimMockRequest(req, 'lead-vip', true, duringPriority);
  assert.equal(vipCheck.allowed, true);

  // Other leader CANNOT claim during priority window
  const otherCheck = canLeaderClaimMockRequest(req, 'lead-other', true, duringPriority);
  assert.equal(otherCheck.allowed, false);

  // Other leader CAN claim after priority window expires
  const afterPriority = new Date('2026-10-20T12:00:00Z');
  const otherCheckAfter = canLeaderClaimMockRequest(req, 'lead-other', true, afterPriority);
  assert.equal(otherCheckAfter.allowed, true);

  // Unverified leader cannot claim
  const unverifiedCheck = canLeaderClaimMockRequest(req, 'lead-other', false, afterPriority);
  assert.equal(unverifiedCheck.allowed, false);

  // Aspirant cannot claim own request
  const ownCheck = canLeaderClaimMockRequest(req, 'asp-1', true, afterPriority);
  assert.equal(ownCheck.allowed, false);
});

test('claimMockRequest assigns claimedLeaderId and generates WebRTC room ID', () => {
  const req: HumanMockRequest = {
    id: 'req-3',
    aspirantId: 'asp-1',
    aspirantNickname: 'AliceEngineer',
    resumeUrl: '/resumes/alice.pdf',
    resumeFileName: 'alice_cv.pdf',
    jobDescription: 'VP Technology',
    targetRole: 'VP Technology',
    interviewType: 'EXECUTIVE_STRATEGY',
    status: 'OPEN_BOARD',
    createdAt: '2026-10-18T10:00:00Z',
  };

  const updated = claimMockRequest(req, 'lead-99', 'MarkCTO');
  assert.equal(updated.status, 'CLAIMED');
  assert.equal(updated.claimedLeaderId, 'lead-99');
  assert.equal(updated.claimedLeaderNickname, 'MarkCTO');
  assert.ok(updated.webrtcRoomId?.startsWith('exec-mock-req-3'));
});
