import React, { useState, useEffect, useRef } from 'react';
import { PriceListDocument, PriceItem, HeaderBanner, ContactInfo, TableSettings } from './types';
import { DEFAULT_PRICE_LIST } from './data/defaults';
import {
  loadStoredLists,
  saveStoredLists,
  getActiveListId,
  setActiveListId,
} from './utils/formatters';
import { PriceTablePreview } from './components/PriceTablePreview';
import { ItemEditor } from './components/ItemEditor';
import { HeaderFooterConfig } from './components/HeaderFooterConfig';
import { StyleConfig } from './components/StyleConfig';
import { SavedListsManager } from './components/SavedListsManager';
import { ExportControls } from './components/ExportControls';
import { BatchImportModal } from './components/BatchImportModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import {
  AdminSession,
  getStoredAdminSession,
  getSupabaseConfig,
  fetchPriceListsFromSupabase,
} from './lib/supabase';
import {
  ListChecks,
  Store,
  Palette,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileSpreadsheet,
  Download,
  Share2,
  Sparkles,
  Eye,
  SlidersHorizontal,
  Minimize2,
  ShieldCheck,
  Lock,
  Cloud,
  Database,
} from 'lucide-react';

export default function App() {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => getStoredAdminSession());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [supabaseConfig, setSupabaseConfig] = useState(() => getSupabaseConfig());

  const [currentDoc, setCurrentDoc] = useState<PriceListDocument>(() => {
    const stored = loadStoredLists();
    const activeId = getActiveListId();
    if (activeId) {
      const found = stored.find((d) => d.id === activeId);
      if (found) return found;
    }
    return stored.length > 0 ? stored[0] : DEFAULT_PRICE_LIST;
  });

  const [savedLists, setSavedLists] = useState<PriceListDocument[]>(() => {
    const stored = loadStoredLists();
    if (stored.length === 0) {
      saveStoredLists([DEFAULT_PRICE_LIST]);
      return [DEFAULT_PRICE_LIST];
    }
    return stored;
  });

  const [activeTab, setActiveTab] = useState<'items' | 'header' | 'style' | 'saved'>('items');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isBatchImportOpen, setIsBatchImportOpen] = useState<boolean>(false);
  const [previewScale, setPreviewScale] = useState<number>(1);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);

  const previewRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Attempt background sync with Supabase on mount if configured
  useEffect(() => {
    const checkCloud = async () => {
      const config = getSupabaseConfig();
      setSupabaseConfig(config);
      if (config.isConfigured) {
        try {
          const cloudLists = await fetchPriceListsFromSupabase();
          if (cloudLists.length > 0) {
            setSavedLists(cloudLists);
            saveStoredLists(cloudLists);
          }
        } catch {
          // Keep offline/local data if network fails
        }
      }
    };
    checkCloud();
  }, []);

  // Calculate auto-fit scale on resize
  useEffect(() => {
    const calculateScale = () => {
      if (!canvasContainerRef.current) return;
      const containerWidth = canvasContainerRef.current.clientWidth - 32; // padding
      const cardWidth = currentDoc.settings.cardWidth || 700;

      if (containerWidth < cardWidth) {
        const ratio = +(containerWidth / cardWidth).toFixed(2);
        if (isAutoFit) {
          setPreviewScale(Math.max(0.35, Math.min(1, ratio)));
        }
      } else if (isAutoFit) {
        setPreviewScale(1);
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [currentDoc.settings.cardWidth, isAutoFit, mobileView]);

  // Auto-save active document to local storage
  useEffect(() => {
    setActiveListId(currentDoc.id);
    const updatedLists = savedLists.map((d) => (d.id === currentDoc.id ? currentDoc : d));
    const exists = updatedLists.some((d) => d.id === currentDoc.id);
    const finalList = exists ? updatedLists : [currentDoc, ...updatedLists];
    setSavedLists(finalList);
    saveStoredLists(finalList);
  }, [currentDoc]);

  const updateDoc = (partial: Partial<PriceListDocument>) => {
    setCurrentDoc((prev) => ({
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleImportItems = (importedItems: PriceItem[], mode: 'append' | 'replace') => {
    if (mode === 'append') {
      updateDoc({ items: [...currentDoc.items, ...importedItems] });
    } else {
      updateDoc({ items: importedItems });
    }
  };

  const handleSaveWithName = (name: string) => {
    const updated = {
      ...currentDoc,
      name,
      updatedAt: new Date().toISOString(),
    };
    setCurrentDoc(updated);
    const nextLists = savedLists.map((l) => (l.id === updated.id ? updated : l));
    if (!nextLists.some((l) => l.id === updated.id)) {
      nextLists.unshift(updated);
    }
    setSavedLists(nextLists);
    saveStoredLists(nextLists);
  };

  const handleLoadList = (doc: PriceListDocument) => {
    setCurrentDoc(doc);
    setActiveListId(doc.id);
  };

  const handleDeleteList = (id: string) => {
    if (savedLists.length <= 1) {
      alert('حداقل یک لیست باید در سیستم وجود داشته باشد.');
      return;
    }
    if (window.confirm('آیا از حذف این لیست قیمت مطمئن هستید؟')) {
      const nextLists = savedLists.filter((l) => l.id !== id);
      setSavedLists(nextLists);
      saveStoredLists(nextLists);
      if (currentDoc.id === id) {
        setCurrentDoc(nextLists[0]);
        setActiveListId(nextLists[0].id);
      }
    }
  };

  const handleNewList = () => {
    const newDoc: PriceListDocument = {
      ...DEFAULT_PRICE_LIST,
      id: `doc-${Date.now()}`,
      name: `لیست قیمت جدید ${savedLists.length + 1}`,
      title: 'لیست قیمت فروشگاه',
      subtitle: 'لیست قیمت جدید',
      date: new Date().toLocaleDateString('fa-IR'),
      items: [
        { id: '1', title: 'کالای نمونه ۱', price: '100,000' },
        { id: '2', title: 'کالای نمونه ۲', price: '250,000' },
      ],
      updatedAt: new Date().toISOString(),
    };
    setCurrentDoc(newDoc);
    const nextLists = [newDoc, ...savedLists];
    setSavedLists(nextLists);
    saveStoredLists(nextLists);
  };

  const handleImportBackup = (lists: PriceListDocument[]) => {
    setSavedLists(lists);
    saveStoredLists(lists);
    if (lists.length > 0) {
      setCurrentDoc(lists[0]);
      setActiveListId(lists[0].id);
    }
  };

  const handleToggleAutoFit = () => {
    if (isAutoFit) {
      setIsAutoFit(false);
      setPreviewScale(1);
    } else {
      setIsAutoFit(true);
      if (canvasContainerRef.current) {
        const containerWidth = canvasContainerRef.current.clientWidth - 32;
        const cardWidth = currentDoc.settings.cardWidth || 700;
        setPreviewScale(Math.max(0.35, Math.min(1, +(containerWidth / cardWidth).toFixed(2))));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white" dir="rtl">
      {/* Top Application Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-xs shrink-0">
              ق
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-extrabold text-sm sm:text-lg text-slate-900 tracking-tight truncate">
                  سازنده لیست قیمت
                </h1>
                <span className="text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200/60 px-1.5 py-0.5 rounded-full hidden sm:inline-block">
                  طرح فروشگاهی
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-normal truncate">
                تولید خروجی عکس لیست قیمت با لوگو، تلفن و آدرس با ذخیره‌سازی محلی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Supabase & Admin Status Button */}
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 font-bold text-xs rounded-lg border transition-all hover:shadow-xs active:scale-98 cursor-pointer ${
                adminSession?.isAdmin
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title={adminSession?.isAdmin ? 'مدیریت و اتصال دیتابیس (وارد شده)' : 'ورود مدیر و اتصال به Supabase'}
            >
              {adminSession?.isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                  <span className="hidden sm:inline">مدیر سیستم</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
                  <span className="hidden xs:inline">ورود مدیر</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsBatchImportOpen(true)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200/80 transition-all hover:shadow-xs active:scale-98 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span className="hidden xs:inline">اکسل</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('saved');
                setMobileView('editor');
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200/60 transition-all hover:shadow-xs active:scale-98 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
              <span className="hidden sm:inline">لیست‌ها</span>
              <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {savedLists.length}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher (Visible only on < lg screens) */}
        <div className="lg:hidden px-3 pb-2.5 pt-1 border-t border-slate-100 bg-slate-50/80">
          <div className="grid grid-cols-2 gap-1.5 bg-slate-200/70 p-1 rounded-xl border border-slate-300/60">
            <button
              type="button"
              onClick={() => setMobileView('editor')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mobileView === 'editor'
                  ? 'bg-white text-orange-700 shadow-sm ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ویرایش لیست و محتوا</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileView('preview')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mobileView === 'preview'
                  ? 'bg-white text-orange-700 shadow-sm ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>پیش‌نمایش و دانلود عکس</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side (Controls & Editors) - 6 cols on large screens */}
        <div className={`lg:col-span-6 space-y-4 ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-xl border border-slate-300/70 shadow-inner overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('items')}
              className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'items'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <ListChecks className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'items' ? 'text-orange-600' : 'text-slate-500'}`} />
              <span>اقلام و قیمت</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('header')}
              className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'header'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Store className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'header' ? 'text-orange-600' : 'text-slate-500'}`} />
              <span>سربرگ و تماس</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('style')}
              className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'style'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Palette className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'style' ? 'text-orange-600' : 'text-slate-500'}`} />
              <span>قالب و رنگ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'saved'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <FolderOpen className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'saved' ? 'text-orange-600' : 'text-slate-500'}`} />
              <span>حافظه</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
            {activeTab === 'items' && (
              <ItemEditor
                items={currentDoc.items}
                onChange={(items) => updateDoc({ items })}
                onOpenBatchImport={() => setIsBatchImportOpen(true)}
                showCode={currentDoc.settings.showCodeColumn}
                showUnit={currentDoc.settings.showUnitColumn}
                showDiscount={currentDoc.settings.showDiscountColumn}
                currency={currentDoc.settings.currency}
              />
            )}

            {activeTab === 'header' && (
              <HeaderFooterConfig
                title={currentDoc.title}
                subtitle={currentDoc.subtitle}
                date={currentDoc.date}
                banner={currentDoc.banner}
                footerNote={currentDoc.footerNote}
                contact={currentDoc.contact}
                onUpdateTitle={(title) => updateDoc({ title })}
                onUpdateSubtitle={(subtitle) => updateDoc({ subtitle })}
                onUpdateDate={(date) => updateDoc({ date })}
                onUpdateBanner={(banner) => updateDoc({ banner })}
                onUpdateFooterNote={(footerNote) => updateDoc({ footerNote })}
                onUpdateContact={(contact) => updateDoc({ contact })}
              />
            )}

            {activeTab === 'style' && (
              <StyleConfig
                settings={currentDoc.settings}
                onChange={(settings) => updateDoc({ settings })}
              />
            )}

            {activeTab === 'saved' && (
              <SavedListsManager
                currentDoc={currentDoc}
                savedLists={savedLists}
                adminSession={adminSession}
                onOpenAdminModal={() => setIsAdminModalOpen(true)}
                onLoadList={handleLoadList}
                onSaveCurrent={handleSaveWithName}
                onDeleteList={handleDeleteList}
                onNewList={handleNewList}
                onImportBackup={handleImportBackup}
                onCloudSyncSuccess={(cloudLists) => {
                  setSavedLists(cloudLists);
                  saveStoredLists(cloudLists);
                  if (cloudLists.length > 0) {
                    setCurrentDoc(cloudLists[0]);
                    setActiveListId(cloudLists[0].id);
                  }
                }}
              />
            )}
          </div>

          {/* Quick Action Button to jump to Preview on Mobile */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => {
                setMobileView('preview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
            >
              <Eye className="w-4 h-4" />
              <span>مشاهده پیش‌نمایش نهایی و دانلود عکس</span>
            </button>
          </div>

          {/* Export Controls Box (Desktop) */}
          <div className="hidden lg:block">
            <ExportControls previewRef={previewRef} fileName={currentDoc.title || 'price_list'} />
          </div>
        </div>

        {/* Right Side (Live Visual Preview) - 6 cols */}
        <div className={`lg:col-span-6 space-y-3 lg:sticky lg:top-20 ${mobileView === 'editor' ? 'hidden lg:block' : 'block'}`}>
          {/* Preview Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-800">پیش‌نمایش زنده</span>
              <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {currentDoc.settings.cardWidth}px
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleAutoFit}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  isAutoFit
                    ? 'bg-orange-100 text-orange-800 border border-orange-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
                title="تطبیق خودکار با عرض صفحه"
              >
                <Minimize2 className="w-3 h-3" />
                <span>فیت صفحه</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAutoFit(false);
                  setPreviewScale((s) => Math.max(0.3, +(s - 0.1).toFixed(2)));
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                title="کوچک‌نمایی"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="text-[11px] font-mono text-slate-700 font-semibold w-9 text-center">
                {Math.round(previewScale * 100)}%
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsAutoFit(false);
                  setPreviewScale((s) => Math.min(1.5, +(s + 0.1).toFixed(2)));
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                title="بزرگ‌نمایی"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAutoFit(false);
                  setPreviewScale(1);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                title="اندازه واقعی (100%)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Card Canvas Container */}
          <div
            ref={canvasContainerRef}
            className="bg-slate-200/90 p-2 sm:p-6 rounded-2xl border border-slate-300/80 flex items-center justify-center min-h-[360px] sm:min-h-[520px] overflow-hidden shadow-inner relative"
          >
            <div
              className="transition-all duration-200 flex justify-center items-start origin-top"
              style={{
                width: `${currentDoc.settings.cardWidth * previewScale}px`,
                height: 'auto',
              }}
            >
              <div
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top center',
                  width: `${currentDoc.settings.cardWidth}px`,
                }}
              >
                <PriceTablePreview ref={previewRef} document={currentDoc} scale={1} />
              </div>
            </div>
          </div>

          {/* Export Controls on Mobile (Shown directly below the preview) */}
          <div className="block lg:hidden pt-1">
            <ExportControls previewRef={previewRef} fileName={currentDoc.title || 'price_list'} />
          </div>
        </div>
      </main>

      {/* Batch Import Modal */}
      <BatchImportModal
        isOpen={isBatchImportOpen}
        onClose={() => setIsBatchImportOpen(false)}
        onImport={handleImportItems}
      />

      {/* Admin Authentication & Supabase Database Modal */}
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setSupabaseConfig(getSupabaseConfig());
        }}
        adminSession={adminSession}
        onSessionChange={(session) => setAdminSession(session)}
        onRefreshData={async () => {
          const config = getSupabaseConfig();
          setSupabaseConfig(config);
          if (config.isConfigured) {
            try {
              const lists = await fetchPriceListsFromSupabase();
              if (lists.length > 0) {
                setSavedLists(lists);
                saveStoredLists(lists);
                setCurrentDoc(lists[0]);
                setActiveListId(lists[0].id);
              }
            } catch {
              // ignore
            }
          }
        }}
      />
    </div>
  );
}

