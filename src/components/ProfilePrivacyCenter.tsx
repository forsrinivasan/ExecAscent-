import React, { useState } from 'react';
import {
  User,
  Shield,
  Eye,
  Lock,
  Globe,
  Upload,
  Trash2,
  CheckCircle2,
  FileText,
  AlertCircle,
  Briefcase,
  Target,
  X,
} from 'lucide-react';
import type { UserProfile, PrivacySetting } from '../types/index.ts';
import { sanitizeProfileForViewer } from '../utils/privacyFilter.ts';
import { useExecutiveTheme } from '../theme/ThemeContext.tsx';

interface ProfilePrivacyCenterProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onDeleteAccountData: () => void;
}

export const ProfilePrivacyCenter: React.FC<ProfilePrivacyCenterProps> = ({
  profile,
  onUpdateProfile,
  onDeleteAccountData,
}) => {
  const { theme, themeConfig } = useExecutiveTheme();
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [showPublicPreview, setShowPublicPreview] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  const toggleFieldPrivacy = (field: keyof UserProfile['privacySettings']) => {
    const current = formData.privacySettings[field];
    const next: PrivacySetting = current === 'public' ? 'private' : 'public';
    setFormData((prev) => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [field]: next,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!formData.skillset.includes(newSkillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skillset: [...prev.skillset, newSkillInput.trim()],
      }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skillset: prev.skillset.filter((s) => s !== skill),
    }));
  };

  const publicSanitized = sanitizeProfileForViewer(formData, 'community-guest-id', false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className={`p-6 rounded-2xl border ${themeConfig.panelBorder} ${themeConfig.cardBg} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm`}>
        <div>
          <div className="flex items-center space-x-2 text-amber-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Psychological Safety &amp; Granular Privacy</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Profile &amp; Privacy Control Center</h2>
          <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${themeConfig.textSecondary}`}>
            All profile fields default to <strong className="text-amber-500">Private (Self Only)</strong>. You have absolute control to decide what is visible to community members versus kept confidential.
          </p>
        </div>

        <button
          onClick={() => setShowPublicPreview(true)}
          className={`border text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shrink-0 shadow-sm ${
            theme === 'titanium'
              ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
              : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4 text-sky-500" />
          <span>Preview Public View</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-500 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile changes and privacy toggles saved successfully.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className={`border rounded-2xl p-6 space-y-6 shadow-sm ${themeConfig.cardBg} ${themeConfig.panelBorder}`}>
        {/* Core Identity */}
        <div className="space-y-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-2 ${themeConfig.textPrimary} ${themeConfig.panelBorder}`}>
            1. Display Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${themeConfig.textSecondary}`}>
                Display Nickname / Handle (Always Visible)
              </label>
              <input
                type="text"
                required
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500 ${
                  theme === 'titanium'
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                }`}
              />
              <span className={`text-[11px] mt-1 block ${themeConfig.textMuted}`}>
                Enables anonymous or pseudonymous community participation.
              </span>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${themeConfig.textSecondary}`}>
                Verified Account Email (NEVER Public)
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className={`w-full border rounded-lg p-2.5 text-xs cursor-not-allowed font-mono opacity-80 ${
                  theme === 'titanium'
                    ? 'bg-slate-100 border-slate-200 text-slate-600'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400'
                }`}
              />
              <span className="text-[11px] text-emerald-500 mt-1 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified via Email OTP &bull; Strictly Confidential</span>
              </span>
            </div>
          </div>
        </div>

        {/* Professional Fields with Privacy Toggles */}
        <div className="space-y-4 pt-2">
          <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-2 ${themeConfig.textPrimary} ${themeConfig.panelBorder}`}>
            2. Professional Background &amp; Granular Privacy Toggles
          </h3>

          {/* Current Company */}
          <div className={`p-4 rounded-xl border space-y-2 ${themeConfig.panelBorder} ${theme === 'titanium' ? 'bg-slate-50' : 'bg-slate-950/60'}`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold flex items-center space-x-1.5 ${themeConfig.textPrimary}`}>
                <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                <span>Current Employer / Company</span>
              </label>

              <button
                type="button"
                onClick={() => toggleFieldPrivacy('company')}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition flex items-center space-x-1.5 ${
                  formData.privacySettings.company === 'public'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-500'
                    : 'border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {formData.privacySettings.company === 'public' ? (
                  <>
                    <Globe className="w-3 h-3 text-sky-500" />
                    <span>Public to Community</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span>Private (Self Only)</span>
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              value={formData.company || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className={`w-full border rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500 ${
                theme === 'titanium'
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
              }`}
              placeholder="e.g. Stripe, Airbnb, Datadog (optional)"
            />
          </div>

          {/* Current Designation */}
          <div className={`p-4 rounded-xl border space-y-2 ${themeConfig.panelBorder} ${theme === 'titanium' ? 'bg-slate-50' : 'bg-slate-950/60'}`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold flex items-center space-x-1.5 ${themeConfig.textPrimary}`}>
                <User className="w-3.5 h-3.5 text-sky-500" />
                <span>Current Designation / Title</span>
              </label>

              <button
                type="button"
                onClick={() => toggleFieldPrivacy('position')}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition flex items-center space-x-1.5 ${
                  formData.privacySettings.position === 'public'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-500'
                    : 'border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {formData.privacySettings.position === 'public' ? (
                  <>
                    <Globe className="w-3 h-3 text-sky-500" />
                    <span>Public to Community</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span>Private (Self Only)</span>
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              value={formData.designation || ''}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className={`w-full border rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500 ${
                theme === 'titanium'
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
              }`}
              placeholder="e.g. Staff Software Engineer, Engineering Manager"
            />
          </div>

          {/* Total Experience */}
          <div className={`p-4 rounded-xl border space-y-2 ${themeConfig.panelBorder} ${theme === 'titanium' ? 'bg-slate-50' : 'bg-slate-950/60'}`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold flex items-center space-x-1.5 ${themeConfig.textPrimary}`}>
                <span>Total Professional Experience (Years)</span>
              </label>

              <button
                type="button"
                onClick={() => toggleFieldPrivacy('experience_years')}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition flex items-center space-x-1.5 ${
                  formData.privacySettings.experience_years === 'public'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-500'
                    : 'border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {formData.privacySettings.experience_years === 'public' ? (
                  <>
                    <Globe className="w-3 h-3 text-sky-500" />
                    <span>Public to Community</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span>Private (Self Only)</span>
                  </>
                )}
              </button>
            </div>

            <input
              type="number"
              min="0"
              max="50"
              value={formData.experienceYears || ''}
              onChange={(e) =>
                setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })
              }
              className={`w-full border rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500 font-mono ${
                theme === 'titanium'
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
              }`}
            />
          </div>

          {/* Target Role & Career Plan */}
          <div className={`p-4 rounded-xl border space-y-2 ${themeConfig.panelBorder} ${theme === 'titanium' ? 'bg-slate-50' : 'bg-slate-950/60'}`}>
            <div className="flex items-center justify-between">
              <label className={`text-xs font-semibold flex items-center space-x-1.5 ${themeConfig.textPrimary}`}>
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>Target Career Designation &amp; Roadmap</span>
              </label>

              <button
                type="button"
                onClick={() => toggleFieldPrivacy('career_plan')}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition flex items-center space-x-1.5 ${
                  formData.privacySettings.career_plan === 'public'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-500'
                    : 'border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {formData.privacySettings.career_plan === 'public' ? (
                  <>
                    <Globe className="w-3 h-3 text-sky-500" />
                    <span>Public to Community</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span>Private (Self Only)</span>
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              value={formData.targetDesignation || ''}
              onChange={(e) => setFormData({ ...formData, targetDesignation: e.target.value })}
              className={`w-full border rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500 ${
                theme === 'titanium'
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
              }`}
              placeholder="e.g. Director of Engineering / VP of Engineering / CTO"
            />

            <textarea
              rows={2}
              value={formData.careerPlan || ''}
              onChange={(e) => setFormData({ ...formData, careerPlan: e.target.value })}
              className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-500 leading-relaxed ${
                theme === 'titanium'
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
              }`}
              placeholder="What are your 6-12 month career acceleration objectives?"
            />
          </div>

          {/* Skills Management */}
          <div className={`p-4 rounded-xl border space-y-3 ${themeConfig.panelBorder} ${theme === 'titanium' ? 'bg-slate-50' : 'bg-slate-950/60'}`}>
            <label className={`text-xs font-semibold block ${themeConfig.textPrimary}`}>
              Competencies &amp; Technical Skillset
            </label>

            <div className="flex flex-wrap gap-2">
              {formData.skillset.map((skill) => (
                <span
                  key={skill}
                  className={`text-xs px-2.5 py-1 rounded-md border flex items-center space-x-1.5 ${
                    theme === 'titanium'
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-500 ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add skill (e.g. Distributed Systems, FinOps, Incident Command)"
                className={`flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 ${
                  theme === 'titanium'
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-[#0A0F1D] border-slate-800 text-slate-100'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg text-xs"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className={`pt-4 border-t ${themeConfig.panelBorder} flex flex-wrap items-center justify-between gap-3`}>
          <button
            type="button"
            onClick={onDeleteAccountData}
            className="text-rose-500 hover:text-rose-400 text-xs flex items-center space-x-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Request Complete Account &amp; Data Deletion</span>
          </button>

          <button
            type="submit"
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl transition shadow text-xs"
          >
            Save Profile &amp; Privacy Preferences
          </button>
        </div>
      </form>

      {/* Public View Preview Modal */}
      {showPublicPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4 ${
            theme === 'titanium'
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#101726] border-slate-700/80 text-slate-100'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Eye className="w-4 h-4 text-sky-500" />
                <span>Live Public Preview (As Seen by Other Members)</span>
              </h3>
              <button
                onClick={() => setShowPublicPreview(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-4 rounded-xl border space-y-3 ${
              theme === 'titanium' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
                  {(publicSanitized.nickname || 'A').slice(0, 1)}
                </div>
                <div>
                  <h4 className="font-bold text-base">{publicSanitized.nickname || 'Anonymous Member'}</h4>
                  <span className="text-xs text-slate-400">
                    {publicSanitized.designation || 'Experienced Technology Professional'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Employer:</span>
                  <span className="font-medium">
                    {publicSanitized.company || (
                      <em className="text-slate-500 font-normal">Confidential (Private)</em>
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Experience:</span>
                  <span className="font-mono">
                    {publicSanitized.experienceYears
                      ? `${publicSanitized.experienceYears} Years`
                      : 'Private'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Target Role:</span>
                  <span className="font-medium text-amber-500">
                    {publicSanitized.targetDesignation || 'Private'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPublicPreview(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-xl text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
