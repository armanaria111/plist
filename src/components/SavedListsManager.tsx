import React, { useState, useRef } from 'react';
import { PriceListDocument } from '../types';
import {
  FolderOpen,
  Save,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Check,
  FileCheck,
  Clock,
  Cloud,
  RefreshCw,
  Database,
  Lock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { DEFAULT_PRICE_LIST } from '../data/defaults';
import {
  getSupabaseConfig,
  savePriceListToSupabase,
  fetchPriceListsFromSupabase,
  deletePriceListFromSupabase,
  AdminSession,
} from '../lib/supabase';

interface SavedListsManagerProps {
  currentDoc: PriceListDocument;
  savedLists: PriceListDocument[];
  adminSession: AdminSession | null;
  onOpenAdminModal: () => void;
  onLoadList: (doc: PriceListDocument) => void;
  onSaveCurrent: (name: string) => void;
  onDeleteList: (id: string) => void;
  onNewList: () => void;
  onImportBackup: (lists: PriceListDocument[]) => void;
  onCloudSyncSuccess?: (lists: PriceListDocument[]) => void;
}

export const SavedListsManager: React.FC<SavedListsManagerProps> = ({
  currentDoc,
  savedLists,
  adminSession,
  onOpenAdminModal,
  onLoadList,
  onSaveCurrent,
  onDeleteList,
  onNewList,
  onImportBackup,
  onCloudSyncSuccess,
}) => {
  const [saveName, setSaveName] = useState(currentDoc.name || 'لیست قیمت جدید');
  const [saveStatus, setSaveStatus] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabaseConfig = getSupabaseConfig();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) return;
    onSaveCurrent(saveName.trim());
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2500);
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(savedLists.length > 0 ? savedLists : [currentDoc], null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `price_lists_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportBackup(parsed);
          alert(`${parsed.length} لیست قیمت با موفقیت بازیابی شد.`);
        } else if (parsed && parsed.id && parsed.title) {
          onImportBackup([parsed]);
          alert('لیست قیمت با موفقیت بازیابی شد.');
        } else {
          alert('فرمت فایل نامعتبر است.');
        }
      } catch {
        alert('خطا در خواندن فایل پشتیبان.');
      }
    };
    reader.readAsText(file);
  };

  // Sync with Supabase Database
  const handleSaveToSupabase = async () => {
    if (!supabaseConfig.isConfigured) {
      onOpenAdminModal();
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await savePriceListToSupabase(currentDoc);
      setSyncMessage({ type: 'success', text: 'لیست جاری با موفقیت در دیتابیس Supabase ذخیره شد.' });
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (err: any) {
      setSyncMessage({ type: 'error', text: err.message || 'خطا در ذخیره سازی در دیتابیس Supabase.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFetchFromSupabase = async () => {
    if (!supabaseConfig.isConfigured) {
      onOpenAdminModal();
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const cloudLists = await fetchPriceListsFromSupabase();
      if (cloudLists.length > 0) {
        onImportBackup(cloudLists);
        if (onCloudSyncSuccess) onCloudSyncSuccess(cloudLists);
        setSyncMessage({
          type: 'success',
          text: `${cloudLists.length} لیست با موفقیت از دیتابیس Supabase بارگذاری شد.`,
        });
      } else {
        setSyncMessage({
          type: 'success',
          text: 'جدول price_lists در دیتابیس متصل است اما رکوردی ندارد.',
        });
      }
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (err: any) {
      setSyncMessage({
        type: 'error',
        text: err.message || 'خطا در دریافت لیست‌ها از دیتابیس Supabase.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div id="saved-lists-manager-section" className="space-y-4 text-xs text-slate-700">
      {/* Supabase Cloud Database Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-sm border border-slate-700 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Cloud className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-100">دیتابیس ابری Supabase</span>
              <span className="text-[10px] text-slate-400 block">PostgreSQL Database + Auth</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {supabaseConfig.isConfigured ? (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                متصل به دیتابیس
              </span>
            ) : (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                دیتابیس متصل نیست
              </span>
            )}

            <button
              type="button"
              onClick={onOpenAdminModal}
              className="text-[11px] bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Database className="w-3 h-3 text-orange-400" />
              <span>تنظیمات / ورود</span>
            </button>
          </div>
        </div>

        {/* Sync message feedback */}
        {syncMessage && (
          <div
            className={`p-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-2 ${
              syncMessage.type === 'success'
                ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/70 border border-red-500/40 text-red-300'
            }`}
          >
            <span>{syncMessage.text}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            disabled={isSyncing}
            onClick={handleSaveToSupabase}
            className="flex-1 min-w-[140px] py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{isSyncing ? 'در حال ارتباط...' : 'ذخیره این لیست در Supabase'}</span>
          </button>

          <button
            type="button"
            disabled={isSyncing}
            onClick={handleFetchFromSupabase}
            className="py-2 px-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-100 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="دریافت لیست‌های موجود از دیتابیس Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>دریافت از دیتابیس ابری</span>
          </button>
        </div>
      </div>

      {/* Save current sheet locally */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 font-bold text-slate-900 text-sm">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4 text-orange-600" />
            <span>ذخیره در حافظه محلی مرورگر (Local Storage)</span>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200 shadow-2xs">
            <FileCheck className="w-3 h-3 text-emerald-600" />
            ذخیره خودکار فعال
          </span>
        </div>

        <form onSubmit={handleSave} className="flex items-center gap-2">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="نام ذخیره‌سازی این لیست..."
            className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition-all"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            {saveStatus ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saveStatus ? 'ذخیره شد!' : 'ذخیره این نسخه'}</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
          <button
            type="button"
            onClick={onNewList}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 transition-all hover:shadow-2xs active:scale-98 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-orange-600" />
            <span>ایجاد لیست قیمت جدید و خالی</span>
          </button>

          <button
            type="button"
            onClick={() => onLoadList(DEFAULT_PRICE_LIST)}
            className="text-xs text-slate-500 hover:text-slate-800 hover:underline transition-colors cursor-pointer"
          >
            بازنشانی به طرح نمونه اولیه (شرکت امیت)
          </button>
        </div>
      </div>

      {/* Saved Lists Drawer */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 font-bold text-slate-900 text-sm">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-orange-600" />
            <span>لیست‌های ذخیره شده ({savedLists.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer"
              title="بارگذاری فایل پشتیبان JSON"
            >
              <Upload className="w-3 h-3 text-orange-600" />
              <span>بازیابی JSON</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer"
              title="دانلود فایل پشتیبان JSON"
            >
              <Download className="w-3 h-3 text-slate-600" />
              <span>پشتیبان‌گیری</span>
            </button>
          </div>
        </div>

        {savedLists.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            هنوز لیستی ذخیره نشده است. با زدن دکمه «ذخیره این نسخه»، لیست فعلی در حافظه دستگاه شما
            ثبت می‌شود.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {savedLists.map((doc) => {
              const isCurrent = doc.id === currentDoc.id;
              return (
                <div
                  key={doc.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isCurrent
                      ? 'bg-orange-50/70 border-orange-300 ring-2 ring-orange-400/20 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                  }`}
                >
                  <div className="flex-1 cursor-pointer" onClick={() => onLoadList(doc)}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{doc.name || doc.title}</span>
                      {isCurrent && (
                        <span className="text-[10px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                          در حال ویرایش
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>{doc.items.length} کالا</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(doc.updatedAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isCurrent && (
                      <button
                        type="button"
                        onClick={() => onLoadList(doc)}
                        className="px-3 py-1 bg-white hover:bg-orange-600 hover:text-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 transition-all active:scale-98 shadow-2xs cursor-pointer"
                      >
                        بارگذاری
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        onDeleteList(doc.id);
                        if (supabaseConfig.isConfigured) {
                          try {
                            await deletePriceListFromSupabase(doc.id);
                          } catch {
                            // ignore
                          }
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="حذف این لیست"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
