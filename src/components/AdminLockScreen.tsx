import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Database,
  Key,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Server,
  ArrowRight,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  getSupabaseClient,
  AdminSession,
  setStoredAdminSession,
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
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Supabase Settings accordion/drawer
  const [showDbConfig, setShowDbConfig] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getSupabaseConfig().anonKey);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      // If Supabase client is not yet connected/configured
      if (!supabase) {
        if (password.trim() === 'admin' || password.trim() === 'admin123' || password.trim().length >= 4) {
          const session: AdminSession = {
            isAdmin: true,
            email: email.trim() || 'مدیر سیستم',
            source: 'local',
          };
          setStoredAdminSession(session);
          setSuccessMsg('احراز هویت با موفقیت انجام شد. در حال ورود...');
          setTimeout(() => onLoginSuccess(session), 600);
          return;
        } else {
          throw new Error('رمز عبور وارد شده صحیح نیست. (رمز پیش‌فرض: admin123)');
        }
      }

      // Supabase is configured
      if (!email.trim() || !password.trim()) {
        throw new Error('لطفاً ایمیل و رمز عبور را وارد کنید.');
      }

      if (isRegisterMode) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        if (data.user) {
          const session: AdminSession = {
            isAdmin: true,
            email: data.user.email,
            source: 'supabase',
          };
          setStoredAdminSession(session);
          setSuccessMsg('ثبت‌نام مدیر انجام شد. در حال ورود به پنل...');
          setTimeout(() => onLoginSuccess(session), 600);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          // If Supabase user login fails, check fallback master password
          if (password.trim() === 'admin123' || password.trim() === 'admin') {
            const session: AdminSession = {
              isAdmin: true,
              email: email.trim() || 'مدیر سیستم',
              source: 'local',
            };
            setStoredAdminSession(session);
            setSuccessMsg('ورود با رمز عبور پشتیبان انجام شد.');
            setTimeout(() => onLoginSuccess(session), 600);
            return;
          }
          throw error;
        }

        if (data.user) {
          const session: AdminSession = {
            isAdmin: true,
            email: data.user.email,
            source: 'supabase',
          };
          setStoredAdminSession(session);
          setSuccessMsg('ورود با موفقیت انجام شد.');
          setTimeout(() => onLoginSuccess(session), 600);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در احراز هویت.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDbConfig = () => {
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setSuccessMsg('مشخصات اتصال سوبابیس ذخیره شد.');
    setShowDbConfig(false);
    setTimeout(() => setSuccessMsg(null), 3000);
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
              <span>{loading ? 'در حال بررسی...' : isRegisterMode ? 'ثبت‌نام و ورود به عنوان مدیر' : 'ورود به پنل مدیریت'}</span>
            </button>
          </form>

          {/* Quick Register / Mode Switch */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg(null);
              }}
              className="hover:text-orange-400 transition-colors cursor-pointer"
            >
              {isRegisterMode ? 'حساب کاربری دارید؟ ورود' : 'ساخت حساب کاربری ادمین در Supabase'}
            </button>

            <button
              type="button"
              onClick={() => setShowHelpGuide(!showHelpGuide)}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>راهنمای سوبابیس</span>
            </button>
          </div>
        </div>

        {/* Supabase Guide Box (Expandable) */}
        {showHelpGuide && (
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 text-xs text-slate-300 space-y-3 leading-relaxed">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700 font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-orange-400" />
                <span>اطلاعات اتصال سوبابیس را از کجا بیاوریم؟</span>
              </span>
              <button
                type="button"
                onClick={() => setShowHelpGuide(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                بستن
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-300">
              <li>
                وارد سایت <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-orange-400 underline font-mono">supabase.com</a> شده و وارد پروژه‌تان شوید.
              </li>
              <li>
                از نوار ابزار پایین سمت چپ روی آیکون <strong>چرخ‌دنده (Project Settings)</strong> کلیک کنید.
              </li>
              <li>
                روی گزینه <strong>Data API</strong> (یا در نسخه‌های قدیمی‌تر <strong>API</strong>) کلیک کنید.
              </li>
              <li>
                در این صفحه دو مقدار زیر را مشاهده می‌کنید:
                <ul className="list-disc list-inside mr-3 mt-1.5 space-y-1 text-slate-200">
                  <li>
                    <strong className="text-orange-400">Project URL:</strong> آدرس پروژه شما (مثلاً <code className="bg-slate-900 px-1 py-0.5 rounded font-mono">https://xyzcompany.supabase.co</code>)
                  </li>
                  <li>
                    <strong className="text-orange-400">Project API Keys (anon / public):</strong> کلید عمومی شروع شونده با <code className="bg-slate-900 px-1 py-0.5 rounded font-mono">eyJhbG...</code>
                  </li>
                </ul>
              </li>
            </ol>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDbConfig(true)}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-orange-400" />
                <span>ثبت این دو کلید در همین مرورگر</span>
              </button>
            </div>
          </div>
        )}

        {/* Database Config Drawer */}
        {showDbConfig && (
          <div className="bg-slate-800/95 border border-orange-500/30 rounded-2xl p-5 text-xs text-slate-300 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700 font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-orange-500" />
                <span>تنظیم مستقیم اطلاعات Supabase</span>
              </span>
              <button
                type="button"
                onClick={() => setShowDbConfig(false)}
                className="text-slate-400 hover:text-white"
              >
                انصراف
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Project URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Project API Key (anon/public)</label>
              <textarea
                rows={2}
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white"
                dir="ltr"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveDbConfig}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              ذخیره اطلاعات اتصال
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
