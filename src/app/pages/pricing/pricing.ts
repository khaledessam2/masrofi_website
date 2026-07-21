import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { StarComponent } from '../../components/star/star';
import { CardVisualComponent } from '../../components/card-visual/card-visual';
import { TestimonialsComponent } from '../../components/testimonials/testimonials';
import { FaqComponent, FaqItem } from '../../components/faq/faq';
import { RevealDirective } from '../../directives/reveal.directive';

type PlanKey = 'e' | 'p' | 'm';
type Cell = boolean | string | null;

interface Plan {
  key: PlanKey;
  name: string;
  badge: string;
  badgeAccent: 'green' | 'gold' | 'red';
  price: string;
  unit: string;
  desc: string;
  popular?: boolean;
}

interface FeatureRow { label: string; e: Cell; p: Cell; m: Cell; }
interface FeatureGroup { title: string; rows: FeatureRow[]; }

interface CompareRow { label: string; note?: string; masroofi: boolean | string; others: (boolean | string)[]; }

@Component({
  selector: 'app-pricing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HeaderComponent, FooterComponent, StarComponent, CardVisualComponent, TestimonialsComponent, FaqComponent, RevealDirective],
  templateUrl: './pricing.html',
})
export class PricingComponent {
  private content = inject(ContentService);

  hero = this.content.block('pricing', 'hero', {
    title: 'Choose your ',
    titleAccent: 'perfect plan',
    body: 'Kids learn and grow their money while parents support and guide — all in one place.',
  });

  newsletter = this.content.block('global', 'newsletter', {
    heading: 'Stay in the know',
    body: 'Get a fresh slice of money news, and the latest Masroofi updates, straight to your inbox.',
    firstName: 'First name',
    email: 'Email',
    button: 'Sign me up',
    fineprint: 'Read our privacy policy. Unsubscribe anytime.',
  });

  copy = this.content.block('pricing', 'copy', {
    plansHeading: 'Plans & pricing',
    plansBody: 'Join over 2 million kids who have already built real money skills with Masroofi.',
    plansFineprint: 'Based on all-time active child members since launch.',
    planFreeNote: 'One month free',
    planCta: 'Get started',
    plansDisclaimer: 'Capital at risk. The value of your child’s investments can go down as well as up. Interest rates are variable and additional terms apply.',
    plansEmphasis: 'One month FREE, cancel anytime.',
    seeAllBenefits: 'See all benefits',
    whyHeading: 'Why choose Masroofi?',
    whyBody: 'Masroofi is the money app and debit card built by parents, for kids. From just £3.99 a month, children get a head start in life while parents get the tools to support and guide.',
    whyCompareLead: 'See how Masroofi compares to other kids’ accounts:',
    swipeHint: 'Swipe to compare →',
    comparisonFineprint: 'Comparison based on publicly available information. Correct at time of writing.',
    investHeading: 'Invest in your child’s future',
    investBody: 'Grow a pot of money for when your child turns 18 with a Masroofi junior investing account. It’s included in every plan — just activate it in your parent app.',
    investFineprint: 'Capital at risk. The value of your investment can go down as well as up.',
    investCta: 'Discover investing',
    investGoalLabel: '18th birthday goal',
    investGoalUni: 'Uni fund',
    investCardLabel: 'Junior investing',
    investCardStat: '£1,543.20',
    investGoalCar: 'First car',
    faqHeadingLine1: 'Got questions?',
    faqHeadingLine2: 'We have answers',
  });

  plans: Plan[] = this.content.block<Plan[]>('pricing', 'plans', [
    {
      key: 'e',
      name: 'Everyday',
      badge: 'Core learning tools',
      badgeAccent: 'green',
      price: '£3.99',
      unit: 'monthly per child',
      desc: 'Smart learning tools that teach kids to earn, save, spend and invest.',
    },
    {
      key: 'p',
      name: 'Plus',
      badge: 'Most popular',
      badgeAccent: 'gold',
      price: '£5.99',
      unit: 'monthly per child',
      desc: 'Everything in Everyday, plus interest on savings and free top-ups.',
      popular: true,
    },
    {
      key: 'm',
      name: 'Max',
      badge: 'Family discount',
      badgeAccent: 'red',
      price: '£9.99',
      unit: 'monthly, up to four kids',
      desc: 'All Plus benefits, up to four kids’ accounts included — for one monthly fee.',
    },
  ]);

  featureGroups: FeatureGroup[] = this.content.block<FeatureGroup[]>('pricing', 'feature_groups', [
    {
      title: 'Earn',
      rows: [
        { label: 'Smart money app that grows with your child', e: true, p: true, m: true },
        { label: 'Gift links: money gifted by family & friends', e: true, p: true, m: true },
        { label: 'Instant transfers', e: true, p: true, m: true },
        { label: 'Pocket money & chore lists', e: true, p: true, m: true },
        { label: 'Free top-ups', e: false, p: true, m: true },
        { label: 'One free top-up each month (then a small fee per top-up)', e: true, p: null, m: null },
      ],
    },
    {
      title: 'Spend',
      rows: [
        { label: 'Standard debit card (personalised designs from £4.99)', e: true, p: true, m: true },
        { label: 'Parent app & parental controls', e: true, p: true, m: true },
      ],
    },
    {
      title: 'Save & Invest',
      rows: [
        { label: 'Junior investing account', e: true, p: true, m: true },
        { label: 'Custom savings goals', e: true, p: true, m: true },
        { label: 'Interest paid on savings', e: false, p: true, m: true },
      ],
    },
    {
      title: 'Learn',
      rows: [
        { label: 'Parent space: parenting tips & guidance', e: true, p: true, m: true },
        { label: 'Intro to Money Missions', e: true, p: false, m: false },
        { label: '80+ interactive Money Missions', e: false, p: true, m: true },
      ],
    },
  ]);

  competitors = this.content.block<string[]>('pricing', 'competitors', [
    'NatWest Rooster Money', 'Revolut <18', 'Starling Kite', 'HyperJar',
    'Lloyds Smart Start', 'Nationwide FlexOne', 'Halifax Money Smart',
  ]);

  compareRows: CompareRow[] = this.content.block<CompareRow[]>('pricing', 'compare_rows', [
    { label: 'Parental controls', masroofi: true, others: [true, true, true, true, false, false, false] },
    { label: 'Gift links: money gifted by family & friends', masroofi: true, others: [true, true, true, true, false, false, false] },
    { label: 'Kids’ savings goals', masroofi: true, others: [true, true, true, true, false, true, false] },
    { label: 'Interest on savings', note: 'With Plus & Max plans', masroofi: true, others: [false, false, false, true, true, true, true] },
    { label: 'Parent-paid interest on your child’s savings', masroofi: true, others: [false, false, false, false, false, false, false] },
    { label: 'Junior investing account included', masroofi: true, others: [false, false, false, false, false, false, false] },
    { label: 'Monitor your child’s spending', masroofi: true, others: [true, true, true, true, true, true, true] },
    { label: 'Instant cash transfers for kids', masroofi: true, others: [true, true, true, true, false, false, false] },
    { label: 'Child-friendly financial education', masroofi: true, others: [true, true, false, false, false, false, false] },
    { label: 'Automated pocket money linked to chores', masroofi: true, others: [false, false, false, false, false, false, false] },
    { label: 'Apple Pay (13+)', masroofi: true, others: [false, true, false, false, false, false, false] },
    { label: 'Custom cards', masroofi: true, others: [false, true, false, false, false, false, false] },
    { label: 'Age limits', masroofi: '6–18', others: ['6–17', '6–17', '6–16', '6–17', '11–15', '11–17', '11–17'] },
  ]);

  faqs: FaqItem[] = this.content.block<FaqItem[]>('pricing', 'faqs', [
    { q: 'Can I change my plan after I sign up?', a: 'Yes. You can move between Everyday, Plus and the Max family plan anytime from your parent app. Changes take effect from your next billing date.' },
    { q: 'Can I cancel my membership?', a: 'Anytime, with no cancellation fees. If you cancel during your free trial you won’t be charged at all.' },
    { q: 'How is payment taken for my membership?', a: 'Your monthly membership is charged automatically to the debit or credit card you register when you sign up. You’ll always be reminded before the free trial ends.' },
    { q: 'How do I avoid a service fee for top-ups?', a: 'On Plus and Max, top-ups are always free and unlimited. On Everyday you get one free top-up each month, and setting up an automatic allowance is a simple way to avoid extra top-ups.' },
    { q: 'How much is a personalised card design?', a: 'Every plan includes a free standard card. A personalised card design is an optional one-off from £4.99.' },
    { q: 'How much does it cost to replace a lost or stolen card?', a: 'You can freeze a card instantly in the app. If you need a replacement, a standard replacement card is free — you’ll only pay if you choose a new personalised design.' },
    { q: 'What do I get during my free trial?', a: 'The full experience of the plan you choose — the card, both apps, spending controls and Money Missions — free for 30 days, with nothing charged until the trial ends.' },
    { q: 'Why does Masroofi charge a monthly fee?', a: 'The membership covers the card, the parent and kids apps, real-time controls and all the educational content — with no ads and no selling of your family’s data.' },
  ]);

  badgeVar(a: string): string { return `var(--color-${a})`; }
}
