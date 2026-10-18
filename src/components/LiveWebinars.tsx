import React, { useState } from 'react';
import {
  Calendar,
  Video,
  ThumbsUp,
  Clock,
  Plus,
  Users,
  CheckCircle,
  Download,
  AlertCircle,
  ChevronRight,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import type { LiveTopicRequest, LiveSessionEvent, UserRole } from '../types/index.ts';
import { useExecutiveTheme } from '../theme/ThemeContext.tsx';

interface LiveWebinarsProps {
  topicRequests: LiveTopicRequest[];
  liveSessions: LiveSessionEvent[];
  currentUserNickname: string;
  currentUserId: string;
  currentUserRole: UserRole;
  onTopicRequestSubmit: (req: LiveTopicRequest) => void;
  onTopicUpvote: (topicId: string) => void;
  onProposeSession: (session: LiveSessionEvent) => void;
  onToggleRSVP: (sessionId: string) => void;
  onJoinWebRTC: (roomId: string, title: string, hostNickname: string) => void;
}

export const LiveWebinars: React.FC<LiveWebinarsProps> = ({
  topicRequests,
  liveSessions,
  currentUserNickname,
  currentUserId,
  currentUserRole,
  onTopicRequestSubmit,
  onTopicUpvote,
  onProposeSession,
  onToggleRSVP,
  onJoinWebRTC,
}) => {
  const { theme, themeConfig } = useExecutiveTheme();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [selectedTopicToHost, setSelectedTopicToHost] = useState<LiveTopicRequest | null>(null);

  // Topic Request state
  const [newTopic, setNewTopic] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [targetLevel, setTargetLevel] = useState('Staff Engineer -> Director of Engineering');
  const [preferredWindows, setPreferredWindows] = useState('Weekend Mornings (10 AM EST), Weekdays (6 PM EST)');

  // Propose Session state
  const [proposeTitle, setProposeTitle] = useState('');
  const [proposeDesc, setProposeDesc] = useState('');
  const [proposeTime, setProposeTime] = useState(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [durationMins, setDurationMins] = useState(60);

  const handleCreateTopicRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const req: LiveTopicRequest = {
      id: `req-top-${Date.now()}`,
      requesterId: currentUserId,
      requesterNickname: currentUserNickname,
      topic: newTopic.trim(),
      description: newDesc.trim(),
      targetLevel,
      preferredTimeWindows: preferredWindows.split(',').map((w) => w.trim()).filter(Boolean),
      upvotes: 1,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    onTopicRequestSubmit(req);
    setShowRequestModal(false);
    setNewTopic('');
    setNewDesc('');
  };

  const handleOpenProposeModal = (topic?: LiveTopicRequest) => {
    if (topic) {
      setSelectedTopicToHost(topic);
      setProposeTitle(`Masterclass: ${topic.topic}`);
      setProposeDesc(topic.description);
    } else {
      setSelectedTopicToHost(null);
      setProposeTitle('Executive Incident Command & Strategic Decision Making');
      setProposeDesc('Interactive live simulation covering architectural crisis leadership and board communication.');
    }
    setShowProposeModal(true);
  };

  const handleSubmitPropose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeTitle.trim()) return;

    const newSess: LiveSessionEvent = {
      id: `sess-${Date.now()}`,
      hostLeaderId: currentUserId,
      hostLeaderNickname: currentUserNickname,
      hostRole: 'VP of Engineering',
      title: proposeTitle.trim(),
      description: proposeDesc.trim(),
      scheduledTime: new Date(proposeTime).toISOString(),
      durationMinutes: durationMins,
      webrtcRoomId: `asc-live-${Date.now()}`,
      capacity: 100,
      approvalStatus: 'PENDING_APPROVAL', // Mandatory Admin Room Approval Gateway
      status: 'SCHEDULED',
      tags: ['#ExecutiveMasterclass', '#Leadership'],
      attendeesCount: 1,
      isUserRsvp: true,
    };

    onProposeSession(newSess);
    setShowProposeModal(false);
  };

  const downloadICS = (session: LiveSessionEvent) => {
    const startDate = new Date(session.scheduledTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(new Date(session.scheduledTime).getTime() + session.durationMinutes * 60000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, '');

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ExecAscent//Live Webinars//EN
BEGIN:VEVENT
UID:${session.id}@execascent.org
DTSTAMP:${startDate}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:ExecAscent: ${session.title}
DESCRIPTION:${session.description}\\n\\nNative WebRTC Room: ${session.webrtcRoomId}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ExecAscent_${session.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm`}>
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider mb-1 text-amber-500">
            <Video className="w-4 h-4" />
            <span>Native In-App WebRTC Video &bull; Zero External Redirects</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Live Executive Webinars &amp; Demand Aggregation</h2>
          <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${themeConfig.textSecondary}`}>
            Aspirants submit and vote on high-impact executive topics. Volunteer IT Leaders schedule and host interactive native WebRTC video seminars with real-time Q&amp;A.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition border flex items-center space-x-1.5 ${
              theme === 'titanium'
                ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Request a Topic</span>
          </button>

          {currentUserRole === 'LEADER' && (
            <button
              onClick={() => handleOpenProposeModal()}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Propose &amp; Host Webinar</span>
            </button>
          )}
        </div>
      </div>

      {/* Section 1: Scheduled Live Webinars */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-base font-bold flex items-center space-x-2 ${themeConfig.textPrimary}`}>
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Scheduled &amp; Upcoming WebRTC Webinars</span>
          </h3>
          <span className={`text-xs font-mono tabular-nums ${themeConfig.textMuted}`}>
            {liveSessions.filter((s) => s.approvalStatus === 'APPROVED').length} Approved Sessions
          </span>
        </div>

        {liveSessions.filter((s) => s.approvalStatus === 'APPROVED' || currentUserRole === 'ADMIN').length === 0 ? (
          <div className={`p-10 rounded-2xl border ${themeConfig.panelBorder} text-center space-y-3`}>
            <Calendar className="w-8 h-8 text-amber-500 mx-auto" />
            <p className={`text-sm font-semibold ${themeConfig.textPrimary}`}>No Webinars Scheduled Yet</p>
            <p className={`text-xs ${themeConfig.textSecondary}`}>
              All dummy sessions have been cleared. As an Administrator or verified leader, schedule a live WebRTC masterclass using the button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {liveSessions
            .filter((s) => s.approvalStatus === 'APPROVED' || currentUserRole === 'ADMIN')
            .map((session) => {
              const isPending = session.approvalStatus === 'PENDING_APPROVAL';
              const dateObj = new Date(session.scheduledTime);
              const formattedDate = dateObj.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = dateObj.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={session.id}
                  className={`border rounded-2xl p-5 flex flex-col justify-between transition duration-200 shadow-sm ${
                    isPending
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : `${themeConfig.cardBg} ${themeConfig.panelBorder}`
                  }`}
                >
                  <div className="space-y-3">
                    {/* Zero-Pill Unboxed Schedule Metadata */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center space-x-2 font-mono text-[11px] text-amber-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formattedDate} &bull; {formattedTime} ({session.durationMinutes}m)
                        </span>
                      </div>

                      {isPending ? (
                        <span className="text-[11px] font-mono text-amber-500 font-medium">
                          Pending Room Approval
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-500 font-medium">
                          WebRTC Room Ready
                        </span>
                      )}
                    </div>

                    <h4 className={`font-bold text-base leading-snug ${themeConfig.textPrimary}`}>
                      {session.title}
                    </h4>
                    <p className={`text-xs leading-relaxed ${themeConfig.textSecondary}`}>
                      {session.description}
                    </p>

                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <span>Host:</span>
                      <strong className={themeConfig.textPrimary}>{session.hostLeaderNickname}</strong>
                      <span className="text-slate-500">({session.hostRole})</span>
                    </div>

                    {/* Unboxed tags */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      {session.tags.map((t, idx) => (
                        <React.Fragment key={t}>
                          {idx > 0 && <span aria-hidden="true">&bull;</span>}
                          <span>{t}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className={`mt-5 pt-4 border-t ${themeConfig.panelBorder} flex items-center justify-between gap-2`}>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono tabular-nums">{session.attendeesCount} RSVPed</span>
                      </span>

                      <button
                        onClick={() => downloadICS(session)}
                        className="hover:text-amber-500 transition flex items-center space-x-1"
                        title="Download Calendar Invite (.ics)"
                      >
                        <Download className="w-3 h-3" />
                        <span className="hidden sm:inline">.ics</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onToggleRSVP(session.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          session.isUserRsvp
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : 'border-slate-700 hover:border-slate-500 text-slate-300'
                        }`}
                      >
                        {session.isUserRsvp ? '✓ RSVP Confirmed' : 'RSVP Now'}
                      </button>

                      {session.approvalStatus === 'APPROVED' && (
                        <button
                          onClick={() =>
                            onJoinWebRTC(
                              session.webrtcRoomId || 'live-seminar',
                              session.title,
                              session.hostLeaderNickname
                            )
                          }
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow flex items-center space-x-1.5"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join WebRTC</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        )}
      </div>

      {/* Section 2: Aspirant Demand Aggregation & Topic Voting */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-bold flex items-center space-x-2 ${themeConfig.textPrimary}`}>
              <ThumbsUp className="w-4 h-4 text-sky-400" />
              <span>Requested Executive Masterclass Topics (Demand Board)</span>
            </h3>
            <p className={`text-xs mt-0.5 ${themeConfig.textSecondary}`}>
              Aspirants vote on what topics volunteer leaders should cover next. High-demand topics are prioritized.
            </p>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="text-xs font-semibold text-amber-500 hover:underline"
          >
            + Submit New Topic
          </button>
        </div>

        {topicRequests.length === 0 ? (
          <div className={`p-8 rounded-2xl border ${themeConfig.panelBorder} text-center space-y-2`}>
            <ThumbsUp className="w-6 h-6 text-sky-400 mx-auto" />
            <p className={`text-xs font-semibold ${themeConfig.textPrimary}`}>No Topic Requests Submitted Yet</p>
            <p className={`text-[11px] ${themeConfig.textSecondary}`}>
              Aspirants can submit topics they want covered by leadership. Click "+ Submit New Topic" to propose one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topicRequests.map((req) => (
              <div
                key={req.id}
                className={`border rounded-2xl p-4 flex flex-col justify-between transition shadow-sm ${themeConfig.cardBg} ${themeConfig.panelBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-amber-500">{req.targetLevel}</span>
                    <button
                      onClick={() => onTopicUpvote(req.id)}
                      className="flex items-center space-x-1 text-slate-400 hover:text-amber-500 transition text-xs font-mono"
                      title="Vote for this topic"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="tabular-nums font-bold">{req.upvotes}</span>
                    </button>
                  </div>

                  <h4 className={`font-bold text-sm leading-snug ${themeConfig.textPrimary}`}>
                    {req.topic}
                  </h4>
                  <p className={`text-xs mt-1.5 line-clamp-3 leading-relaxed ${themeConfig.textSecondary}`}>
                    {req.description}
                  </p>

                  <div className={`mt-3 text-[11px] ${themeConfig.textMuted}`}>
                    <span>Requested Windows: </span>
                    <span className="font-mono">{req.preferredTimeWindows.join(' · ')}</span>
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t ${themeConfig.panelBorder} flex items-center justify-between text-xs`}>
                  <span className={themeConfig.textMuted}>By {req.requesterNickname}</span>
                  {currentUserRole === 'LEADER' && (
                    <button
                      onClick={() => handleOpenProposeModal(req)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Host This Topic &rarr;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Topic Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4 ${
            theme === 'titanium'
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#101726] border-slate-700/80 text-slate-100'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>Submit Masterclass Topic Request</span>
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopicRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1 text-slate-400">Masterclass Topic Title</label>
                <input
                  type="text"
                  required
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                    theme === 'titanium'
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                  }`}
                  placeholder="e.g. Navigating Multi-Million Dollar Cloud Budgets with CFOs"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Target Career Transition</label>
                <input
                  type="text"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                    theme === 'titanium'
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Description &amp; Key Questions</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className={`w-full border rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 ${
                    theme === 'titanium'
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                  }`}
                  placeholder="What specific scenarios or heuristics would you like the executive leader to unpack?"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Preferred Scheduling Windows</label>
                <input
                  type="text"
                  value={preferredWindows}
                  onChange={(e) => setPreferredWindows(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                    theme === 'titanium'
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-lg text-xs"
                >
                  Post Topic Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Propose Webinar Modal (Leader Only) */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4 ${
            theme === 'titanium'
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#101726] border-slate-700/80 text-slate-100'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Host Volunteer WebRTC Webinar</span>
              </h3>
              <button
                onClick={() => setShowProposeModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPropose} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1 text-slate-400">Session Title</label>
                <input
                  type="text"
                  required
                  value={proposeTitle}
                  onChange={(e) => setProposeTitle(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                    theme === 'titanium'
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Description &amp; Agenda</label>
                <textarea
                  rows={3}
                  required
                  value={proposeDesc}
                  onChange={(e) => setProposeDesc(e.target.value)}
                  className={`w-full border rounded-lg p-3 text-xs focus:outline-none focus:border-amber-500 ${
                    theme === 'titanium'
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-slate-400">Scheduled Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={proposeTime}
                    onChange={(e) => setProposeTime(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                      theme === 'titanium'
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1 text-slate-400">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="30"
                    max="180"
                    value={durationMins}
                    onChange={(e) => setDurationMins(parseInt(e.target.value))}
                    className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                      theme === 'titanium'
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div className={`p-3 rounded-lg border text-[11px] ${
                theme === 'titanium'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                Note: Session proposals route through the Admin Moderation Gateway for room ID provision before appearing on the public calendar.
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-lg text-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
