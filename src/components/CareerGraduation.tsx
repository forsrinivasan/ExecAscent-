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
import { useExecutiveTheme } from '../theme/ThemeContext.tsx';

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
  const { theme, themeConfig } = useExecutiveTheme();

  const levels = [
    {
      level: 1,
      name: 'Explorer',
      description: 'Profile created, core competencies defined, and initial AI mock simulations completed.',
      requirements: ['Complete optional profile setup', 'Conduct at least 3 AI Mock Practice sessions'],
      isCompleted: progression.currentLevel >= 1,
      isCurrent: progression.currentLevel === 1,
    },
    {
      level: 2,
      name: 'Practitioner',
      description: 'Active community engagement and completed at least 1 verified Human Mock Interview with an IT Leader.',
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
      <div className={`p-6 rounded-2xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm`}>
        <div>
          <div className="flex items-center space-x-2 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Gamified Progression Matrix &bull; Evidence-Based &amp; Private</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Career Progression &amp; Mentorship Recognition</h2>
          <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${themeConfig.textSecondary}`}>
            Track your milestones toward {targetRole}. Level progression is evidence-based and private by default; it does not constitute an objective employment guarantee.
          </p>
        </div>

        <div className={`border ${themeConfig.panelBorder} px-5 py-3 rounded-xl flex items-center space-x-3 shrink-0 ${
          theme === 'titanium' ? 'bg-slate-50' : 'bg-slate-950/80'
        }`}>
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-bold text-base font-mono">
            L{progression.currentLevel}
          </div>
          <div>
            <span className={`text-[10px] uppercase tracking-wider block ${themeConfig.textMuted}`}>Current Status</span>
            <span className={`font-bold text-sm ${themeConfig.textPrimary}`}>{progression.levelName}</span>
          </div>
        </div>
      </div>

      {/* Aspirant 3-Stage Progression Roadmap */}
      <div className="space-y-4">
        <h3 className={`text-base font-bold flex items-center space-x-2 ${themeConfig.textPrimary}`}>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Aspirant Progression Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {levels.map((lvl) => (
            <div
              key={lvl.level}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition duration-200 shadow-sm ${
                lvl.isCurrent
                  ? 'border-amber-500/50 bg-amber-500/5 shadow-md'
                  : lvl.isCompleted
                  ? `${themeConfig.cardBg} border-emerald-500/40`
                  : `${themeConfig.cardBg} ${themeConfig.panelBorder} opacity-70`
              }`}
            >
              <div className="space-y-3">
                {/* Zero-Pill Unboxed Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-sm flex items-center space-x-1.5">
                    <span className="text-amber-500 font-mono">Level {lvl.level}:</span>
                    <span className={themeConfig.textPrimary}>{lvl.name}</span>
                  </div>

                  {lvl.isCompleted && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                </div>

                <p className={`text-xs leading-relaxed ${themeConfig.textSecondary}`}>{lvl.description}</p>

                <div className={`pt-2 border-t ${themeConfig.panelBorder} space-y-1.5`}>
                  <span className={`text-[10px] uppercase font-semibold block tracking-wider ${themeConfig.textMuted}`}>
                    Graduation Criteria:
                  </span>
                  {lvl.requirements.map((req, i) => (
                    <div key={i} className={`flex items-start space-x-1.5 text-xs ${themeConfig.textSecondary}`}>
                      <span className="text-amber-500">&bull;</span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Indicator at bottom */}
              <div className={`pt-4 mt-4 border-t ${themeConfig.panelBorder} flex items-center justify-between text-xs`}>
                {lvl.isCompleted ? (
                  <span className="text-emerald-500 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Graduated Level</span>
                  </span>
                ) : lvl.isCurrent ? (
                  <span className="text-amber-500 font-semibold flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>In Active Progress</span>
                  </span>
                ) : (
                  <span className={themeConfig.textMuted}>Locked</span>
                )}

                {lvl.level === 3 && lvl.isCurrent && !progression.verifiedByCoordinator && (
                  <button
                    onClick={onVerifyLevel3}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded transition"
                  >
                    Simulate Coordinator Verification
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leader Impact & Recognition Section */}
      <div className={`border rounded-2xl p-6 ${themeConfig.cardBg} ${themeConfig.panelBorder} shadow-sm space-y-6`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              <span>Leader Impact Recognition Framework</span>
            </div>
            <h3 className={`text-base font-bold ${themeConfig.textPrimary}`}>
              Volunteer Contribution &amp; Community Endorsements
            </h3>
            <p className={`text-xs mt-1 leading-relaxed ${themeConfig.textSecondary}`}>
              Leaders earn non-monetary badges and verified impact points reflecting their contribution to elevating the executive tech community.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className={themeConfig.textMuted}>Total Impact Points:</span>
            <span className="text-base font-mono font-bold text-amber-500 tabular-nums">
              {leaderImpact.impactPoints} pts
            </span>
          </div>
        </div>

        {/* Metrics Grid with Tabular Numerals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${themeConfig.panelBorder} ${theme === 'titanium' ? 'bg-slate-50' : 'bg-slate-950/60'}`}>
            <span className={`text-xs block ${themeConfig.textMuted}`}>Mocks Conducted</span>
            <span className="text-2xl font-bold font-mono text-emerald-500 tabular-nums">
              {leaderImpact.mockInterviewsConducted}
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${themeConfig.panelBorder} ${theme === 'titanium' ? 'bg-slate-50' : 'bg-slate-950/60'}`}>
            <span className={`text-xs block ${themeConfig.textMuted}`}>Webinars Hosted</span>
            <span className="text-2xl font-bold font-mono text-sky-500 tabular-nums">
              {leaderImpact.webinarsHosted}
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${themeConfig.panelBorder} ${theme === 'titanium' ? 'bg-slate-50' : 'bg-slate-950/60'}`}>
            <span className={`text-xs block ${themeConfig.textMuted}`}>Community Answers</span>
            <span className="text-2xl font-bold font-mono text-amber-500 tabular-nums">
              {leaderImpact.communityAnswersGiven}
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${themeConfig.panelBorder} ${theme === 'titanium' ? 'bg-slate-50' : 'bg-slate-950/60'}`}>
            <span className={`text-xs block ${themeConfig.textMuted}`}>Peer Endorsements</span>
            <span className="text-2xl font-bold font-mono text-purple-500 tabular-nums">
              {leaderImpact.endorsementsCount}
            </span>
          </div>
        </div>

        {/* Volunteer Badges (Clean Unboxed Badges with Separators) */}
        <div className={`pt-4 border-t ${themeConfig.panelBorder}`}>
          <span className={`text-xs font-semibold block mb-2.5 ${themeConfig.textPrimary}`}>
            Earned Volunteer Endorsements:
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {leaderImpact.volunteerBadges.map((badge, idx) => (
              <div key={badge} className="flex items-center space-x-1.5 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500/20 text-amber-500" />
                <span className="font-medium">{badge}</span>
                {idx < leaderImpact.volunteerBadges.length - 1 && (
                  <span className="text-slate-500 pl-3">&bull;</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
