import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Award,
  Sparkles,
  Shield,
  FileText,
  AlertCircle,
  Download,
  Trash2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import type { AIVoiceSession, AIScorecardResult, TranscriptTurn } from '../types/index.ts';
import { evaluateCandidateResponse } from '../utils/scorecardEvaluator.ts';
import { maskPIIInDocument } from '../utils/privacyFilter.ts';
import { useExecutiveTheme } from '../theme/ThemeContext.tsx';

interface AIVoiceSimulatorProps {
  userNickname: string;
  onSaveToCareerPlan?: (result: AIScorecardResult) => void;
  onClose?: () => void;
}

export const AIVoiceSimulator: React.FC<AIVoiceSimulatorProps> = ({
  userNickname,
  onSaveToCareerPlan,
  onClose,
}) => {
  const { theme, themeConfig } = useExecutiveTheme();
  // Step in simulator: 'SETUP' | 'CONSENT' | 'INTERVIEW' | 'EVALUATION'
  const [step, setStep] = useState<'SETUP' | 'CONSENT' | 'INTERVIEW' | 'EVALUATION'>('SETUP');

  // Setup inputs
  const [targetRole, setTargetRole] = useState('Director of Platform Engineering');
  const [interviewCategory, setInterviewCategory] = useState<'BEHAVIORAL' | 'SITUATIONAL' | 'HR'>('BEHAVIORAL');
  const [jobDescription, setJobDescription] = useState(
    'Leading 40+ platform engineers across multi-region Kubernetes, cloud infrastructure, and developer productivity. Driving high reliability SLAs and executive cross-functional alignment.'
  );
  const [resumeText, setResumeText] = useState(
    '12 years in distributed backend systems and site reliability. Led migration of 300+ microservices to Kubernetes. Mentored 15 senior engineers and tech leads.'
  );
  const [isMaskingPII, setIsMaskingPII] = useState(true);

  // Interview state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [transcriptLog, setTranscriptLog] = useState<TranscriptTurn[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAnswerInput, setCurrentAnswerInput] = useState('');
  const [scorecardResult, setScorecardResult] = useState<AIScorecardResult | null>(null);
  const [audioLatencySLA, setAudioLatencySLA] = useState('0.85s (sub-1.2s SLA)');

  // Waveform canvas
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);

  // Setup speech synthesis and recognition
  useEffect(() => {
    // Check for Web Speech API recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              setCurrentAnswerInput((prev) => `${prev} ${event.results[i][0].transcript}`.trim());
            } else {
              interim += event.results[i][0].transcript;
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition status:', e.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }
  }, []);

  // Animated Waveform loop
  useEffect(() => {
    let animId: number;
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const renderWave = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 32;
      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        let height = 6;
        if (isSpeaking) {
          height = Math.sin(frame * 0.15 + i * 0.4) * 24 + 28;
        } else if (isListening) {
          height = Math.cos(frame * 0.2 + i * 0.3) * 18 + 22;
        }

        ctx.fillStyle = isSpeaking ? '#f59e0b' : isListening ? '#38bdf8' : '#475569';
        ctx.fillRect(i * (barWidth + 2), canvas.height / 2 - height / 2, barWidth, height);
      }

      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, isListening]);

  // Handle document analysis & question formulation via server API
  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const sanitizedResume = isMaskingPII ? maskPIIInDocument(resumeText) : resumeText;

      const res = await fetch('/api/ai/analyze-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          interviewCategory,
          jobDescription,
          resumeText: sanitizedResume,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions([
          `Tell me about a high-stakes decision where executive stakeholders disagreed with your architectural vision for ${targetRole}.`,
          'Describe a major production incident at scale. What was your immediate response, how did you coordinate cross-functional incident command, and what cultural changes resulted?',
          'How do you balance tech debt remediation against high-pressure quarterly feature roadmaps?',
          'Walk me through how you coached and leveled up an underperforming senior engineer.',
          'What strategies do you employ to translate technical roadmaps into executive financial metrics?',
        ]);
      }
      setStep('CONSENT');
    } catch (err) {
      console.warn('API error, using local fallback questions:', err);
      setQuestions([
        `Tell me about a high-stakes decision where executive stakeholders disagreed with your architectural vision for ${targetRole}.`,
        'Describe a major production incident at scale. What was your immediate response, how did you coordinate cross-functional incident command, and what cultural changes resulted?',
        'How do you balance tech debt remediation against high-pressure quarterly feature roadmaps?',
        'Walk me through how you coached and leveled up an underperforming senior engineer.',
        'What strategies do you employ to translate technical roadmaps into executive financial metrics?',
      ]);
      setStep('CONSENT');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBeginInterview = () => {
    setStep('INTERVIEW');
    setCurrentQIndex(0);
    const firstQ = questions[0];
    const initialTurn: TranscriptTurn = {
      id: `t-${Date.now()}`,
      speaker: 'AI_INTERVIEWER',
      text: firstQ,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTranscriptLog([initialTurn]);
    speakText(firstQ);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;

      // Select natural sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Male'))
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2500);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      // Barge-in: cancel AI speech if user starts speaking
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.warn('Recognition start error:', e);
          setIsListening(true);
        }
      } else {
        setIsListening(true);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswerInput.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const candidateTurn: TranscriptTurn = {
      id: `t-cand-${Date.now()}`,
      speaker: 'CANDIDATE',
      text: currentAnswerInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedLog = [...transcriptLog, candidateTurn];
    setTranscriptLog(updatedLog);
    setCurrentAnswerInput('');

    // Advance to next question or complete
    if (currentQIndex < questions.length - 1) {
      const nextIndex = currentQIndex + 1;
      setCurrentQIndex(nextIndex);
      const nextQ = questions[nextIndex];
      const aiTurn: TranscriptTurn = {
        id: `t-ai-${Date.now()}`,
        speaker: 'AI_INTERVIEWER',
        text: nextQ,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTranscriptLog([...updatedLog, aiTurn]);
      speakText(nextQ);
    } else {
      // Complete interview -> generate evaluation
      setStep('EVALUATION');
      await generateScorecard(updatedLog);
    }
  };

  const generateScorecard = async (logs: TranscriptTurn[]) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/evaluate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          interviewCategory,
          transcriptLog: logs,
        }),
      });
      const data = await res.json();
      if (data && data.overallReadiness !== undefined) {
        setScorecardResult(data);
      } else {
        throw new Error('Fallback required');
      }
    } catch {
      // Use pure logic evaluator
      const candAnswers = logs
        .filter((l) => l.speaker === 'CANDIDATE')
        .map((l) => l.text)
        .join(' ');
      const evalResult = evaluateCandidateResponse(candAnswers, targetRole);

      setScorecardResult({
        overallReadiness: evalResult.overallReadiness,
        starMetrics: evalResult.starMetrics,
        executivePresence: {
          toneScore: evalResult.toneScore,
          concisenessScore: evalResult.concisenessScore,
          fillerWordDensity: evalResult.fillerWordDensity,
        },
        strengths: evalResult.strengths,
        improvementAreas: evalResult.improvementAreas,
        modelSuggestedAnswers: [
          {
            question: questions[0] || 'Executive conflict resolution',
            suggestedStructure:
              'Situation (20s): Set the business stakes -> Task: Quantified SLA -> Action (60s): Collaborative trade-off matrix -> Result (30s): Zero outages, $1.2M cloud savings.',
          },
        ],
        summary: `Strong candidate delivery for ${targetRole}. Focus on quantifying business outcomes and articulating architectural trade-offs with commercial awareness.`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteTranscript = () => {
    setTranscriptLog([]);
    setScorecardResult(null);
    setStep('SETUP');
  };

  return (
    <div className={`${themeConfig.cardBg} border ${themeConfig.panelBorder} rounded-2xl overflow-hidden shadow-2xl ${themeConfig.textPrimary} transition-colors`}>
      {/* Simulator Header */}
      <div className={`p-5 border-b ${themeConfig.panelBorder} ${theme === 'titanium' ? 'bg-slate-50' : 'bg-slate-950/70'} flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold text-base flex items-center space-x-2 ${themeConfig.textPrimary}`}>
              <span>Executive Voice AI Mock Simulator</span>
              <span className="text-xs font-mono text-sky-500 font-normal">
                · Full-Duplex Audio / RAG
              </span>
            </h3>
            <p className={`text-xs ${themeConfig.textSecondary}`}>
              Interactive STAR Interview Practice &bull; Persona: Senior VP of Engineering AI
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Audio SLA:</span>
          <span className="text-emerald-400 font-mono font-medium">{audioLatencySLA}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 ml-2 transition"
              aria-label="Close simulator"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Step 1: Document Upload & Setup */}
      {step === 'SETUP' && (
        <div className="p-6 space-y-6">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-semibold text-amber-300 flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>1. Target Role &amp; Interview Grounding (RAG Context)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Executive Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Interview Category
                </label>
                <select
                  value={interviewCategory}
                  onChange={(e) => setInterviewCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="BEHAVIORAL">Behavioral (Leadership, Conflict, Trade-offs)</option>
                  <option value="SITUATIONAL">Situational (Crisis Command, 10x Scale, FinOps)</option>
                  <option value="HR">HR Calibration (Culture, Executive Scope)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Job Description / Key Competencies
              </label>
              <textarea
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Candidate Profile / Resume Summary
              </label>
              <textarea
                rows={2}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="maskPII"
                checked={isMaskingPII}
                onChange={(e) => setIsMaskingPII(e.target.checked)}
                className="accent-amber-500 w-4 h-4 rounded"
              />
              <label htmlFor="maskPII" className="text-xs text-slate-300">
                Automated PII Masking: Redact personal emails, telephone numbers, and addresses before processing.
              </label>
            </div>
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition shadow flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>RAG Document Parsing &amp; Custom STAR Question Generation...</span>
              </>
            ) : (
              <>
                <span>Generate Customized Interview &bull; Proceed to Consent</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Privacy Notice & Consent Gateway */}
      {step === 'CONSENT' && (
        <div className="p-6 space-y-6">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
              <Shield className="w-5 h-5" />
              <span>Mandatory Privacy Notice &amp; Explicit Consent</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
              <li>
                <strong>Untrusted Context Handling:</strong> Uploaded job descriptions and resumes are parsed as context and cannot override platform safety constraints.
              </li>
              <li>
                <strong>No Model Training:</strong> Your private interview audio and transcripts are never used to train foundation AI models.
              </li>
              <li>
                <strong>Practice Guidance, Not Hiring Verdict:</strong> AI feedback provides evidence-based guidance against published rubrics; it does not promise hiring outcomes.
              </li>
              <li>
                <strong>User Ownership:</strong> You retain complete control to review, save to your private career plan, or permanently delete the transcript at any time.
              </li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Formulated Questions Preview ({questions.length} Questions):
            </h5>
            <ol className="text-xs text-slate-200 space-y-1.5 list-decimal pl-5">
              {questions.map((q, idx) => (
                <li key={idx} className="leading-relaxed">
                  {q}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('SETUP')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Back to Setup
            </button>
            <button
              onClick={handleBeginInterview}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Consent &bull; Start Real-Time Voice Simulation</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Interactive Voice Interview Simulation */}
      {step === 'INTERVIEW' && (
        <div className="p-6 space-y-6">
          {/* Question Counter & Category */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md font-semibold">
                Question {currentQIndex + 1} of {questions.length}
              </span>
              <span className="text-slate-400">{interviewCategory} Interview Mode</span>
            </div>
            <button
              onClick={() => speakText(questions[currentQIndex])}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Replay Question Audio</span>
            </button>
          </div>

          {/* AI Voice Persona Visualizer Tile */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl transition-all duration-300 ${
                isSpeaking
                  ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400 scale-105 shadow-amber-500/20'
                  : isListening
                  ? 'bg-sky-500/20 text-sky-300 border-2 border-sky-400 scale-105 shadow-sky-500/20'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {isSpeaking ? '🗣️' : isListening ? '🎙️' : '🤖'}
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-100">David &bull; Senior VP Engineering AI</h4>
              <p className="text-xs text-slate-400">
                {isSpeaking
                  ? 'Speaking question... (Click mic to interrupt / barge-in)'
                  : isListening
                  ? 'Listening to candidate response... (Speak now)'
                  : 'Awaiting candidate answer'}
              </p>
            </div>

            {/* Audio Waveform Canvas */}
            <canvas ref={waveCanvasRef} width={380} height={44} className="rounded-lg" />
          </div>

          {/* Current Question Box */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-amber-500/30 text-amber-100 text-sm font-medium leading-relaxed">
            "{questions[currentQIndex]}"
          </div>

          {/* Candidate Answer Input (Voice or Text) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-300 font-medium">Your STAR Answer:</label>
              <span className="text-slate-500">
                Tip: Structure as Situation (15%), Task (15%), Action (50%), Result (20%)
              </span>
            </div>
            <textarea
              rows={3}
              value={currentAnswerInput}
              onChange={(e) => setCurrentAnswerInput(e.target.value)}
              placeholder="Speak using microphone or type your response here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-sky-500 placeholder-slate-600"
            />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={toggleMic}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-sky-400" />}
              <span>{isListening ? 'Stop Mic' : 'Start Speech Input'}</span>
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={!currentAnswerInput.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition shadow flex items-center space-x-2"
            >
              <span>{currentQIndex === questions.length - 1 ? 'Finish & Generate Scorecard' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Automated Evaluation Scorecard */}
      {step === 'EVALUATION' && (
        <div className="p-6 space-y-6">
          {isAnalyzing ? (
            <div className="py-16 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <h4 className="text-base font-bold text-slate-200">Evaluating Mock Interview Transcript...</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Analyzing STAR adherence, executive tone, filler word density, and architectural depth against senior leadership standards.
              </p>
            </div>
          ) : scorecardResult ? (
            <div className="space-y-6">
              {/* Scorecard Hero */}
              <div className="p-5 bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    <Award className="w-4 h-4" />
                    <span>Executive Mock Interview Scorecard</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-100">{targetRole}</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">{scorecardResult.summary}</p>
                </div>

                <div className="flex items-center space-x-4 bg-slate-950/80 px-6 py-3 rounded-xl border border-slate-800">
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-emerald-400">
                      {scorecardResult.overallReadiness}%
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                      Readiness Score
                    </span>
                  </div>
                </div>
              </div>

              {/* STAR Framework Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block">Situation</span>
                  <span className="text-lg font-bold text-amber-400">
                    {scorecardResult.starMetrics.situationScore}/10
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block">Task</span>
                  <span className="text-lg font-bold text-amber-400">
                    {scorecardResult.starMetrics.taskScore}/10
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block">Action (Ownership)</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {scorecardResult.starMetrics.actionScore}/10
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block">Result (Metrics)</span>
                  <span className="text-lg font-bold text-sky-400">
                    {scorecardResult.starMetrics.resultScore}/10
                  </span>
                </div>
              </div>

              {/* Executive Presence Breakdown */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Tone &amp; Gravitas</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${scorecardResult.executivePresence.toneScore * 10}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-slate-200">
                      {scorecardResult.executivePresence.toneScore}/10
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Conciseness</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-400 h-full"
                        style={{ width: `${scorecardResult.executivePresence.concisenessScore * 10}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-slate-200">
                      {scorecardResult.executivePresence.concisenessScore}/10
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Filler Word Density</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {scorecardResult.executivePresence.fillerWordDensity}
                  </span>
                </div>
              </div>

              {/* Strengths & Improvement Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Demonstrated Strengths</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    {scorecardResult.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Actionable Improvements</span>
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    {scorecardResult.improvementAreas.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={handleDeleteTranscript}
                  className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Session Data</span>
                </button>

                <div className="flex items-center space-x-2">
                  {onSaveToCareerPlan && (
                    <button
                      onClick={() => onSaveToCareerPlan(scorecardResult)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                    >
                      Save to My Career Plan
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(scorecardResult, null, 2)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `ExecAscent_Scorecard_${targetRole.replace(/\s+/g, '_')}.json`;
                      a.click();
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition shadow flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Scorecard</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
