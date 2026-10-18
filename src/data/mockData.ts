import type {
  ContentPost,
  CommentItem,
  LiveTopicRequest,
  LiveSessionEvent,
  HumanMockRequest,
  UserProfile,
  User,
} from '../types/index.ts';

export const BOARDROOM_HERO_IMAGE = '/src/assets/images/exec_boardroom_hero_1792328288177.jpg';
export const TECH_ROADMAP_IMAGE = '/src/assets/images/executive_tech_roadmap_1792328587674.jpg';

// The solitary Admin user account
export const INITIAL_ADMIN: User = {
  id: 'admin-super',
  email: 'admin@execascent.org',
  nickname: 'SuperAdmin_Governance',
  role: 'ADMIN',
  isVerified: true,
  accountStatus: 'APPROVED',
  company: 'ExecAscent Executive Board',
  designation: 'Platform Super Administrator & Lead Coordinator',
  experienceYears: 20,
  tieredTrustStatus: 'COMMUNITY_FELLOW',
  notes: 'Master credentials for user account approval, mentor verification, and community safety governance.',
  createdAt: '2026-01-01T00:00:00Z',
};

// Aliased fallback for safety; points strictly to the Admin user
export const INITIAL_ASPIRANT: User = INITIAL_ADMIN;

// Clean collection containing only the single admin user ID
export const INITIAL_REGISTERED_USERS: User[] = [INITIAL_ADMIN];

// All dummy data collections cleared
export const INITIAL_LEADERS: User[] = [];
export const INITIAL_POSTS: ContentPost[] = [];
export const INITIAL_COMMENTS: CommentItem[] = [];
export const INITIAL_TOPIC_REQUESTS: LiveTopicRequest[] = [];
export const INITIAL_LIVE_SESSIONS: LiveSessionEvent[] = [];
export const INITIAL_MOCK_REQUESTS: HumanMockRequest[] = [];

// Admin profile
export const INITIAL_USER_PROFILE: UserProfile = {
  userId: 'admin-super',
  nickname: 'SuperAdmin_Governance',
  email: 'admin@execascent.org',
  position: 'Platform Super Administrator',
  designation: 'Platform Coordinator & Lead Architect',
  experienceYears: 20,
  company: 'ExecAscent Governance Board',
  skillset: ['Executive Leadership', 'Platform Governance', 'Technical Mentorship', 'System Architecture'],
  targetDesignation: 'Executive Board Member',
  careerPlan: 'Governing the non-monetary executive mentoring community and upholding executive interview quality standards.',
  privacySettings: {
    company: 'public',
    experience_years: 'public',
    position: 'public',
    skillset: 'public',
    target_designation: 'public',
    career_plan: 'public',
  },
};
