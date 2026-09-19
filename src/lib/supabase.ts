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

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (((import.meta as any).env?.VITE_SUPABASE_URL as string) || '').trim();
  const envKey = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '').trim();

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      isConfigured: true,
      source: 'env',
    };
  }

  try {
    const storedUrl = (localStorage.getItem(STORAGE_OVERRIDE_URL_KEY) || '').trim();
    const storedKey = (localStorage.getItem(STORAGE_OVERRIDE_ANON_KEY) || '').trim();
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
    if (!url.trim() && !anonKey.trim()) {
      localStorage.removeItem(STORAGE_OVERRIDE_URL_KEY);
      localStorage.removeItem(STORAGE_OVERRIDE_ANON_KEY);
    } else {
      localStorage.setItem(STORAGE_OVERRIDE_URL_KEY, url.trim());
      localStorage.setItem(STORAGE_OVERRIDE_ANON_KEY, anonKey.trim());
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

  const { data, error } = await supabase
    .from('price_lists')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching from Supabase:', error);
    throw new Error(error.message);
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
