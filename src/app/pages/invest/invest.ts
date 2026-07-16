import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { StarComponent } from '../../components/star/star';
import { FaqComponent, FaqItem } from '../../components/faq/faq';
import { RevealDirective } from '../../directives/reveal.directive';

interface WhyCard { icon: 'spark' | 'wallet' | 'chart' | 'family' | 'shield'; title: string; body: string; }
interface HowStep { icon: 'add' | 'percent' | 'grow' | 'lock'; body: string; }
interface Plan {
  name: string; badge: string; accent: 'green' | 'gold' | 'red';
  price: string; unit: string; popular?: boolean; benefits: string[];
}
interface BlogCard { tag: string; title: string; read: string; accent: string; }

@Component({
  selector: 'app-invest',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    HeaderComponent,
    FooterComponent,
    StarComponent,
    FaqComponent,
    RevealDirective,
  ],
  templateUrl: './invest.html',
})
export class InvestComponent {
  // ---- Investing calculator (shared logic with home) ----
  childAge = signal(6);
  daily = signal(4);
  private rate = 0.05;

  private schedule = computed(() => {
    const years = Math.max(1, 18 - this.childAge());
    const annual = this.daily() * 365;
    const rows: { contrib: number; total: number }[] = [];
    let bal = 0;
    let contribTotal = 0;
    for (let i = 0; i < years; i++) {
      bal = (bal + annual) * (1 + this.rate);
      contribTotal += annual;
      rows.push({ contrib: contribTotal, total: bal });
    }
    return rows;
  });

  projected = computed(() => this.schedule().at(-1)?.total ?? 0);

  bars = computed(() => {
    const rows = this.schedule();
    const max = Math.max(...rows.map((r) => r.total), 1);
    return rows.map((r) => ({
      totalPct: (r.total / max) * 100,
      contribPct: (r.contrib / max) * 100,
    }));
  });

  money(n: number): string {
    return '£' + Math.round(n).toLocaleString('en-GB');
  }

  // ---- 18th-birthday goal cards (hero) ----
  goals = [
    { icon: '🚗', label: 'First car' },
    { icon: '✈️', label: 'Gap year' },
    { icon: '🎓', label: 'Uni costs' },
  ];

  // ---- Why choose ----
  whyCards: WhyCard[] = [
    { icon: 'wallet', title: 'Affordable', body: 'No minimum monthly contributions. Start from just £1, then choose how much you contribute and when.' },
    { icon: 'chart', title: 'High performing', body: 'Our Junior ISA fund has delivered strong long-term average returns over the last 12 years.' },
    { icon: 'family', title: 'Family focused', body: 'Family and friends can add money to your child’s Junior ISA directly with Gift links.' },
    { icon: 'shield', title: 'Trustworthy', body: 'Your contributions are invested in a diversified equity fund and protected up to the regulated limit.' },
  ];

  howSteps: HowStep[] = [
    { icon: 'add', body: 'You, your family and friends add money to your child’s Junior ISA — up to £9,000 per tax year.' },
    { icon: 'percent', body: 'This money is invested by experts in a diversified stocks & shares fund.' },
    { icon: 'grow', body: 'Profits are reinvested back into the fund, helping the money grow faster — this is called compounding.' },
    { icon: 'lock', body: 'The Junior ISA is locked until your child turns 18, giving compounding time to work its magic.' },
  ];

  plans: Plan[] = [
    {
      name: 'Everyday', badge: 'Core features', accent: 'green', price: '£3.99', unit: 'monthly per child',
      benefits: ['Smart money app & debit card for kids', 'Pocket money & chore lists', 'Real-time alerts & parental controls', 'Junior Stocks & Shares ISA', 'Custom savings goals'],
    },
    {
      name: 'Plus', badge: 'Most popular', accent: 'gold', price: '£5.99', unit: 'monthly per child', popular: true,
      benefits: ['Everything in Everyday', 'Custom savings goals & 2.63% AER* interest', 'Free top-ups', '80+ Money Missions', 'Priority support'],
    },
    {
      name: 'Max', badge: 'Family discount', accent: 'red', price: '£9.99', unit: 'monthly, up to four kids',
      benefits: ['All Plus benefits', 'Up to four kids’ accounts included', 'Lowest cost per child', 'Shared family savings goals', 'One simple family bill'],
    },
  ];

  blogCards: BlogCard[] = [
    { tag: 'Investing', title: 'Junior ISAs, explained for parents', read: '3 min. read', accent: 'sky' },
    { tag: 'Guides', title: 'The power of pocket money', read: '2 min. read', accent: 'pink' },
    { tag: 'Growth', title: 'Compound interest, explained simply', read: '4 min. read', accent: 'gold' },
  ];

  faqs: FaqItem[] = [
    {
      q: 'How do I open a Junior ISA?',
      a: 'Activate the Junior Stocks & Shares ISA in seconds from your parent app — it’s included on every Masroofi plan. Once it’s open, you can start contributing whenever you like.',
    },
    {
      q: 'How much can I invest?',
      a: 'You can add up to £9,000 per tax year across all of your child’s Junior ISAs. There’s no minimum with Masroofi — start from as little as £1.',
    },
    {
      q: 'What happens to a Junior ISA at 18?',
      a: 'The account is locked until your child turns 18. At 18 it becomes theirs and converts to an adult ISA, giving them a solid foundation to build on.',
    },
    {
      q: 'What are the Junior ISA rules?',
      a: 'A child can hold one Junior Stocks & Shares ISA. Money paid in belongs to the child, can’t be withdrawn until 18 (except in specific circumstances) and grows free of UK tax.',
    },
    {
      q: 'Are there any fees?',
      a: 'The Junior ISA is included in your monthly Masroofi plan — there are no separate account or contribution fees. Fund charges may apply within the investment itself.',
    },
  ];

  accentVar(a: string): string { return `var(--color-${a})`; }
}
