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
} from 'lucide-react';
import type { UserProfile, PrivacySetting } from '../types/index.ts';
import { sanitizeProfileForViewer } from '../utils/privacyFilter.ts';

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
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Psychological Safety &amp; Granular Privacy</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Profile &amp; Privacy Control Center</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            All profile fields default to <strong>Private (Self Only)</strong>. You have absolute control to decide what is visible to community members versus kept confidential.
          </p>
        </div>

        <button
          onClick={() => setShowPublicPreview(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shrink-0 shadow"
        >
          <Eye className="w-4 h-4 text-sky-400" />
          <span>Preview Public View</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile changes and privacy toggles saved successfully.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Core Identity */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            1. Display Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Display Nickname / Handle (Always Visible)
              </label>
              <input
                type="text"
                required
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Enables anonymous or pseudonymous community participation.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Verified Account Email (NEVER Public)
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full bg-slate-950/50 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-400 cursor-not-allowed font-mono"
              />
              <span className="text-[11px] text-emerald-400/80 mt-1 block flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified via Email OTP &bull; Strictly Confidential</span>
              </span>
            </div>
          </div>
        </div>

        {/* Professional Fields with Privacy Toggles */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
            2. Professional Background &amp; Granular Privacy Toggles
          </h3>

          {/* Current Company */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>Current Employer / Company</span>
              </label>

              <button
                type="button"
                onClick={() => toggleFieldPrivacy('company')}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition flex items-center space-x-1 ${
                  formData.privacySettings.company === 'public'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {formData.privacySettings.company === 'public' ? (
                  <>
                    <Globe className="w-3 h-3 text-sky-400" />
                    <span>Public (Community Visible)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Private (Self Only)</span>
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="E.g., Fintech Cloud Operations Corp"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            />
          </div>

          {/* Designation & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">Current Position / Title</label>
                <button
                  type="button"
                  onClick={() => toggleFieldPrivacy('position')}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition flex items-center space-x-1 ${
                    formData.privacySettings.position === 'public'
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {formData.privacySettings.position === 'public' ? 'Public' : 'Private'}
                </button>
              </div>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
              />
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">Total Experience (Years)</label>
                <button
                  type="button"
                  onClick={() => toggleFieldPrivacy('experience_years')}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition flex items-center space-x-1 ${
                    formData.privacySettings.experience_years === 'public'
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {formData.privacySettings.experience_years === 'public' ? 'Public' : 'Private'}
                </button>
              </div>
              <input
                type="number"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
              />
            </div>
          </div>

          {/* Target Designation & Career Plan */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Next Target Career Designation</span>
              </label>
              <button
                type="button"
                onClick={() => toggleFieldPrivacy('target_designation')}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition flex items-center space-x-1 ${
                  formData.privacySettings.target_designation === 'public'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {formData.privacySettings.target_designation === 'public' ? 'Public' : 'Private'}
              </button>
            </div>
            <input
              type="text"
              value={formData.targetDesignation}
              onChange={(e) => setFormData({ ...formData, targetDesignation: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            />
          </div>

          {/* Career Plan */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Strategic Career Plan / Goals (Defaults to Private)
              </label>
              <button
                type="button"
                onClick={() => toggleFieldPrivacy('career_plan')}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition flex items-center space-x-1 ${
                  formData.privacySettings.career_plan === 'public'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {formData.privacySettings.career_plan === 'public' ? 'Public' : 'Private'}
              </button>
            </div>
            <textarea
              rows={2}
              value={formData.careerPlan}
              onChange={(e) => setFormData({ ...formData, careerPlan: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100"
            />
          </div>

          {/* Skillset Matrix */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">Core Skillset Matrix</label>
              <button
                type="button"
                onClick={() => toggleFieldPrivacy('skillset')}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition flex items-center space-x-1 ${
                  formData.privacySettings.skillset === 'public'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {formData.privacySettings.skillset === 'public' ? 'Public' : 'Private'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {formData.skillset.map((skill) => (
                <span
                  key={skill}
                  className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add skill (e.g. Distributed Consensus, FinOps)..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>

        {/* Submit Save */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onDeleteAccountData}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Request Account Data Deletion</span>
          </button>

          <button
            type="submit"
            className="py-2.5 px-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs rounded-xl transition shadow"
          >
            Save Profile &amp; Privacy Preferences
          </button>
        </div>
      </form>

      {/* Public Preview Modal */}
      {showPublicPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-sky-400">
                <Eye className="w-4 h-4" />
                <h3 className="font-bold text-sm text-slate-100">Live Public Profile Preview</h3>
              </div>
              <button
                onClick={() => setShowPublicPreview(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              This is exactly what other community members see. Notice how your email and private fields are completely redacted.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-amber-400 text-lg">
                  {publicSanitized.nickname?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{publicSanitized.nickname}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {publicSanitized.position || 'Engineering Professional'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Company:</span>
                  <span className={publicSanitized.company ? 'text-slate-200' : 'text-slate-600 italic'}>
                    {publicSanitized.company || '[Confidential / Private]'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Experience:</span>
                  <span className={publicSanitized.experienceYears ? 'text-slate-200' : 'text-slate-600 italic'}>
                    {publicSanitized.experienceYears ? `${publicSanitized.experienceYears} Years` : '[Private]'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Next Target Role:</span>
                  <span className={publicSanitized.targetDesignation ? 'text-amber-300 font-semibold' : 'text-slate-600 italic'}>
                    {publicSanitized.targetDesignation || '[Private]'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-600 italic font-mono">[Never Publicly Exposed]</span>
                </div>
              </div>

              {publicSanitized.skillset && publicSanitized.skillset.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-400 block mb-1">Public Skillset:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {publicSanitized.skillset.map((s) => (
                      <span key={s} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowPublicPreview(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition"
            >
              Done Previewing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
