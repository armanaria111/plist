import React, { useRef } from 'react';
import { HeaderBanner, ContactInfo } from '../types';
import {
  Store,
  Calendar,
  Image as ImageIcon,
  Phone,
  MapPin,
  Instagram,
  Send,
  Globe,
  Upload,
  Trash2,
  CalendarDays,
  FileText,
} from 'lucide-react';
import { getPersianDateToday } from '../utils/formatters';

interface HeaderFooterConfigProps {
  title: string;
  subtitle: string;
  date: string;
  banner: HeaderBanner;
  footerNote: string;
  contact: ContactInfo;
  onUpdateTitle: (title: string) => void;
  onUpdateSubtitle: (subtitle: string) => void;
  onUpdateDate: (date: string) => void;
  onUpdateBanner: (banner: HeaderBanner) => void;
  onUpdateFooterNote: (note: string) => void;
  onUpdateContact: (contact: ContactInfo) => void;
}

export const HeaderFooterConfig: React.FC<HeaderFooterConfigProps> = ({
  title,
  subtitle,
  date,
  banner,
  footerNote,
  contact,
  onUpdateTitle,
  onUpdateSubtitle,
  onUpdateDate,
  onUpdateBanner,
  onUpdateFooterNote,
  onUpdateContact,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onUpdateBanner({
          ...banner,
          logoUrl: base64,
          logoType: 'image',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    onUpdateBanner({
      ...banner,
      logoUrl: undefined,
      logoType: 'text',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSetTodayDate = () => {
    onUpdateDate(getPersianDateToday());
  };

  return (
    <div id="header-footer-config-section" className="space-y-4 text-xs text-slate-700">
      {/* Top Banner & Brand Identity */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70 font-bold text-slate-900 text-sm">
          <Store className="w-4 h-4 text-orange-600" />
          <span>هویت برند و بنر بالا</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              نام برند در پلاک سربرگ (انگلیسی / فارسی):
            </label>
            <input
              type="text"
              value={banner.brandName}
              onChange={(e) => onUpdateBanner({ ...banner, brandName: e.target.value })}
              placeholder="مثال: Emee te"
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-bold transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              زیرنویس پلاک برند (اختیاری):
            </label>
            <input
              type="text"
              value={banner.brandSubtext || ''}
              onChange={(e) => onUpdateBanner({ ...banner, brandSubtext: e.target.value })}
              placeholder="مثال: پخش و توزیع یراق آلات"
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Logo upload */}
        <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-300/80 transition-all hover:shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-orange-600" />
              <span>{banner.logoUrl ? 'تغییر تصویر لوگو' : 'آپلود لوگوی شرکت'}</span>
            </button>

            {banner.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="flex items-center gap-1 px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف لوگو</span>
              </button>
            )}
          </div>

          {banner.logoUrl && (
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <img src={banner.logoUrl} alt="Logo preview" className="h-7 w-auto object-contain" />
              <span className="text-[11px] text-slate-500 font-medium">لوگو فعال است</span>
            </div>
          )}
        </div>
      </div>

      {/* Sheet Titles & Date */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70 font-bold text-slate-900 text-sm">
          <FileText className="w-4 h-4 text-orange-600" />
          <span>عنوان و مشخصات لیست</span>
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1">
            عنوان اصلی لیست (روی کادر قیمت):
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            placeholder="مثال: قیمت فروشگاه و پخش شرکت امیت"
            className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-bold text-slate-900 text-sm transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">زیرعنوان یا توضیح:</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => onUpdateSubtitle(e.target.value)}
              placeholder="مثال: لیست رسمی قیمت عمده"
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-600 font-semibold">تاریخ لیست:</label>
              <button
                type="button"
                onClick={handleSetTodayDate}
                className="text-orange-600 hover:text-orange-700 font-bold text-[11px] flex items-center gap-0.5"
              >
                <CalendarDays className="w-3 h-3" />
                <span>امروز</span>
              </button>
            </div>
            <input
              type="text"
              value={date}
              onChange={(e) => onUpdateDate(e.target.value)}
              placeholder="مثال: ۱۴۰۴/۱۲/۰۵"
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-mono transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-600 font-semibold mb-1">متن پاورقی / یادداشت سلب مسئولیت:</label>
          <input
            type="text"
            value={footerNote}
            onChange={(e) => onUpdateFooterNote(e.target.value)}
            placeholder="مثال: قیمت ها بروز و قابل تغییر می باشد."
            className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-medium transition-all"
          />
        </div>
      </div>

      {/* Contact & Store Information */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70 font-bold text-slate-900 text-sm">
          <Phone className="w-4 h-4 text-orange-600" />
          <span>اطلاعات تماس، آدرس و شبکه‌های اجتماعی</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">شماره تلفن ۱ (ثابت یا همراه):</label>
            <div className="relative">
              <input
                type="text"
                value={contact.phone1}
                onChange={(e) => onUpdateContact({ ...contact, phone1: e.target.value })}
                placeholder="۰۲۱-۵۵۵۵۵۵۵۵"
                className="w-full p-2 pr-8 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-mono transition-all"
                dir="ltr"
              />
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">شماره تلفن ۲ (موبایل یا واتساپ):</label>
            <div className="relative">
              <input
                type="text"
                value={contact.phone2 || ''}
                onChange={(e) => onUpdateContact({ ...contact, phone2: e.target.value })}
                placeholder="۰۹۱۲-۳۴۵۶۷۸۹"
                className="w-full p-2 pr-8 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-mono transition-all"
                dir="ltr"
              />
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-600 font-semibold mb-1">آدرس فروشگاه / دفتر مرکزی:</label>
            <div className="relative">
              <input
                type="text"
                value={contact.address}
                onChange={(e) => onUpdateContact({ ...contact, address: e.target.value })}
                placeholder="تهران، خیابان..."
                className="w-full p-2 pr-8 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden transition-all"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">آیدی اینستاگرام (اختیاری):</label>
            <div className="relative">
              <input
                type="text"
                value={contact.instagram || ''}
                onChange={(e) => onUpdateContact({ ...contact, instagram: e.target.value })}
                placeholder="@my_shop"
                className="w-full p-2 pr-8 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-mono transition-all"
                dir="ltr"
              />
              <Instagram className="w-3.5 h-3.5 text-pink-500 absolute right-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">آیدی کانال / تلگرام (اختیاری):</label>
            <div className="relative">
              <input
                type="text"
                value={contact.telegram || ''}
                onChange={(e) => onUpdateContact({ ...contact, telegram: e.target.value })}
                placeholder="@my_channel"
                className="w-full p-2 pr-8 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-mono transition-all"
                dir="ltr"
              />
              <Send className="w-3.5 h-3.5 text-sky-500 absolute right-2.5 top-3" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-600 font-semibold mb-1">آدرس وب‌سایت (اختیاری):</label>
            <div className="relative">
              <input
                type="text"
                value={contact.website || ''}
                onChange={(e) => onUpdateContact({ ...contact, website: e.target.value })}
                placeholder="www.myshop.com"
                className="w-full p-2 pr-8 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-mono transition-all"
                dir="ltr"
              />
              <Globe className="w-3.5 h-3.5 text-emerald-500 absolute right-2.5 top-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
