import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { StarComponent } from '../../components/star/star';
import { CardVisualComponent } from '../../components/card-visual/card-visual';
import { FaqComponent, FaqItem } from '../../components/faq/faq';
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
    RevealDirective,
  ],
  templateUrl: './spend.html',
})
export class SpendComponent {
  cardDesigns: CardDesign[] = [
    { color: 'green', name: 'Emerald' },
    { color: 'ink', name: 'Midnight' },
    { color: 'red', name: 'Coral' },
    { color: 'ink', name: 'Onyx' },
    { color: 'green', name: 'Mint' },
    { color: 'red', name: 'Sunset' },
  ];

  // ---- card slider ----
  slide = signal(0);

  next() { this.slide.update((v) => (v + 1) % this.cardDesigns.length); }
  prev() { this.slide.update((v) => (v - 1 + this.cardDesigns.length) % this.cardDesigns.length); }
  goTo(i: number) { this.slide.set(i); }

  limits: SpendLimit[] = [
    { label: 'Weekly spend limit', note: 'Maximum spend in one week', amount: '£80' },
    { label: 'Single spend limit', note: 'Maximum spend in one go', amount: '£50' },
    { label: 'ATM withdrawal limit', note: 'Maximum withdrawal in one go', amount: '£25' },
  ];

  controlCards: ControlCard[] = [
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
  ];

  whereUsed: string[] = [
    'ATMs',
    'Online',
    'Abroad, fee-free',
    'Subscriptions',
    'In-store',
    'Apps',
    'With Apple Pay & Apple Watch (13+)',
  ];

  safetyTools: SafetyTool[] = [
    { icon: 'check', label: 'Zero Liability Policy by Visa' },
    { icon: 'key', label: 'Secure PIN recovery in the app' },
    { icon: 'bell', label: 'Real-time spending notifications' },
    { icon: 'bank', label: 'Bank-level encryption' },
    { icon: 'block', label: 'Masroofi blocks unsafe spending categories' },
    { icon: 'lock', label: 'Easily block and unblock the card in-app' },
    { icon: 'chip', label: 'Chip and PIN-protected transactions' },
    { icon: 'card', label: 'Replace lost or stolen cards for free' },
  ];

  blogCards = [
    { tag: 'Spending', title: 'Teaching kids to spend wisely', read: '2 min. read', accent: 'sky' },
    { tag: 'Guides', title: 'The power of pocket money', read: '2 min. read', accent: 'pink' },
    { tag: 'Safety', title: 'Keeping your child’s card safe', read: '4 min. read', accent: 'gold' },
  ];

  faqs: FaqItem[] = [
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
  ];

  accentVar(a: string): string { return `var(--color-${a})`; }
}
