import React from 'react';
import { TableSettings } from '../types';
import { COLOR_THEMES } from '../data/defaults';
import { Palette, Columns, Coins, Type, Sliders } from 'lucide-react';

interface StyleConfigProps {
  settings: TableSettings;
  onChange: (settings: TableSettings) => void;
}

export const StyleConfig: React.FC<StyleConfigProps> = ({ settings, onChange }) => {
  const update = (partial: Partial<TableSettings>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div id="style-config-section" className="space-y-4 text-xs text-slate-700">
      {/* Themes Palette */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70 font-bold text-slate-900 text-sm">
          <Palette className="w-4 h-4 text-orange-600" />
          <span>قالب و رنگ‌بندی پوستر</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {COLOR_THEMES.map((theme) => {
            const isSelected = settings.themeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => update({ themeId: theme.id })}
                className={`flex items-center justify-between p-3 rounded-xl border text-right transition-all cursor-pointer ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: theme.primaryDark }}
                    />
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: theme.primaryLight }}
                    />
                  </div>
                  <span className="font-bold text-slate-800 text-xs">{theme.name}</span>
                </div>
                {isSelected && (
                  <span className="text-[10px] bg-orange-600 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                    انتخاب شده
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Columns to show */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70 font-bold text-slate-900 text-sm">
          <Columns className="w-4 h-4 text-orange-600" />
          <span>ستون‌های جدول قیمت</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs">
            <input
              type="checkbox"
              checked={settings.showRowNumber}
              onChange={(e) => update({ showRowNumber: e.target.checked })}
              className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 accent-orange-600 cursor-pointer"
            />
            <span className="font-semibold text-slate-800 text-xs">ستون ردیف</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs">
            <input
              type="checkbox"
              checked={settings.showCodeColumn}
              onChange={(e) => update({ showCodeColumn: e.target.checked })}
              className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 accent-orange-600 cursor-pointer"
            />
            <span className="font-semibold text-slate-800 text-xs">ستون کد کالا</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs">
            <input
              type="checkbox"
              checked={settings.showUnitColumn}
              onChange={(e) => update({ showUnitColumn: e.target.checked })}
              className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 accent-orange-600 cursor-pointer"
            />
            <span className="font-semibold text-slate-800 text-xs">ستون واحد / سایز</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs">
            <input
              type="checkbox"
              checked={settings.showDiscountColumn}
              onChange={(e) => update({ showDiscountColumn: e.target.checked })}
              className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 accent-orange-600 cursor-pointer"
            />
            <span className="font-semibold text-slate-800 text-xs">ستون تخفیف</span>
          </label>
        </div>
      </div>

      {/* Currency and Numerals */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70 font-bold text-slate-900 text-sm">
          <Coins className="w-4 h-4 text-orange-600" />
          <span>واحد پول و اعداد</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">واحد پول:</label>
            <select
              value={settings.currency}
              onChange={(e) => update({ currency: e.target.value })}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-medium"
            >
              <option value="تومان">تومان</option>
              <option value="ریال">ریال</option>
              <option value="هزار تومان">هزار تومان</option>
              <option value="میلیون تومان">میلیون تومان</option>
              <option value="">بدون نمایش واحد</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">محل درج واحد پول:</label>
            <select
              value={settings.currencyPosition}
              onChange={(e) =>
                update({
                  currencyPosition: e.target.value as 'in_header' | 'in_cell' | 'none',
                })
              }
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-medium"
            >
              <option value="in_header">در سرستون قیمت (پیشنهادی)</option>
              <option value="in_cell">کنار هر عدد در هر سطر</option>
              <option value="none">مخفی</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">نوع ارقام اعداد:</label>
            <select
              value={settings.usePersianNumbers ? 'persian' : 'english'}
              onChange={(e) => update({ usePersianNumbers: e.target.value === 'persian' })}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-medium"
            >
              <option value="persian">اعداد فارسی (۱۲۳٬۴۵۶)</option>
              <option value="english">اعداد انگلیسی (123,456)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sizing & Density */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70 font-bold text-slate-900 text-sm">
          <Sliders className="w-4 h-4 text-orange-600" />
          <span>اندازه متن، فشردگی و عرض تصویر</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">اندازه قلم (فونـت):</label>
            <select
              value={settings.fontSize}
              onChange={(e) =>
                update({ fontSize: e.target.value as 'sm' | 'base' | 'lg' | 'xl' })
              }
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-medium"
            >
              <option value="sm">کوچک و فشرده</option>
              <option value="base">استاندارد (پیشنهادی)</option>
              <option value="lg">بزرگ و خوانا</option>
              <option value="xl">خیلی بزرگ (پوستری)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">فاصله و ارتفاع سطرها:</label>
            <select
              value={settings.rowDensity}
              onChange={(e) =>
                update({ rowDensity: e.target.value as 'compact' | 'normal' | 'spacious' })
              }
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-hidden font-medium"
            >
              <option value="compact">فشرده (برای لیست‌های پر تعداد)</option>
              <option value="normal">متعادل و خوانا</option>
              <option value="spacious">باز و دست و دلباز</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-600 font-semibold">عرض خروجی تصویر:</label>
              <span className="font-mono font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-[11px]">
                {settings.cardWidth}px
              </span>
            </div>
            <input
              type="range"
              min="480"
              max="900"
              step="20"
              value={settings.cardWidth}
              onChange={(e) => update({ cardWidth: Number(e.target.value) })}
              className="w-full mt-2 accent-orange-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
