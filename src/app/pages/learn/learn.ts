import { Component, signal, computed, ChangeDetectionStrategy, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { StarComponent } from '../../components/star/star';
import { FaqComponent, FaqItem } from '../../components/faq/faq';
import { ReadMoreComponent, BlogCard } from '../../components/read-more/read-more';
import { RevealDirective } from '../../directives/reveal.directive';

interface AgeGroup { range: string; topics: string[]; }
interface Level { ages: string; level: string; title: string; body: string; accent: string; }

@Component({
  selector: 'app-learn',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    HeaderComponent,
    FooterComponent,
    StarComponent,
    FaqComponent,
    ReadMoreComponent,
    RevealDirective,
  ],
  templateUrl: './learn.html',
})
export class LearnComponent {
  ageGroups: AgeGroup[] = [
    { range: '5–7 years', topics: ['Value of coins and notes', 'Keeping track of money', 'Choices about saving and spending', 'Needs and wants', 'Looking after money', 'Saving money', 'Where their money comes from'] },
    { range: '7–9 years', topics: ['Ways to pay', 'Keeping records', 'Decisions about saving and spending', 'Spending and saving priorities', 'Keeping money safe', 'Lending and borrowing', 'Earning money', 'Helping others'] },
    { range: '9–11 years', topics: ['Foreign currency', 'Simple financial records', 'Influences on saving and spending', 'Value for money', 'Protecting their money', 'Saving and borrowing', 'Links between work and money', 'Wider communities'] },
    { range: '11–14 years', topics: ['Financial paperwork and budgeting', 'Saving and borrowing', 'Advertising and peer pressure', 'Making financial decisions', 'Financial products', 'Fraud and identity theft', 'Risk and reward', 'Different types of insurance', 'Investing in their future'] },
    { range: '14–16 years', topics: ['Planning and budgeting', 'Planned saving and borrowing', 'Consumer rights and responsibilities', 'Comparing financial products', 'Avoiding fraud and identity theft', 'Managing financial risk and reward', 'Insuring against risk', 'Work, income and deductions', 'Long-term financial planning'] },
    { range: '16–19 years', topics: ['Financial planning and budgeting', 'Paying, borrowing and saving', 'Taking responsibility', 'Seeking financial advice', 'Choosing financial products', 'Protection from fraud and identity theft', 'Identifying and reducing financial risks', 'Links between work, life choices and planning'] },
  ];

  // ---- age-group slider (1 card on mobile, 2 on tablet, 3 on desktop) ----
  slide = signal(0);
  perView = signal(3);
  maxSlide = computed(() => Math.max(0, this.ageGroups.length - this.perView()));
  trackOffset = computed(() => this.slide() * (100 / this.perView()));

  constructor() {
    afterNextRender(() => {
      const update = () => {
        const w = window.innerWidth;
        this.perView.set(w < 640 ? 1 : w < 1024 ? 2 : 3);
        this.slide.update((v) => Math.min(v, this.maxSlide()));
      };
      update();
      window.addEventListener('resize', update);
    });
  }

  next() { this.slide.update((v) => Math.min(v + 1, this.maxSlide())); }
  prev() { this.slide.update((v) => Math.max(v - 1, 0)); }

  levels: Level[] = [
    { ages: 'Ages 6+', level: 'Level 1', title: 'The starting line', body: 'Kids discover the money basics — like earning and smart spending — and build a solid foundation for all their future learning.', accent: 'gold' },
    { ages: 'Ages 12–14', level: 'Level 2', title: 'Ready to level up', body: 'Older kids dive into advanced lessons, unlocking key skills like creating a budget and improving a credit score.', accent: 'green' },
    { ages: 'Ages 15–18', level: 'Level 3', title: 'Advanced money skills', body: 'These in-depth missions challenge and prepare teens for adult finance — covering everything from mortgages to investing.', accent: 'red' },
  ];

  blogCards: BlogCard[] = [
    { tag: 'Learning', title: 'Money lessons every kid should know', read: '3 min. read', accent: 'sky', img: '/blog/blog-1.png' },
    { tag: 'Guides', title: 'The power of pocket money', read: '2 min. read', accent: 'pink', img: '/blog/blog-2.png' },
    { tag: 'Teens', title: 'Summer jobs for kids and teens', read: '4 min. read', accent: 'gold', img: '/blog/blog-3.png' },
  ];

  faqs: FaqItem[] = [
    {
      q: 'What are Money Missions on Masroofi?',
      a: 'Money Missions are bite-sized, gamified lessons built into the kids’ app. They teach real money skills — earning, saving, spending and investing — with points and rewards along the way.',
    },
    {
      q: 'Can Masroofi help parents teach kids about money?',
      a: 'Absolutely. Masroofi gives you the tools and prompts to turn everyday moments into money lessons, plus a Parent Space with tips to support your child’s learning.',
    },
    {
      q: 'Can parents track their child’s financial learning?',
      a: 'Yes. From your parent app you can see which Money Missions your child has completed and the points they’ve earned, so you can celebrate progress together.',
    },
    {
      q: 'Why is it important to teach kids about money?',
      a: 'Money habits form early — often by age seven. Teaching kids about money young helps them grow into confident, capable adults who can save, budget and make smart decisions.',
    },
    {
      q: 'At what age should kids start learning about money?',
      a: 'As early as five. Masroofi tailors lessons to every age from 5 to 18, so children always learn what’s right for their stage — right now.',
    },
  ];

  accentVar(a: string): string { return `var(--color-${a})`; }
}
