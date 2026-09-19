# راهنمای اتصال به دیتابیس Supabase و استقرار در Render.com

این پروژه به طور کامل برای ارتباط با پایگاه داده PostgreSQL در **Supabase** و استقرار بدون دردسر بر روی **Render.com** آماده‌سازی شده است.

---

## ۱. راه‌اندازی دیتابیس در Supabase

1. وارد پنل [Supabase.com](https://supabase.com) شوید و یک پروژه جدید بسازید.
2. از منوی سمت چپ به بخش **SQL Editor** بروید و یک کوئری جدید باز کنید.
3. دستورات SQL زیر را کپی کرده و دکمه **Run** را بزنید:

```sql
-- ایجاد جدول لیست‌های قیمت
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

-- فعال‌سازی RLS
alter table public.price_lists enable row level security;

-- ایجاد دسترسی‌های لازم
create policy "Allow all read" on public.price_lists for select using (true);
create policy "Allow all insert" on public.price_lists for insert with check (true);
create policy "Allow all update" on public.price_lists for update using (true);
create policy "Allow all delete" on public.price_lists for delete using (true);
```

4. از بخش **Project Settings -> API** مقادیر زیر را یادداشت کنید:
   - **Project URL**
   - **Project API keys (anon / public)**

---

## ۲. ورود ادمین (Admin Authentication)

- در هدر برنامه روی دکمه **«ورود مدیر»** کلیک کنید.
- می‌توانید با سیستم احراز هویت Supabase ایمیل و رمزعبور وارد کنید، یا از طریق تب «ثبت‌نام کاربر ادمین» اقدام نمایید.
- در صورتی که هنوز کاربر Supabase نساخته‌اید، رمز عبور پشتیبان ادمین: `admin123` می‌باشد.

---

## ۳. استقرار در Render.com

1. وارد [Render.com](https://render.com) شوید.
2. روی دکمه **New +** و سپس **Static Site** کلیک کنید.
3. مخزن گیت‌هاب پروژه را انتخاب کنید.
4. تنظیمات ساخت:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. در تب **Environment Variables** دو متغیر زیر را تعریف کنید:
   - `VITE_SUPABASE_URL` : برابر با آدرس Project URL شما در سوبابیس
   - `VITE_SUPABASE_ANON_KEY` : برابر با کلید anon در سوبابیس
6. دکمه **Create Static Site** را بزنید. پروژه ظرف چند ثانیه بیلد و فعال خواهد شد!
