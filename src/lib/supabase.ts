import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { PriceListDocument } from '../types';
import { sanitizeDoc } from '../utils/formatters';

const STORAGE_OVERRIDE_URL_KEY = 'PRICE_LIST_SUPABASE_URL';
const STORAGE_OVERRIDE_ANON_KEY = 'PRICE_LIST_SUPABASE_ANON_KEY';
const LOCAL_ADMIN_SESSION_KEY = 'PRICE_LIST_LOCAL_ADMIN_SESSION';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  source: 'env' | 'storage' | 'none';
}

/**
 * Sanitizes Supabase URL to ensure it is strictly the root origin (e.g. https://xyz.supabase.co)
 * and strips any trailing slashes, /rest/v1 paths, quotes, or dashboard URLs.
 */
export const sanitizeSupabaseUrl = (raw: string): string => {
  if (!raw) return '';
  let url = raw.trim();

  // Strip single/double quotes and whitespace
  url = url.replace(/^['"]+|['"]+$/g, '').trim();
  if (!url) return '';

  // Handle accidental pasting of dashboard URL: https://supabase.com/dashboard/project/abcdefghijk
  const dashboardMatch = url.match(/supabase\.com\/(?:dashboard\/)?project\/([a-zA-Z0-9_-]+)/);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Strip /rest/v1 or any subpath if user copied the API endpoint
  if (url.includes('/rest/v1')) {
    url = url.split('/rest/v1')[0];
  }

  // Ensure protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    // Origin is protocol + // + host + port (no pathname, no trailing slash)
    return parsed.origin;
  } catch {
    return url.replace(/\/+$/, '');
  }
};

/**
 * Sanitizes Supabase public/anon key by stripping whitespace and quotes.
 */
export const sanitizeSupabaseKey = (raw: string): string => {
  if (!raw) return '';
  return raw.replace(/^['"]+|['"]+$/g, '').replace(/\s+/g, '').trim();
};

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = sanitizeSupabaseUrl(((import.meta as any).env?.VITE_SUPABASE_URL as string) || '');
  const envKey = sanitizeSupabaseKey(((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '');

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
  }

  try {
    const storedUrl = sanitizeSupabaseUrl(localStorage.getItem(STORAGE_OVERRIDE_URL_KEY) || '');
    const storedKey = sanitizeSupabaseKey(localStorage.getItem(STORAGE_OVERRIDE_ANON_KEY) || '');
    if (storedUrl && storedKey) {
      return {
        url: storedUrl,
        anonKey: storedKey,
        isConfigured: true,
        source: 'storage',
      };
    }
  } catch {
    // ignore
  }

  return {
    url: '',
    anonKey: '',
    isConfigured: false,
    source: 'none',
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  try {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = sanitizeSupabaseKey(anonKey);

    if (!cleanUrl && !cleanKey) {
      localStorage.removeItem(STORAGE_OVERRIDE_URL_KEY);
      localStorage.removeItem(STORAGE_OVERRIDE_ANON_KEY);
    } else {
      localStorage.setItem(STORAGE_OVERRIDE_URL_KEY, cleanUrl);
      localStorage.setItem(STORAGE_OVERRIDE_ANON_KEY, cleanKey);
    }
    clientInstance = null;
  } catch (err) {
    console.error('Failed to save Supabase config:', err);
  }
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (clientInstance) return clientInstance;

  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  try {
    clientInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return clientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

// Admin Session State
export interface AdminSession {
  isAdmin: boolean;
  email?: string;
  source: 'supabase' | 'local';
}

export const getStoredAdminSession = (): AdminSession | null => {
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredAdminSession = (session: AdminSession | null) => {
  try {
    if (session) {
      localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY);
    }
  } catch {
    // ignore
  }
};

// Supabase SQL Schema for easy creation
export const SUPABASE_SQL_SCHEMA = `-- جدول لیست‌های قیمت
create table if not exists public.price_lists (
  id text primary key,
  name text not null,
  title text,
  subtitle text,
  date text,
  banner jsonb default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  footer_note text,
  contact jsonb default '{}'::jsonb,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- فعال‌سازی دسترسی امنیتی RLS
alter table public.price_lists enable row level security;

-- ایجاد سیاست‌های خواندن عمومی و نوشتن
create policy "Allow all read" on public.price_lists for select using (true);
create policy "Allow all insert" on public.price_lists for insert with check (true);
create policy "Allow all update" on public.price_lists for update using (true);
create policy "Allow all delete" on public.price_lists for delete using (true);
`;

/**
 * Fetch all documents from Supabase price_lists table
 */
export const fetchPriceListsFromSupabase = async (): Promise<PriceListDocument[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('price_lists')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Notice from Supabase query:', error.message || error);
      return [];
    }

    if (!data || !Array.isArray(data)) return [];

    return data.map((row: any) =>
      sanitizeDoc({
        id: row.id,
        name: row.name || 'بدون عنوان',
        title: row.title || '',
        subtitle: row.subtitle || '',
        date: row.date || '',
        banner: row.banner || {},
        items: row.items || [],
        footerNote: row.footer_note || '',
        contact: row.contact || {},
        settings: row.settings || {},
        updatedAt: row.updated_at || new Date().toISOString(),
      })
    );
  } catch (err: any) {
    console.warn('Network or Supabase query failed:', err?.message || err);
    return [];
  }
};

/**
 * Save / Upsert a single document into Supabase
 */
export const savePriceListToSupabase = async (doc: PriceListDocument): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('دیتابیس Supabase هنوز متصل نشده است.');
  }

  const payload = {
    id: doc.id,
    name: doc.name || doc.title || 'لیست قیمت',
    title: doc.title || '',
    subtitle: doc.subtitle || '',
    date: doc.date || '',
    banner: doc.banner || {},
    items: doc.items || [],
    footer_note: doc.footerNote || '',
    contact: doc.contact || {},
    settings: doc.settings || {},
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('price_lists').upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Error saving to Supabase:', error);
    throw new Error(error.message);
  }
};

/**
 * Delete a document from Supabase
 */
export const deletePriceListFromSupabase = async (id: string): Promise<void> => {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from('price_lists').delete().eq('id', id);
  if (error) {
    console.error('Error deleting from Supabase:', error);
    throw new Error(error.message);
  }
};
