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
} from 'lucide-react';
import type { HumanMockRequest, User, UserRole } from '../types/index.ts';
import {
  calculatePriorityExpiration,
  getEffectiveMockRequestStatus,
  canLeaderClaimMockRequest,
  claimMockRequest,
} from '../utils/mockMatcher.ts';

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
      {/* Board Hero & Call-to-action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Open Request Board &bull; Volunteer Executive Mentorship</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">1-on-1 Human Mock Interview Board</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Submit a real job description &amp; resume. Optionally tag 1 Preferred Leader with a <strong>48-hour exclusive priority window</strong> before opening to the public leader board. 100% volunteer-led; no fees or payments.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Request 1-on-1 Mock Interview</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex space-x-2 text-xs">
          {(['ALL', 'OPEN', 'CLAIMED', 'MY_REQUESTS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                statusFilter === tab
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL' && 'All Requests'}
              {tab === 'OPEN' && 'Open & Priority Queue'}
              {tab === 'CLAIMED' && 'Claimed & Scheduled'}
              {tab === 'MY_REQUESTS' && 'My Requests / Engagements'}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Showing {filteredRequests.length} of {requests.length} requests
        </span>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition hover:border-slate-700 shadow-md ${
                isPreferredActive
                  ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-900'
                  : effectiveStatus === 'CLAIMED'
                  ? 'border-emerald-500/40'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header status badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {req.interviewType}
                  </span>

                  {effectiveStatus === 'PREFERRED_PENDING' && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>Preferred Priority Active</span>
                    </span>
                  )}
                  {effectiveStatus === 'OPEN_BOARD' && (
                    <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Open Board Claimable
                    </span>
                  )}
                  {effectiveStatus === 'CLAIMED' && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Claimed by Leader</span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-100 text-base leading-snug">{req.targetRole}</h3>

                <div className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                  <span>Candidate:</span>
                  <span className="text-slate-200 font-semibold">{req.aspirantNickname}</span>
                </div>

                {/* Preferred leader indicator */}
                {req.preferredLeaderNickname && (
                  <div className="mt-3 p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                    <span className="text-slate-400">Tagged Preferred Leader: </span>
                    <strong className="text-amber-300">{req.preferredLeaderNickname}</strong>
                    {isPreferredActive && (
                      <div className="text-[10px] text-amber-400/80 mt-0.5 font-mono">
                        ⏳ {timeRemainingText}
                      </div>
                    )}
                  </div>
                )}

                {/* Job Description excerpt */}
                <div className="mt-3 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 line-clamp-3">
                  <span className="text-slate-400 font-semibold block mb-0.5">Role Requirements:</span>
                  {req.jobDescription}
                </div>

                {req.notes && (
                  <p className="mt-2 text-[11px] text-slate-400 italic">"{req.notes}"</p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-2">
                {effectiveStatus === 'CLAIMED' ? (
                  <div className="w-full flex items-center justify-between">
                    <div className="text-xs text-emerald-400 font-medium">
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
                    <span className="text-[10px] text-slate-500">
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
                      <span className="text-[10px] text-amber-500/80 italic">
                        {isPreferredActive ? 'Reserved for Preferred Leader' : 'Cannot Claim'}
                      </span>
                    )}

                    {currentUserRole === 'ASPIRANT' && isMyRequest && (
                      <span className="text-xs text-amber-400 font-medium">
                        Awaiting Leader Claim...
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Mock Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Submit 1-on-1 Human Mock Request</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Designation / Role</label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="BEHAVIORAL">Behavioral (STAR Method, People Leadership, Conflict)</option>
                  <option value="SITUATIONAL">Situational (System Incident Command, FinOps Trade-offs)</option>
                  <option value="HR">HR Calibration &amp; Executive Scope</option>
                  <option value="EXECUTIVE_STRATEGY">Executive Strategy &amp; Board-Level Presence</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Job Description / Key Criteria</label>
                <textarea
                  rows={3}
                  required
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste key responsibilities and expectations for the role..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Optional: Tag 1 Preferred IT Leader (48h Priority)</label>
                <select
                  value={preferredLeaderId}
                  onChange={(e) => setPreferredLeaderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">None (Publish immediately to Open Board)</option>
                  {leaders.map((leader) => (
                    <option key={leader.id} value={leader.id}>
                      {leader.nickname} ({leader.email})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tagging a leader gives them exclusive claim rights for 48 hours. If unclaimed or declined, your request automatically routes to the public Open Board.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Additional Notes for the Leader</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., Special areas where you want tough scrutiny..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg transition shadow"
                >
                  Submit Mock Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
