# Masroofi — Supabase setup

Follow these steps once. They create the database, load the current site
content, enable image storage, and create your editor login.

> **Access model:** the public website is **read-only** for anonymous visitors.
> **Any signed-in Supabase user** can edit content through the admin panel, so
> keep sign-ups disabled (see step 5) and only create accounts you trust.

---

## 1. Create the project

1. Go to <https://supabase.com> → **New project**.
2. Name it `masrofi`, pick a region close to your users, set a strong DB password.
3. Wait ~2 minutes for it to finish provisioning.

## 2. Grab your keys

Project → **Settings → API**. You will need:

| Key | Where it is used |
|-----|------------------|
| **Project URL** (`https://xxxx.supabase.co`) | both the website and the admin app |
| **anon public** key | both apps (safe to expose — protected by RLS) |
| **service_role** key | **never** put in frontend code; only for admin scripts if ever needed |

## 3. Create the schema and load the content

Project → **SQL Editor → New query**. Paste the whole contents of
[`full_setup.sql`](full_setup.sql) and click **Run**. This single file does
everything in order:

- creates `content_blocks` — every editable section of the site (JSONB)
- creates `admins` — a legacy allow-list, kept for optional future gating (not required to edit)
- sets up Row Level Security: **public read, any signed-in user can write**
- creates a public **`site-assets`** storage bucket for images
- seeds the current site content (so the site looks identical to the hard-coded version)

Re-running the whole file is safe — it's idempotent and the content upserts on `(page, section)`.

## 5. Create your editor login

1. **Authentication → Users → Add user** → enter your email + a password
   (tick "Auto Confirm User").
2. That's it — **any signed-in user can edit content**, so there's nothing else
   to configure. Sign in to the admin app with this email/password.

> **Important — keep it private:** because every signed-in user can edit, turn
> **Authentication → Providers → Email → "Allow new users to sign up"** OFF so
> nobody can self-register, and only add trusted accounts via *Add user*.

> Optional: the legacy `admins` table is still there if you ever want to
> restrict editing again. To re-enable admin-only writes, list a user with
> `insert into public.admins (user_id, email) values ('USER-UID', 'you@example.com');`
> and swap the write policy back to `using (public.is_admin())`.

## 6. Wire the keys into the apps

**Website** — `src/environments/environment.ts` (and `environment.prod.ts`):

```ts
export const environment = {
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseAnonKey: 'your-anon-key',
};
```

**Admin app** — same file inside the `masrofi_admin` project.

That's it. The website reads content live; any signed-in user editing in the
admin app updates it.

---

## Content model (reference)

Everything lives in one table, `content_blocks`, keyed by `(page, section)`:

| page | sections |
|------|----------|
| `global` | `nav_links`, `footer_columns`, `testimonials` |
| `home` | `hero_slides`, `why_cards`, `earn_tasks`, `guide_toggles`, `comparison_rows`, `plans`, `calculator` |
| `pricing` | `plans`, `feature_groups`, `competitors`, `compare_rows`, `faqs` |
| `earn` | `chores`, `mini_cards`, `blog_cards`, `faqs` |
| `learn` | `age_groups`, `levels`, `blog_cards`, `faqs` |
| `invest` | `goals`, `why_cards`, `how_steps`, `plans`, `blog_cards`, `faqs`, `calculator` |
| `save` | `features`, `blog_cards`, `faqs` |
| `spend` | `card_designs`, `limits`, `control_cards`, `where_used`, `safety_tools`, `blog_cards`, `faqs` |

The `data` column holds the JSON array/object the Angular component renders
directly — so the admin edits the same shape the site consumes.
