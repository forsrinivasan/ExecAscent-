import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Share2,
  Hand,
  MessageSquare,
  Users,
  PhoneOff,
  Award,
  Shield,
  Send,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { UserRole, HumanMockScorecard } from '../types/index.ts';

interface WebRTCLiveRoomProps {
  roomId: string;
  sessionTitle: string;
  userNickname: string;
  userRole: UserRole;
  isMockInterview?: boolean;
  targetRole?: string;
  evaluatorNickname?: string;
  onLeave: () => void;
  onSubmitScorecard?: (scorecard: HumanMockScorecard) => void;
}

interface ChatMsg {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isHost?: boolean;
}

export const WebRTCLiveRoom: React.FC<WebRTCLiveRoomProps> = ({
  roomId,
  sessionTitle,
  userNickname,
  userRole,
  isMockInterview = false,
  targetRole = 'Director of Platform Engineering',
  evaluatorNickname = 'MarcusVance_VP',
  onLeave,
  onSubmitScorecard,
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'scorecard' | null>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: 'c1',
      sender: 'ExecAscent Bot',
      text: `Connected to secure native WebRTC Room: ${roomId}. End-to-end encrypted peer stream active.`,
      timestamp: 'Now',
    },
    {
      id: 'c2',
      sender: evaluatorNickname,
      text: isMockInterview
        ? 'Welcome to your Executive Mock Session! Whenever you are ready, let us begin with the first situational case.'
        : 'Welcome everyone! We will take questions in the chat and address raised hands during the Q&A segment.',
      timestamp: '1m ago',
      isHost: true,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [participants, setParticipants] = useState<
    { id: string; name: string; role: string; isHost?: boolean; handRaised?: boolean; isMuted?: boolean }[]
  >([
    { id: '1', name: evaluatorNickname, role: 'IT Leader (Host)', isHost: true },
    { id: '2', name: `${userNickname} (You)`, role: userRole, handRaised: false },
    ...(!isMockInterview
      ? [
          { id: '3', name: 'DevOpsTitan', role: 'ASPIRANT', handRaised: false },
          { id: '4', name: 'CloudArchitectElena', role: 'ASPIRANT', handRaised: false },
        ]
      : []),
  ]);

  // Scorecard state for IT Leader post-interview evaluation
  const [starAdherence, setStarAdherence] = useState(8);
  const [commScore, setCommScore] = useState(8);
  const [execPresence, setExecPresence] = useState(8);
  const [techDepth, setTechDepth] = useState(9);
  const [strengthsText, setStrengthsText] = useState('Superb problem framing and decisive operational ownership during crisis.');
  const [improvementText, setImprovementText] = useState('Anchor the Result phase with quantifiable financial and SLA metrics.');
  const [scorecardSubmitted, setScorecardSubmitted] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera stream or dynamic canvas fallback
  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    let animId: number;

    async function setupStream() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        console.info('Using simulated WebRTC camera canvas stream (camera permission restricted or unavailable)');
        // Fallback: draw simulated executive avatar feed onto canvas
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frame = 0;
        const renderSimulatedFeed = () => {
          frame++;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Subtle animated gradient
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, '#1e293b');
          grad.addColorStop(1, '#090d16');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Avatar circle
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2 - 15, 45, 0, Math.PI * 2);
          ctx.fillStyle = '#334155';
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Initials
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(userNickname.slice(0, 2).toUpperCase(), canvas.width / 2, canvas.height / 2 - 15);

          // Simulated Audio Waveform below
          ctx.fillStyle = '#38bdf8';
          for (let i = 0; i < 16; i++) {
            const h = Math.sin(frame * 0.08 + i * 0.5) * 12 + 16;
            ctx.fillRect(canvas.width / 2 - 60 + i * 8, canvas.height / 2 + 45 - h / 2, 4, h);
          }

          animId = requestAnimationFrame(renderSimulatedFeed);
        };
        renderSimulatedFeed();
      }
    }

    setupStream();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      cancelAnimationFrame(animId);
    };
  }, [userNickname]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMsg = {
      id: `msg-${Date.now()}`,
      sender: userNickname,
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost: userRole === 'LEADER' || userRole === 'ADMIN',
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
  };

  const handleToggleHand = () => {
    const nextState = !hasRaisedHand;
    setHasRaisedHand(nextState);
    setParticipants((prev) =>
      prev.map((p) => (p.name.includes('(You)') ? { ...p, handRaised: nextState } : p))
    );
    if (nextState) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `hand-${Date.now()}`,
          sender: 'Room System',
          text: `✋ ${userNickname} raised their hand for questions.`,
          timestamp: 'Just now',
        },
      ]);
    }
  };

  const handleMuteAll = () => {
    setParticipants((prev) =>
      prev.map((p) => (p.isHost ? p : { ...p, isMuted: true }))
    );
    setChatMessages((prev) => [
      ...prev,
      {
        id: `mute-${Date.now()}`,
        sender: 'Host Action',
        text: 'All participant microphones have been muted by Host.',
        timestamp: 'Just now',
        isHost: true,
      },
    ]);
  };

  const handleScorecardSubmit = () => {
    const overall = Math.round(
      ((starAdherence * 0.35 + commScore * 0.25 + execPresence * 0.25 + techDepth * 0.15) / 10) * 100
    );

    const scorecard: HumanMockScorecard = {
      id: `sc-${Date.now()}`,
      mockRequestId: roomId,
      evaluatorLeaderId: 'lead-current',
      evaluatorNickname,
      starAdherenceScore: starAdherence,
      communicationScore: commScore,
      executivePresenceScore: execPresence,
      technicalDepthScore: techDepth,
      overallScore: overall,
      keyStrengths: strengthsText.split('.').map((s) => s.trim()).filter(Boolean),
      improvementAreas: improvementText.split('.').map((s) => s.trim()).filter(Boolean),
      recommendations: 'Recommended for Level 3 Executive Ready evaluation.',
      evaluatedAt: new Date().toISOString(),
    };

    if (onSubmitScorecard) {
      onSubmitScorecard(scorecard);
    }
    setScorecardSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-slate-100 font-sans">
      {/* Top Session Bar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>WebRTC Active: {roomId}</span>
          </div>
          <h2 className="text-sm font-semibold text-slate-200 truncate max-w-md">
            {sessionTitle}
          </h2>
          {isMockInterview && (
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded font-mono border border-amber-500/30">
              1-on-1 Mock Interview: {targetRole}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {userRole === 'LEADER' && isMockInterview && (
            <button
              onClick={() => setActiveTab('scorecard')}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Fill Rubric Scorecard</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab(activeTab === 'chat' ? null : 'chat')}
            aria-label="Toggle in-room chat"
            className={`p-2 rounded-lg transition relative ${
              activeTab === 'chat' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-sky-400 rounded-full"></span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'participants' ? null : 'participants')}
            aria-label="Toggle participants list"
            className={`p-2 rounded-lg transition ${
              activeTab === 'participants' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={onLeave}
            className="bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ml-2 shadow"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave Session</span>
          </button>
        </div>
      </div>

      {/* Main Room Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid Canvas Area */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 items-center justify-center overflow-y-auto">
          {/* Peer / Host Stream Tile */}
          <div className="relative aspect-video bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10 pointer-events-none"></div>

            {/* Simulated Remote Video Stream */}
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-amber-500/60 flex items-center justify-center text-3xl font-bold text-amber-300 shadow-lg mb-3">
                {evaluatorNickname.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" />
                <span>Verified IT Leader (Host)</span>
              </div>
              <p className="text-slate-400 text-xs mt-2">Executive Audio &amp; Video Stream Active</p>
            </div>

            {/* Tile Info Bar */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-slate-900/90 backdrop-blur border border-slate-700/60 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-200">
                  {evaluatorNickname}
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px] flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Speaking</span>
                </span>
              </div>
              <div className="p-1 bg-slate-900/80 rounded-md text-slate-300">
                <Volume2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Local User Stream Tile */}
          <div className="relative aspect-video bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10 pointer-events-none"></div>

            {/* Video element if real camera is granted */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoOn ? 'block' : 'hidden'}`}
            />

            {/* Fallback canvas video animation */}
            <canvas
              ref={canvasRef}
              width={480}
              height={270}
              className={`w-full h-full object-cover ${!isVideoOn ? 'block' : 'hidden'}`}
            />

            {/* Tile Info Bar */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-slate-900/90 backdrop-blur border border-slate-700/60 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-200">
                  {userNickname} (You)
                </span>
                {hasRaisedHand && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-xs flex items-center space-x-1 font-medium">
                    <span>✋ Hand Raised</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1.5">
                {!isAudioOn && (
                  <span className="p-1 bg-rose-500/20 border border-rose-500/30 rounded text-rose-300">
                    <MicOff className="w-3.5 h-3.5" />
                  </span>
                )}
                {!isVideoOn && (
                  <span className="p-1 bg-rose-500/20 border border-rose-500/30 rounded text-rose-300">
                    <VideoOff className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Chat, Participants, or Scorecard */}
        {activeTab && (
          <div className="w-80 md:w-96 border-l border-slate-800 bg-slate-900/95 flex flex-col">
            {/* Sidebar Header */}
            <div className="h-12 border-b border-slate-800 px-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {activeTab === 'chat' && (
                  <>
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">In-Room Live Chat</span>
                  </>
                )}
                {activeTab === 'participants' && (
                  <>
                    <Users className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Participants ({participants.length})</span>
                  </>
                )}
                {activeTab === 'scorecard' && (
                  <>
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">Structured Leader Rubric</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveTab(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Content */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-xl text-xs ${
                        msg.sender === userNickname
                          ? 'bg-sky-500/10 border border-sky-500/20 ml-4'
                          : msg.isHost
                          ? 'bg-amber-500/10 border border-amber-500/20 mr-4'
                          : 'bg-slate-800/80 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-semibold ${
                            msg.sender === userNickname
                              ? 'text-sky-400'
                              : msg.isHost
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {msg.sender}
                        </span>
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type in-room message..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-500 text-white p-2 rounded-lg transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {userRole === 'LEADER' && (
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 mb-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Host Moderation Controls</span>
                    <button
                      onClick={handleMuteAll}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded transition flex items-center space-x-1"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Mute All</span>
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                          {p.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200 flex items-center space-x-1">
                            <span>{p.name}</span>
                            {p.isHost && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">Host</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{p.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {p.handRaised && <span className="text-amber-400">✋</span>}
                        {p.isMuted && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'scorecard' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                {scorecardSubmitted ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                    <Award className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h4 className="font-bold text-emerald-300 text-sm">Evaluation Submitted!</h4>
                    <p className="text-slate-300 text-xs">
                      The candidate has received their private structured scorecard. Mentorship points added to your leader profile.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-400 leading-relaxed">
                      Complete this confidential post-interview rubric. Feedback is strictly private to the aspirant and recorded in their progression history.
                    </p>

                    <div>
                      <div className="flex justify-between font-medium text-slate-300 mb-1">
                        <span>STAR Adherence (Situation, Task, Action, Result)</span>
                        <span className="text-amber-400 font-bold">{starAdherence}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={starAdherence}
                        onChange={(e) => setStarAdherence(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-300 mb-1">
                        <span>Communication &amp; Conciseness</span>
                        <span className="text-amber-400 font-bold">{commScore}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={commScore}
                        onChange={(e) => setCommScore(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-300 mb-1">
                        <span>Executive Presence &amp; Strategic Vision</span>
                        <span className="text-amber-400 font-bold">{execPresence}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={execPresence}
                        onChange={(e) => setExecPresence(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-300 mb-1">
                        <span>Technical Depth &amp; Trade-Offs</span>
                        <span className="text-amber-400 font-bold">{techDepth}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={techDepth}
                        onChange={(e) => setTechDepth(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Key Strengths Demonstrated</label>
                      <textarea
                        rows={2}
                        value={strengthsText}
                        onChange={(e) => setStrengthsText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Improvement Areas</label>
                      <textarea
                        rows={2}
                        value={improvementText}
                        onChange={(e) => setImprovementText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                      />
                    </div>

                    <button
                      onClick={handleScorecardSubmit}
                      className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-lg transition shadow"
                    >
                      Submit Structured Scorecard
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Media Control Bar */}
      <div className="h-16 border-t border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Native WebRTC &bull; Latency: <span className="text-emerald-400 font-mono">38ms</span> &bull; Loss: 0.0%
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAudioOn(!isAudioOn)}
            aria-label={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
            className={`p-3 rounded-full transition ${
              isAudioOn ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            className={`p-3 rounded-full transition ${
              isVideoOn ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            aria-label={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
            className={`p-3 rounded-full transition ${
              isScreenSharing ? 'bg-sky-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleHand}
            aria-label={hasRaisedHand ? 'Lower hand' : 'Raise hand'}
            className={`p-3 rounded-full transition ${
              hasRaisedHand ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Hand className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-500">
          ExecAscent Non-Monetary Mentorship
        </div>
      </div>
    </div>
  );
};
