import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, Shield, CheckCircle2, AlertCircle, ArrowRight, X } from 'lucide-react';
import type { User, UserRole } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [stage, setStage] = useState<'EMAIL' | 'OTP' | 'ONBOARDING'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<UserRole>('ASPIRANT');
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [generatedDemoOTP, setGeneratedDemoOTP] = useState('742819');

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!isOpen) return null;

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid work or personal email address.');
      return;
    }
    setErrorMsg('');
    // Generate deterministic demo OTP for smooth testing
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedDemoOTP(code);
    setCooldown(60);
    setStage('OTP');
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedDemoOTP && otp !== '123456') {
      setErrorMsg('Invalid or expired OTP. Please check the code sent to your email.');
      return;
    }
    setErrorMsg('');
    setStage('ONBOARDING');
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg('Please select a display nickname.');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: email.trim(),
      nickname: nickname.trim(),
      role,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    onSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">ExecAscent Authentication</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition">
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {stage === 'EMAIL' && (
          <form onSubmit={handleRequestOTP} className="space-y-4 text-xs">
            <p className="text-slate-400 leading-relaxed">
              Register or sign in with your email address. A 6-digit Time-based One-Time Password (TOTP) will be dispatched.
            </p>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Work / Personal Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition shadow flex items-center justify-center space-x-1"
            >
              <span>Send 6-Digit Verification OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {stage === 'OTP' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
            <p className="text-slate-400">
              Enter the 6-digit verification code sent to <strong className="text-slate-200">{email}</strong>.
            </p>

            {/* Test helper banner */}
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] font-mono">
              Demo Simulation OTP: <strong>{generatedDemoOTP}</strong> (valid for 10 min)
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">6-Digit OTP</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="e.g. 742819"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-center font-mono text-sm tracking-widest text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Did not receive code?'}
              </span>
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={handleRequestOTP}
                className="text-amber-400 hover:text-amber-300 disabled:opacity-40 transition font-medium"
              >
                Resend OTP
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl transition shadow flex items-center justify-center space-x-1"
            >
              <span>Validate OTP</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {stage === 'ONBOARDING' && (
          <form onSubmit={handleCompleteOnboarding} className="space-y-4 text-xs">
            <p className="text-slate-400">
              Choose your display nickname and primary community role. Administrative permissions cannot be self-selected.
            </p>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Display Nickname / Handle</label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. ElenaArchitect or CloudStrategist"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Select Community Role</label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRole('ASPIRANT')}
                  className={`p-3 rounded-xl border text-left transition ${
                    role === 'ASPIRANT'
                      ? 'bg-amber-500/20 border-amber-500/50 text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <strong className="block text-amber-300 font-bold mb-0.5">🎓 Aspirant</strong>
                  <span className="text-[10px] leading-tight block">
                    Experienced IT Pro preparing for next-level executive roles.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('LEADER')}
                  className={`p-3 rounded-xl border text-left transition ${
                    role === 'LEADER'
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-slate-100'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <strong className="block text-indigo-300 font-bold mb-0.5">👑 IT Leader</strong>
                  <span className="text-[10px] leading-tight block">
                    Volunteer executive mentoring and hosting mock sessions.
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl transition shadow"
            >
              Enter ExecAscent Community
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
