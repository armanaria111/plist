import React, { useState } from 'react';
import { PriceItem } from '../types';
import { X, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { toEnglishDigits } from '../utils/formatters';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: PriceItem[], mode: 'append' | 'replace') => void;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');

  if (!isOpen) return null;

  const parseLines = (): PriceItem[] => {
    if (!rawText.trim()) return [];
    const lines = rawText.split('\n');
    const parsed: PriceItem[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Check tab separation (Excel copy-paste), or comma, or pipe, or dash/equal
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else if (line.includes('|')) {
        parts = line.split('|');
      } else if (line.includes(' - ')) {
        parts = line.split(' - ');
      } else if (line.includes(':')) {
        parts = line.split(':');
      } else {
        // Try regex splitting title and trailing number
        const match = trimmed.match(/^(.*?)[\s\-_:=]+([0-9,۰-۹]+)$/);
        if (match) {
          parts = [match[1], match[2]];
        } else {
          parts = [trimmed, '-'];
        }
      }

      const title = parts[0]?.trim() || `کالا ${index + 1}`;
      const priceRaw = parts[1]?.trim() || '-';
      const cleanPrice = toEnglishDigits(priceRaw).replace(/,/g, '').trim();

      parsed.push({
        id: `import-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        price: cleanPrice || '-',
      });
    });

    return parsed;
  };

  const parsedItems = parseLines();

  const handleApply = () => {
    if (parsedItems.length === 0) return;
    onImport(parsedItems, importMode);
    setRawText('');
    onClose();
  };

  const handleLoadSample = () => {
    setRawText(`ریل ساچمه ای امیت آبکاری (سانتی)\t7000
ریل ساچمه ای آرامبند امیت (سانتی)\t9300
ریل ساچمه ای مگنتی امیت (سانتی)\t9300
لولا گازور آرامبند کلیپسی\t102000
لولا گازور دو پیچ\t455000
قرقره 120 کیلویی امیت پلاس\t85000
جک آرامبند\t94000
جک معمولی\t-`);
  };

  return (
    <div
      id="batch-import-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        id="batch-import-modal-card"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600 ring-1 ring-orange-500/20 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">ورود دسته‌جمعی از اکسل یا متن</h3>
              <p className="text-xs text-slate-500 font-normal">کپی و پیست سریع ردیف‌های عنوان و قیمت</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>ستون‌های اکسل (عنوان و قیمت) را کپی کرده و در کادر زیر پیست کنید:</span>
            <button
              onClick={handleLoadSample}
              type="button"
              className="text-orange-600 hover:text-orange-700 underline font-bold cursor-pointer"
            >
              نمونه تست
            </button>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`عنوان کالا [تب یا کاما] قیمت\nمثال:\nریل ساچمه ای 50 سانتی\t85000\nلولا آرامبند\t45000`}
            rows={7}
            className="w-full text-sm font-mono p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden bg-slate-50/60 transition-all"
            dir="auto"
          />

          {/* Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="text-orange-600 focus:ring-orange-500 accent-orange-600"
                />
                <span>افزودن به انتهای لیست فعلی</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-orange-600 focus:ring-orange-500 accent-orange-600"
                />
                <span>جایگزینی کامل لیست فعلی</span>
              </label>
            </div>

            {parsedItems.length > 0 && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                {parsedItems.length} ردیف آماده ورود
              </span>
            )}
          </div>

          {/* Quick Preview Table */}
          {parsedItems.length > 0 && (
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-white text-xs shadow-2xs">
              <div className="sticky top-0 bg-slate-100 font-bold px-3 py-1.5 border-b border-slate-200 grid grid-cols-12 text-slate-700">
                <span className="col-span-1 text-center">#</span>
                <span className="col-span-8">عنوان</span>
                <span className="col-span-3 text-left">قیمت</span>
              </div>
              {parsedItems.slice(0, 10).map((item, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 border-b border-slate-100 grid grid-cols-12 text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <span className="col-span-1 text-center text-slate-400 font-mono">{idx + 1}</span>
                  <span className="col-span-8 truncate font-medium">{item.title}</span>
                  <span className="col-span-3 text-left font-mono font-bold text-slate-900">
                    {item.price}
                  </span>
                </div>
              ))}
              {parsedItems.length > 10 && (
                <div className="p-2 text-center text-slate-500 text-xs bg-slate-50 font-medium">
                  و {parsedItems.length - 10} ردیف دیگر...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <button
            onClick={handleApply}
            disabled={parsedItems.length === 0}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>ثبت و وارد کردن به لیست</span>
          </button>
        </div>
      </div>
    </div>
  );
};
