import type { UserProfile } from '../types/index.ts';

/**
 * Masks sensitive PII (emails, phone numbers, street addresses) from raw document text
 */
export function maskPIIInDocument(rawText: string): string {
  if (!rawText) return '';

  // Mask email addresses
  const maskedEmail = rawText.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[REDACTED_EMAIL]'
  );

  // Mask phone numbers (various formats)
  const maskedPhone = maskedEmail.replace(
    /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g,
    '[REDACTED_PHONE]'
  );

  return maskedPhone;
}

/**
 * Sanitizes a UserProfile object based on field-level privacy settings.
 * If viewer is the owner or an admin, all fields are visible.
 * If viewer is a public or community member, private fields are stripped or masked.
 */
export function sanitizeProfileForViewer(
  profile: UserProfile,
  viewerUserId?: string,
  isViewerAdmin: boolean = false
): Partial<UserProfile> {
  const isOwner = viewerUserId === profile.userId;
  if (isOwner || isViewerAdmin) {
    return { ...profile };
  }

  const sanitized: Partial<UserProfile> = {
    userId: profile.userId,
    nickname: profile.nickname, // Nickname is always safe public handle
    privacySettings: profile.privacySettings,
  };

  // Check each field's privacy setting
  if (profile.privacySettings.company === 'public') {
    sanitized.company = profile.company;
  }
  if (profile.privacySettings.experience_years === 'public') {
    sanitized.experienceYears = profile.experienceYears;
  }
  if (profile.privacySettings.position === 'public') {
    sanitized.position = profile.position;
  }
  if (profile.privacySettings.target_designation === 'public') {
    sanitized.targetDesignation = profile.targetDesignation;
  }
  if (profile.privacySettings.skillset === 'public') {
    sanitized.skillset = profile.skillset;
  }
  if (profile.privacySettings.career_plan === 'public') {
    sanitized.careerPlan = profile.careerPlan;
  }

  // Email and sensitive resume file name are NEVER public
  sanitized.email = undefined;
  sanitized.resumeFileName = undefined;

  return sanitized;
}
