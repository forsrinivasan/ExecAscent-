import React from 'react';
import {
  Award,
  CheckCircle,
  Clock,
  Sparkles,
  Shield,
  Target,
  TrendingUp,
  UserCheck,
  Star,
  Users,
} from 'lucide-react';
import type { AspirantProgression, LeaderImpactStats, UserRole } from '../types/index.ts';

interface CareerGraduationProps {
  progression: AspirantProgression;
  leaderImpact: LeaderImpactStats;
  userRole: UserRole;
  userNickname: string;
  targetRole: string;
  onVerifyLevel3?: () => void;
}

export const CareerGraduation: React.FC<CareerGraduationProps> = ({
  progression,
  leaderImpact,
  userRole,
  userNickname,
  targetRole,
  onVerifyLevel3,
}) => {
  const levels = [
    {
      level: 1,
      name: 'Explorer',
      description: 'Profile created, core competencies defined, and initial AI mock simulations completed.',
      badge: '🌱 Level 1: Explorer',
      requirements: ['Complete optional profile setup', 'Conduct at least 3 AI Mock Practice sessions'],
      isCompleted: progression.currentLevel >= 1,
      isCurrent: progression.currentLevel === 1,
    },
    {
      level: 2,
      name: 'Practitioner',
      description: 'Active community engagement and completed at least 1 verified Human Mock Interview with an IT Leader.',
      badge: '⚡ Level 2: Practitioner',
      requirements: [
        'Complete 1-on-1 Human Mock Interview with an IT Leader',
        'Contribute to community Q&A discussions or webinars',
      ],
      isCompleted: progression.currentLevel >= 2,
      isCurrent: progression.currentLevel === 2,
    },
    {
      level: 3,
      name: 'Executive Ready',
      description: 'Achieved ≥ 85% on structured mock evaluations and verified by Platform Coordinator.',
      badge: '👑 Level 3: Executive Ready',
      requirements: [
        'Achieve score ≥ 85% on structured STAR mock evaluation',
        'Coordinator review & endorsement of leadership competencies',
      ],
      isCompleted: progression.currentLevel >= 3,
      isCurrent: progression.currentLevel === 3,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Gamified Progression Matrix &bull; Non-Punitive &amp; Self-Directed</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Career Progression &amp; Mentorship Recognition</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Track your milestones toward {targetRole}. Level progression is evidence-based and private by default; it does not constitute an objective employment guarantee.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 px-5 py-3 rounded-xl flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-base">
            L{progression.currentLevel}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Status</span>
            <span className="font-bold text-slate-100 text-sm">{progression.levelName}</span>
          </div>
        </div>
      </div>

      {/* Aspirant 3-Stage Progression Roadmap */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Aspirant Progression Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {levels.map((lvl) => (
            <div
              key={lvl.level}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition ${
                lvl.isCurrent
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-lg'
                  : lvl.isCompleted
                  ? 'bg-slate-900/90 border-emerald-500/30'
                  : 'bg-slate-900/40 border-slate-800 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      lvl.isCurrent
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : lvl.isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Level {lvl.level}: {lvl.name}
                  </span>

                  {lvl.isCompleted && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{lvl.description}</p>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Graduation Criteria:
                  </span>
                  {lvl.requirements.map((req, i) => (
                    <div key={i} className="flex items-start space-x-1.5 text-xs text-slate-300">
                      <span className="text-amber-400">&bull;</span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Indicator at bottom */}
              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                {lvl.isCompleted ? (
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Milestone Achieved</span>
                  </span>
                ) : lvl.isCurrent ? (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-[11px] text-amber-300 font-medium">
                      <span>In Progress</span>
                      <span>Score: {progression.highestScore}% (Target: 85%)</span>
                    </div>
                    {userRole === 'ADMIN' && onVerifyLevel3 && lvl.level === 3 && (
                      <button
                        onClick={onVerifyLevel3}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition"
                      >
                        Grant Coordinator Endorsement
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Volunteer Leader Impact Recognition (Non-Monetary) */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Volunteer IT Leader Impact Recognition</span>
            </h3>
            <p className="text-xs text-slate-400">
              Honoring volunteer executives who donate knowledge, conduct human mocks, and host community webinars.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">Impact Points:</span>
            <strong className="text-amber-400 font-bold font-mono text-sm">
              {leaderImpact.impactPoints} pts
            </strong>
          </div>
        </div>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Human Mocks Conducted</span>
            <span className="text-xl font-bold text-slate-100">
              {leaderImpact.mockInterviewsConducted}
            </span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Live Webinars Hosted</span>
            <span className="text-xl font-bold text-indigo-400">
              {leaderImpact.webinarsHosted}
            </span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Q&amp;A Answers Provided</span>
            <span className="text-xl font-bold text-sky-400">
              {leaderImpact.communityAnswersGiven}
            </span>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-xs block mb-1">Mentee Endorsements</span>
            <span className="text-xl font-bold text-amber-400">
              {leaderImpact.endorsementsCount}
            </span>
          </div>
        </div>

        {/* Volunteer Badges */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-300 block mb-2">Awarded Volunteer Badges:</span>
          <div className="flex flex-wrap gap-2">
            {leaderImpact.volunteerBadges.map((badge) => (
              <span
                key={badge}
                className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-medium px-3 py-1 rounded-full flex items-center space-x-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{badge}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
