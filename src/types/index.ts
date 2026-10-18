export type UserRole = 'ASPIRANT' | 'LEADER' | 'ADMIN';

export type ContentStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type MockRequestStatus = 
  | 'PREFERRED_PENDING' 
  | 'OPEN_BOARD' 
  | 'CLAIMED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type SessionStatus = 
  | 'PROPOSED' 
  | 'APPROVED' 
  | 'SCHEDULED' 
  | 'LIVE' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export type PrivacySetting = 'private' | 'public';

export interface ProfilePrivacySettings {
  company: PrivacySetting;
  experience_years: PrivacySetting;
  skillset: PrivacySetting;
  career_plan: PrivacySetting;
  target_designation: PrivacySetting;
  position: PrivacySetting;
}

export interface UserProfile {
  userId: string;
  nickname: string;
  email: string;
  position: string;
  designation: string;
  experienceYears: number;
  company: string;
  skillset: string[];
  targetDesignation: string;
  careerPlan: string;
  privacySettings: ProfilePrivacySettings;
  resumeFileName?: string;
  resumeUploadedAt?: string;
}

export interface ContentPost {
  id: string;
  authorId: string;
  authorNickname: string;
  authorRole: UserRole;
  authorAvatar?: string;
  type: 'REEL' | 'ARTICLE';
  title: string;
  bodyText: string;
  mediaUrl?: string;
  durationSeconds?: number;
  tags: string[];
  status: ContentStatus;
  reviewedBy?: string;
  rejectionReason?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  hasSaved?: boolean;
  commentsCount: number;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  authorRole: UserRole;
  isVerifiedLeader: boolean;
  content: string;
  createdAt: string;
  upvotes: number;
}

export interface LiveTopicRequest {
  id: string;
  requesterId: string;
  requesterNickname: string;
  topic: string;
  description: string;
  targetLevel: string;
  preferredTimeWindows: string[];
  upvotes: number;
  status: 'SUBMITTED' | 'GROUPED' | 'PROPOSED' | 'SCHEDULED';
  createdAt: string;
}

export interface LiveSessionEvent {
  id: string;
  topicRequestId?: string;
  title: string;
  description: string;
  hostLeaderId: string;
  hostLeaderNickname: string;
  hostRole: string;
  scheduledTime: string; // ISO
  durationMinutes: number;
  webrtcRoomId: string;
  capacity: number;
  status: SessionStatus;
  tags: string[];
  attendeesCount: number;
  isUserRsvp?: boolean;
  approvalStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
}

export interface HumanMockRequest {
  id: string;
  aspirantId: string;
  aspirantNickname: string;
  preferredLeaderId?: string;
  preferredLeaderNickname?: string;
  claimedLeaderId?: string;
  claimedLeaderNickname?: string;
  resumeUrl: string;
  resumeFileName: string;
  jobDescription: string;
  targetRole: string;
  interviewType: 'BEHAVIORAL' | 'SITUATIONAL' | 'HR' | 'EXECUTIVE_STRATEGY';
  status: MockRequestStatus;
  preferredExpiresAt?: string; // ISO timestamp (48h from creation)
  scheduledTime?: string;
  webrtcRoomId?: string;
  notes?: string;
  createdAt: string;
  scorecard?: HumanMockScorecard;
}

export interface HumanMockScorecard {
  id: string;
  mockRequestId: string;
  evaluatorLeaderId: string;
  evaluatorNickname: string;
  starAdherenceScore: number; // 1-10
  communicationScore: number; // 1-10
  executivePresenceScore: number; // 1-10
  technicalDepthScore: number; // 1-10
  overallScore: number; // 1-100%
  keyStrengths: string[];
  improvementAreas: string[];
  recommendations: string;
  evaluatedAt: string;
}

export interface STARMetrics {
  situationScore: number; // 1-10
  taskScore: number; // 1-10
  actionScore: number; // 1-10
  resultScore: number; // 1-10
  average: number; // 1-10
}

export interface AIScorecardResult {
  overallReadiness: number; // 0-100%
  starMetrics: STARMetrics;
  executivePresence: {
    toneScore: number; // 1-10
    concisenessScore: number; // 1-10
    fillerWordDensity: string; // "Low (1.2%)", "Moderate", etc.
  };
  strengths: string[];
  improvementAreas: string[];
  modelSuggestedAnswers: {
    question: string;
    suggestedStructure: string;
  }[];
  summary: string;
}

export interface TranscriptTurn {
  id: string;
  speaker: 'AI_INTERVIEWER' | 'CANDIDATE';
  text: string;
  timestamp: string;
}

export interface AIVoiceSession {
  id: string;
  userId: string;
  targetRole: string;
  interviewCategory: 'BEHAVIORAL' | 'SITUATIONAL' | 'HR';
  resumeParsedData?: {
    candidateSummary: string;
    detectedSkills: string[];
    experienceLevel: string;
  };
  jdParsedData?: {
    roleTitle: string;
    requiredCompetencies: string[];
  };
  questions: string[];
  currentQuestionIndex: number;
  transcriptLog: TranscriptTurn[];
  scorecardResult?: AIScorecardResult;
  status: 'SETUP' | 'CONSENT' | 'ACTIVE' | 'EVALUATING' | 'COMPLETED';
  durationSeconds: number;
  createdAt: string;
}

export interface AspirantProgression {
  currentLevel: 1 | 2 | 3;
  levelName: 'Explorer' | 'Practitioner' | 'Executive Ready';
  aiMocksCompleted: number;
  humanMocksCompleted: number;
  communityContributions: number;
  highestScore: number;
  verifiedByCoordinator: boolean;
  nextLevelRequirements: string[];
}

export interface LeaderImpactStats {
  volunteerBadges: string[];
  impactPoints: number;
  mockInterviewsConducted: number;
  webinarsHosted: number;
  communityAnswersGiven: number;
  endorsementsCount: number;
}

export interface ModerationCase {
  id: string;
  targetType: 'REEL' | 'ARTICLE' | 'LIVE_EVENT' | 'USER_REPORT';
  targetId: string;
  title: string;
  authorNickname: string;
  reason: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedBy?: string;
  feedback?: string;
}
