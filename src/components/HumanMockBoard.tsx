import React, { useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  Video,
  Shield,
  FileText,
  Plus,
  Calendar,
  AlertCircle,
  Award,
  ChevronRight,
  X,
} from 'lucide-react';
import type { HumanMockRequest, User, UserRole } from '../types/index.ts';
import {
  calculatePriorityExpiration,
  getEffectiveMockRequestStatus,
  canLeaderClaimMockRequest,
  claimMockRequest,
} from '../utils/mockMatcher.ts';
import { useExecutiveTheme } from '../theme/ThemeContext.tsx';

interface HumanMockBoardProps {
  requests: HumanMockRequest[];
  leaders: User[];
  currentUserId: string;
  currentUserNickname: string;
  currentUserRole: UserRole;
  isLeaderVerified: boolean;
  onRequestSubmit: (newReq: HumanMockRequest) => void;
  onRequestClaim: (claimedReq: HumanMockRequest) => void;
  onJoinWebRTCRoom: (roomId: string, title: string, targetRole: string, evaluatorNickname: string) => void;
}

export const HumanMockBoard: React.FC<HumanMockBoardProps> = ({
  requests,
  leaders,
  currentUserId,
  currentUserNickname,
  currentUserRole,
  isLeaderVerified,
  onRequestSubmit,
  onRequestClaim,
  onJoinWebRTCRoom,
}) => {
  const { theme, themeConfig } = useExecutiveTheme();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetRole, setTargetRole] = useState('Director of Platform Engineering');
  const [interviewType, setInterviewType] = useState<HumanMockRequest['interviewType']>('BEHAVIORAL');
  const [jobDescription, setJobDescription] = useState(
    'Leading 40+ platform engineers responsible for distributed multi-region Kubernetes clusters, 99.999% SLA, and zero-trust security.'
  );
  const [resumeFileName, setResumeFileName] = useState('Alex_Chen_Staff_CV.pdf');
  const [preferredLeaderId, setPreferredLeaderId] = useState<string>('leader-1');
  const [notes, setNotes] = useState('Looking for candid feedback on executive presence and board-level risk communication.');

  // Selected filter
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLAIMED' | 'MY_REQUESTS'>('ALL');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const preferredLeader = leaders.find((l) => l.id === preferredLeaderId);

    const now = new Date();
    const hasPreferred = Boolean(preferredLeaderId && preferredLeader);
    const expiresAt = hasPreferred ? calculatePriorityExpiration(now, 48) : undefined;

    const newReq: HumanMockRequest = {
      id: `mock-req-${Date.now()}`,
      aspirantId: currentUserId,
      aspirantNickname: currentUserNickname,
      preferredLeaderId: hasPreferred ? preferredLeaderId : undefined,
      preferredLeaderNickname: hasPreferred ? preferredLeader?.nickname : undefined,
      resumeUrl: `/resumes/${resumeFileName}`,
      resumeFileName,
      jobDescription,
      targetRole,
      interviewType,
      status: hasPreferred ? 'PREFERRED_PENDING' : 'OPEN_BOARD',
      preferredExpiresAt: expiresAt,
      notes,
      createdAt: now.toISOString(),
    };

    onRequestSubmit(newReq);
    setShowCreateModal(false);
  };

  const handleClaim = (req: HumanMockRequest) => {
    try {
      const updated = claimMockRequest(req, currentUserId, currentUserNickname);
      onRequestClaim(updated);
    } catch (err: any) {
      alert(err.message || 'Unable to claim mock request');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const effectiveStatus = getEffectiveMockRequestStatus(r);
    if (statusFilter === 'OPEN') return effectiveStatus === 'OPEN_BOARD' || effectiveStatus === 'PREFERRED_PENDING';
    if (statusFilter === 'CLAIMED') return effectiveStatus === 'CLAIMED';
    if (statusFilter === 'MY_REQUESTS') return r.aspirantId === currentUserId || r.claimedLeaderId === currentUserId;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Board Header Banner */}
      <div className={`p-6 rounded-2xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm`}>
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider mb-1 text-amber-500">
            <Users className="w-4 h-4" />
            <span>Open Request Board &bull; Volunteer Executive Mentorship</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">1-on-1 Human Mock Interview Board</h2>
          <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${themeConfig.textSecondary}`}>
            Submit a real job description &amp; resume. Optionally tag 1 Preferred Leader with a <strong className="text-amber-500">48-hour exclusive priority window</strong> before opening to the public leader board. 100% volunteer-led; no fees or payments.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Request 1-on-1 Mock Interview</span>
        </button>
      </div>

      {/* Filter Tabs & Counter */}
      <div className={`flex items-center justify-between border-b ${themeConfig.panelBorder} pb-3`}>
        <div className="flex space-x-2 text-xs">
          {(['ALL', 'OPEN', 'CLAIMED', 'MY_REQUESTS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                statusFilter === tab
                  ? `${themeConfig.navActiveBg} ${themeConfig.navActiveText} font-semibold shadow-sm`
                  : themeConfig.navInactiveText
              }`}
            >
              {tab === 'ALL' && 'All Requests'}
              {tab === 'OPEN' && 'Open & Priority Queue'}
              {tab === 'CLAIMED' && 'Claimed & Scheduled'}
              {tab === 'MY_REQUESTS' && 'My Requests'}
            </button>
          ))}
        </div>

        <span className={`text-xs font-mono tabular-nums ${themeConfig.textMuted}`}>
          Showing {filteredRequests.length} of {requests.length} requests
        </span>
      </div>

      {/* Requests Grid with Zero-Pill Discipline */}
      {filteredRequests.length === 0 ? (
        <div className={`p-12 rounded-2xl border ${themeConfig.panelBorder} text-center space-y-4 max-w-lg mx-auto my-6`}>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`text-base font-bold ${themeConfig.textPrimary}`}>Mock Interview Board is Clear</h4>
            <p className={`text-xs ${themeConfig.textSecondary} mt-1.5 leading-relaxed`}>
              All dummy mock requests have been removed. When candidates complete their AI readiness baseline, their requests will appear here for verified leaders to review and claim.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow"
          >
            Request 1-on-1 Mock Interview
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRequests.map((req) => {
          const effectiveStatus = getEffectiveMockRequestStatus(req);
          const isPreferredActive = effectiveStatus === 'PREFERRED_PENDING';
          const canClaim = canLeaderClaimMockRequest(req, currentUserId, isLeaderVerified).allowed;
          const isMyRequest = req.aspirantId === currentUserId;
          const isClaimedByMe = req.claimedLeaderId === currentUserId;

          // Time remaining for priority
          let timeRemainingText = '';
          if (isPreferredActive && req.preferredExpiresAt) {
            const ms = new Date(req.preferredExpiresAt).getTime() - Date.now();
            const hours = Math.max(0, Math.floor(ms / (1000 * 60 * 60)));
            timeRemainingText = `${hours}h priority window remaining`;
          }

          return (
            <div
              key={req.id}
              className={`border rounded-2xl p-5 flex flex-col justify-between transition duration-200 shadow-sm ${
                isPreferredActive
                  ? 'border-amber-500/50 bg-amber-500/5'
                  : effectiveStatus === 'CLAIMED'
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : `${themeConfig.cardBg} ${themeConfig.panelBorder}`
              }`}
            >
              <div>
                {/* Zero-Pill Unboxed Metadata Header */}
                <div className="flex items-center justify-between text-xs mb-3 text-slate-400">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="font-semibold text-amber-500">{req.interviewType}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>1-on-1 Session</span>
                  </div>

                  {/* Clean text status without candy capsules */}
                  <div>
                    {effectiveStatus === 'PREFERRED_PENDING' && (
                      <span className="text-[11px] font-semibold text-amber-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>48h Priority Active</span>
                      </span>
                    )}
                    {effectiveStatus === 'OPEN_BOARD' && (
                      <span className="text-[11px] font-semibold text-sky-500">
                        Open Board Claimable
                      </span>
                    )}
                    {effectiveStatus === 'CLAIMED' && (
                      <span className="text-[11px] font-semibold text-emerald-500 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Claimed by Leader</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className={`font-bold text-base leading-snug ${themeConfig.textPrimary}`}>
                  {req.targetRole}
                </h3>

                <div className={`text-xs mt-1.5 flex items-center space-x-1.5 ${themeConfig.textSecondary}`}>
                  <span>Candidate:</span>
                  <span className="font-semibold">{req.aspirantNickname}</span>
                </div>

                {/* Preferred leader indicator */}
                {req.preferredLeaderNickname && (
                  <div className={`mt-3 p-2.5 rounded-lg border text-xs ${
                    theme === 'titanium'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300'
                  }`}>
                    <span className="text-slate-400">Tagged Preferred Leader: </span>
                    <strong className="text-amber-500">{req.preferredLeaderNickname}</strong>
                    {isPreferredActive && (
                      <div className="text-[10px] text-amber-500 font-mono mt-0.5">
                        {timeRemainingText}
                      </div>
                    )}
                  </div>
                )}

                {/* Job Description excerpt */}
                <div className={`mt-3 text-xs p-3 rounded-lg border line-clamp-3 leading-relaxed ${
                  theme === 'titanium'
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                }`}>
                  <span className="font-semibold block mb-0.5 text-slate-400">Target Requirements:</span>
                  {req.jobDescription}
                </div>

                {req.notes && (
                  <p className={`mt-2 text-xs italic ${themeConfig.textMuted}`}>"{req.notes}"</p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className={`pt-4 border-t ${themeConfig.panelBorder} mt-4 flex items-center justify-between gap-2`}>
                {effectiveStatus === 'CLAIMED' ? (
                  <div className="w-full flex items-center justify-between">
                    <div className="text-xs text-emerald-500 font-medium">
                      Leader: {req.claimedLeaderNickname}
                    </div>
                    {(isMyRequest || isClaimedByMe || currentUserRole === 'ADMIN') && (
                      <button
                        onClick={() =>
                          onJoinWebRTCRoom(
                            req.webrtcRoomId || 'asc-mock-room',
                            `1-on-1 Mock: ${req.targetRole}`,
                            req.targetRole,
                            req.claimedLeaderNickname || 'IT Leader'
                          )
                        }
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow flex items-center space-x-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Launch WebRTC Room</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <span className={`text-[11px] font-mono tabular-nums ${themeConfig.textMuted}`}>
                      Posted {new Date(req.createdAt).toLocaleDateString()}
                    </span>

                    {currentUserRole === 'LEADER' && canClaim && (
                      <button
                        onClick={() => handleClaim(req)}
                        className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow flex items-center space-x-1"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Claim Session</span>
                      </button>
                    )}

                    {currentUserRole === 'LEADER' && !canClaim && (
                      <span className="text-[11px] text-amber-500 font-medium">
                        {isPreferredActive ? 'Priority to Tagged Leader' : 'Claim Unavailable'}
                      </span>
                    )}

                    {currentUserRole === 'ASPIRANT' && isMyRequest && (
                      <span className="text-xs text-amber-500 font-medium">
                        Awaiting Leader Claim
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Submit Mock Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4 max-h-[90vh] overflow-y-auto ${
            theme === 'titanium'
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#101726] border-slate-700/80 text-slate-100'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Submit 1-on-1 Mock Interview Request</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1 text-slate-400">Target Role Title</label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                    theme === 'titanium'
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                  }`}
                  placeholder="e.g. Director of Infrastructure / VP Engineering"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-slate-400">Interview Category</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value as any)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                      theme === 'titanium'
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                    }`}
                  >
                    <option value="BEHAVIORAL">Behavioral / Leadership</option>
                    <option value="SYSTEM_DESIGN">System Design at Scale</option>
                    <option value="EXECUTIVE_PRESENCE">Executive Presence &amp; Board</option>
                    <option value="HR_ROUND">Senior HR / Cultural Fit</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1 text-slate-400">Tag Preferred Leader (Optional 48h)</label>
                  <select
                    value={preferredLeaderId}
                    onChange={(e) => setPreferredLeaderId(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                      theme === 'titanium'
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                    }`}
                  >
                    <option value="">No preference (Post immediately to Open Board)</option>
                    {leaders.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nickname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Job Description (Target Qualifications)</label>
                <textarea
                  rows={3}
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className={`w-full border rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 leading-relaxed ${
                    theme === 'titanium'
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                  }`}
                  placeholder="Paste snippet of the target executive job description..."
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Resume / CV Attachment</label>
                <input
                  type="text"
                  value={resumeFileName}
                  onChange={(e) => setResumeFileName(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                    theme === 'titanium'
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Candidate Notes / Areas for Critique</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                    theme === 'titanium'
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                  }`}
                  placeholder="e.g. Need feedback on executive presence and STAR storytelling..."
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-lg text-xs"
                >
                  Post Mock Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
