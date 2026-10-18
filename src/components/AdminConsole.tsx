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
} from 'lucide-react';
import type { ContentPost, LiveSessionEvent, UserRole } from '../types/index.ts';

interface AdminConsoleProps {
  pendingPosts: ContentPost[];
  pendingSessions: LiveSessionEvent[];
  onApprovePost: (postId: string) => void;
  onRejectPost: (postId: string, reason: string) => void;
  onApproveSession: (sessionId: string, webrtcRoomId: string) => void;
  onRejectSession: (sessionId: string, reason: string) => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  pendingPosts,
  pendingSessions,
  onApprovePost,
  onRejectPost,
  onApproveSession,
  onRejectSession,
}) => {
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'SESSIONS' | 'ANALYTICS'>('CONTENT');
  const [rejectingItemId, setRejectingItemId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [roomAssignmentId, setRoomAssignmentId] = useState('');

  const [auditLogs, setAuditLogs] = useState<
    { id: string; time: string; actor: string; action: string; target: string; status: string }[]
  >([
    {
      id: 'log-1',
      time: '10 mins ago',
      actor: 'ExecAscent_Coordinator',
      action: 'APPROVE_CONTENT',
      target: 'The #1 Mistake Staff Engineers Make (post-1)',
      status: 'APPROVED',
    },
    {
      id: 'log-2',
      time: '1 hour ago',
      actor: 'ExecAscent_Coordinator',
      action: 'ASSIGN_WEBRTC_ROOM',
      target: 'Mastering the Executive Behavioral Round (session-1)',
      status: 'asc-live-behavioral-mastery',
    },
  ]);

  const handleConfirmRejectPost = (postId: string) => {
    onRejectPost(postId, rejectionReason || 'Content did not meet community executive decorum standards.');
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: 'Just now',
        actor: 'ExecAscent_Coordinator',
        action: 'REJECT_CONTENT',
        target: postId,
        status: 'REJECTED',
      },
      ...prev,
    ]);
    setRejectingItemId(null);
    setRejectionReason('');
  };

  const handleConfirmApprovePost = (postId: string) => {
    onApprovePost(postId);
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        time: 'Just now',
        actor: 'ExecAscent_Coordinator',
        action: 'APPROVE_CONTENT',
        target: postId,
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
        actor: 'ExecAscent_Coordinator',
        action: 'ASSIGN_WEBRTC_ROOM',
        target: sessionId,
        status: roomId,
      },
      ...prev,
    ]);
    setRoomAssignmentId('');
  };

  return (
    <div className="space-y-6">
      {/* Admin Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Community Trust &amp; Safety &bull; Mandatory Approval Gateway</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Coordinator &amp; Admin Moderation Gateway</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Strict quality assurance: verify user-submitted reels, articles, and proposed WebRTC webinars before public community visibility.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div className="text-center px-3 border-r border-slate-800">
            <span className="text-lg font-bold text-amber-400 block">{pendingPosts.length}</span>
            <span className="text-slate-400 text-[10px]">Pending Posts</span>
          </div>
          <div className="text-center px-3">
            <span className="text-lg font-bold text-indigo-400 block">{pendingSessions.length}</span>
            <span className="text-slate-400 text-[10px]">Pending Sessions</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('CONTENT')}
          className={`pb-3 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'CONTENT'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Pending Content Moderation ({pendingPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SESSIONS')}
          className={`pb-3 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'SESSIONS'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Webinar Room Approvals ({pendingSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`pb-3 border-b-2 transition flex items-center space-x-1.5 ${
            activeTab === 'ANALYTICS'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Health &amp; Audit Logs</span>
        </button>
      </div>

      {/* Tab 1: Content Moderation Queue */}
      {activeTab === 'CONTENT' && (
        <div className="space-y-4">
          {pendingPosts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-slate-200 text-sm">Moderation Queue is Clear</h4>
              <p className="text-xs text-slate-400">All submitted reels and articles have been reviewed.</p>
            </div>
          ) : (
            pendingPosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                      {post.type} &bull; PENDING_APPROVAL
                    </span>
                    <span className="text-xs text-slate-400">
                      Author: <strong className="text-slate-200">{post.authorNickname}</strong>
                    </span>
                  </div>

                  <span className="text-xs text-slate-500">
                    Submitted {new Date(post.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-100">{post.title}</h4>
                  <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    {post.bodyText}
                  </p>
                </div>

                {post.type === 'REEL' && post.mediaUrl && (
                  <div className="text-xs text-slate-400 flex items-center space-x-2">
                    <Video className="w-4 h-4 text-sky-400" />
                    <span>Media URL:</span>
                    <code className="text-slate-300 bg-slate-950 px-2 py-0.5 rounded font-mono truncate max-w-md">
                      {post.mediaUrl}
                    </code>
                  </div>
                )}

                {/* Moderation Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setRejectingItemId(post.id)}
                    className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleConfirmApprovePost(post.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve &amp; Publish to Feed</span>
                  </button>
                </div>

                {/* Rejection Prompt */}
                {rejectingItemId === post.id && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-rose-500/30 space-y-2 text-xs">
                    <label className="text-rose-300 font-medium block">
                      Reason for Rejection (Feedback sent to author):
                    </label>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="E.g., Needs more concrete leadership heuristics rather than generic advice..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-100"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setRejectingItemId(null)}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmRejectPost(post.id)}
                        className="px-3 py-1 bg-rose-600 text-white font-bold rounded"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Webinar Room Approvals */}
      {activeTab === 'SESSIONS' && (
        <div className="space-y-4">
          {pendingSessions.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-slate-200 text-sm">No Pending Webinar Proposals</h4>
              <p className="text-xs text-slate-400">All proposed live sessions have been reviewed.</p>
            </div>
          ) : (
            pendingSessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full">
                    LIVE_SESSION &bull; PENDING_APPROVAL
                  </span>
                  <span className="text-xs text-slate-400">
                    Host: <strong className="text-slate-200">{sess.hostLeaderNickname}</strong>
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-100">{sess.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{sess.description}</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex flex-wrap gap-4 text-slate-300">
                  <div>
                    <span className="text-slate-500 block">Proposed Date:</span>
                    <span>{new Date(sess.scheduledTime).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duration:</span>
                    <span>{sess.durationMinutes} Minutes</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Capacity:</span>
                    <span>{sess.capacity} Participants</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex-1 max-w-xs">
                    <input
                      type="text"
                      placeholder="Assign WebRTC Room ID (optional)"
                      value={roomAssignmentId}
                      onChange={(e) => setRoomAssignmentId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onRejectSession(sess.id, 'Session slot conflicts with community calendar.')}
                      className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleConfirmApproveSession(sess.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve &amp; Assign WebRTC Room</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: System Analytics & Audit Log */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 text-xs block mb-1">Total Verified Members</span>
              <span className="text-2xl font-extrabold text-slate-100">1,480</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 text-xs block mb-1">Active Volunteer Leaders</span>
              <span className="text-2xl font-extrabold text-amber-400">42</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 text-xs block mb-1">Mocks Conducted</span>
              <span className="text-2xl font-extrabold text-emerald-400">318</span>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-slate-400 text-xs block mb-1">WebRTC Uptime SLA</span>
              <span className="text-2xl font-extrabold text-sky-400">99.98%</span>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-200">Platform Operational Audit Trail</h4>
              <span className="text-xs text-slate-500 font-mono">Immutable Log</span>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target / Resource</th>
                    <th className="p-3">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-400">{log.time}</td>
                      <td className="p-3 font-semibold text-slate-200">{log.actor}</td>
                      <td className="p-3 font-mono text-amber-400">{log.action}</td>
                      <td className="p-3 text-slate-300 truncate max-w-xs">{log.target}</td>
                      <td className="p-3">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono text-[10px]">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
