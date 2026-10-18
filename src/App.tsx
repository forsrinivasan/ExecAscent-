import React, { useState } from 'react';
import {
  Compass,
  Video,
  Users,
  Mic,
  Award,
  ShieldCheck,
  User,
  Sparkles,
  Lock,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  CheckCircle,
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
} from './types/index.ts';

import {
  INITIAL_LEADERS,
  INITIAL_ASPIRANT,
  INITIAL_ADMIN,
  INITIAL_USER_PROFILE,
  INITIAL_POSTS,
  INITIAL_COMMENTS,
  INITIAL_TOPIC_REQUESTS,
  INITIAL_LIVE_SESSIONS,
  INITIAL_MOCK_REQUESTS,
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
import { calculateAspirantLevel, calculateLeaderImpact } from './utils/scorecardEvaluator.ts';

export default function App() {
  // Current user and active role
  const [currentUser, setCurrentUser] = useState(INITIAL_ASPIRANT);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [leaders, setLeaders] = useState(INITIAL_LEADERS);

  // Active navigation tab
  const [activeNav, setActiveNav] = useState<
    'CONTENT' | 'WEBINARS' | 'HUMAN_MOCK' | 'AI_VOICE' | 'GRADUATION' | 'MODERATION' | 'PROFILE'
  >('CONTENT');

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

  // Core Data Collections
  const [posts, setPosts] = useState<ContentPost[]>(INITIAL_POSTS);
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [topicRequests, setTopicRequests] = useState<LiveTopicRequest[]>(INITIAL_TOPIC_REQUESTS);
  const [liveSessions, setLiveSessions] = useState<LiveSessionEvent[]>(INITIAL_LIVE_SESSIONS);
  const [mockRequests, setMockRequests] = useState<HumanMockRequest[]>(INITIAL_MOCK_REQUESTS);

  // Progression & Impact States
  const [progression, setProgression] = useState<AspirantProgression>(
    calculateAspirantLevel({
      hasProfile: true,
      aiMocksCount: 3,
      humanMocksCount: 1,
      communityContributions: 2,
      highestScore: 82,
      isCoordinatorVerified: false,
    })
  );

  const [leaderImpact, setLeaderImpact] = useState<LeaderImpactStats>({
    volunteerBadges: ['Volunteer Contributor', 'Executive Interviewer', 'Masterclass Host'],
    impactPoints: 475,
    mockInterviewsConducted: 4,
    webinarsHosted: 2,
    communityAnswersGiven: 5,
    endorsementsCount: 3,
  });

  // Role switching utility (facilitates instant testing of all 3 personas)
  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === 'ASPIRANT') {
      setCurrentUser(INITIAL_ASPIRANT);
    } else if (newRole === 'LEADER') {
      setCurrentUser(INITIAL_LEADERS[0]);
    } else if (newRole === 'ADMIN') {
      setCurrentUser(INITIAL_ADMIN);
    }
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
    alert('Mock evaluation saved to your private Career Progression plan!');
  };

  const pendingPosts = posts.filter((p) => p.status === 'PENDING_APPROVAL');
  const pendingSessions = liveSessions.filter((s) => s.approvalStatus === 'PENDING_APPROVAL');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Universal Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 min-h-16 flex flex-wrap items-center justify-between gap-2">
          {/* Logo & Platform Badge */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-slate-950 text-base sm:text-lg shadow-md shrink-0">
              EA
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-100 text-sm sm:text-base tracking-tight">
                  ExecAscent
                </span>
                <span className="hidden md:inline-block bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  100% Volunteer Mentorship
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block -mt-0.5 truncate max-w-[170px] sm:max-w-none">
                Executive IT Career Progression
              </span>
            </div>
          </div>

          {/* Role Persona Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-0.5 sm:p-1 rounded-xl text-xs shrink-0">
            <span className="text-slate-500 px-1.5 font-mono text-[10px] hidden lg:inline">Active Role:</span>
            <button
              onClick={() => handleSwitchRole('ASPIRANT')}
              className={`px-2 py-1 rounded-lg font-semibold text-[11px] sm:text-xs transition ${
                currentUser.role === 'ASPIRANT'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🎓 <span className="hidden xs:inline">Aspirant</span>
            </button>
            <button
              onClick={() => handleSwitchRole('LEADER')}
              className={`px-2 py-1 rounded-lg font-semibold text-[11px] sm:text-xs transition ${
                currentUser.role === 'LEADER'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👑 <span className="hidden xs:inline">Leader</span>
            </button>
            <button
              onClick={() => handleSwitchRole('ADMIN')}
              className={`px-2 py-1 rounded-lg font-semibold text-[11px] sm:text-xs transition ${
                currentUser.role === 'ADMIN'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🛡️ <span className="hidden xs:inline">Admin</span>
            </button>
          </div>

          {/* User Profile & Auth Trigger */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setActiveNav('PROFILE')}
              className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1 rounded-xl text-xs transition"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                {currentUser.nickname.slice(0, 1)}
              </div>
              <span className="font-semibold text-slate-200 text-xs hidden sm:inline max-w-[100px] truncate">
                {currentUser.nickname}
              </span>
              <Shield className="w-3 h-3 text-amber-400" />
            </button>

            <button
              onClick={() => setShowAuthModal(true)}
              className="p-1.5 text-slate-400 hover:text-white transition"
              title="Sign in with Email OTP"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto border-t border-slate-800/80 space-x-1 py-1.5 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveNav('CONTENT')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 shrink-0 ${
              activeNav === 'CONTENT'
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Content Hub (Reels &amp; Q&amp;A)</span>
          </button>

          <button
            onClick={() => setActiveNav('WEBINARS')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 shrink-0 ${
              activeNav === 'WEBINARS'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Live Webinars &amp; Demands</span>
          </button>

          <button
            onClick={() => setActiveNav('HUMAN_MOCK')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 shrink-0 ${
              activeNav === 'HUMAN_MOCK'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1-on-1 Mock Board (48h Priority)</span>
          </button>

          <button
            onClick={() => setActiveNav('AI_VOICE')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 shrink-0 ${
              activeNav === 'AI_VOICE'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice AI Mock Simulator</span>
          </button>

          <button
            onClick={() => setActiveNav('GRADUATION')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 shrink-0 ${
              activeNav === 'GRADUATION'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Career Graduation (L{progression.currentLevel})</span>
          </button>

          <button
            onClick={() => setActiveNav('MODERATION')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 shrink-0 relative ${
              activeNav === 'MODERATION'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Moderation Gateway</span>
            {pendingPosts.length + pendingSessions.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveNav('PROFILE')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 shrink-0 ${
              activeNav === 'PROFILE'
                ? 'bg-slate-800 text-slate-100 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile &amp; Privacy</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
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
            onApprovePost={handleApprovePost}
            onRejectPost={handleRejectPost}
            onApproveSession={handleApproveSession}
            onRejectSession={handleRejectSession}
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
            // Update candidate mock request with completed scorecard
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
      <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">ExecAscent</span>
            <span>&bull;</span>
            <span>Non-Monetary Volunteer Platform for Experienced IT Professionals</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Psychological Safety &amp; Privacy By Default</span>
            <span>&bull;</span>
            <span>Native WebRTC Stack</span>
            <span>&bull;</span>
            <span>Sub-1.2s Voice AI SLA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
