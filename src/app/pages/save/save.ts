import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { StarComponent } from '../../components/star/star';
import { FaqComponent, FaqItem } from '../../components/faq/faq';
import { ReadMoreComponent, BlogCard } from '../../components/read-more/read-more';
import { RevealDirective } from '../../directives/reveal.directive';

interface Feature { title: string; body: string; note?: string; }

@Component({
  selector: 'app-save',
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
  templateUrl: './save.html',
})
export class SaveComponent {
  private content = inject(ContentService);

  hero = this.content.block('save', 'hero', {
    title: 'Save',
    body: "Help your child take charge of their own saving with the kids' savings account that pays them interest.",
    img: '/save/save.png',
    alt: 'Child saving money with the Masroofi app',
  });

  newsletter = this.content.block('global', 'newsletter', {
    heading: 'Stay in the know',
    body: 'Get a fresh slice of money news, and the latest Masroofi updates, straight to your inbox.',
    firstName: 'First name',
    email: 'Email',
    button: 'Sign me up',
    fineprint: 'Read our privacy policy. Unsubscribe anytime.',
  });

  copy = this.content.block('save', 'copy', {
    goalsEyebrow: 'Savings goals',
    goalsHeading: 'Set it, save it, smash it',
    goalsBody: 'Masroofi savings goals help kids grow their money — and their money smarts. Kids can set custom goals, transfer money automatically with autosave and earn interest.*',
    goalsCta: 'Learn more ›',
    goalsFootnote: '*Plus & Max plans only. Interest rate is variable. Additional T&Cs apply.',
    goalsBadge: 'Interest savings',
    goalsStat: '2.63%',
    statHeadingBefore: 'Masroofi kids & parents have set',
    statHeadingHighlight: '2.49 million',
    statHeadingAfter: 'savings goals',
    statCaption: 'Based on all-time active member data since launch.',
    isaChipFirst: 'First car',
    isaChipSecond: 'Gap year',
    isaCardLabel: 'Junior ISA',
    isaCardStat: '£1,543.20',
    isaHeading: 'They save, you invest with a Junior ISA',
    isaBody: 'Every Masroofi plan includes a Junior Stocks & Shares ISA — so while your child grows their savings, you can grow a pot of money for when they turn 18.',
    isaCta: 'Discover Junior ISA ›',
    isaFootnote: 'Capital at risk. The value of your investment can go down as well as up.',
    interestLabelA: 'Interest savings',
    interestLabelB: 'Parent-paid interest',
    interestValueA: '2.63% AER',
    interestValueB: '15% interest',
    diariesHeading: 'Pocket money diaries: Ellie',
    diariesBody: 'Masroofi member Ellie is using her app to save for the future. Her biggest saving tips? Using autosave, and tracking her spending in her Masroofi app.',
    diariesCta: "Ellie's money story ›",
    testimonialQuote: 'Perfect for teaching my daughter how to manage and, more importantly, how to save her money.',
    testimonialAttribution: 'Chris F. — verified member',
    testimonialCaption: 'Rated excellent by families like yours',
    faqHeading: 'Frequently asked questions',
    readMoreHeading: 'Want more saving insights?',
    readMoreSubtitle: "You'll find them on the Masroofi blog.",
  });

  features: Feature[] = this.content.block<Feature[]>('save', 'features', [
    {
      title: 'The power of growth',
      body: 'Plus and Max members can make their money work harder by earning 2.63% AER interest on their savings — a real-life lesson in compound growth.',
      note: 'Interest rate is variable. Additional terms and conditions apply.',
    },
    {
      title: 'Reward with extra savings',
      body: 'Motivate money-smart habits by paying extra interest on your child’s savings. Just choose the amount in your parent app and adjust it any time.',
    },
  ]);

  blogCards: BlogCard[] = this.content.block<BlogCard[]>('save', 'blog_cards', [
    { tag: 'Saving', title: 'Teaching kids the savings habit', read: '2 min. read', accent: 'sky', img: '/blog/blog-1.png' },
    { tag: 'Guides', title: 'The power of pocket money', read: '2 min. read', accent: 'pink', img: '/blog/blog-2.png' },
    { tag: 'Interest', title: 'Compound interest, explained simply', read: '4 min. read', accent: 'gold', img: '/blog/blog-3.png' },
  ]);

  faqs: FaqItem[] = this.content.block<FaqItem[]>('save', 'faqs', [
    {
      q: 'How does Masroofi help kids save money?',
      a: 'Kids set custom savings goals, move money in with one tap or automatically using autosave, and watch their balance grow towards the things they want — building the savings habit for life.',
    },
    {
      q: 'Does Masroofi offer savings accounts with interest?',
      a: 'Yes. Plus and Max members earn 2.63% AER (variable) interest on their savings, paid straight into their Masroofi account — a real lesson in how money can grow.',
    },
    {
      q: 'What is parent-paid interest and how does it work?',
      a: 'You can choose to pay your own bonus interest rate on your child’s savings, on top of any account interest. Set the rate in your parent app and change it whenever you like.',
    },
    {
      q: 'What are the benefits of setting savings goals?',
      a: 'Goals give saving a purpose. When kids can see how close they are to a new game or a bigger dream, they’re far more motivated to put money aside and wait.',
    },
    {
      q: 'How do I explain compound interest to my child?',
      a: 'Show them that the interest they earn also earns interest over time. With Masroofi they can watch it happen on real savings — the clearest way to make compound growth click.',
    },
  ]);
}
