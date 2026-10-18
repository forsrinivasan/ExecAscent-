import React, { useState } from 'react';
import {
  Compass,
  Video,
  Users,
  Mic,
  Award,
  ShieldCheck,
  Sparkles,
  Lock,
  ChevronDown,
  Shield,
  Palette,
  Check,
  Calendar,
  ExternalLink,
  Zap,
} from 'lucide-react';

import type {
  UserRole,
  UserProfile,
  ContentPost,
  CommentItem,
  LiveTopicRequest,
  LiveSessionEvent,
  HumanMockRequest,
  HumanMockScorecard,
  AspirantProgression,
  LeaderImpactStats,
  AIScorecardResult,
  TieredTrustStatus,
  User,
} from './types/index.ts';

import {
  INITIAL_LEADERS,
  INITIAL_ASPIRANT,
  INITIAL_ADMIN,
  INITIAL_REGISTERED_USERS,
  INITIAL_USER_PROFILE,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_TOPIC_REQUESTS,
  INITIAL_LIVE_SESSIONS,
  INITIAL_MOCK_REQUESTS,
  BOARDROOM_HERO_IMAGE,
  TECH_ROADMAP_IMAGE,
} from './data/mockData.ts';

import { ContentHub } from './components/ContentHub.tsx';
import { LiveWebinars } from './components/LiveWebinars.tsx';
import { HumanMockBoard } from './components/HumanMockBoard.tsx';
import { AIVoiceSimulator } from './components/AIVoiceSimulator.tsx';
import { CareerGraduation } from './components/CareerGraduation.tsx';
import { AdminConsole } from './components/AdminConsole.tsx';
import { ProfilePrivacyCenter } from './components/ProfilePrivacyCenter.tsx';
import { WebRTCLiveRoom } from './components/WebRTCLiveRoom.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { calculateAspirantLevel } from './utils/scorecardEvaluator.ts';
import { useExecutiveTheme, ExecutiveTheme, THEME_CONFIGS } from './theme/ThemeContext.tsx';

export default function App() {
  const { theme, setTheme, themeConfig } = useExecutiveTheme();

  // Current user defaults to the sole authenticated Super Admin
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_ADMIN);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [leaders, setLeaders] = useState<User[]>(INITIAL_LEADERS);

  // Active navigation tab defaults to Admin Governance Gateway
  const [activeNav, setActiveNav] = useState<
    'CONTENT' | 'WEBINARS' | 'HUMAN_MOCK' | 'AI_VOICE' | 'GRADUATION' | 'MODERATION' | 'PROFILE'
  >('MODERATION');

  // Theme dropdown state
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Hero spotlight toggle
  const [showHeroSpotlight, setShowHeroSpotlight] = useState(true);

  // Active WebRTC Live Room overlay
  const [activeWebRTCRoom, setActiveWebRTCRoom] = useState<{
    roomId: string;
    sessionTitle: string;
    targetRole?: string;
    isMockInterview?: boolean;
    evaluatorNickname?: string;
  } | null>(null);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Core Data Collections (clean, zero dummy records)
  const [posts, setPosts] = useState<ContentPost[]>(INITIAL_POSTS);
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [topicRequests, setTopicRequests] = useState<LiveTopicRequest[]>(INITIAL_TOPIC_REQUESTS);
  const [liveSessions, setLiveSessions] = useState<LiveSessionEvent[]>(INITIAL_LIVE_SESSIONS);
  const [mockRequests, setMockRequests] = useState<HumanMockRequest[]>(INITIAL_MOCK_REQUESTS);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(INITIAL_REGISTERED_USERS);

  // Progression & Impact States initialized cleanly
  const [progression, setProgression] = useState<AspirantProgression>(
    calculateAspirantLevel({
      hasProfile: true,
      aiMocksCount: 0,
      humanMocksCount: 0,
      communityContributions: 0,
      highestScore: 0,
      isCoordinatorVerified: true,
    })
  );

  const [leaderImpact, setLeaderImpact] = useState<LeaderImpactStats>({
    volunteerBadges: ['Platform Governance SuperAdmin'],
    impactPoints: 0,
    mockInterviewsConducted: 0,
    webinarsHosted: 0,
    communityAnswersGiven: 0,
    endorsementsCount: 0,
  });

  // Perspective Preview utility for testing without dummy users
  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === 'ADMIN') {
      setCurrentUser(INITIAL_ADMIN);
      setActiveNav('MODERATION');
    } else if (newRole === 'ASPIRANT') {
      setCurrentUser({
        ...INITIAL_ADMIN,
        id: 'aspirant-preview',
        role: 'ASPIRANT',
        nickname: 'Aspirant_Candidate',
      });
      setActiveNav('CONTENT');
    } else if (newRole === 'LEADER') {
      setCurrentUser({
        ...INITIAL_ADMIN,
        id: 'leader-preview',
        role: 'LEADER',
        nickname: 'Verified_Mentor',
      });
      setActiveNav('CONTENT');
    }
  };

  // User Account Approval actions
  const handleApproveUser = (userId: string) => {
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, accountStatus: 'APPROVED', isVerified: true } : u))
    );
  };

  const handleRejectUser = (userId: string, reason: string) => {
    setRegisteredUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, accountStatus: 'REJECTED', isVerified: false, rejectionReason: reason } : u
      )
    );
  };

  const handleUpdateUserTrust = (userId: string, trust: TieredTrustStatus) => {
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, tieredTrustStatus: trust } : u))
    );
  };

  // Content actions
  const handlePostSubmit = (newPost: ContentPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleAddComment = (newComment: CommentItem) => {
    setComments((prev) => [...prev, newComment]);
    setPosts((prev) =>
      prev.map((p) => (p.id === newComment.postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );
  };

  const handleToggleUpvote = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextUpvoted = !p.hasUpvoted;
        return {
          ...p,
          hasUpvoted: nextUpvoted,
          upvotes: nextUpvoted ? p.upvotes + 1 : p.upvotes - 1,
        };
      })
    );
  };

  const handleToggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, hasSaved: !p.hasSaved } : p))
    );
  };

  // Live Webinar actions
  const handleTopicRequestSubmit = (req: LiveTopicRequest) => {
    setTopicRequests((prev) => [req, ...prev]);
  };

  const handleTopicUpvote = (topicId: string) => {
    setTopicRequests((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, upvotes: t.upvotes + 1 } : t))
    );
  };

  const handleProposeSession = (newSess: LiveSessionEvent) => {
    setLiveSessions((prev) => [newSess, ...prev]);
  };

  const handleToggleRSVP = (sessionId: string) => {
    setLiveSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        const nextRsvp = !s.isUserRsvp;
        return {
          ...s,
          isUserRsvp: nextRsvp,
          attendeesCount: nextRsvp ? s.attendeesCount + 1 : s.attendeesCount - 1,
        };
      })
    );
  };

  // Human Mock actions
  const handleMockRequestSubmit = (newReq: HumanMockRequest) => {
    setMockRequests((prev) => [newReq, ...prev]);
  };

  const handleMockRequestClaim = (claimedReq: HumanMockRequest) => {
    setMockRequests((prev) =>
      prev.map((r) => (r.id === claimedReq.id ? claimedReq : r))
    );
  };

  // Admin Moderation actions
  const handleApprovePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: 'APPROVED' } : p))
    );
  };

  const handleRejectPost = (postId: string, reason: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: 'REJECTED', rejectionReason: reason } : p))
    );
  };

  const handleApproveSession = (sessionId: string, webrtcRoomId: string) => {
    setLiveSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, approvalStatus: 'APPROVED', status: 'SCHEDULED', webrtcRoomId }
          : s
      )
    );
  };

  const handleRejectSession = (sessionId: string, reason: string) => {
    setLiveSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, approvalStatus: 'REJECTED', status: 'CANCELLED' } : s))
    );
  };

  const handleVerifyLevel3 = () => {
    setProgression((prev) => ({
      ...prev,
      currentLevel: 3,
      levelName: 'Executive Ready',
      verifiedByCoordinator: true,
      nextLevelRequirements: ['Maintain continuous mentoring and explore transition to IT Leader role!'],
    }));
  };

  const handleSaveAIScorecard = (result: AIScorecardResult) => {
    setProgression((prev) => {
      const highest = Math.max(prev.highestScore, result.overallReadiness);
      return {
        ...prev,
        aiMocksCompleted: prev.aiMocksCompleted + 1,
        highestScore: highest,
      };
    });
  };

  const pendingPosts = posts.filter((p) => p.status === 'PENDING_APPROVAL');
  const pendingSessions = liveSessions.filter((s) => s.approvalStatus === 'PENDING_APPROVAL');

  const themesList: { id: ExecutiveTheme; name: string; tag: string; icon: string }[] = [
    { id: 'obsidian', name: 'Obsidian Executive', tag: 'Nocturnal Slate & Brass', icon: '🌑' },
    { id: 'titanium', name: 'Oxford Boardroom', tag: 'Architectural Daylight Porcelain', icon: '🏛️' },
    { id: 'sapphire', name: 'Silicon Vanguard', tag: 'Midnight Navy & Electric Cyan', icon: '⚡' },
  ];

  return (
    <div className={`min-h-screen ${themeConfig.canvasBg} ${themeConfig.textPrimary} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Bar - Strictly adhering to 3-zone contract */}
      <header className={`sticky top-0 z-40 ${themeConfig.panelBg} border-b ${themeConfig.panelBorder} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-6">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-sm shrink-0">
              EA
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-base font-bold tracking-tight ${themeConfig.textPrimary} whitespace-nowrap`}>
                  ExecAscent
                </span>
                <span className="hidden sm:inline text-xs text-amber-500/90 font-medium whitespace-nowrap">
                  · Volunteer Mentorship
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-medium shrink-0">
            <button
              onClick={() => setActiveNav('CONTENT')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'CONTENT'
                  ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold`
                  : themeConfig.navInactiveText
              }`}
            >
              Executive Hub
            </button>

            <button
              onClick={() => setActiveNav('WEBINARS')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'WEBINARS'
                  ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold`
                  : themeConfig.navInactiveText
              }`}
            >
              Masterclasses
            </button>

            <button
              onClick={() => setActiveNav('HUMAN_MOCK')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'HUMAN_MOCK'
                  ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold`
                  : themeConfig.navInactiveText
              }`}
            >
              Mock Board (48h Priority)
            </button>

            <button
              onClick={() => setActiveNav('AI_VOICE')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'AI_VOICE'
                  ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold`
                  : themeConfig.navInactiveText
              }`}
            >
              Voice AI Simulator
            </button>

            <button
              onClick={() => setActiveNav('GRADUATION')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'GRADUATION'
                  ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold`
                  : themeConfig.navInactiveText
              }`}
            >
              Career Graduation (L{progression.currentLevel})
            </button>

            {(() => {
              const pendingUsersCount = registeredUsers.filter((u) => u.accountStatus === 'PENDING_APPROVAL').length;
              const totalAdminTasks = pendingPosts.length + pendingSessions.length + pendingUsersCount;
              return (
                <button
                  onClick={() => setActiveNav('MODERATION')}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center space-x-1.5 ${
                    activeNav === 'MODERATION'
                      ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold`
                      : themeConfig.navInactiveText
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin Gateway</span>
                  {totalAdminTasks > 0 && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-mono font-bold px-1.5 py-0.2 rounded-full">
                      {totalAdminTasks}
                    </span>
                  )}
                </button>
              );
            })()}
          </nav>

          {/* Zone 3: Executive Theme Selector + Role Persona Switcher + Profile */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Theme Picker Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
                  theme === 'titanium'
                    ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                }`}
                title="Switch Executive Theme"
              >
                <Palette className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline font-medium">{themeConfig.name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showThemeMenu && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-xl border p-2 shadow-2xl z-50 transition-all ${
                    theme === 'titanium'
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-[#101726] border-slate-700/80 text-slate-100'
                  }`}
                >
                  <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    Select Executive Theme
                  </div>
                  <div className="space-y-1 mt-1">
                    {themesList.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left transition ${
                          theme === t.id
                            ? theme === 'titanium'
                              ? 'bg-slate-100 font-semibold text-slate-900'
                              : 'bg-slate-800 font-semibold text-amber-400'
                            : 'hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span>{t.icon}</span>
                            <span className="font-medium">{t.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 pl-6">{t.tag}</div>
                        </div>
                        {theme === t.id && <Check className="w-4 h-4 text-amber-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Persona Switcher */}
            <div className={`flex items-center border p-0.5 rounded-lg text-xs shrink-0 ${
              theme === 'titanium' ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <button
                onClick={() => handleSwitchRole('ASPIRANT')}
                className={`px-2 py-1 rounded font-medium text-[11px] transition ${
                  currentUser.role === 'ASPIRANT'
                    ? theme === 'titanium'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Aspirant Role"
              >
                Aspirant
              </button>
              <button
                onClick={() => handleSwitchRole('LEADER')}
                className={`px-2 py-1 rounded font-medium text-[11px] transition ${
                  currentUser.role === 'LEADER'
                    ? theme === 'titanium'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Verified IT Leader Role"
              >
                Leader
              </button>
              <button
                onClick={() => handleSwitchRole('ADMIN')}
                className={`px-2 py-1 rounded font-medium text-[11px] transition ${
                  currentUser.role === 'ADMIN'
                    ? theme === 'titanium'
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Coordinator / Admin Role"
              >
                Admin
              </button>
            </div>

            {/* Profile Avatar & Privacy Trigger */}
            <button
              onClick={() => setActiveNav('PROFILE')}
              className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border text-xs transition ${
                theme === 'titanium'
                  ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200'
              }`}
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.nickname}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {currentUser.role === 'ADMIN' ? '🛡️' : currentUser.nickname.charAt(0)}
                </div>
              )}
              <span className="font-semibold text-xs hidden md:inline max-w-[130px] truncate">
                {currentUser.nickname}
              </span>
            </button>

            {/* Email OTP Sign-in */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-1.5 text-slate-400 hover:text-amber-500 transition"
              title="Sign in with Email OTP"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className={`lg:hidden flex overflow-x-auto border-t px-4 py-2 space-x-2 text-xs font-medium scrollbar-none ${themeConfig.panelBorder}`}>
          <button
            onClick={() => setActiveNav('CONTENT')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeNav === 'CONTENT' ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold` : themeConfig.navInactiveText
            }`}
          >
            Hub
          </button>
          <button
            onClick={() => setActiveNav('WEBINARS')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeNav === 'WEBINARS' ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold` : themeConfig.navInactiveText
            }`}
          >
            Masterclasses
          </button>
          <button
            onClick={() => setActiveNav('HUMAN_MOCK')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeNav === 'HUMAN_MOCK' ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold` : themeConfig.navInactiveText
            }`}
          >
            Mock Board
          </button>
          <button
            onClick={() => setActiveNav('AI_VOICE')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeNav === 'AI_VOICE' ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold` : themeConfig.navInactiveText
            }`}
          >
            Voice AI
          </button>
          <button
            onClick={() => setActiveNav('GRADUATION')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeNav === 'GRADUATION' ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold` : themeConfig.navInactiveText
            }`}
          >
            Graduation
          </button>
          <button
            onClick={() => setActiveNav('MODERATION')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeNav === 'MODERATION' ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold` : themeConfig.navInactiveText
            }`}
          >
            Moderation
          </button>
          <button
            onClick={() => setActiveNav('PROFILE')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeNav === 'PROFILE' ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold` : themeConfig.navInactiveText
            }`}
          >
            Profile
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">

        {/* Executive Hero Banner & Platform Spotlight */}
        {showHeroSpotlight && (
          <section className={`rounded-2xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} overflow-hidden shadow-sm transition-all`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
              {/* Left Column: Mission & Core Architecture */}
              <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                      Executive IT Career Acceleration
                    </div>
                    <button
                      onClick={() => setShowHeroSpotlight(false)}
                      className="text-xs text-slate-400 hover:text-slate-200 transition"
                      title="Dismiss spotlight banner"
                    >
                      Hide
                    </button>
                  </div>

                  <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-balance leading-snug">
                    Architect your transition to VP of Engineering &amp; CTO.
                  </h1>

                  <p className={`mt-3 text-sm leading-relaxed ${themeConfig.textSecondary}`}>
                    ExecAscent is a non-monetary community platform built exclusively for senior engineers, engineering directors, and architects preparing for executive leadership. Grounded in psychological safety, real-time WebRTC live rooms, and full-duplex voice AI behavioral simulations.
                  </p>

                  {/* Clean unboxed metadata with typographic separators (Zero-Pill discipline) */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span className="font-medium text-amber-500">48h Priority Claim Window</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>STAR Behavioral Scorecards</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>100% Non-Monetary Volunteers</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>Sub-1.2s Voice AI SLA</span>
                  </div>
                </div>

                {/* Verified IT Leaders Showcase */}
                <div className="mt-6 pt-5 border-t border-slate-800/60">
                  <div className="text-xs font-semibold text-slate-400 mb-2.5">
                    Verified Mentors Active This Week:
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    {leaders.map((leader) => (
                      <div key={leader.id} className="flex items-center space-x-2">
                        <img
                          src={leader.avatarUrl || '/src/assets/images/mentor_marcus_vp_1792328286138.jpg'}
                          alt={leader.nickname}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/40 shrink-0"
                        />
                        <div className="text-xs">
                          <div className={`font-semibold ${themeConfig.textPrimary}`}>
                            {leader.nickname.replace('_', ' ')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {leader.id === 'leader-1' && 'VP of Engineering'}
                            {leader.id === 'leader-2' && 'Chief Technology Officer'}
                            {leader.id === 'leader-3' && 'Head of AI Platforms'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Keynote Boardroom Visual */}
              <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
                <img
                  src={TECH_ROADMAP_IMAGE || BOARDROOM_HERO_IMAGE}
                  alt="Executive Technology Strategy Session"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white text-xs">
                    <span className="font-semibold text-amber-400">Live Strategy Session</span>
                    <p className="text-[11px] text-slate-200 mt-0.5">
                      Scaling Distributed Architecture &amp; C-Suite Communication
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Viewports */}
        {activeNav === 'CONTENT' && (
          <ContentHub
            posts={posts}
            comments={comments}
            currentUserNickname={currentUser.nickname}
            currentUserId={currentUser.id}
            currentUserRole={currentUser.role}
            onPostSubmit={handlePostSubmit}
            onAddComment={handleAddComment}
            onToggleUpvote={handleToggleUpvote}
            onToggleSave={handleToggleSave}
          />
        )}

        {activeNav === 'WEBINARS' && (
          <LiveWebinars
            topicRequests={topicRequests}
            liveSessions={liveSessions}
            currentUserNickname={currentUser.nickname}
            currentUserId={currentUser.id}
            currentUserRole={currentUser.role}
            onTopicRequestSubmit={handleTopicRequestSubmit}
            onTopicUpvote={handleTopicUpvote}
            onProposeSession={handleProposeSession}
            onToggleRSVP={handleToggleRSVP}
            onJoinWebRTC={(roomId, title, hostNickname) =>
              setActiveWebRTCRoom({
                roomId,
                sessionTitle: title,
                evaluatorNickname: hostNickname,
                isMockInterview: false,
              })
            }
          />
        )}

        {activeNav === 'HUMAN_MOCK' && (
          <HumanMockBoard
            requests={mockRequests}
            leaders={leaders}
            currentUserId={currentUser.id}
            currentUserNickname={currentUser.nickname}
            currentUserRole={currentUser.role}
            isLeaderVerified={currentUser.role === 'LEADER' || currentUser.role === 'ADMIN'}
            onRequestSubmit={handleMockRequestSubmit}
            onRequestClaim={handleMockRequestClaim}
            onJoinWebRTCRoom={(roomId, title, targetRole, evaluatorNickname) =>
              setActiveWebRTCRoom({
                roomId,
                sessionTitle: title,
                targetRole,
                evaluatorNickname,
                isMockInterview: true,
              })
            }
          />
        )}

        {activeNav === 'AI_VOICE' && (
          <AIVoiceSimulator
            userNickname={currentUser.nickname}
            onSaveToCareerPlan={handleSaveAIScorecard}
          />
        )}

        {activeNav === 'GRADUATION' && (
          <CareerGraduation
            progression={progression}
            leaderImpact={leaderImpact}
            userRole={currentUser.role}
            userNickname={currentUser.nickname}
            targetRole={userProfile.targetDesignation}
            onVerifyLevel3={handleVerifyLevel3}
          />
        )}

        {activeNav === 'MODERATION' && (
          <AdminConsole
            pendingPosts={pendingPosts}
            pendingSessions={pendingSessions}
            registeredUsers={registeredUsers}
            onApprovePost={handleApprovePost}
            onRejectPost={handleRejectPost}
            onApproveSession={handleApproveSession}
            onRejectSession={handleRejectSession}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            onUpdateUserTrust={handleUpdateUserTrust}
          />
        )}

        {activeNav === 'PROFILE' && (
          <ProfilePrivacyCenter
            profile={userProfile}
            onUpdateProfile={(updated) => setUserProfile(updated)}
            onDeleteAccountData={() => {
              if (confirm('Are you sure you want to request complete account data deletion?')) {
                alert('Account data deletion request logged. Retention policies will safely remove your artifacts.');
              }
            }}
          />
        )}
      </main>

      {/* Embedded In-App Native WebRTC Video Conference Modal */}
      {activeWebRTCRoom && (
        <WebRTCLiveRoom
          roomId={activeWebRTCRoom.roomId}
          sessionTitle={activeWebRTCRoom.sessionTitle}
          userNickname={currentUser.nickname}
          userRole={currentUser.role}
          isMockInterview={activeWebRTCRoom.isMockInterview}
          targetRole={activeWebRTCRoom.targetRole}
          evaluatorNickname={activeWebRTCRoom.evaluatorNickname || 'IT Leader'}
          onLeave={() => setActiveWebRTCRoom(null)}
          onSubmitScorecard={(sc) => {
            setMockRequests((prev) =>
              prev.map((r) =>
                r.webrtcRoomId === activeWebRTCRoom.roomId
                  ? { ...r, status: 'COMPLETED', scorecard: sc }
                  : r
              )
            );
            setProgression((prev) => ({
              ...prev,
              humanMocksCompleted: prev.humanMocksCompleted + 1,
              highestScore: Math.max(prev.highestScore, sc.overallScore),
            }));
          }}
        />
      )}

      {/* Email TOTP Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(newUser) => {
          setCurrentUser(newUser);
          setUserProfile((prev) => ({
            ...prev,
            nickname: newUser.nickname,
            email: newUser.email,
          }));
        }}
      />

      {/* Clean Footer */}
      <footer className={`border-t ${themeConfig.panelBorder} ${themeConfig.panelBg} py-6 text-xs text-slate-500`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className={`font-semibold ${themeConfig.textPrimary}`}>ExecAscent</span>
            <span>&bull;</span>
            <span>Executive IT Career Platform</span>
            <span>&bull;</span>
            <span className="text-amber-500 font-medium">100% Volunteer Network</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Psychological Safety &amp; Private Default</span>
            <span>&bull;</span>
            <span>In-App WebRTC Stack</span>
            <span>&bull;</span>
            <span className="font-mono tabular-nums">Sub-1.2s Voice AI SLA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
