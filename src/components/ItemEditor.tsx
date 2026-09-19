import React, { useState } from 'react';
import { PriceItem } from '../types';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Sparkles,
  Percent,
  TrendingUp,
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react';
import { toEnglishDigits } from '../utils/formatters';

interface ItemEditorProps {
  items: PriceItem[];
  onChange: (items: PriceItem[]) => void;
  onOpenBatchImport: () => void;
  showCode: boolean;
  showUnit: boolean;
  showDiscount: boolean;
  currency: string;
}

export const ItemEditor: React.FC<ItemEditorProps> = ({
  items,
  onChange,
  onOpenBatchImport,
  showCode,
  showUnit,
  showDiscount,
  currency,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newBadge, setNewBadge] = useState('');

  const [batchPercent, setBatchPercent] = useState<string>('');
  const [showBatchTools, setShowBatchTools] = useState(false);

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: PriceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newTitle.trim(),
      price: newPrice.trim() || '-',
      code: newCode.trim() || undefined,
      unit: newUnit.trim() || undefined,
      discount: newDiscount.trim() || undefined,
      badge: newBadge.trim() || undefined,
    };

    onChange([...items, newItem]);
    setNewTitle('');
    setNewPrice('');
    setNewCode('');
    setNewUnit('');
    setNewDiscount('');
    setNewBadge('');
  };

  const handleUpdateItem = (id: string, updates: Partial<PriceItem>) => {
    onChange(
      items.map((it) => {
        if (it.id === id) {
          return { ...it, ...updates };
        }
        return it;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    onChange(items.filter((it) => it.id !== id));
  };

  const handleDuplicateItem = (item: PriceItem, index: number) => {
    const duplicated: PriceItem = {
      ...item,
      id: `dup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${item.title} (کپی)`,
    };
    const next = [...items];
    next.splice(index + 1, 0, duplicated);
    onChange(next);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  const handleAddMultipleEmpty = (count: number) => {
    const newRows: PriceItem[] = Array.from({ length: count }, (_, idx) => ({
      id: `empty-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      title: `کالای جدید ${items.length + idx + 1}`,
      price: '-',
    }));
    onChange([...items, ...newRows]);
  };

  const handleApplyBatchAdjustment = () => {
    const percent = parseFloat(toEnglishDigits(batchPercent));
    if (isNaN(percent) || percent === 0) return;

    const multiplier = 1 + percent / 100;
    const updated = items.map((it) => {
      const clean = toEnglishDigits(String(it.price)).replace(/,/g, '').trim();
      const num = Number(clean);
      if (isNaN(num) || num <= 0) return it;

      // Round to neat 100 or 1000
      const newNum = Math.round((num * multiplier) / 100) * 100;
      return {
        ...it,
        price: newNum.toLocaleString('en-US'),
      };
    });

    onChange(updated);
    setBatchPercent('');
    setShowBatchTools(false);
  };

  const handleClearAll = () => {
    if (window.confirm('آیا از پاک کردن تمام اقلام لیست مطمئن هستید؟')) {
      onChange([]);
    }
  };

  return (
    <div id="item-editor-section" className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 text-sm">اقلام لیست قیمت</span>
          <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2.5 py-0.5 rounded-full border border-orange-200/60 shadow-2xs">
            {items.length} ردیف
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenBatchImport}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-all hover:shadow-2xs active:scale-98"
            title="ورود داده از اکسل"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>ورود از اکسل</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBatchTools(!showBatchTools)}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all hover:shadow-2xs active:scale-98 ${
              showBatchTools
                ? 'bg-amber-100/90 text-amber-900 border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>تغییر درصدی قیمت‌ها</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddMultipleEmpty(3)}
            className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-200 transition-all hover:shadow-2xs active:scale-98"
          >
            +۳ سطر خالی
          </button>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all"
              title="پاک کردن همه"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Batch Price Adjustment Drawer */}
      {showBatchTools && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-amber-950">
            <span className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-amber-600" />
              افزایش یا کاهش همگانی قیمت‌ها بر اساس درصد
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={batchPercent}
              onChange={(e) => setBatchPercent(e.target.value)}
              placeholder="مثال: 10 برای +۱۰٪ یا -5 برای تخفیف ۵٪"
              className="flex-1 text-xs p-2 bg-white border border-amber-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
            />
            <button
              type="button"
              onClick={handleApplyBatchAdjustment}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors active:scale-98 cursor-pointer"
            >
              اعمال روی همه
            </button>
          </div>
          <p className="text-[11px] text-amber-800">
            قیمت تمام اقلام عددی محاسبه شده و به نزدیک‌ترین صدتایی گرد می‌شود.
          </p>
        </div>
      )}

      {/* Add New Item Form */}
      <form
        onSubmit={handleAddItem}
        className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5 shadow-2xs"
      >
        <span className="text-xs font-bold text-slate-800 block">افزودن سطر جدید به لیست:</span>
        <div className="grid grid-cols-12 gap-2">
          {showCode && (
            <div className="col-span-3 sm:col-span-2">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="کد کالا"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono transition-all"
              />
            </div>
          )}

          <div
            className={
              showCode
                ? 'col-span-9 sm:col-span-5'
                : showUnit || showDiscount
                ? 'col-span-12 sm:col-span-6'
                : 'col-span-12 sm:col-span-7'
            }
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="نام / عنوان کالا (مثال: ریل ساچمه ای امیت...)"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium transition-all"
            />
          </div>

          <div
            className={
              showUnit || showDiscount
                ? 'col-span-6 sm:col-span-3'
                : 'col-span-8 sm:col-span-3'
            }
          >
            <input
              type="text"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder={`قیمت (${currency || 'تومان'})`}
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono font-bold transition-all"
            />
          </div>

          {showUnit && (
            <div className="col-span-3 sm:col-span-1">
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="واحد"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-center"
              />
            </div>
          )}

          {showDiscount && (
            <div className="col-span-3 sm:col-span-1">
              <input
                type="text"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                placeholder="تخفیف"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold text-red-600 transition-all text-center"
              />
            </div>
          )}

          <div className="col-span-4 sm:col-span-2 flex items-center gap-1">
            <input
              type="text"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              placeholder="برچسب (ویژه 💥)"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-center text-orange-600 font-semibold"
            />
          </div>

          <div className="col-span-12 sm:col-span-1 flex items-center justify-end">
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت</span>
            </button>
          </div>
        </div>
      </form>

      {/* Items List Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <div className="min-w-[580px]">
            {/* Table Column Headers */}
            {items.length > 0 && (
              <div className="bg-slate-100/80 px-2.5 py-2 border-b border-slate-200 text-[11px] font-bold text-slate-600 flex items-center gap-2">
                <span className="w-11 text-center shrink-0">ردیف</span>
                {showCode && <span className="w-16 text-center shrink-0">کد کالا</span>}
                <span className="flex-1 min-w-[140px]">عنوان کالا</span>
                <span className="w-24 text-center shrink-0">برچسب</span>
                {showUnit && <span className="w-14 text-center shrink-0">واحد</span>}
                {showDiscount && <span className="w-16 text-center shrink-0">تخفیف</span>}
                <span className="w-28 text-center shrink-0">قیمت ({currency})</span>
                <span className="w-20 text-center shrink-0">عملیات</span>
              </div>
            )}

            <div className="max-h-[440px] overflow-y-auto divide-y divide-slate-100">
              {items.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  سطری وجود ندارد. از فرم بالا برای ثبت کالا استفاده کنید یا از اکسل وارد نمایید.
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-2 flex items-center gap-2 transition-colors ${
                      item.isHighlighted ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-slate-50/90'
                    }`}
                  >
                    {/* Index / Reorder controls */}
                    <div className="flex items-center gap-0.5 text-slate-400 shrink-0">
                      <span className="w-5 text-center text-xs font-mono font-semibold text-slate-500">
                        {index + 1}
                      </span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:text-slate-700 disabled:opacity-20 transition-opacity cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === items.length - 1}
                          className="p-1 hover:text-slate-700 disabled:opacity-20 transition-opacity cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Code (if enabled) */}
                    {showCode && (
                      <input
                        type="text"
                        value={item.code || ''}
                        onChange={(e) => handleUpdateItem(item.id, { code: e.target.value })}
                        placeholder="کد"
                        className="w-16 text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-md text-center font-mono shrink-0 focus:bg-white focus:border-orange-500 outline-hidden"
                      />
                    )}

                    {/* Title */}
                    <div className="flex-1 min-w-[140px]">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                        className="w-full text-xs p-1.5 border border-transparent hover:border-slate-300 focus:border-orange-500 rounded-md font-medium focus:bg-white transition-colors outline-hidden text-slate-900"
                        placeholder="عنوان کالا"
                      />
                    </div>

                    {/* Badge input */}
                    <div className="w-24 shrink-0">
                      <input
                        type="text"
                        value={item.badge || ''}
                        onChange={(e) => handleUpdateItem(item.id, { badge: e.target.value })}
                        placeholder="برچسب"
                        className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-md text-center text-orange-700 font-semibold focus:bg-white focus:border-orange-500 outline-hidden"
                      />
                    </div>

                    {/* Unit (if enabled) */}
                    {showUnit && (
                      <input
                        type="text"
                        value={item.unit || ''}
                        onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                        placeholder="واحد"
                        className="w-14 text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-md text-center shrink-0 focus:bg-white focus:border-orange-500 outline-hidden"
                      />
                    )}

                    {/* Discount (if enabled) */}
                    {showDiscount && (
                      <input
                        type="text"
                        value={item.discount || ''}
                        onChange={(e) => handleUpdateItem(item.id, { discount: e.target.value })}
                        placeholder="تخفیف"
                        className="w-16 text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-md text-center text-red-600 font-bold shrink-0 focus:bg-white focus:border-orange-500 outline-hidden"
                      />
                    )}

                    {/* Price */}
                    <div className="w-28 shrink-0">
                      <input
                        type="text"
                        value={item.price}
                        onChange={(e) => handleUpdateItem(item.id, { price: e.target.value })}
                        className="w-full text-xs p-1.5 border border-slate-200 focus:border-orange-500 rounded-md font-mono font-bold text-center bg-slate-50/70 focus:bg-white outline-hidden text-slate-900"
                        placeholder="قیمت"
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateItem(item.id, { isHighlighted: !item.isHighlighted })
                        }
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          item.isHighlighted
                            ? 'text-amber-700 bg-amber-100 border border-amber-300'
                            : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                        }`}
                        title="هایلایت زرد سطر"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateItem(item, index)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                        title="تکرار / کپی سطر"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="حذف سطر"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
