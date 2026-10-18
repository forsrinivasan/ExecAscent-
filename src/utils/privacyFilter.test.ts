import test from 'node:test';
import assert from 'node:assert/strict';
import { maskPIIInDocument, sanitizeProfileForViewer } from './privacyFilter.ts';
import type { UserProfile } from '../types/index.ts';

test('maskPIIInDocument removes email and telephone identifiers', () => {
  const raw = 'Please contact me at sarah.chen@techcorp.io or call +1 415-555-0192 for interview details.';
  const masked = maskPIIInDocument(raw);

  assert.ok(!masked.includes('sarah.chen@techcorp.io'));
  assert.ok(!masked.includes('415-555-0192'));
  assert.ok(masked.includes('[REDACTED_EMAIL]'));
  assert.ok(masked.includes('[REDACTED_PHONE]'));
});

test('sanitizeProfileForViewer hides private fields from community members but reveals to owner and admin', () => {
  const profile: UserProfile = {
    userId: 'user-42',
    nickname: 'CloudMaster',
    email: 'private_email@example.com',
    position: 'Staff SRE',
    designation: 'Staff Infrastructure Engineer',
    experienceYears: 14,
    company: 'Fintech Secret Unicorn Inc',
    skillset: ['Kubernetes', 'Go', 'Distributed Systems'],
    targetDesignation: 'VP of Infrastructure',
    careerPlan: 'Aiming for executive tech leadership within 12 months',
    resumeFileName: 'confidential_cv.pdf',
    privacySettings: {
      company: 'private', // private
      experience_years: 'public', // public
      position: 'public', // public
      target_designation: 'public', // public
      skillset: 'public', // public
      career_plan: 'private', // private
    },
  };

  // 1. Another member viewing: private fields (company, career_plan, email, resume) are excluded
  const communityView = sanitizeProfileForViewer(profile, 'other-user-99', false);
  assert.equal(communityView.nickname, 'CloudMaster');
  assert.equal(communityView.company, undefined);
  assert.equal(communityView.careerPlan, undefined);
  assert.equal(communityView.email, undefined);
  assert.equal(communityView.resumeFileName, undefined);
  assert.equal(communityView.experienceYears, 14);
  assert.deepEqual(communityView.skillset, ['Kubernetes', 'Go', 'Distributed Systems']);

  // 2. Owner viewing: everything is accessible
  const ownerView = sanitizeProfileForViewer(profile, 'user-42', false);
  assert.equal(ownerView.company, 'Fintech Secret Unicorn Inc');
  assert.equal(ownerView.careerPlan, 'Aiming for executive tech leadership within 12 months');
  assert.equal(ownerView.email, 'private_email@example.com');

  // 3. Admin viewing: full access for support/audit
  const adminView = sanitizeProfileForViewer(profile, 'admin-1', true);
  assert.equal(adminView.company, 'Fintech Secret Unicorn Inc');
});
