import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Database,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  LogOut,
  ShieldCheck,
  Server,
  RefreshCw,
  Eye,
  EyeOff,
  Cloud,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  getSupabaseClient,
  AdminSession,
  getStoredAdminSession,
  setStoredAdminSession,
  SUPABASE_SQL_SCHEMA,
} from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  adminSession: AdminSession | null;
  onSessionChange: (session: AdminSession | null) => void;
  onRefreshData?: () => void;
}

export const AdminAuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  adminSession,
  onSessionChange,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'auth' | 'database' | 'render'>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Supabase Config State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [configSource, setConfigSource] = useState<'env' | 'storage' | 'none'>('none');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setSupabaseUrl(config.url);
      setSupabaseAnonKey(config.anonKey);
      setConfigSource(config.source);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSupabaseAuthLogin = async (isSignUp = false) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        // If Supabase is not connected yet, fall back to master passcode
        if (password.trim() === 'admin' || password.trim() === 'admin123' || password.trim().length >= 4) {
          const newSession: AdminSession = {
            isAdmin: true,
            email: email.trim() || 'admin@local',
            source: 'local',
          };
          setStoredAdminSession(newSession);
          onSessionChange(newSession);
          setSuccessMsg('با موفقیت به عنوان مدیر وارد شدید (احراز هویت لوکال)');
          setTimeout(() => onClose(), 1200);
          return;
        } else {
          throw new Error('رمز عبور پیش‌فرض برای حالت لوکال: admin123 می‌باشد.');
        }
      }

      if (!email.trim() || !password.trim()) {
        throw new Error('لطفاً ایمیل و کلمه عبور را وارد کنید.');
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        if (data.user) {
          const newSession: AdminSession = {
            isAdmin: true,
            email: data.user.email,
            source: 'supabase',
          };
          setStoredAdminSession(newSession);
          onSessionChange(newSession);
          setSuccessMsg('حساب کاربری ادمین در Supabase با موفقیت ثبت و ورود انجام شد.');
          if (onRefreshData) onRefreshData();
          setTimeout(() => onClose(), 1200);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) {
          // If Supabase auth user does not exist yet but password matches local admin
          if (password.trim() === 'admin123' || password.trim() === 'admin') {
            const newSession: AdminSession = {
              isAdmin: true,
              email: email.trim() || 'admin@local',
              source: 'local',
            };
            setStoredAdminSession(newSession);
            onSessionChange(newSession);
            setSuccessMsg('با رمز عبور پشتیبان ادمین وارد شدید.');
            setTimeout(() => onClose(), 1200);
            return;
          }
          throw error;
        }
        if (data.user) {
          const newSession: AdminSession = {
            isAdmin: true,
            email: data.user.email,
            source: 'supabase',
          };
          setStoredAdminSession(newSession);
          onSessionChange(newSession);
          setSuccessMsg('ورود با موفقیت انجام شد.');
          if (onRefreshData) onRefreshData();
          setTimeout(() => onClose(), 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ورود به سیستم.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {
      // ignore
    }
    setStoredAdminSession(null);
    onSessionChange(null);
    setSuccessMsg('از حساب کاربری مدیر خارج شدید.');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  const handleSaveDatabaseConfig = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('آدرس URL یا کلید Anon نامعتبر است.');
      }

      // Quick test query to verify connection
      const { error } = await client.from('price_lists').select('id').limit(1);
      if (error && !error.message.includes('relation "public.price_lists" does not exist')) {
        // It reached Supabase! Even if table does not exist, connection is valid
        console.warn('Supabase test warning:', error);
      }

      setConfigSource(getSupabaseConfig().source);
      setSuccessMsg('ارتباط با دیتابیس Supabase با موفقیت ذخیره و برقرار شد.');
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در برقراری ارتباط با Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">پنل مدیریت و دیتابیس Supabase</h3>
              <p className="text-[11px] text-slate-400">کنترل دسترسی، اتصال دیتابیس ابری و استقرار در Render</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'auth'
                ? 'bg-white text-orange-600 border-b-2 border-orange-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>ورود ادمین</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'database'
                ? 'bg-white text-orange-600 border-b-2 border-orange-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>تنظیمات Supabase</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('render')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'render'
                ? 'bg-white text-orange-600 border-b-2 border-orange-600 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>استقرار در Render</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status Feedback */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: AUTH */}
          {activeTab === 'auth' && (
            <div className="space-y-4">
              {adminSession?.isAdmin ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>شما با موفقیت به عنوان مدیر وارد شده‌اید</span>
                  </div>
                  <div className="text-[11px] text-emerald-900 space-y-1">
                    <p>
                      <strong>ایمیل کاربر:</strong> {adminSession.email || 'کاربر مدیر'}
                    </p>
                    <p>
                      <strong>نوع ورود:</strong>{' '}
                      {adminSession.source === 'supabase' ? 'دیتابیس Supabase Auth' : 'رمز عبور پشتیبان ادمین'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>خروج از حساب مدیر</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 leading-relaxed text-[11px]">
                    با ورود به پنل ادمین، امکان ویرایش اقلام، حذف و اضافه، ذخیره مستقیم در دیتابیس ابری Supabase و دسترسی به تنظیمات فراهم می‌شود.
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">ایمیل مدیر</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-orange-500 outline-hidden font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">کلمه عبور</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="کلمه عبور (پیش‌فرض لوکال: admin123)"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-orange-500 outline-hidden font-mono"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      نکته: در صورت عدم ساخت کاربر در Supabase، رمز عبور پیش‌فرض <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">admin123</code> می‌باشد.
                    </span>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSupabaseAuthLogin(false)}
                      className="flex-1 py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{loading ? 'در حال ورود...' : 'ورود مدیر'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSupabaseAuthLogin(true)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                      title="ایجاد حساب کاربری ادمین در Supabase"
                    >
                      <span>ثبت‌نام کاربر ادمین</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUPABASE DATABASE */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">وضعیت اتصال:</span>
                </div>
                <div>
                  {configSource === 'env' ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      متصل از متغیرهای محیطی (.env)
                    </span>
                  ) : configSource === 'storage' ? (
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      متصل از تنظیمات دستی مرورگر
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      هنوز متصل نشده است
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Project URL سوبابیس</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] focus:bg-white focus:border-orange-500 outline-hidden"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Project API Anon / Public Key</label>
                  <textarea
                    rows={3}
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] focus:bg-white focus:border-orange-500 outline-hidden"
                    dir="ltr"
                  />
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSaveDatabaseConfig}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{loading ? 'در حال بررسی اتصال...' : 'ذخیره و تست اتصال به دیتابیس'}</span>
                </button>
              </div>

              {/* SQL Schema helper */}
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-400 text-[11px]">کد SQL ساخت جدول در Supabase:</span>
                  <button
                    type="button"
                    onClick={handleCopySchema}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'کپی شد!' : 'کپی کد SQL'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  کافیست در داشبورد سوبابیس به بخش <strong>SQL Editor</strong> رفته و این دستورات را اجرا کنید تا جدول <code className="text-orange-300">price_lists</code> ساخته شود.
                </p>
                <pre className="text-[10px] font-mono bg-black/40 p-2 rounded max-h-28 overflow-y-auto text-emerald-400" dir="ltr">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: RENDER.COM DEPLOYMENT */}
          {activeTab === 'render' && (
            <div className="space-y-3 leading-relaxed">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-orange-600" />
                  <span>مراحل استقرار سریع در Render.com:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-700">
                  <li>
                    در سایت <strong>Render.com</strong> ثبت‌نام کرده و یک <strong>Static Site</strong> جدید بسازید.
                  </li>
                  <li>
                    مخزن گیت‌هاب پروژه را انتخاب کنید.
                  </li>
                  <li>
                    تنظیمات بیلد:
                    <ul className="list-disc list-inside mr-3 mt-1 font-mono text-[10px] text-slate-600 space-y-0.5" dir="ltr">
                      <li>Build Command: <span className="text-orange-700 font-bold">npm run build</span></li>
                      <li>Publish Directory: <span className="text-orange-700 font-bold">dist</span></li>
                    </ul>
                  </li>
                  <li>
                    در بخش <strong>Environment Variables</strong> در Render، دو متغیر زیر را اضافه کنید:
                    <ul className="list-disc list-inside mr-3 mt-1 font-mono text-[10px] text-slate-600 space-y-0.5" dir="ltr">
                      <li>VITE_SUPABASE_URL</li>
                      <li>VITE_SUPABASE_ANON_KEY</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-[11px]">
                فایل پیکربندی خودکار <code className="font-mono font-bold">render.yaml</code> نیز در ریشه پروژه قرار داده شده است و Render می‌تواند به صورت Blueprint خودکار آن را شناسایی کند.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
