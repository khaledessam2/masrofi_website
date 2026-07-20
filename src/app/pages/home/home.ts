import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  afterNextRender,
  DestroyRef,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { StarComponent } from '../../components/star/star';
import { CardVisualComponent } from '../../components/card-visual/card-visual';
import { TestimonialsComponent } from '../../components/testimonials/testimonials';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    HeaderComponent,
    FooterComponent,
    StarComponent,
    CardVisualComponent,
    TestimonialsComponent,
    RevealDirective,
  ],
  templateUrl: './home.html',
})
export class HomeComponent {
  // ---- Hero slider ----
  heroSlides = [
    {
      img: '/hero/hero-1.svg',
      alt: 'Kid holding a Masroofi card and phone app',
      title: 'Where kids go to',
      accent: 'learn & grow money',
      body: 'Build lifelong skills in saving, investing, earning and spending. Join Masroofi today and get your first month free.',
      cta: 'Get started',
      note: 'T&Cs apply',
    },
    {
      img: '/hero/hero-2.svg',
      alt: 'Junior investing account growth chart',
      title: 'Investing for',
      accent: 'your child’s future',
      body: 'Every Masroofi plan includes a junior investing account to help you build a pot of money for when they turn 18.',
      cta: 'Get started',
      note: 'Capital at risk. The value of investments can go down as well as up.',
    },
    {
      img: '/hero/hero-3.svg',
      alt: 'Savings with interest illustration',
      title: 'Savings',
      accent: 'with interest',
      body: 'Earn interest on savings that compounds over time to help your kids reach their savings goals faster.',
      cta: 'Get started',
      note: 'Interest rate is variable. Additional terms and conditions apply.',
    },
    {
      img: '/hero/hero-4.svg',
      alt: 'Happy parent testimonial',
      title: 'Such a great way',
      accent: 'to learn about money',
      body: '“I wish I had this account when I was younger!” — a favourite from the thousands of families who trust Masroofi.',
      cta: 'Get started',
      note: 'Rated Excellent by parents.',
    },
  ];

  currentSlide = signal(0);
  isPlaying = signal(true);
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly slideMs = 6000;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.startAuto();
      destroyRef.onDestroy(() => this.stopAuto());
    });
  }

  private startAuto(): void {
    this.stopAuto();
    if (!this.isPlaying()) return;
    this.timer = setInterval(() => this.next(), this.slideMs);
  }

  private stopAuto(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  next(): void {
    this.currentSlide.update((i) => (i + 1) % this.heroSlides.length);
  }

  goToSlide(i: number): void {
    this.currentSlide.set(i);
    this.startAuto(); // restart the countdown after a manual pick
  }

  togglePlay(): void {
    this.isPlaying.update((p) => !p);
    this.isPlaying() ? this.startAuto() : this.stopAuto();
  }

  // Pause while hovered, without changing the user's play/pause choice.
  pauseAuto(): void {
    this.stopAuto();
  }

  resumeAuto(): void {
    if (this.isPlaying()) this.startAuto();
  }

  // ---- Investing calculator ----
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

  // ---- Why choose (4 pillars) ----
  whyCards = [
    {
      icon: 'spark',
      title: 'Easy',
      body: 'Activate it in seconds from your parent app, then let the experts do the hard work for you.',
    },
    {
      icon: 'wallet',
      title: 'Affordable',
      body: 'No minimum contributions — start from as little as you like, and grow it at your own pace.',
    },
    {
      icon: 'shield',
      title: 'Trustworthy',
      body: 'Held safely with our regulated banking partner, with your family’s money always protected.',
    },
    {
      icon: 'family',
      title: 'Family focused',
      body: 'Family and friends can chip in directly with gift links, so everyone helps the pot grow.',
    },
  ];

  // ---- Earn / Guide mini illustrations ----
  earnTasks = [
    { label: 'Make your bed', amount: '£0.50', done: true },
    { label: 'Weekly allowance', amount: '+£10', done: false },
    { label: 'Tidy your room', amount: '£0.50', done: true },
  ];
  guideToggles = ['High street', 'ATMs', 'Online'];

  // ---- Comparison ("money smarts") ----
  comparisonRows = [
    { label: 'Eligible from age 6+', masroofi: true, banks: true },
    { label: 'Interest on savings', masroofi: true, banks: true },
    { label: 'Junior investing account', masroofi: true, banks: false },
    { label: '80+ educational money lessons', masroofi: true, banks: false },
  ];

  // ---- Plans teaser ----
  plans = [
    {
      name: 'Everyday',
      badge: 'Core features',
      accent: 'green',
      price: '£3.99',
      unit: 'monthly per child',
      benefits: [
        'Smart money app & debit card for kids',
        'Pocket money & chore lists',
        'Real-time alerts & parental controls',
        'Junior investing account',
        'Custom savings goals',
      ],
    },
    {
      name: 'Plus',
      badge: 'Most popular',
      accent: 'gold',
      price: '£5.99',
      unit: 'monthly per child',
      popular: true,
      benefits: [
        'Everything in Everyday',
        'Interest paid on savings',
        'Free top-ups',
        '80+ Money Missions',
        'Priority support',
      ],
    },
    {
      name: 'Max',
      badge: 'Family discount',
      accent: 'red',
      price: '£9.99',
      unit: 'monthly, up to four kids',
      benefits: [
        'All Plus benefits',
        'Up to four kids’ accounts included',
        'Lowest cost per child',
        'Shared family savings goals',
        'One simple family bill',
      ],
    },
  ];

  accentVar(a: string): string {
    return `var(--color-${a})`;
  }
}
