import { Component, ChangeDetectionStrategy, signal, computed, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { StarComponent } from '../../components/star/star';
import { CardVisualComponent } from '../../components/card-visual/card-visual';
import { FaqComponent, FaqItem } from '../../components/faq/faq';
import { ReadMoreComponent, BlogCard } from '../../components/read-more/read-more';
import { RevealDirective } from '../../directives/reveal.directive';

type CardColor = 'ink' | 'green' | 'red';
interface CardDesign { color: CardColor; name: string; }
interface SpendLimit { label: string; note: string; amount: string; }
interface ControlCard { icon: 'shield' | 'bell' | 'chart'; title: string; body: string; }
interface SafetyTool { icon: 'check' | 'key' | 'bell' | 'lock' | 'block' | 'card' | 'bank' | 'chip'; label: string; }

@Component({
  selector: 'app-spend',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    HeaderComponent,
    FooterComponent,
    StarComponent,
    CardVisualComponent,
    FaqComponent,
    ReadMoreComponent,
    RevealDirective,
  ],
  templateUrl: './spend.html',
})
export class SpendComponent {
  private content = inject(ContentService);

  hero = this.content.block('spend', 'hero', {
    title: 'Spend',
    body: "Grow your child's money smarts as they practise responsible spending with their own prepaid debit card.",
  });

  newsletter = this.content.block('global', 'newsletter', {
    heading: 'Stay in the know',
    body: 'Get a fresh slice of money news, and the latest Masroofi updates, straight to your inbox.',
    firstName: 'First name',
    email: 'Email',
    button: 'Sign me up',
    fineprint: 'Read our privacy policy. Unsubscribe anytime.',
  });

  copy = this.content.block('spend', 'copy', {
    cardsHeading: '45+ personalised debit cards',
    cardsMakeItTheirOwn: 'Make it their own',
    cardsBody: 'Kids can choose their favourite design and personalise it with their name.',
    cardsFineprint: 'Kids’ debit cards licensed by Visa.',
    statementHeading: 'Smart spending, parent approved',
    statementBody: 'Support and guide your child’s learning with flexible parental controls.',
    limitsEyebrow: 'Parental controls',
    limitsHeading: 'Safety limits set by you',
    limitsBody: 'Set limits for weekly spending, one-off purchases and ATM withdrawals in your parent app for added security and protection. You can change these at any time.',
    limitsCta: 'Learn more ›',
    whereUsedLabel: 'Gaming World',
    whereUsedStat: '-£15',
    whereUsedHeading: 'Where can their card be used?',
    bigStatValue: '91%',
    bigStatRest: ' of parents would recommend Masroofi to a friend',
    bigStatFineprint: 'Based on a survey of active Masroofi members. Individual experiences may vary.',
    safetyToolsHeading: 'Safety tools you can count on',
    testimonialQuote: 'We absolutely LOVE Masroofi! It has given our child the confidence, self-belief and skills to understand and manage money.',
    testimonialAttribution: 'Jodie B. — verified member',
    testimonialCaption: 'Rated excellent by families like yours',
    faqHeading: 'Questions? We’ve got you covered',
    readMoreSubtitle: 'Discover tips, tricks and spending insights on the Masroofi blog.',
  });

  cardDesigns: CardDesign[] = this.content.block<CardDesign[]>('spend', 'card_designs', [
    { color: 'green', name: 'Emerald' },
    { color: 'ink', name: 'Midnight' },
    { color: 'red', name: 'Coral' },
    { color: 'ink', name: 'Onyx' },
    { color: 'green', name: 'Mint' },
    { color: 'red', name: 'Sunset' },
  ]);

  // ---- card slider (1 card on mobile, 3 at once with active centred on ≥sm) ----
  slide = signal(0);
  perView = signal(3);

  constructor() {
    afterNextRender(() => {
      const update = () => this.perView.set(window.innerWidth < 640 ? 1 : 3);
      update();
      window.addEventListener('resize', update);
    });
  }

  // Track offset as a percentage of the visible track. With 3-up we keep the
  // active card in the middle slot (clamped so the ends never show a blank
  // slot); with 1-up we simply step one full card at a time.
  trackOffset = computed(() => {
    const n = this.cardDesigns.length;
    const pv = this.perView();
    if (pv === 1) return this.slide() * 100;
    const centre = Math.min(Math.max(this.slide(), 1), n - 2);
    return (centre - 1) * (100 / pv);
  });

  next() { this.slide.update((v) => (v + 1) % this.cardDesigns.length); }
  prev() { this.slide.update((v) => (v - 1 + this.cardDesigns.length) % this.cardDesigns.length); }
  goTo(i: number) { this.slide.set(i); }

  limits: SpendLimit[] = this.content.block<SpendLimit[]>('spend', 'limits', [
    { label: 'Weekly spend limit', note: 'Maximum spend in one week', amount: '£80' },
    { label: 'Single spend limit', note: 'Maximum spend in one go', amount: '£50' },
    { label: 'ATM withdrawal limit', note: 'Maximum withdrawal in one go', amount: '£25' },
  ]);

  controlCards: ControlCard[] = this.content.block<ControlCard[]>('spend', 'control_cards', [
    {
      icon: 'shield',
      title: 'Built-in protection',
      body: 'Masroofi automatically blocks transactions at gambling, tobacco and other adult-only merchants. You can add extra blocks in your parent app.',
    },
    {
      icon: 'bell',
      title: 'Real-time peace of mind',
      body: 'Know where, when and how much your child is spending with real-time notifications straight to your phone.',
    },
    {
      icon: 'chart',
      title: 'Spending, mapped',
      body: 'Detailed, in-app insights give you a full overview of your child’s spending, so you can help them stay on track.',
    },
  ]);

  whereUsed: string[] = this.content.block<string[]>('spend', 'where_used', [
    'ATMs',
    'Online',
    'Abroad, fee-free',
    'Subscriptions',
    'In-store',
    'Apps',
    'With Apple Pay & Apple Watch (13+)',
  ]);

  safetyTools: SafetyTool[] = this.content.block<SafetyTool[]>('spend', 'safety_tools', [
    { icon: 'check', label: 'Zero Liability Policy by Visa' },
    { icon: 'key', label: 'Secure PIN recovery in the app' },
    { icon: 'bell', label: 'Real-time spending notifications' },
    { icon: 'bank', label: 'Bank-level encryption' },
    { icon: 'block', label: 'Masroofi blocks unsafe spending categories' },
    { icon: 'lock', label: 'Easily block and unblock the card in-app' },
    { icon: 'chip', label: 'Chip and PIN-protected transactions' },
    { icon: 'card', label: 'Replace lost or stolen cards for free' },
  ]);

  blogCards: BlogCard[] = this.content.block<BlogCard[]>('spend', 'blog_cards', [
    { tag: 'Spending', title: 'Teaching kids to spend wisely', read: '2 min. read', accent: 'sky', img: '/blog/blog-1.png' },
    { tag: 'Guides', title: 'The power of pocket money', read: '2 min. read', accent: 'pink', img: '/blog/blog-2.png' },
    { tag: 'Safety', title: 'Keeping your child’s card safe', read: '4 min. read', accent: 'gold', img: '/blog/blog-3.png' },
  ]);

  faqs: FaqItem[] = this.content.block<FaqItem[]>('spend', 'faqs', [
    {
      q: 'Where can my child use their Masroofi card?',
      a: 'The Masroofi Visa debit card works anywhere Visa is accepted — in shops, online, at ATMs, on subscriptions and apps, and abroad with no foreign transaction fees.',
    },
    {
      q: 'What if my child loses their card?',
      a: 'Freeze the card instantly from your parent app in one tap. If it’s lost for good, you can order a free replacement — and your child’s balance stays safe throughout.',
    },
    {
      q: 'Can I set spending limits for my child?',
      a: 'Yes. Set weekly spend, single-purchase and ATM withdrawal limits from your parent app, and change them at any time.',
    },
    {
      q: 'Does Masroofi work with Apple Pay?',
      a: 'Teens aged 13+ can add their Masroofi card to Apple Pay and pay with their phone or Apple Watch, wherever contactless is accepted.',
    },
    {
      q: 'How can I teach my child responsible spending?',
      a: 'Real-time notifications, spending insights and safety limits let your child spend within safe boundaries while you guide them — turning everyday purchases into money lessons.',
    },
  ]);
}
