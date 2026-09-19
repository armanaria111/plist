import { PriceListDocument } from '../types';
import { DEFAULT_PRICE_LIST } from '../data/defaults';

export const toPersianDigits = (str: string | number): string => {
  if (str === null || str === undefined) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, (w) => persianDigits[+w]);
};

export const toEnglishDigits = (str: string): string => {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(persianDigits[i], String(i)).replaceAll(arabicDigits[i], String(i));
  }
  return result;
};

export const formatPriceString = (value: string | number, usePersian: boolean = false): string => {
  if (value === '-' || value === 'تماس بگیرید' || value === 'ناموجود' || value === '') {
    return String(value);
  }
  const cleanStr = toEnglishDigits(String(value)).replace(/,/g, '').trim();
  const num = Number(cleanStr);
  if (isNaN(num)) {
    return String(value);
  }
  const formatted = num.toLocaleString('en-US');
  return usePersian ? toPersianDigits(formatted) : formatted;
};

export const getPersianDateToday = (): string => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(now);
  } catch {
    return '۱۴۰۴/۱۲/۰۵';
  }
};

const STORAGE_KEY = 'PRICE_LIST_GENERATOR_DOCS_V1';
const ACTIVE_ID_KEY = 'PRICE_LIST_ACTIVE_ID_V1';

export const sanitizeDoc = (doc: any): PriceListDocument => {
  if (!doc || typeof doc !== 'object') return DEFAULT_PRICE_LIST;
  return {
    ...DEFAULT_PRICE_LIST,
    ...doc,
    banner: {
      ...DEFAULT_PRICE_LIST.banner,
      ...(doc.banner || {}),
    },
    contact: {
      ...DEFAULT_PRICE_LIST.contact,
      ...(doc.contact || {}),
    },
    settings: {
      ...DEFAULT_PRICE_LIST.settings,
      ...(doc.settings || {}),
    },
    items: Array.isArray(doc.items) ? doc.items : DEFAULT_PRICE_LIST.items,
  };
};

export const loadStoredLists = (): PriceListDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(sanitizeDoc);
    }
    return [];
  } catch (err) {
    console.error('Error loading stored price lists:', err);
    return [];
  }
};

export const saveStoredLists = (lists: PriceListDocument[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (err) {
    console.error('Error saving price lists:', err);
  }
};

export const getActiveListId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_ID_KEY);
  } catch {
    return null;
  }
};

export const setActiveListId = (id: string) => {
  try {
    localStorage.setItem(ACTIVE_ID_KEY, id);
  } catch (err) {
    console.error('Error setting active list id:', err);
  }
};
