import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Video,
  FileText,
  Clock,
  TrendingUp,
  Users,
  Activity,
  Layers,
  X,
  UserCheck,
  ShieldAlert,
  Award,
  Sparkles,
  Key,
  Copy,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import type { ContentPost, LiveSessionEvent, User, TieredTrustStatus } from '../types/index.ts';
import { useExecutiveTheme } from '../theme/ThemeContext.tsx';

interface AdminConsoleProps {
  pendingPosts: ContentPost[];
  pendingSessions: LiveSessionEvent[];
  registeredUsers: User[];
  onApprovePost: (postId: string) => void;
  onRejectPost: (postId: string, reason: string) => void;
  onApproveSession: (sessionId: string, webrtcRoomId: string) => void;
  onRejectSession: (sessionId: string, reason: string) => void;
  onApproveUser: (userId: string) => void;
  onRejectUser: (userId: string, reason: string) => void;
  onUpdateUserTrust: (userId: string, trust: TieredTrustStatus) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  pendingPosts,
  pendingSessions,
  registeredUsers,
  onApprovePost,
  onRejectPost,
  onApproveSession,
  onRejectSession,
  onApproveUser,
  onRejectUser,
  onUpdateUserTrust,
}) => {
  const { theme, themeConfig } = useExecutiveTheme();
  const [activeTab, setActiveTab] = useState<'ACCOUNTS' | 'CONTENT' | 'SESSIONS' | 'ANALYTICS'>('ACCOUNTS');
  
  // Rejection modal
  const [rejectingTarget, setRejectingTarget] = useState<{
    id: string;
    type: 'POST' | 'SESSION' | 'USER';
    title: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Room assignment for session approval
  const [roomAssignmentId, setRoomAssignmentId] = useState('');

  // Account filter
  const [userFilter, setUserFilter] = useState<'ALL' | 'PENDING' | 'LEADER' | 'ASPIRANT' | 'APPROVED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Live Audit log
  const [auditLogs, setAuditLogs] = useState<
    { id: string; time: string; actor: string; action: string; target: string; status: string }[]
  >([
    {
      id: 'log-1',
      time: 'Just now',
      actor: 'SuperAdmin_Governance',
      action: 'ADMIN_CONSOLE_ACCESSED',
      target: 'Full Governance Authority Verified',
      status: 'AUTHENTICATED',
    },
    {
      id: 'log-2',
      time: '12 mins ago',
      actor: 'SuperAdmin_Governance',
      action: 'APPROVE_CONTENT',
      target: 'The #1 Mistake Staff Engineers Make in VP Rounds',
      status: 'APPROVED',
    },
    {
      id: 'log-3',
      time: '45 mins ago',
      actor: 'SuperAdmin_Governance',
      action: 'ASSIGN_WEBRTC_ROOM',
      target: 'Mastering the Executive Behavioral Round (session-1)',
      status: 'asc-live-behavioral-mastery',
    },
  ]);

  const handleCopyAdminCredentials = () => {
    navigator.clipboard?.writeText('Email: admin@execascent.org\nRole: SuperAdmin_Governance');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleConfirmReject = () => {
    if (!rejectingTarget) return;
    const reason = rejectionReason.trim() || 'Did not meet platform executive vetting criteria.';

    if (rejectingTarget.type === 'USER') {
      onRejectUser(rejectingTarget.id, reason);
      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          time: 'Just now',
          actor: 'SuperAdmin_Governance',
          action: 'REJECT_USER_ACCOUNT',
          target: `${rejectingTarget.title} (${rejectingTarget.id})`,
          status: 'REJECTED',
        },
        ...prev,
      ]);
    } else if (rejectingTarget.type === 'POST') {
      onRejectPost(rejectingTarget.id, reason);
      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          time: 'Just now',
          actor: 'SuperAdmin_Governance',
          action: 'REJECT_CONTENT',
          target: rejectingTarget.id,
          status: 'REJECTED',
        },
        ...prev,
      ]);
    } else if (rejectingTarget.type === 'SESSION') {
      onRejectSession(rejectingTarget.id, reason);
      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          time: 'Just now',
          actor: 'SuperAdmin_Governance',
          action: 'REJECT_SESSION',
          target: rejectingTarget.id,
          status: 'REJECTED',
        },
        ...prev,
      ]);
    }

    setRejectingTarget(null);
    setRejectionReason('');
  };

  const handleConfirmApproveUser = (user: User) => {
    onApproveUser(user.id);
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: 'Just now',
        actor: 'SuperAdmin_Governance',
        action: 'APPROVE_USER_ACCOUNT',
        target: `${user.nickname} (${user.email})`,
        status: 'APPROVED',
      },
      ...prev,
    ]);
  };

  const handleElevateTrust = (user: User, newTrust: TieredTrustStatus) => {
    onUpdateUserTrust(user.id, newTrust);
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: 'Just now',
        actor: 'SuperAdmin_Governance',
        action: 'ELEVATE_TIERED_TRUST',
        target: `${user.nickname} -> ${newTrust}`,
        status: newTrust,
      },
      ...prev,
    ]);
  };

  const handleConfirmApprovePost = (postId: string, title: string) => {
    onApprovePost(postId);
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: 'Just now',
        actor: 'SuperAdmin_Governance',
        action: 'APPROVE_CONTENT',
        target: `${title} (${postId})`,
        status: 'APPROVED',
      },
      ...prev,
    ]);
  };

  const handleConfirmApproveSession = (sessionId: string) => {
    const roomId = roomAssignmentId.trim() || `asc-live-room-${Math.random().toString(36).substring(2, 7)}`;
    onApproveSession(sessionId, roomId);
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: 'Just now',
        actor: 'SuperAdmin_Governance',
        action: 'ASSIGN_WEBRTC_ROOM',
        target: sessionId,
        status: roomId,
      },
      ...prev,
    ]);
    setRoomAssignmentId('');
  };

  // Filtered users
  const pendingUsersCount = registeredUsers.filter((u) => u.accountStatus === 'PENDING_APPROVAL').length;
  
  const filteredUsers = registeredUsers.filter((u) => {
    const matchesSearch =
      u.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.company && u.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.designation && u.designation.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (userFilter === 'PENDING') return u.accountStatus === 'PENDING_APPROVAL';
    if (userFilter === 'APPROVED') return u.accountStatus === 'APPROVED';
    if (userFilter === 'LEADER') return u.role === 'LEADER';
    if (userFilter === 'ASPIRANT') return u.role === 'ASPIRANT';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Admin Credentials & Security Authority Card */}
      <div className={`p-5 rounded-2xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} shadow-md relative overflow-hidden`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                  Super Admin Master Account &bull; Active Credentials
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-medium border border-emerald-500/20">
                  Full Approval Clearance
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white mt-0.5">
                Executive Governance &amp; Account Approval Gateway
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1.5 font-mono">
                <span>
                  Admin Email: <strong className="text-amber-400 font-semibold">admin@execascent.org</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Password: <strong className="text-amber-400 font-semibold">[REDACTED]</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Persona: <strong className="text-slate-200">SuperAdmin_Governance</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleCopyAdminCredentials}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition"
              title="Copy credentials for testing login"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Login Details</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Operational Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] uppercase font-bold tracking-wider block ${themeConfig.textMuted}`}>Pending Accounts</span>
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{pendingUsersCount}</span>
          </div>
          <UserCheck className="w-6 h-6 text-amber-400/50" />
        </div>

        <div className={`p-4 rounded-xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] uppercase font-bold tracking-wider block ${themeConfig.textMuted}`}>Pending Posts</span>
            <span className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">{pendingPosts.length}</span>
          </div>
          <FileText className="w-6 h-6 text-indigo-400/50" />
        </div>

        <div className={`p-4 rounded-xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] uppercase font-bold tracking-wider block ${themeConfig.textMuted}`}>Pending Webinars</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{pendingSessions.length}</span>
          </div>
          <Video className="w-6 h-6 text-emerald-400/50" />
        </div>

        <div className={`p-4 rounded-xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} flex items-center justify-between`}>
          <div>
            <span className={`text-[10px] uppercase font-bold tracking-wider block ${themeConfig.textMuted}`}>Total Network</span>
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">{registeredUsers.length}</span>
          </div>
          <Users className="w-6 h-6 text-slate-400/50" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex border-b ${themeConfig.panelBorder} space-x-6 text-xs font-semibold overflow-x-auto`}>
        <button
          onClick={() => setActiveTab('ACCOUNTS')}
          className={`pb-3 border-b-2 transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'ACCOUNTS'
              ? 'border-amber-500 text-amber-500 font-bold'
              : `border-transparent ${themeConfig.textSecondary} hover:${themeConfig.textPrimary}`
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>User Accounts &amp; Mentor Vetting</span>
          {pendingUsersCount > 0 && (
            <span className="bg-amber-500 text-slate-950 font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {pendingUsersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('CONTENT')}
          className={`pb-3 border-b-2 transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'CONTENT'
              ? 'border-amber-500 text-amber-500 font-bold'
              : `border-transparent ${themeConfig.textSecondary} hover:${themeConfig.textPrimary}`
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Post Moderation Queue</span>
          {pendingPosts.length > 0 && (
            <span className="bg-amber-500 text-slate-950 font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {pendingPosts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('SESSIONS')}
          className={`pb-3 border-b-2 transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'SESSIONS'
              ? 'border-amber-500 text-amber-500 font-bold'
              : `border-transparent ${themeConfig.textSecondary} hover:${themeConfig.textPrimary}`
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Webinar &amp; Room Approvals</span>
          {pendingSessions.length > 0 && (
            <span className="bg-amber-500 text-slate-950 font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {pendingSessions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`pb-3 border-b-2 transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'ANALYTICS'
              ? 'border-amber-500 text-amber-500 font-bold'
              : `border-transparent ${themeConfig.textSecondary} hover:${themeConfig.textPrimary}`
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Governance &amp; Audit Logs</span>
        </button>
      </div>

      {/* TAB 1: ACCOUNTS & MENTOR VETTING */}
      {activeTab === 'ACCOUNTS' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 text-xs">
              {(['PENDING', 'ALL', 'LEADER', 'ASPIRANT', 'APPROVED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setUserFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                    userFilter === filter
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : `border ${themeConfig.panelBorder} ${themeConfig.textSecondary} hover:${themeConfig.textPrimary} bg-slate-900/40`
                  }`}
                >
                  {filter === 'PENDING' && `Pending Approval (${pendingUsersCount})`}
                  {filter === 'ALL' && 'All Registered'}
                  {filter === 'LEADER' && 'Leaders / Mentors'}
                  {filter === 'ASPIRANT' && 'Aspirants'}
                  {filter === 'APPROVED' && 'Approved Members'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, company, role..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* User Cards Grid */}
          {filteredUsers.length === 0 ? (
            <div className={`p-10 rounded-2xl border ${themeConfig.panelBorder} text-center space-y-2`}>
              <UserCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className={`text-sm font-semibold ${themeConfig.textPrimary}`}>No accounts matching filter</p>
              <p className={`text-xs ${themeConfig.textSecondary}`}>
                All candidate and mentor applications have been reviewed or resolved.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((user) => {
                const isPending = user.accountStatus === 'PENDING_APPROVAL';
                const isApproved = user.accountStatus === 'APPROVED';
                const isLeader = user.role === 'LEADER';

                return (
                  <div
                    key={user.id}
                    className={`p-5 rounded-2xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} space-y-4 shadow-sm hover:border-amber-500/40 transition duration-150 flex flex-col justify-between`}
                  >
                    <div className="space-y-3">
                      {/* Header with Avatar and Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.nickname}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-base text-slate-300 shrink-0">
                              {user.nickname.substring(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className={`font-bold text-sm ${themeConfig.textPrimary}`}>{user.nickname}</h4>
                              <span
                                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                                  isLeader
                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                }`}
                              >
                                {isLeader ? 'Leader Applicant' : 'Aspirant Applicant'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono block mt-0.5">{user.email}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Pending Vetting</span>
                            </span>
                          ) : isApproved ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Approved Active</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold flex items-center space-x-1">
                              <XCircle className="w-3 h-3" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Professional Experience Breakdown */}
                      <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="font-medium text-slate-200">{user.designation || 'Senior Technology Lead'}</span>
                          {user.experienceYears && (
                            <span className="text-amber-400 font-mono font-semibold">{user.experienceYears}y exp</span>
                          )}
                        </div>
                        <span className="text-slate-400 block text-[11px]">{user.company || 'Enterprise Technology'}</span>
                      </div>

                      {/* Application Notes */}
                      {user.notes && (
                        <div className="text-xs text-slate-400 italic bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-lg leading-relaxed">
                          "{user.notes}"
                        </div>
                      )}

                      {/* Tiered Trust Status Tag */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${themeConfig.textMuted}`}>
                          Tiered Trust Level:
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                              user.tieredTrustStatus === 'COMMUNITY_FELLOW'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : user.tieredTrustStatus === 'VERIFIED_CONTRIBUTOR'
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {user.tieredTrustStatus === 'COMMUNITY_FELLOW' && 'Community Fellow'}
                            {user.tieredTrustStatus === 'VERIFIED_CONTRIBUTOR' && 'Verified Contributor (Auto-Publish)'}
                            {user.tieredTrustStatus === 'PROBATIONARY' && 'Probationary (Moderated)'}
                            {!user.tieredTrustStatus && 'Standard Member'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className={`pt-3 mt-3 border-t ${themeConfig.panelBorder} flex flex-wrap items-center justify-between gap-2`}>
                      <div className="flex items-center space-x-2">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleConfirmApproveUser(user)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve &amp; Activate</span>
                            </button>
                            <button
                              onClick={() =>
                                setRejectingTarget({
                                  id: user.id,
                                  type: 'USER',
                                  title: user.nickname,
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-semibold text-xs transition flex items-center space-x-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-emerald-400 flex items-center space-x-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Account Verified</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Trust Elevation Dropdown / Quick Action */}
                      {user.tieredTrustStatus !== 'VERIFIED_CONTRIBUTOR' && user.tieredTrustStatus !== 'COMMUNITY_FELLOW' && (
                        <button
                          onClick={() => handleElevateTrust(user, 'VERIFIED_CONTRIBUTOR')}
                          className="px-2.5 py-1.5 rounded-lg border border-sky-500/40 text-sky-400 hover:bg-sky-500/10 font-semibold text-[11px] transition flex items-center space-x-1"
                          title="Grant Auto-Publish permission so their posts bypass manual moderation"
                        >
                          <Sparkles className="w-3 h-3 text-sky-400" />
                          <span>Grant Auto-Publish</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONTENT POST MODERATION */}
      {activeTab === 'CONTENT' && (
        <div className="space-y-4">
          {pendingPosts.length === 0 ? (
            <div className={`p-10 rounded-2xl border ${themeConfig.panelBorder} text-center space-y-2`}>
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className={`text-sm font-semibold ${themeConfig.textPrimary}`}>Content Moderation Queue is Clear</p>
              <p className={`text-xs ${themeConfig.textSecondary}`}>
                All user articles and reels have been reviewed. Verified Contributors publish automatically with automated safety checks.
              </p>
            </div>
          ) : (
            pendingPosts.map((post) => (
              <div
                key={post.id}
                className={`p-5 rounded-2xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} space-y-4 shadow-sm`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-xs text-amber-500 mb-1">
                      <span className="font-mono uppercase font-bold tracking-wider">{post.type}</span>
                      <span>&bull;</span>
                      <span className={themeConfig.textSecondary}>Submitted by {post.authorNickname}</span>
                    </div>
                    <h3 className={`text-base font-bold ${themeConfig.textPrimary}`}>{post.title}</h3>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                    PENDING APPROVAL
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                  {post.bodyText}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className={`pt-3 border-t ${themeConfig.panelBorder} flex items-center justify-between text-xs`}>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleConfirmApprovePost(post.id, post.title)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve &amp; Publish</span>
                    </button>
                    <button
                      onClick={() =>
                        setRejectingTarget({
                          id: post.id,
                          type: 'POST',
                          title: post.title,
                        })
                      }
                      className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40 px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Post</span>
                    </button>
                  </div>

                  <span className={`text-[11px] ${themeConfig.textMuted}`}>
                    Requires manual review (Probationary Contributor)
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: SESSIONS & WEBRTC ROOM ASSIGNMENT */}
      {activeTab === 'SESSIONS' && (
        <div className="space-y-4">
          {pendingSessions.length === 0 ? (
            <div className={`p-10 rounded-2xl border ${themeConfig.panelBorder} text-center space-y-2`}>
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className={`text-sm font-semibold ${themeConfig.textPrimary}`}>No Proposed Live Webinars Awaiting Room Assignment</p>
              <p className={`text-xs ${themeConfig.textSecondary}`}>
                All upcoming masterclasses have verified host assignments and secure WebRTC rooms.
              </p>
            </div>
          ) : (
            pendingSessions.map((session) => (
              <div
                key={session.id}
                className={`p-5 rounded-2xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} space-y-4 shadow-sm`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-xs text-indigo-400 mb-1">
                      <Video className="w-4 h-4" />
                      <span className="font-semibold">WebRTC Live Session Proposal</span>
                      <span>&bull;</span>
                      <span className={themeConfig.textSecondary}>Host: {session.hostLeaderNickname}</span>
                    </div>
                    <h3 className={`text-base font-bold ${themeConfig.textPrimary}`}>{session.title}</h3>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shrink-0">
                    PROPOSED
                  </span>
                </div>

                <p className={`text-xs ${themeConfig.textSecondary}`}>{session.description}</p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <div className="flex-1">
                    <label className={`block text-[11px] font-medium mb-1 ${themeConfig.textMuted}`}>
                      Assign In-App WebRTC Room Identifier:
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. asc-live-${session.id}`}
                      value={roomAssignmentId}
                      onChange={(e) => setRoomAssignmentId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className={`pt-3 border-t ${themeConfig.panelBorder} flex items-center justify-between text-xs`}>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleConfirmApproveSession(session.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve &amp; Provision In-App Room</span>
                    </button>
                    <button
                      onClick={() =>
                        setRejectingTarget({
                          id: session.id,
                          type: 'SESSION',
                          title: session.title,
                        })
                      }
                      className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40 px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Proposal</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: GOVERNANCE & AUDIT LOGS */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-sm flex items-center space-x-2 ${themeConfig.textPrimary}`}>
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Executive Governance Audit Trail (Immutable Log)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">SOC2 &bull; Privacy-Safe</span>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-amber-400 font-bold">{log.action}</span>
                    <span className="text-slate-300">{log.target}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400">
                    <span className="text-[11px] text-slate-400">{log.actor}</span>
                    <span>&bull;</span>
                    <span className="text-[10px]">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold text-base">Confirm Rejection</h4>
              </div>
              <button
                onClick={() => setRejectingTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Please state constructive governance feedback for rejecting{' '}
              <strong className="text-white">{rejectingTarget.title}</strong>. This ensures transparent psychological safety.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Feedback / Reason</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please clarify leadership scope or provide verified corporate email."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setRejectingTarget(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
