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
} from 'lucide-react';
import type { LiveTopicRequest, LiveSessionEvent, UserRole } from '../types/index.ts';

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

    const roomId = `asc-live-${Math.random().toString(36).substring(2, 9)}`;

    const newSession: LiveSessionEvent = {
      id: `sess-${Date.now()}`,
      topicRequestId: selectedTopicToHost?.id,
      title: proposeTitle.trim(),
      description: proposeDesc.trim(),
      hostLeaderId: currentUserId,
      hostLeaderNickname: currentUserNickname,
      hostRole: 'Volunteer IT Executive Mentor',
      scheduledTime: new Date(proposeTime).toISOString(),
      durationMinutes: durationMins,
      webrtcRoomId: roomId,
      capacity: 100,
      status: 'PROPOSED',
      approvalStatus: 'PENDING_APPROVAL', // Mandatory Admin Moderation Gateway
      tags: ['#WebRTC', '#ExecutiveMasterclass', '#Leadership'],
      attendeesCount: 1,
      isUserRsvp: true,
    };

    onProposeSession(newSession);
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
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Video className="w-4 h-4" />
            <span>Native In-App WebRTC Video &bull; No 3rd-Party Redirects</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Live Executive Webinars &amp; Demand Aggregation</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Aspirants submit and vote on high-impact session topics. Volunteer IT Leaders schedule and host interactive native WebRTC video seminars with real-time Q&amp;A.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition border border-slate-700 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Request a Topic</span>
          </button>

          {currentUserRole === 'LEADER' && (
            <button
              onClick={() => handleOpenProposeModal()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow flex items-center space-x-1.5"
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
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Scheduled &amp; Upcoming WebRTC Webinars</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {liveSessions.filter((s) => s.approvalStatus === 'APPROVED').length} Approved Sessions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition hover:border-slate-700 shadow-lg ${
                    isPending ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formattedDate} &bull; {formattedTime} ({session.durationMinutes}m)
                        </span>
                      </span>

                      {isPending ? (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                          Pending Admin Room Approval
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                          WebRTC Room Ready
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-100 text-base">{session.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{session.description}</p>

                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <span>Host:</span>
                      <strong className="text-slate-200">{session.hostLeaderNickname}</strong>
                      <span className="text-slate-500">({session.hostRole})</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {session.tags.map((t) => (
                        <span key={t} className="text-[10px] text-sky-400 font-mono bg-slate-950 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer RSVP & Launch WebRTC Room */}
                  <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {session.attendeesCount} / {session.capacity} RSVPs
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadICS(session)}
                        title="Download .ics Calendar Invite"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleRSVP(session.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          session.isUserRsvp
                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {session.isUserRsvp ? '✓ Attending' : 'RSVP'}
                      </button>

                      <button
                        onClick={() =>
                          onJoinWebRTC(session.webrtcRoomId, session.title, session.hostLeaderNickname)
                        }
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow flex items-center space-x-1.5"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Live WebRTC</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Section 2: Demand-Driven Topic Aggregation */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Community Requested Topics (Demand Aggregation)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Vote on topics you want IT Leaders to host. IT Leaders review high-demand requests to schedule group masterclasses.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topicRequests.map((req) => (
            <div
              key={req.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4 transition hover:border-slate-700"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    {req.targetLevel}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Requested by {req.requesterNickname}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-100">{req.topic}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{req.description}</p>

                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Preferred: {req.preferredTimeWindows.join(' | ')}</span>
                </div>
              </div>

              {/* Upvote & Leader Host Button */}
              <div className="flex flex-col items-center space-y-2 shrink-0">
                <button
                  onClick={() => onTopicUpvote(req.id)}
                  className="flex flex-col items-center justify-center bg-slate-950 border border-slate-800 hover:border-sky-500/50 p-2 rounded-xl transition text-slate-300 hover:text-sky-400"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-xs font-bold mt-0.5">{req.upvotes}</span>
                </button>

                {currentUserRole === 'LEADER' && (
                  <button
                    onClick={() => handleOpenProposeModal(req)}
                    className="text-[10px] font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white px-2 py-1 rounded-lg transition"
                  >
                    Host This
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Topic Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-sky-400" />
                <span>Request a Live Session Topic</span>
              </h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTopicRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="E.g., How to frame cross-functional dissent during Director interviews"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Audience &amp; Seniority Level</label>
                <input
                  type="text"
                  required
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Context &amp; Questions to Cover</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Specific questions or scenarios you want experienced leaders to break down..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Preferred Time Windows</label>
                <input
                  type="text"
                  value={preferredWindows}
                  onChange={(e) => setPreferredWindows(e.target.value)}
                  placeholder="E.g., Weekday Evenings (7 PM EST), Saturday 11 AM EST"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition shadow"
                >
                  Submit Topic Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Propose Session Modal (Leaders Only) */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Propose Live WebRTC Webinar</span>
              </h3>
              <button
                onClick={() => setShowProposeModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Admin Room Gateway:</strong> Your proposed webinar will be submitted to Coordinators for room schedule verification and approval.
              </p>
            </div>

            <form onSubmit={handleSubmitPropose} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={proposeTitle}
                  onChange={(e) => setProposeTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Session Agenda &amp; Takeaways</label>
                <textarea
                  rows={3}
                  required
                  value={proposeDesc}
                  onChange={(e) => setProposeDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={proposeTime}
                    onChange={(e) => setProposeTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duration (Minutes)</label>
                  <select
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={75}>75 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition shadow"
                >
                  Submit for Room Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
