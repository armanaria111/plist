import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  getSupabaseClient,
  AdminSession,
  setStoredAdminSession,
  getCustomAdminCredentials,
} from '../lib/supabase';

interface Props {
  onLoginSuccess: (session: AdminSession) => void;
}

export const AdminLockScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const customCreds = getCustomAdminCredentials();
      const enteredUser = email.trim();
      const enteredPass = password.trim();

      if (!enteredPass) {
        throw new Error('لطفاً کلمه عبور را وارد کنید.');
      }

      // Check against custom admin credentials first
      const isUsernameMatch =
        !enteredUser ||
        enteredUser.toLowerCase() === customCreds.username.toLowerCase() ||
        enteredUser.toLowerCase() === 'admin';

      if (isUsernameMatch && enteredPass === customCreds.password) {
        const session: AdminSession = {
          isAdmin: true,
          email: enteredUser || customCreds.username,
          source: 'local',
        };
        setStoredAdminSession(session);
        setSuccessMsg('احراز هویت با موفقیت انجام شد. در حال ورود...');
        setTimeout(() => onLoginSuccess(session), 500);
        return;
      }

      // Check against Supabase Auth if client is configured
      const supabase = getSupabaseClient();
      if (supabase && enteredUser) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: enteredUser,
          password: enteredPass,
        });

        if (!error && data.user) {
          const session: AdminSession = {
            isAdmin: true,
            email: data.user.email,
            source: 'supabase',
          };
          setStoredAdminSession(session);
          setSuccessMsg('ورود با موفقیت انجام شد.');
          setTimeout(() => onLoginSuccess(session), 500);
          return;
        }
      }

      throw new Error('نام کاربری یا رمز عبور اشتباه است.');
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ورود به سیستم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-orange-500 selection:text-white" dir="rtl">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-4">
        {/* Branding & Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/20 ring-4 ring-orange-500/20 mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            سامانه امن مدیریت لیست قیمت
          </h1>
          <p className="text-xs text-slate-400">
            برای حفظ محرمانگی قیمت‌ها و اقلام، دسترسی فقط پس از ورود مدیر امکان‌پذیر است.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-500/50 text-red-200 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">ایمیل مدیر یا نام کاربری</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full p-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden transition-all font-mono"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">کلمه عبور</label>
                <span className="text-[10px] text-slate-400">پیش‌فرض: admin123</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden transition-all font-mono"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-orange-600/25 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'در حال بررسی...' : 'ورود به پنل مدیریت'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
