export interface PriceItem {
  id: string;
  code?: string;
  title: string;
  price: number | string;
  unit?: string;
  discount?: string;
  badge?: string; // e.g. 'ویژه', 'تخفیف', or custom badge icon
  isHighlighted?: boolean;
}

export interface HeaderBanner {
  brandName: string;
  brandSubtext?: string;
  logoUrl?: string;
  logoType: 'text' | 'image';
  showBannerDecoration: boolean;
}

export interface ContactInfo {
  phone1: string;
  phone2?: string;
  address: string;
  website?: string;
  instagram?: string;
  telegram?: string;
  whatsapp?: string;
  qrCodeText?: string;
  showQrCode?: boolean;
}

export interface ColorTheme {
  id: string;
  name: string;
  primary: string; // Header accent (e.g. orange #ea580c or #f97316)
  primaryDark: string; // Banner background (#4b5563 or #374151)
  primaryLight: string; // Table header background (#ffedd5 / #fed7aa)
  primaryText: string; // Header text color
  rowAltBg: string; // Zebra row color (#fff7ed or #f9fafb)
  borderColor: string;
  accentBadge: string;
}

export interface TableSettings {
  showRowNumber: boolean;
  showCodeColumn: boolean;
  showUnitColumn: boolean;
  showDiscountColumn: boolean;
  showCategoryHeaders: boolean;
  currency: string; // 'تومان' | 'ریال' | 'هزار تومان' | 'بدون واحد' | custom
  currencyPosition: 'in_header' | 'in_cell' | 'none';
  usePersianNumbers: boolean;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  rowDensity: 'compact' | 'normal' | 'spacious';
  themeId: string;
  cardWidth: number; // in pixels or preset
  aspectRatio: 'auto' | 'a4' | 'story' | 'square';
}

export interface PriceListDocument {
  id: string;
  name: string;
  updatedAt: string;
  title: string;
  subtitle: string;
  date: string;
  banner: HeaderBanner;
  items: PriceItem[];
  footerNote: string;
  contact: ContactInfo;
  settings: TableSettings;
}
