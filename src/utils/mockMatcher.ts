import type { HumanMockRequest, MockRequestStatus } from '../types/index.ts';

/**
 * Calculates the expiration timestamp for the 48-hour preferred leader priority window
 */
export function calculatePriorityExpiration(createdAt: string | Date, hours = 48): string {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const expiration = new Date(date.getTime() + hours * 60 * 60 * 1000);
  return expiration.toISOString();
}

/**
 * Checks if the 48-hour preferred leader priority is still actively reserved
 */
export function isPreferredPriorityActive(
  request: Pick<HumanMockRequest, 'status' | 'preferredLeaderId' | 'preferredExpiresAt'>,
  now: Date = new Date()
): boolean {
  if (request.status !== 'PREFERRED_PENDING') return false;
  if (!request.preferredLeaderId || !request.preferredExpiresAt) return false;

  const expiresAt = new Date(request.preferredExpiresAt).getTime();
  return now.getTime() < expiresAt;
}

/**
 * Derives the effective status of a mock request, automatically advancing
 * from PREFERRED_PENDING to OPEN_BOARD if the 48-hour window has expired.
 */
export function getEffectiveMockRequestStatus(
  request: HumanMockRequest,
  now: Date = new Date()
): MockRequestStatus {
  if (request.status === 'PREFERRED_PENDING') {
    if (!request.preferredExpiresAt) return 'OPEN_BOARD';
    const expiresAt = new Date(request.preferredExpiresAt).getTime();
    if (now.getTime() >= expiresAt) {
      return 'OPEN_BOARD';
    }
    return 'PREFERRED_PENDING';
  }
  return request.status;
}

/**
 * Evaluates whether a given leader has permission to claim this mock interview request
 */
export function canLeaderClaimMockRequest(
  request: HumanMockRequest,
  leaderId: string,
  isLeaderVerified: boolean,
  now: Date = new Date()
): { allowed: boolean; reason?: string } {
  if (!isLeaderVerified) {
    return { allowed: false, reason: 'Only verified IT Leaders can claim mock interviews.' };
  }

  if (request.aspirantId === leaderId) {
    return { allowed: false, reason: 'You cannot claim your own mock interview request.' };
  }

  const effectiveStatus = getEffectiveMockRequestStatus(request, now);

  if (effectiveStatus === 'CLAIMED' || effectiveStatus === 'COMPLETED' || effectiveStatus === 'CANCELLED') {
    return { allowed: false, reason: `Request is already in ${effectiveStatus} state.` };
  }

  if (effectiveStatus === 'PREFERRED_PENDING') {
    if (request.preferredLeaderId === leaderId) {
      return { allowed: true };
    }
    return { 
      allowed: false, 
      reason: 'This request is reserved for the preferred IT leader during the 48-hour priority window.' 
    };
  }

  if (effectiveStatus === 'OPEN_BOARD') {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Request cannot be claimed at this time.' };
}

/**
 * Transitions a request into CLAIMED state by a specific leader
 */
export function claimMockRequest(
  request: HumanMockRequest,
  leaderId: string,
  leaderNickname: string,
  now: Date = new Date()
): HumanMockRequest {
  const check = canLeaderClaimMockRequest(request, leaderId, true, now);
  if (!check.allowed) {
    throw new Error(check.reason || 'Cannot claim mock request');
  }

  const roomId = `exec-mock-${request.id.slice(0, 8)}-${Math.random().toString(36).substring(2, 6)}`;

  return {
    ...request,
    status: 'CLAIMED',
    claimedLeaderId: leaderId,
    claimedLeaderNickname: leaderNickname,
    webrtcRoomId: roomId,
  };
}
