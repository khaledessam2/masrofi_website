-- ============================================================================
-- Masroofi CMS — FULL SETUP (one file)
-- ----------------------------------------------------------------------------
-- Paste this ENTIRE file into Supabase → SQL Editor → New query → Run.
-- It does everything in order:
--   1) content schema (tables, trigger, RLS, storage bucket)
--   2) write access for ANY authenticated user (public site stays read-only)
--   3) seed data (mirrors the site's hard-coded content)
-- Safe to re-run: every step is idempotent and the seed upserts on (page, section).
-- ============================================================================


-- ############################################################################
-- PART 1 — CONTENT SCHEMA
-- ############################################################################

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- content_blocks: the single source of truth for all site content
-- ---------------------------------------------------------------------------
create table if not exists public.content_blocks (
  id          uuid primary key default gen_random_uuid(),
  page        text        not null,          -- 'home' | 'pricing' | 'earn' | ... | 'global'
  section     text        not null,          -- 'hero_slides' | 'faqs' | 'plans' | ...
  label       text,                          -- human-friendly name shown in the admin
  data        jsonb       not null default '[]'::jsonb,
  sort        int         not null default 0,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users (id) on delete set null,
  unique (page, section)
);

comment on table public.content_blocks is
  'Editable site content. Each row is one section of one page; data is the JSON the frontend component consumes verbatim.';

-- keep updated_at fresh on every write
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_content_blocks_updated_at on public.content_blocks;
create trigger trg_content_blocks_updated_at
  before update on public.content_blocks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- admins: legacy allow-list, kept for optional future gating.
-- NOTE: content writes are currently open to ANY authenticated user (see the
-- RLS section below), so membership here is NOT required to edit content.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  email    text,
  added_at timestamptz not null default now()
);

comment on table public.admins is 'Allow-list of auth users permitted to edit content.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--   * anyone (anon) can READ content        -> public website
--   * any signed-in user can WRITE content  -> admin panel
-- ---------------------------------------------------------------------------
alter table public.content_blocks enable row level security;
alter table public.admins        enable row level security;

drop policy if exists "content readable by everyone" on public.content_blocks;
create policy "content readable by everyone"
  on public.content_blocks for select
  using (true);

drop policy if exists "content writable by admins"        on public.content_blocks;
drop policy if exists "authenticated can update content"   on public.content_blocks;
drop policy if exists "content writable by authenticated" on public.content_blocks;
create policy "content writable by authenticated"
  on public.content_blocks for all
  to authenticated
  using (true)
  with check (true);

-- admins can see the admin list (so the panel can confirm access); no self-insert.
drop policy if exists "admins can read admin list" on public.admins;
create policy "admins can read admin list"
  on public.admins for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: public bucket for images (hero art, blog thumbnails, card visuals)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "site-assets public read" on storage.objects;
create policy "site-assets public read"
  on storage.objects for select
  using (bucket_id = 'site-assets');

drop policy if exists "site-assets admin write" on storage.objects;
drop policy if exists "site-assets authenticated write" on storage.objects;
create policy "site-assets authenticated write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-assets');

drop policy if exists "site-assets admin update" on storage.objects;
drop policy if exists "site-assets authenticated update" on storage.objects;
create policy "site-assets authenticated update"
  on storage.objects for update to authenticated
  using (bucket_id = 'site-assets');

drop policy if exists "site-assets admin delete" on storage.objects;
drop policy if exists "site-assets authenticated delete" on storage.objects;
create policy "site-assets authenticated delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site-assets');


-- ############################################################################
-- PART 2 — SEED DATA
-- Mirrors the content currently hard-coded in the Angular components so the
-- site looks identical after switching to the database. Every row upserts
-- on (page, section), so re-running is safe.
-- ############################################################################

insert into public.content_blocks (page, section, label, sort, data) values

-- ======================= GLOBAL ============================================
('global','nav_links','Global · Header navigation', 10, $json$[
  { "label": "Plans & Pricing", "path": "/pricing" },
  { "label": "Earn", "path": "/earn" },
  { "label": "Spend", "path": "/spend" },
  { "label": "Save", "path": "/save" },
  { "label": "Invest", "path": "/invest" },
  { "label": "Learn", "path": "/learn" }
]$json$),

('global','footer_columns','Global · Footer columns', 20, $json$[
  { "title": "Product", "links": [
    { "label": "Plans & Pricing", "href": "/pricing" },
    { "label": "The card", "href": "/spend" },
    { "label": "Parent app", "href": "/" },
    { "label": "Kids app", "href": "/" },
    { "label": "Money Missions", "href": "/earn" },
    { "label": "Junior investing", "href": "/invest" }
  ] },
  { "title": "Company", "links": [
    { "label": "About us", "href": "#" },
    { "label": "Careers", "href": "#" },
    { "label": "Press", "href": "#" },
    { "label": "Affiliates", "href": "#" },
    { "label": "Blog", "href": "#" }
  ] },
  { "title": "Help", "links": [
    { "label": "Help centre", "href": "#" },
    { "label": "Contact us", "href": "#" },
    { "label": "Fees", "href": "/pricing" },
    { "label": "Report a lost card", "href": "#" },
    { "label": "Safety tips", "href": "/learn" }
  ] },
  { "title": "Legal", "links": [
    { "label": "Terms & Conditions", "href": "#" },
    { "label": "Privacy Policy", "href": "#" },
    { "label": "Cookie Policy", "href": "#" },
    { "label": "Complaints", "href": "#" }
  ] }
]$json$),

('global','footer_social','Global · Footer social links', 21, $json$[
  { "network": "facebook", "href": "#" },
  { "network": "x", "href": "#" },
  { "network": "youtube", "href": "#" },
  { "network": "instagram", "href": "#" }
]$json$),

('global','footer_apps','Global · Footer app store links', 22, $json${
  "appStore": "#",
  "googlePlay": "#"
}$json$),

('global','footer_legal','Global · Footer legal links', 23, $json$[
  { "label": "Privacy Policy", "href": "#" },
  { "label": "Terms & Conditions", "href": "#" },
  { "label": "Cookie Policy", "href": "#" },
  { "label": "Accessibility", "href": "#" }
]$json$),

('global','testimonials','Global · Testimonials', 30, $json$[
  { "quote": "It has helped my daughter manage her money from an early age. She’s learned how to save and how to spend responsibly — I recommend it to every parent." },
  { "quote": "Excellent service, very easy to use, and my son loves having his own card and money. Highly recommended." },
  { "quote": "A brilliant app that has been a big help in teaching my son about money and banking. Wonderful idea." },
  { "quote": "Great for giving kids financial independence while parents keep a watchful eye on everything." }
]$json$),

-- ======================= HOME ==============================================
('home','hero_slides','Home · Hero slides', 10, $json$[
  { "img": "/hero/hero-1.svg", "alt": "Kid holding a Masroofi card and phone app", "title": "Where kids go to", "accent": "learn & grow money", "body": "Build lifelong skills in saving, investing, earning and spending. Join Masroofi today and get your first month free.", "cta": "Get started", "note": "T&Cs apply" },
  { "img": "/hero/hero-2.svg", "alt": "Junior investing account growth chart", "title": "Investing for", "accent": "your child’s future", "body": "Every Masroofi plan includes a junior investing account to help you build a pot of money for when they turn 18.", "cta": "Get started", "note": "Capital at risk. The value of investments can go down as well as up." },
  { "img": "/hero/hero-3.svg", "alt": "Savings with interest illustration", "title": "Savings", "accent": "with interest", "body": "Earn interest on savings that compounds over time to help your kids reach their savings goals faster.", "cta": "Get started", "note": "Interest rate is variable. Additional terms and conditions apply." },
  { "img": "/hero/hero-4.svg", "alt": "Happy parent testimonial", "title": "Such a great way", "accent": "to learn about money", "body": "“I wish I had this account when I was younger!” — a favourite from the thousands of families who trust Masroofi.", "cta": "Get started", "note": "Rated Excellent by parents." }
]$json$),

('home','why_cards','Home · Why choose cards', 20, $json$[
  { "icon": "spark", "title": "Easy", "body": "Activate it in seconds from your parent app, then let the experts do the hard work for you." },
  { "icon": "wallet", "title": "Affordable", "body": "No minimum contributions — start from as little as you like, and grow it at your own pace." },
  { "icon": "shield", "title": "Trustworthy", "body": "Held safely with our regulated banking partner, with your family’s money always protected." },
  { "icon": "family", "title": "Family focused", "body": "Family and friends can chip in directly with gift links, so everyone helps the pot grow." }
]$json$),

('home','earn_tasks','Home · Earn mini illustration', 30, $json$[
  { "label": "Make your bed", "amount": "£0.50", "done": true },
  { "label": "Weekly allowance", "amount": "+£10", "done": false },
  { "label": "Tidy your room", "amount": "£0.50", "done": true }
]$json$),

('home','guide_toggles','Home · Guide toggles', 40, $json$["High street", "ATMs", "Online"]$json$),

('home','comparison_rows','Home · Comparison rows', 50, $json$[
  { "label": "Eligible from age 6+", "masroofi": true, "banks": true },
  { "label": "Interest on savings", "masroofi": true, "banks": true },
  { "label": "Junior investing account", "masroofi": true, "banks": false },
  { "label": "80+ educational money lessons", "masroofi": true, "banks": false }
]$json$),

('home','plans','Home · Plans teaser', 60, $json$[
  { "name": "Everyday", "badge": "Core features", "accent": "green", "price": "£3.99", "unit": "monthly per child", "benefits": ["Smart money app & debit card for kids", "Pocket money & chore lists", "Real-time alerts & parental controls", "Junior investing account", "Custom savings goals"] },
  { "name": "Plus", "badge": "Most popular", "accent": "gold", "price": "£5.99", "unit": "monthly per child", "popular": true, "benefits": ["Everything in Everyday", "Interest paid on savings", "Free top-ups", "80+ Money Missions", "Priority support"] },
  { "name": "Max", "badge": "Family discount", "accent": "red", "price": "£9.99", "unit": "monthly, up to four kids", "benefits": ["All Plus benefits", "Up to four kids’ accounts included", "Lowest cost per child", "Shared family savings goals", "One simple family bill"] }
]$json$),

('home','calculator','Home · Investing calculator', 70, $json${ "childAge": 6, "daily": 4, "rate": 0.05 }$json$),

-- ======================= PRICING ===========================================
('pricing','plans','Pricing · Plans', 10, $json$[
  { "key": "e", "name": "Everyday", "badge": "Core learning tools", "badgeAccent": "green", "price": "£3.99", "unit": "monthly per child", "desc": "Smart learning tools that teach kids to earn, save, spend and invest." },
  { "key": "p", "name": "Plus", "badge": "Most popular", "badgeAccent": "gold", "price": "£5.99", "unit": "monthly per child", "desc": "Everything in Everyday, plus interest on savings and free top-ups.", "popular": true },
  { "key": "m", "name": "Max", "badge": "Family discount", "badgeAccent": "red", "price": "£9.99", "unit": "monthly, up to four kids", "desc": "All Plus benefits, up to four kids’ accounts included — for one monthly fee." }
]$json$),

('pricing','feature_groups','Pricing · Feature comparison', 20, $json$[
  { "title": "Earn", "rows": [
    { "label": "Smart money app that grows with your child", "e": true, "p": true, "m": true },
    { "label": "Gift links: money gifted by family & friends", "e": true, "p": true, "m": true },
    { "label": "Instant transfers", "e": true, "p": true, "m": true },
    { "label": "Pocket money & chore lists", "e": true, "p": true, "m": true },
    { "label": "Free top-ups", "e": false, "p": true, "m": true },
    { "label": "One free top-up each month (then a small fee per top-up)", "e": true, "p": null, "m": null }
  ] },
  { "title": "Spend", "rows": [
    { "label": "Standard debit card (personalised designs from £4.99)", "e": true, "p": true, "m": true },
    { "label": "Parent app & parental controls", "e": true, "p": true, "m": true }
  ] },
  { "title": "Save & Invest", "rows": [
    { "label": "Junior investing account", "e": true, "p": true, "m": true },
    { "label": "Custom savings goals", "e": true, "p": true, "m": true },
    { "label": "Interest paid on savings", "e": false, "p": true, "m": true }
  ] },
  { "title": "Learn", "rows": [
    { "label": "Parent space: parenting tips & guidance", "e": true, "p": true, "m": true },
    { "label": "Intro to Money Missions", "e": true, "p": false, "m": false },
    { "label": "80+ interactive Money Missions", "e": false, "p": true, "m": true }
  ] }
]$json$),

('pricing','competitors','Pricing · Competitor columns', 30, $json$[
  "NatWest Rooster Money", "Revolut <18", "Starling Kite", "HyperJar",
  "Lloyds Smart Start", "Nationwide FlexOne", "Halifax Money Smart"
]$json$),

('pricing','compare_rows','Pricing · Competitor comparison rows', 40, $json$[
  { "label": "Parental controls", "masroofi": true, "others": [true, true, true, true, false, false, false] },
  { "label": "Gift links: money gifted by family & friends", "masroofi": true, "others": [true, true, true, true, false, false, false] },
  { "label": "Kids’ savings goals", "masroofi": true, "others": [true, true, true, true, false, true, false] },
  { "label": "Interest on savings", "note": "With Plus & Max plans", "masroofi": true, "others": [false, false, false, true, true, true, true] },
  { "label": "Parent-paid interest on your child’s savings", "masroofi": true, "others": [false, false, false, false, false, false, false] },
  { "label": "Junior investing account included", "masroofi": true, "others": [false, false, false, false, false, false, false] },
  { "label": "Monitor your child’s spending", "masroofi": true, "others": [true, true, true, true, true, true, true] },
  { "label": "Instant cash transfers for kids", "masroofi": true, "others": [true, true, true, true, false, false, false] },
  { "label": "Child-friendly financial education", "masroofi": true, "others": [true, true, false, false, false, false, false] },
  { "label": "Automated pocket money linked to chores", "masroofi": true, "others": [false, false, false, false, false, false, false] },
  { "label": "Apple Pay (13+)", "masroofi": true, "others": [false, true, false, false, false, false, false] },
  { "label": "Custom cards", "masroofi": true, "others": [false, true, false, false, false, false, false] },
  { "label": "Age limits", "masroofi": "6–18", "others": ["6–17", "6–17", "6–16", "6–17", "11–15", "11–17", "11–17"] }
]$json$),

('pricing','faqs','Pricing · FAQ', 50, $json$[
  { "q": "Can I change my plan after I sign up?", "a": "Yes. You can move between Everyday, Plus and the Max family plan anytime from your parent app. Changes take effect from your next billing date." },
  { "q": "Can I cancel my membership?", "a": "Anytime, with no cancellation fees. If you cancel during your free trial you won’t be charged at all." },
  { "q": "How is payment taken for my membership?", "a": "Your monthly membership is charged automatically to the debit or credit card you register when you sign up. You’ll always be reminded before the free trial ends." },
  { "q": "How do I avoid a service fee for top-ups?", "a": "On Plus and Max, top-ups are always free and unlimited. On Everyday you get one free top-up each month, and setting up an automatic allowance is a simple way to avoid extra top-ups." },
  { "q": "How much is a personalised card design?", "a": "Every plan includes a free standard card. A personalised card design is an optional one-off from £4.99." },
  { "q": "How much does it cost to replace a lost or stolen card?", "a": "You can freeze a card instantly in the app. If you need a replacement, a standard replacement card is free — you’ll only pay if you choose a new personalised design." },
  { "q": "What do I get during my free trial?", "a": "The full experience of the plan you choose — the card, both apps, spending controls and Money Missions — free for 30 days, with nothing charged until the trial ends." },
  { "q": "Why does Masroofi charge a monthly fee?", "a": "The membership covers the card, the parent and kids apps, real-time controls and all the educational content — with no ads and no selling of your family’s data." }
]$json$),

-- ======================= EARN ==============================================
('earn','chores','Earn · Chores', 10, $json$[
  { "label": "Tidy your room", "amount": "£1.50" },
  { "label": "Load the washing machine", "amount": "£0.50" },
  { "label": "Walk the dog", "amount": "£1.00" }
]$json$),

('earn','mini_cards','Earn · Mini cards', 20, $json$[
  { "icon": "missions", "title": "Learn & earn", "body": "Discover Money Missions — gamified lessons where kids grow their money smarts and boost their pocket money at the same time." },
  { "icon": "gift", "title": "Gifting, simplified", "body": "Gifting money to kids on Masroofi is easy with Gift links. Family and friends choose the amount, add a message and send it straight to the card." },
  { "icon": "teen", "title": "Just for teens", "body": "Kids aged 13+ unlock extra benefits — get wages paid straight to their card and transfer money with friends, making splitting the bill easy." }
]$json$),

('earn','blog_cards','Earn · Blog teasers', 30, $json$[
  { "tag": "Pocket money", "title": "Teaching kids to spend wisely", "read": "2 min. read", "accent": "sky", "img": "/blog/blog-1.png" },
  { "tag": "Guides", "title": "The power of pocket money", "read": "2 min. read", "accent": "pink", "img": "/blog/blog-2.png" },
  { "tag": "Chores", "title": "Turning chores into earnings", "read": "4 min. read", "accent": "gold", "img": "/blog/blog-3.png" }
]$json$),

('earn','faqs','Earn · FAQ', 40, $json$[
  { "q": "How can kids earn money with Masroofi?", "a": "Kids earn through regular pocket money, one-off or recurring chores, gifts from family and friends via Gift links, and by completing Money Missions — all paid straight to their Masroofi card." },
  { "q": "Can I set up automatic allowance payments for my child?", "a": "Yes. Set an amount and a schedule in your parent app once, and pocket money is paid to your child’s card automatically every week or month — no reminders needed." },
  { "q": "What are Gift links, and how do they work?", "a": "Gift links let relatives and friends send money directly to your child’s card. They choose the amount, add a personal message, and the money lands safely in the child’s balance — no card details shared." },
  { "q": "What are good ways for kids and teens to earn?", "a": "Chores at home, small jobs for neighbours, selling old toys, and completing Money Missions all build the habit of earning. Teens 13+ can also have wages paid straight to their Masroofi card." }
]$json$),

-- ======================= LEARN =============================================
('learn','hero','Learn · Hero', 5, $json${
  "title": "Learn",
  "body": "Kids don’t learn everything they need to know about money at school — that’s why Masroofi helps them build essential money skills at home.",
  "img": "/learn/Learn.png",
  "alt": "Kids learning about money with the Masroofi app"
}$json$),

('learn','age_groups','Learn · Age groups', 10, $json$[
  { "range": "5–7 years", "topics": ["Value of coins and notes", "Keeping track of money", "Choices about saving and spending", "Needs and wants", "Looking after money", "Saving money", "Where their money comes from"] },
  { "range": "7–9 years", "topics": ["Ways to pay", "Keeping records", "Decisions about saving and spending", "Spending and saving priorities", "Keeping money safe", "Lending and borrowing", "Earning money", "Helping others"] },
  { "range": "9–11 years", "topics": ["Foreign currency", "Simple financial records", "Influences on saving and spending", "Value for money", "Protecting their money", "Saving and borrowing", "Links between work and money", "Wider communities"] },
  { "range": "11–14 years", "topics": ["Financial paperwork and budgeting", "Saving and borrowing", "Advertising and peer pressure", "Making financial decisions", "Financial products", "Fraud and identity theft", "Risk and reward", "Different types of insurance", "Investing in their future"] },
  { "range": "14–16 years", "topics": ["Planning and budgeting", "Planned saving and borrowing", "Consumer rights and responsibilities", "Comparing financial products", "Avoiding fraud and identity theft", "Managing financial risk and reward", "Insuring against risk", "Work, income and deductions", "Long-term financial planning"] },
  { "range": "16–19 years", "topics": ["Financial planning and budgeting", "Paying, borrowing and saving", "Taking responsibility", "Seeking financial advice", "Choosing financial products", "Protection from fraud and identity theft", "Identifying and reducing financial risks", "Links between work, life choices and planning"] }
]$json$),

('learn','levels','Learn · Money Mission levels', 20, $json$[
  { "ages": "Ages 6+", "level": "Level 1", "title": "The starting line", "body": "Kids discover the money basics — like earning and smart spending — and build a solid foundation for all their future learning.", "accent": "gold" },
  { "ages": "Ages 12–14", "level": "Level 2", "title": "Ready to level up", "body": "Older kids dive into advanced lessons, unlocking key skills like creating a budget and improving a credit score.", "accent": "green" },
  { "ages": "Ages 15–18", "level": "Level 3", "title": "Advanced money skills", "body": "These in-depth missions challenge and prepare teens for adult finance — covering everything from mortgages to investing.", "accent": "red" }
]$json$),

('learn','blog_cards','Learn · Blog teasers', 30, $json$[
  { "tag": "Learning", "title": "Money lessons every kid should know", "read": "3 min. read", "accent": "sky", "img": "/blog/blog-1.png" },
  { "tag": "Guides", "title": "The power of pocket money", "read": "2 min. read", "accent": "pink", "img": "/blog/blog-2.png" },
  { "tag": "Teens", "title": "Summer jobs for kids and teens", "read": "4 min. read", "accent": "gold", "img": "/blog/blog-3.png" }
]$json$),

('learn','faqs','Learn · FAQ', 40, $json$[
  { "q": "What are Money Missions on Masroofi?", "a": "Money Missions are bite-sized, gamified lessons built into the kids’ app. They teach real money skills — earning, saving, spending and investing — with points and rewards along the way." },
  { "q": "Can Masroofi help parents teach kids about money?", "a": "Absolutely. Masroofi gives you the tools and prompts to turn everyday moments into money lessons, plus a Parent Space with tips to support your child’s learning." },
  { "q": "Can parents track their child’s financial learning?", "a": "Yes. From your parent app you can see which Money Missions your child has completed and the points they’ve earned, so you can celebrate progress together." },
  { "q": "Why is it important to teach kids about money?", "a": "Money habits form early — often by age seven. Teaching kids about money young helps them grow into confident, capable adults who can save, budget and make smart decisions." },
  { "q": "At what age should kids start learning about money?", "a": "As early as five. Masroofi tailors lessons to every age from 5 to 18, so children always learn what’s right for their stage — right now." }
]$json$),

-- ======================= INVEST ============================================
('invest','hero','Invest · Hero', 5, $json${
  "title": "Invest",
  "body": "Grow a fund for your child’s future with a Masroofi Junior Stocks & Shares ISA.",
  "img": "/invest/Invest.png",
  "alt": "Parent and child investing together"
}$json$),

('invest','goals','Invest · 18th-birthday goals', 10, $json$[
  { "icon": "🚗", "label": "First car" },
  { "icon": "✈️", "label": "Gap year" },
  { "icon": "🎓", "label": "Uni costs" }
]$json$),

('invest','why_cards','Invest · Why choose cards', 20, $json$[
  { "icon": "wallet", "title": "Affordable", "body": "No minimum monthly contributions. Start from just £1, then choose how much you contribute and when." },
  { "icon": "chart", "title": "High performing", "body": "Our Junior ISA fund has delivered strong long-term average returns over the last 12 years." },
  { "icon": "family", "title": "Family focused", "body": "Family and friends can add money to your child’s Junior ISA directly with Gift links." },
  { "icon": "shield", "title": "Trustworthy", "body": "Your contributions are invested in a diversified equity fund and protected up to the regulated limit." }
]$json$),

('invest','how_steps','Invest · How it works', 30, $json$[
  { "icon": "add", "body": "You, your family and friends add money to your child’s Junior ISA — up to £9,000 per tax year." },
  { "icon": "percent", "body": "This money is invested by experts in a diversified stocks & shares fund." },
  { "icon": "grow", "body": "Profits are reinvested back into the fund, helping the money grow faster — this is called compounding." },
  { "icon": "lock", "body": "The Junior ISA is locked until your child turns 18, giving compounding time to work its magic." }
]$json$),

('invest','plans','Invest · Plans', 40, $json$[
  { "name": "Everyday", "badge": "Core features", "accent": "green", "price": "£3.99", "unit": "monthly per child", "benefits": ["Smart money app & debit card for kids", "Pocket money & chore lists", "Real-time alerts & parental controls", "Junior Stocks & Shares ISA", "Custom savings goals"] },
  { "name": "Plus", "badge": "Most popular", "accent": "gold", "price": "£5.99", "unit": "monthly per child", "popular": true, "benefits": ["Everything in Everyday", "Custom savings goals & 2.63% AER* interest", "Free top-ups", "80+ Money Missions", "Priority support"] },
  { "name": "Max", "badge": "Family discount", "accent": "red", "price": "£9.99", "unit": "monthly, up to four kids", "benefits": ["All Plus benefits", "Up to four kids’ accounts included", "Lowest cost per child", "Shared family savings goals", "One simple family bill"] }
]$json$),

('invest','blog_cards','Invest · Blog teasers', 50, $json$[
  { "tag": "Investing", "title": "Junior ISAs, explained for parents", "read": "3 min. read", "accent": "sky", "img": "/blog/blog-1.png" },
  { "tag": "Guides", "title": "The power of pocket money", "read": "2 min. read", "accent": "pink", "img": "/blog/blog-2.png" },
  { "tag": "Growth", "title": "Compound interest, explained simply", "read": "4 min. read", "accent": "gold", "img": "/blog/blog-3.png" }
]$json$),

('invest','faqs','Invest · FAQ', 60, $json$[
  { "q": "How do I open a Junior ISA?", "a": "Activate the Junior Stocks & Shares ISA in seconds from your parent app — it’s included on every Masroofi plan. Once it’s open, you can start contributing whenever you like." },
  { "q": "How much can I invest?", "a": "You can add up to £9,000 per tax year across all of your child’s Junior ISAs. There’s no minimum with Masroofi — start from as little as £1." },
  { "q": "What happens to a Junior ISA at 18?", "a": "The account is locked until your child turns 18. At 18 it becomes theirs and converts to an adult ISA, giving them a solid foundation to build on." },
  { "q": "What are the Junior ISA rules?", "a": "A child can hold one Junior Stocks & Shares ISA. Money paid in belongs to the child, can’t be withdrawn until 18 (except in specific circumstances) and grows free of UK tax." },
  { "q": "Are there any fees?", "a": "The Junior ISA is included in your monthly Masroofi plan — there are no separate account or contribution fees. Fund charges may apply within the investment itself." }
]$json$),

('invest','calculator','Invest · Investing calculator', 70, $json${ "childAge": 6, "daily": 4, "rate": 0.05 }$json$),

-- ======================= SAVE ==============================================
('save','features','Save · Features', 10, $json$[
  { "title": "The power of growth", "body": "Plus and Max members can make their money work harder by earning 2.63% AER interest on their savings — a real-life lesson in compound growth.", "note": "Interest rate is variable. Additional terms and conditions apply." },
  { "title": "Reward with extra savings", "body": "Motivate money-smart habits by paying extra interest on your child’s savings. Just choose the amount in your parent app and adjust it any time." }
]$json$),

('save','blog_cards','Save · Blog teasers', 20, $json$[
  { "tag": "Saving", "title": "Teaching kids the savings habit", "read": "2 min. read", "accent": "sky", "img": "/blog/blog-1.png" },
  { "tag": "Guides", "title": "The power of pocket money", "read": "2 min. read", "accent": "pink", "img": "/blog/blog-2.png" },
  { "tag": "Interest", "title": "Compound interest, explained simply", "read": "4 min. read", "accent": "gold", "img": "/blog/blog-3.png" }
]$json$),

('save','faqs','Save · FAQ', 30, $json$[
  { "q": "How does Masroofi help kids save money?", "a": "Kids set custom savings goals, move money in with one tap or automatically using autosave, and watch their balance grow towards the things they want — building the savings habit for life." },
  { "q": "Does Masroofi offer savings accounts with interest?", "a": "Yes. Plus and Max members earn 2.63% AER (variable) interest on their savings, paid straight into their Masroofi account — a real lesson in how money can grow." },
  { "q": "What is parent-paid interest and how does it work?", "a": "You can choose to pay your own bonus interest rate on your child’s savings, on top of any account interest. Set the rate in your parent app and change it whenever you like." },
  { "q": "What are the benefits of setting savings goals?", "a": "Goals give saving a purpose. When kids can see how close they are to a new game or a bigger dream, they’re far more motivated to put money aside and wait." },
  { "q": "How do I explain compound interest to my child?", "a": "Show them that the interest they earn also earns interest over time. With Masroofi they can watch it happen on real savings — the clearest way to make compound growth click." }
]$json$),

-- ======================= SPEND =============================================
('spend','card_designs','Spend · Card designs', 10, $json$[
  { "color": "green", "name": "Emerald" },
  { "color": "ink", "name": "Midnight" },
  { "color": "red", "name": "Coral" },
  { "color": "ink", "name": "Onyx" },
  { "color": "green", "name": "Mint" },
  { "color": "red", "name": "Sunset" }
]$json$),

('spend','limits','Spend · Spend limits', 20, $json$[
  { "label": "Weekly spend limit", "note": "Maximum spend in one week", "amount": "£80" },
  { "label": "Single spend limit", "note": "Maximum spend in one go", "amount": "£50" },
  { "label": "ATM withdrawal limit", "note": "Maximum withdrawal in one go", "amount": "£25" }
]$json$),

('spend','control_cards','Spend · Control cards', 30, $json$[
  { "icon": "shield", "title": "Built-in protection", "body": "Masroofi automatically blocks transactions at gambling, tobacco and other adult-only merchants. You can add extra blocks in your parent app." },
  { "icon": "bell", "title": "Real-time peace of mind", "body": "Know where, when and how much your child is spending with real-time notifications straight to your phone." },
  { "icon": "chart", "title": "Spending, mapped", "body": "Detailed, in-app insights give you a full overview of your child’s spending, so you can help them stay on track." }
]$json$),

('spend','where_used','Spend · Where the card works', 40, $json$[
  "ATMs", "Online", "Abroad, fee-free", "Subscriptions", "In-store", "Apps", "With Apple Pay & Apple Watch (13+)"
]$json$),

('spend','safety_tools','Spend · Safety tools', 50, $json$[
  { "icon": "check", "label": "Zero Liability Policy by Visa" },
  { "icon": "key", "label": "Secure PIN recovery in the app" },
  { "icon": "bell", "label": "Real-time spending notifications" },
  { "icon": "bank", "label": "Bank-level encryption" },
  { "icon": "block", "label": "Masroofi blocks unsafe spending categories" },
  { "icon": "lock", "label": "Easily block and unblock the card in-app" },
  { "icon": "chip", "label": "Chip and PIN-protected transactions" },
  { "icon": "card", "label": "Replace lost or stolen cards for free" }
]$json$),

('spend','blog_cards','Spend · Blog teasers', 60, $json$[
  { "tag": "Spending", "title": "Teaching kids to spend wisely", "read": "2 min. read", "accent": "sky", "img": "/blog/blog-1.png" },
  { "tag": "Guides", "title": "The power of pocket money", "read": "2 min. read", "accent": "pink", "img": "/blog/blog-2.png" },
  { "tag": "Safety", "title": "Keeping your child’s card safe", "read": "4 min. read", "accent": "gold", "img": "/blog/blog-3.png" }
]$json$),

('spend','faqs','Spend · FAQ', 70, $json$[
  { "q": "Where can my child use their Masroofi card?", "a": "The Masroofi Visa debit card works anywhere Visa is accepted — in shops, online, at ATMs, on subscriptions and apps, and abroad with no foreign transaction fees." },
  { "q": "What if my child loses their card?", "a": "Freeze the card instantly from your parent app in one tap. If it’s lost for good, you can order a free replacement — and your child’s balance stays safe throughout." },
  { "q": "Can I set spending limits for my child?", "a": "Yes. Set weekly spend, single-purchase and ATM withdrawal limits from your parent app, and change them at any time." },
  { "q": "Does Masroofi work with Apple Pay?", "a": "Teens aged 13+ can add their Masroofi card to Apple Pay and pay with their phone or Apple Watch, wherever contactless is accepted." },
  { "q": "How can I teach my child responsible spending?", "a": "Real-time notifications, spending insights and safety limits let your child spend within safe boundaries while you guide them — turning everyday purchases into money lessons." }
]$json$),

-- ======================= EDITABLE PAGE COPY (hero, sections, CTAs, etc.) ====
-- Full marketing copy migrated out of the hard-coded templates so the admin
-- can edit every heading, paragraph, CTA label, stat and illustration label.

-- --- GLOBAL (shared across pages) ---
('global','newsletter','Global · Newsletter', 24, $json${
  "heading": "Stay in the know",
  "body": "Get a fresh slice of money news, and the latest Masroofi updates, straight to your inbox.",
  "firstName": "First name",
  "email": "Email",
  "button": "Sign me up",
  "fineprint": "Read our privacy policy. Unsubscribe anytime."
}$json$),

('global','testimonials_header','Global · Testimonials header', 25, $json${
  "heading": "Don’t just take our word for it",
  "subtitle": "See why 9 in 10 parents would recommend Masroofi to a friend.",
  "ratingLabel": "Rated excellent"
}$json$),

-- --- HOME ---
('home','copy','Home · Page copy', 5, $json${
  "statLine": "Join over 2 million kids who have already built money skills with Masroofi",
  "statCaption": "Based on all-time active child members since launch.",
  "ratingAppStore": "Rated on the App Store",
  "ratingExcellent": "Rated Excellent",
  "ratingGooglePlay": "Rated on Google Play",
  "calcHeading": "Invest in your child’s future",
  "calcBody": "Grow a pot of money for when they turn 18 with a Masroofi junior investing account — included on every plan.",
  "calcCta": "Learn more",
  "calcEyebrow": "Junior investing account",
  "calcDaySuffix": "a day",
  "calcWorthText": "invested could be worth",
  "calcByAge": "by the time they’re 18",
  "calcAgeLabel": "Your child’s age",
  "calcDailyLabel": "Amount invested daily",
  "calcLegendReturns": "Returns",
  "calcLegendContrib": "Your contributions",
  "calcAxisToday": "Today",
  "calcAxisAge18": "Age 18",
  "calcDisclaimer": "Assumes a hypothetical 5% annual return. Projections are not a reliable indicator of future results. Capital at risk — the value of investments can go down as well as up.",
  "whyHeading": "Why choose a Masroofi junior account?",
  "bigStatement": "Game-changing money learning, built for real life",
  "learnMore": "Learn more ›",
  "featLearnHeading": "Learn",
  "featLearnBody": "Bite-sized lessons and real experiences teach kids lifelong money skills in a fun, gamified way — earning points as they go.",
  "featLearnCardTitle": "Why do people invest?",
  "featLearnBadge100": "100",
  "featLearnBadgeXp": "60 XP",
  "featSaveHeading": "Save with interest",
  "featSaveBody": "With custom savings goals and interest for Plus & Max members, your kids’ money grows with purpose.",
  "featSaveInterest": "Interest",
  "featSaveOnSavings": "on savings",
  "featInvestHeading": "Invest",
  "featInvestBody": "You’re not alone in wanting more for your kids — a junior investing account helps you grow money for their future.",
  "featInvestCardLabel": "Junior investing",
  "featInvestCardStat": "£1,543.20",
  "featEarnHeading": "Earn",
  "featEarnBody": "Through pocket money, gifts from family & friends and completing chores, kids learn to grow their own money.",
  "featSpendHeading": "Spend",
  "featSpendBody": "Set kids up for smarter spending with a personalised debit card and built-in spending controls.",
  "featSpendLabel": "Gaming World",
  "featSpendStat": "-£15",
  "featGuideHeading": "Guide",
  "featGuideBody": "Parents set limits, track spending and stay in the loop — all with bank-grade security.",
  "featureCta": "Get started",
  "comparisonHeading": "For kids growing money smarts, it’s Masroofi",
  "comparisonMasroofi": "Masroofi",
  "comparisonBankLabel": "Kids’ bank accounts",
  "comparisonOther": "Other accounts",
  "comparisonBody": "Many kids’ bank accounts offer a card and app with notifications and controls. The features above are what make Masroofi uniquely different.",
  "plansHeading": "Plans & pricing",
  "plansBody": "Choose from three Masroofi plans — all include the junior investing account. Try free for 30 days, cancel or switch plans anytime.",
  "topBenefits": "Top benefits:",
  "comparePrices": "Compare prices",
  "plansFineprint": "Interest rate is variable. Additional terms and conditions apply."
}$json$),

-- --- EARN ---
('earn','hero','Earn · Hero', 5, $json${
  "title": "Earn",
  "body": "Teach your child the value of money as they learn to earn with pocket money, chores & Money Missions.",
  "img": "/earn/Earn.png",
  "alt": "Child earning pocket money with the Masroofi app"
}$json$),

('earn','copy','Earn · Page copy', 6, $json${
  "pocketEyebrow": "Pocket money",
  "pocketHeading": "Pocket money, made smarter",
  "pocketBody": "Kickstart healthy money habits with a regular allowance. Just set up automated payments in your parent app and let the weekly pocket money payday begin.",
  "pocketCta": "Learn more ›",
  "allowanceBadge": "Allowance",
  "allowanceAmount": "+£10",
  "stat1Before": "Masroofi has helped kids earn over",
  "stat1Number": "£1.8 billion",
  "stat1After": "in pocket money",
  "stat1Caption": "Based on all-time active child members since launch.",
  "choresMockLabel": "Today’s tasks",
  "choresEyebrow": "Chores",
  "choresHeading": "Chores that pay off",
  "choresBody": "Transform effort into earning with in-app task lists. Your child can complete chores you set, and you send a reward for each one they tick off.",
  "choresCta": "Learn more ›",
  "stat2Heading": "Over 84 million chores completed in the Masroofi app",
  "stat2Caption": "Includes recurring daily chores as well as weekly tasks.",
  "transfersEyebrow": "Transfers",
  "transfersHeading": "Instant money transfers",
  "transfersBody": "Need-it-now money moment? With Masroofi instant transfers, you can send money straight to your child’s card at any time.",
  "transfersCta": "Learn more ›",
  "transferFromName": "From Dad",
  "transferFromBalance": "Balance £32.50",
  "transferFromInitial": "D",
  "transferToName": "To Nadine’s card",
  "transferToBalance": "Balance £10.50",
  "transferToInitial": "N",
  "miniCardCta": "Learn more ›",
  "diariesHeading": "Pocket money diaries: Liam",
  "diariesBody": "Liam has been growing money smarts with Masroofi since he was six. He boosts his pocket money with chores and uses Money Missions to understand the value of what he wants to buy.",
  "diariesCta": "Liam’s money story ›",
  "testimonialQuote": "Great app. Kids love using it and completing their tasks to earn their extra pocket money.",
  "testimonialAuthor": "Phil B. — verified member",
  "testimonialCaption": "Rated excellent by families like yours",
  "faqHeading": "Your questions, answered",
  "readMoreSubtitle": "Discover tips, tricks and earning insights on the Masroofi blog."
}$json$),

-- --- SPEND ---
('spend','hero','Spend · Hero', 5, $json${
  "title": "Spend",
  "body": "Grow your child's money smarts as they practise responsible spending with their own prepaid debit card."
}$json$),

('spend','copy','Spend · Page copy', 6, $json${
  "cardsHeading": "45+ personalised debit cards",
  "cardsMakeItTheirOwn": "Make it their own",
  "cardsBody": "Kids can choose their favourite design and personalise it with their name.",
  "cardsFineprint": "Kids’ debit cards licensed by Visa.",
  "statementHeading": "Smart spending, parent approved",
  "statementBody": "Support and guide your child’s learning with flexible parental controls.",
  "limitsEyebrow": "Parental controls",
  "limitsHeading": "Safety limits set by you",
  "limitsBody": "Set limits for weekly spending, one-off purchases and ATM withdrawals in your parent app for added security and protection. You can change these at any time.",
  "limitsCta": "Learn more ›",
  "whereUsedLabel": "Gaming World",
  "whereUsedStat": "-£15",
  "whereUsedHeading": "Where can their card be used?",
  "bigStatValue": "91%",
  "bigStatRest": " of parents would recommend Masroofi to a friend",
  "bigStatFineprint": "Based on a survey of active Masroofi members. Individual experiences may vary.",
  "safetyToolsHeading": "Safety tools you can count on",
  "testimonialQuote": "We absolutely LOVE Masroofi! It has given our child the confidence, self-belief and skills to understand and manage money.",
  "testimonialAttribution": "Jodie B. — verified member",
  "testimonialCaption": "Rated excellent by families like yours",
  "faqHeading": "Questions? We’ve got you covered",
  "readMoreSubtitle": "Discover tips, tricks and spending insights on the Masroofi blog."
}$json$),

-- --- SAVE ---
('save','hero','Save · Hero', 5, $json${
  "title": "Save",
  "body": "Help your child take charge of their own saving with the kids' savings account that pays them interest.",
  "img": "/save/save.png",
  "alt": "Child saving money with the Masroofi app"
}$json$),

('save','copy','Save · Page copy', 6, $json${
  "goalsEyebrow": "Savings goals",
  "goalsHeading": "Set it, save it, smash it",
  "goalsBody": "Masroofi savings goals help kids grow their money — and their money smarts. Kids can set custom goals, transfer money automatically with autosave and earn interest.*",
  "goalsCta": "Learn more ›",
  "goalsFootnote": "*Plus & Max plans only. Interest rate is variable. Additional T&Cs apply.",
  "goalsBadge": "Interest savings",
  "goalsStat": "2.63%",
  "statHeadingBefore": "Masroofi kids & parents have set",
  "statHeadingHighlight": "2.49 million",
  "statHeadingAfter": "savings goals",
  "statCaption": "Based on all-time active member data since launch.",
  "isaChipFirst": "First car",
  "isaChipSecond": "Gap year",
  "isaCardLabel": "Junior ISA",
  "isaCardStat": "£1,543.20",
  "isaHeading": "They save, you invest with a Junior ISA",
  "isaBody": "Every Masroofi plan includes a Junior Stocks & Shares ISA — so while your child grows their savings, you can grow a pot of money for when they turn 18.",
  "isaCta": "Discover Junior ISA ›",
  "isaFootnote": "Capital at risk. The value of your investment can go down as well as up.",
  "interestLabelA": "Interest savings",
  "interestLabelB": "Parent-paid interest",
  "interestValueA": "2.63% AER",
  "interestValueB": "15% interest",
  "diariesHeading": "Pocket money diaries: Ellie",
  "diariesBody": "Masroofi member Ellie is using her app to save for the future. Her biggest saving tips? Using autosave, and tracking her spending in her Masroofi app.",
  "diariesCta": "Ellie's money story ›",
  "testimonialQuote": "Perfect for teaching my daughter how to manage and, more importantly, how to save her money.",
  "testimonialAttribution": "Chris F. — verified member",
  "testimonialCaption": "Rated excellent by families like yours",
  "faqHeading": "Frequently asked questions",
  "readMoreHeading": "Want more saving insights?",
  "readMoreSubtitle": "You'll find them on the Masroofi blog."
}$json$),

-- --- PRICING ---
('pricing','hero','Pricing · Hero', 5, $json${
  "title": "Choose your ",
  "titleAccent": "perfect plan",
  "body": "Kids learn and grow their money while parents support and guide — all in one place."
}$json$),

('pricing','copy','Pricing · Page copy', 6, $json${
  "plansHeading": "Plans & pricing",
  "plansBody": "Join over 2 million kids who have already built real money skills with Masroofi.",
  "plansFineprint": "Based on all-time active child members since launch.",
  "planFreeNote": "One month free",
  "planCta": "Get started",
  "plansDisclaimer": "Capital at risk. The value of your child’s investments can go down as well as up. Interest rates are variable and additional terms apply.",
  "plansEmphasis": "One month FREE, cancel anytime.",
  "seeAllBenefits": "See all benefits",
  "whyHeading": "Why choose Masroofi?",
  "whyBody": "Masroofi is the money app and debit card built by parents, for kids. From just £3.99 a month, children get a head start in life while parents get the tools to support and guide.",
  "whyCompareLead": "See how Masroofi compares to other kids’ accounts:",
  "swipeHint": "Swipe to compare →",
  "comparisonFineprint": "Comparison based on publicly available information. Correct at time of writing.",
  "investHeading": "Invest in your child’s future",
  "investBody": "Grow a pot of money for when your child turns 18 with a Masroofi junior investing account. It’s included in every plan — just activate it in your parent app.",
  "investFineprint": "Capital at risk. The value of your investment can go down as well as up.",
  "investCta": "Discover investing",
  "investGoalLabel": "18th birthday goal",
  "investGoalUni": "Uni fund",
  "investCardLabel": "Junior investing",
  "investCardStat": "£1,543.20",
  "investGoalCar": "First car",
  "faqHeadingLine1": "Got questions?",
  "faqHeadingLine2": "We have answers"
}$json$),

-- --- LEARN (copy; hero seeded above) ---
('learn','copy','Learn · Page copy', 6, $json${
  "badgeMoneyBasics": "Money basics",
  "badgeMoneyBasicsXp": "45 XP",
  "badgeBudgeting": "Budgeting & planning",
  "badgeBudgetingXp": "30 XP",
  "badgeInvesting": "Intro to investing",
  "badgeInvestingXp": "20 XP",
  "heroStatement": "Finance lessons tailored to every age",
  "heroStatementBody": "By seven, kids are already forming lifelong money habits. That’s why Masroofi created Money Missions — real learning for every age, right now.",
  "sliderCta": "Read more",
  "sliderCaption": "Aligned to a recognised financial education planning framework.",
  "missionsIntro": "Money Missions: the ultimate parent hack for teaching money smarts",
  "freeHeading": "80+ free money lessons",
  "freeBody": "Try before you buy with Money Missions! Kids can grow their money skills with 80+ free videos, then complete the gamified versions in-app after signing up.",
  "freeCta": "Try for free",
  "freeMockTitle": "Why do people invest?",
  "freeMockButton": "Start mission",
  "freeMockBadge100": "100",
  "freeMockBadgeXp": "60 XP",
  "bigStatBefore": "Kids save an average of",
  "bigStatHighlight": "50% more",
  "bigStatAfter": "after completing all the Level 1 Money Missions",
  "bigStatCaption": "Based on Masroofi’s Money Missions impact study.",
  "inAppHeading": "In-app missions. Real-world results.",
  "inAppBody": "Kids bring the skills they learn in Money Missions to life with their own app and card. This safe, hands-on practice lets them enter adulthood confident and prepared.",
  "inAppCta": "Learn more ›",
  "inAppMockAllMoney": "All your money",
  "inAppMockTotal": "£26.95",
  "inAppMockOnCard": "On the card",
  "inAppMockOnCardVal": "£22.95",
  "inAppMockInSavings": "In savings",
  "inAppMockInSavingsVal": "£4.00",
  "parentMockLabel": "Parent Space",
  "parentMockTitle": "Growing money confidence",
  "parentMockRead": "2 min read",
  "parentHeading": "Parents, this one’s for you",
  "parentBody": "From tips to support your child’s learning, to updates on money lessons in schools, the Masroofi Parent Space helps grown-ups grow their money skills too.",
  "parentCta": "Explore Parent Space ›",
  "testimonialQuote": "Financial education is sorely lacking at school. I’ve been impressed with how Masroofi encourages my 7-year-old twins to learn about money and make decisions.",
  "testimonialAuthor": "Ed. — verified member",
  "testimonialCaption": "Rated excellent by families like yours",
  "faqHeading": "Questions? You’ll find the answers here",
  "readMoreHeading": "The learning never stops",
  "readMoreSubtitle": "Discover more ways to teach your child to earn, save, spend and invest."
}$json$),

-- --- INVEST (copy; hero seeded above) ---
('invest','copy','Invest · Page copy', 6, $json${
  "goalLabel": "18th birthday goal",
  "goalCar": "First car",
  "goalGap": "Gap year",
  "goalUni": "Uni costs",
  "isaCardLabel": "Junior ISA",
  "isaCardStat": "£1,543.20",
  "includedBadge": "Included in all Masroofi plans",
  "heroStatement": "Money invested in a Junior ISA now could contribute to their dreams at 18",
  "calcEyebrow": "Junior Stocks & Shares ISA",
  "calcDaySuffix": "a day",
  "calcWorthText": "invested could be worth",
  "calcByAge": "by the time they’re 18",
  "calcAgeLabel": "Your child’s age",
  "calcDailyLabel": "Amount invested daily",
  "calcLegendReturns": "Returns",
  "calcLegendContrib": "Your contributions",
  "calcAxisToday": "Today",
  "calcAxisAge18": "Age 18",
  "calcDisclaimer": "Assumes a hypothetical 5% average annual return. This figure is illustrative only and not a guaranteed outcome. Capital at risk. Junior ISA rules and terms and conditions apply.",
  "whyHeading": "Why choose the Masroofi Junior ISA?",
  "easyHeading": "Easy",
  "easyBody": "Activate it in seconds using your parent app, then let the experts do the hard work for you — no finance degree needed.",
  "easyCta": "Learn more ›",
  "easyMockTitle": "Nadine’s Junior ISA",
  "easyMockStat": "£1,543.20",
  "easyMockChange": "▲ 11.8% all time",
  "easyMockContrib": "£1,380 total contributions",
  "easyMockButton": "Add money",
  "easyMockRow1Label": "Monthly contribution",
  "easyMockRow1Val": "£30.00",
  "easyMockRow2Label": "From Aunt Vicky",
  "easyMockRow2Val": "+£50.00",
  "whyFineprint": "Capital at risk. Past performance is not a guarantee of future results.",
  "howHeading": "How does it work?",
  "testimonialQuote": "I’ve set up a Junior ISA so he has a solid foundation in the future to build on his dreams.",
  "testimonialAuthor": "Nicholas J. — verified member",
  "testimonialCaption": "Rated excellent by families like yours",
  "faqHeading": "Your questions, answered",
  "plansHeading": "Plans & pricing",
  "plansBody": "Choose from three Masroofi plans — all include the Junior Stocks & Shares ISA. Try free for 30 days, cancel or switch plans anytime.",
  "topBenefits": "Top benefits:",
  "comparePrices": "Compare prices",
  "plansFineprint": "Interest rate is variable. Additional terms and conditions apply.",
  "readMoreSubtitle": "Discover tips, tricks and investing insights on the Masroofi blog."
}$json$)

on conflict (page, section) do update
  set data = excluded.data,
      label = excluded.label,
      sort = excluded.sort;
