import { ColorTheme, PriceListDocument } from '../types';

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'orange-classic',
    name: 'کلاسیک نارنجی (طرح نمونه)',
    primary: '#ea580c', // Orange-600
    primaryDark: '#4b5563', // Slate-600
    primaryLight: '#fed7aa', // Orange-200
    primaryText: '#1f2937',
    rowAltBg: '#fffbeb', // Amber-50
    borderColor: '#d1d5db',
    accentBadge: '#f97316',
  },
  {
    id: 'corporate-blue',
    name: 'آبی شرکتی و مدرن',
    primary: '#2563eb', // Blue-600
    primaryDark: '#1e293b', // Slate-800
    primaryLight: '#bfdbfe', // Blue-200
    primaryText: '#0f172a',
    rowAltBg: '#f8fafc',
    borderColor: '#cbd5e1',
    accentBadge: '#3b82f6',
  },
  {
    id: 'emerald-luxury',
    name: 'سبز زمردی و بازرگانی',
    primary: '#059669', // Emerald-600
    primaryDark: '#134e4a', // Teal-900
    primaryLight: '#a7f3d0', // Emerald-200
    primaryText: '#064e3b',
    rowAltBg: '#f0fdf4',
    borderColor: '#cbd5e1',
    accentBadge: '#10b981',
  },
  {
    id: 'crimson-bold',
    name: 'قرمز یاقوتی و صنعتی',
    primary: '#dc2626', // Red-600
    primaryDark: '#3f3f46', // Zinc-700
    primaryLight: '#fecaca', // Red-200
    primaryText: '#18181b',
    rowAltBg: '#fef2f2',
    borderColor: '#e4e4e7',
    accentBadge: '#ef4444',
  },
  {
    id: 'gold-prestige',
    name: 'طلایی و مشکی لوکس',
    primary: '#d97706', // Amber-600
    primaryDark: '#18181b', // Zinc-900
    primaryLight: '#fde68a', // Amber-200
    primaryText: '#1c1917',
    rowAltBg: '#fffbeb',
    borderColor: '#d6d3d1',
    accentBadge: '#f59e0b',
  },
  {
    id: 'minimal-slate',
    name: 'مینیمال مشکی و طوسی',
    primary: '#1e293b', // Slate-800
    primaryDark: '#0f172a', // Slate-900
    primaryLight: '#e2e8f0', // Slate-200
    primaryText: '#020617',
    rowAltBg: '#f8fafc',
    borderColor: '#cbd5e1',
    accentBadge: '#64748b',
  },
];

export const DEFAULT_PRICE_LIST: PriceListDocument = {
  id: 'default-sheet-1',
  name: 'لیست قیمت فروشگاه و پخش شرکت امیت',
  updatedAt: new Date().toISOString(),
  title: 'قیمت فروشگاه و پخش شرکت امیت',
  subtitle: 'لیست رسمی قیمت عمده و خرده',
  date: '۱۴۰۴/۱۲/۰۵',
  banner: {
    brandName: 'Emee te',
    brandSubtext: 'تولید و پخش یراق آلات صنعتی و کابینت',
    logoType: 'text',
    showBannerDecoration: true,
  },
  items: [
    { id: '1', title: 'ریل ساچمه ای امیت آبکاری (سانتی)', price: '7,000' },
    { id: '2', title: 'ریل ساچمه ای آرامبند امیت (سانتی)', price: '9,300' },
    { id: '3', title: 'ریل ساچمه ای مگنتی امیت (سانتی)', price: '9,300' },
    { id: '4', title: 'ریل ساچمه ای گالوانیزهCNT (سانتی)', price: '6,200' },
    { id: '5', title: 'ریل باریک امیت (سانتی)', price: '4,000' },
    { id: '6', title: 'لولا گازور آرامبند کلیپسی', price: '102,000' },
    { id: '7', title: 'لولا گازور آرامبند بدون کلیپس پلاس', price: '99,000' },
    { id: '8', title: 'لولا گازور آرامبند اکونومی پمپ بزرگ (پایه جتی)', price: '95,000' },
    { id: '9', title: 'لولا گازور آرامبند توکار', price: '105,000' },
    { id: '10', title: 'لولا گازور چهار پیچ', price: '46,000' },
    { id: '11', title: 'لولا گازور دو پیچ', price: '455,000' },
    { id: '12', title: 'لولا خلاص امیت', price: '47,500' },
    { id: '13', title: 'قرقره 120 کیلویی امیت پلاس', price: '85,000', badge: 'ویژه 💥' },
    { id: '14', title: 'قرقره امیت پلاس (80کیلویی)', price: '75,000' },
    { id: '15', title: 'قرقره امیت (80کیلویی)', price: '75,000' },
    { id: '16', title: 'مگنت امیت', price: '33,000' },
    { id: '17', title: 'جک آرامبند', price: '94,000' },
    { id: '18', title: 'جک معمولی', price: '-' },
  ],
  footerNote: 'قیمت ها بروز و قابل تغییر می باشد.',
  contact: {
    phone1: '۰۲۱-۵۵۵۵۵۵۵۵',
    phone2: '۰۹۱۲-۳۴۵۶۷۸۹',
    address: 'تهران، میدان حسن آباد، خیابان وحدت اسلامی، پلاک ۱۲۴',
    website: 'www.example.com',
    instagram: '@shop_brand',
    telegram: '@shop_order',
    whatsapp: '09123456789',
    showQrCode: false,
  },
  settings: {
    showRowNumber: false,
    showCodeColumn: false,
    showUnitColumn: false,
    showDiscountColumn: false,
    showCategoryHeaders: false,
    currency: 'تومان',
    currencyPosition: 'in_header',
    usePersianNumbers: true,
    fontSize: 'base',
    rowDensity: 'normal',
    themeId: 'orange-classic',
    cardWidth: 620,
    aspectRatio: 'auto',
  },
};
