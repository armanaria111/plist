import React, { useState } from 'react';
import {
  Download,
  Copy,
  Printer,
  FileImage,
  Check,
  Loader2,
  Sparkles,
  Share2,
} from 'lucide-react';
import { toPng, toJpeg, toBlob } from 'html-to-image';

interface ExportControlsProps {
  previewRef: React.RefObject<HTMLDivElement | null>;
  fileName?: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  previewRef,
  fileName = 'price-list',
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const getCleanFileName = (ext: string) => {
    const clean = (fileName || 'price_list')
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '_');
    return `${clean}_${Date.now()}.${ext}`;
  };

  const handleDownloadImage = async (type: 'png' | 'jpeg') => {
    if (!previewRef.current) return;
    setIsExporting(true);
    setStatusMessage('در حال آماده‌سازی تصویر با کیفیت بالا...');

    try {
      // High pixel ratio for crisp Persian typography and clean borders
      // skipFonts: true prevents html-to-image from crashing on cross-origin stylesheet rules
      const options = {
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true,
      };

      const dataUrl =
        type === 'png'
          ? await toPng(previewRef.current, options)
          : await toJpeg(previewRef.current, { ...options, quality: 0.95 });

      const link = document.createElement('a');
      link.download = getCleanFileName(type);
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStatusMessage('تصویر با موفقیت دانلود شد!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Error generating image:', err);
      alert('خطا در ایجاد خروجی عکس. لطفاً مجدداً امتحان کنید.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    setStatusMessage('در حال کپی تصویر در حافظه موقت (Clipboard)...');

    try {
      const blob = await toBlob(previewRef.current, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true,
      });

      if (!blob) throw new Error('Blob conversion failed');

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopySuccess(true);
        setStatusMessage('عکس کپی شد! می‌توانید مستقیم در تلگرام یا واتساپ پیست (Ctrl+V) کنید.');
        setTimeout(() => {
          setCopySuccess(false);
          setStatusMessage('');
        }, 4000);
      } else {
        // Fallback for browsers that don't support copying image blobs directly
        handleDownloadImage('png');
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      // Fallback: download as png
      handleDownloadImage('png');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="export-controls-container"
      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
    >
      <div className="flex items-center justify-between font-bold text-slate-900 text-sm pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <FileImage className="w-4 h-4 text-orange-600" />
          <span>دریافت خروجی تصویر و اشتراک‌گذاری</span>
        </div>
        <span className="text-[11px] text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full font-bold border border-orange-200/80 shadow-2xs">
          کیفیت Ultra HD (2.5x)
        </span>
      </div>

      {statusMessage && (
        <div className="p-2.5 rounded-xl bg-orange-50 text-orange-950 border border-orange-200 text-xs font-bold flex items-center gap-2 shadow-2xs">
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin text-orange-600 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Main High-res PNG */}
        <button
          type="button"
          onClick={() => handleDownloadImage('png')}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>دانلود عکس باکیفیت (PNG)</span>
        </button>

        {/* Copy Image to Clipboard */}
        <button
          type="button"
          onClick={handleCopyToClipboard}
          disabled={isExporting}
          className={`flex items-center justify-center gap-2 px-4 py-3 font-bold text-xs rounded-xl border transition-all active:scale-98 cursor-pointer ${
            copySuccess
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs'
          }`}
          title="کپی مستقیم عکس برای پیست کردن در تلگرام، واتساپ یا اینستاگرام"
        >
          {copySuccess ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4 text-orange-600" />
          )}
          <span>{copySuccess ? 'عکس کپی شد!' : 'کپی عکس (Clipboard)'}</span>
        </button>

        {/* Download JPG or Print */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleDownloadImage('jpeg')}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs rounded-xl transition-all shadow-2xs active:scale-98 cursor-pointer"
          >
            <FileImage className="w-4 h-4 text-slate-500" />
            <span>خروجی JPG</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition-all shadow-2xs active:scale-98 cursor-pointer"
            title="چاپ مستقیم / ذخیره به عنوان PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
