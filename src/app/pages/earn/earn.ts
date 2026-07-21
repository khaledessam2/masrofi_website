import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { StarComponent } from '../../components/star/star';
import { FaqComponent, FaqItem } from '../../components/faq/faq';
import { ReadMoreComponent, BlogCard } from '../../components/read-more/read-more';
import { RevealDirective } from '../../directives/reveal.directive';

interface MiniCard { icon: 'missions' | 'gift' | 'teen'; title: string; body: string; }
interface Chore { label: string; amount: string; }

@Component({
  selector: 'app-earn',
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
  templateUrl: './earn.html',
})
export class EarnComponent {
  private content = inject(ContentService);

  hero = this.content.block('earn', 'hero', {
    title: 'Earn',
    body: 'Teach your child the value of money as they learn to earn with pocket money, chores & Money Missions.',
    img: '/earn/Earn.png',
    alt: 'Child earning pocket money with the Masroofi app',
  });

  newsletter = this.content.block('global', 'newsletter', {
    heading: 'Stay in the know',
    body: 'Get a fresh slice of money news, and the latest Masroofi updates, straight to your inbox.',
    firstName: 'First name',
    email: 'Email',
    button: 'Sign me up',
    fineprint: 'Read our privacy policy. Unsubscribe anytime.',
  });

  copy = this.content.block('earn', 'copy', {
    pocketEyebrow: 'Pocket money',
    pocketHeading: 'Pocket money, made smarter',
    pocketBody: 'Kickstart healthy money habits with a regular allowance. Just set up automated payments in your parent app and let the weekly pocket money payday begin.',
    pocketCta: 'Learn more ›',
    allowanceBadge: 'Allowance',
    allowanceAmount: '+£10',
    stat1Before: 'Masroofi has helped kids earn over',
    stat1Number: '£1.8 billion',
    stat1After: 'in pocket money',
    stat1Caption: 'Based on all-time active child members since launch.',
    choresMockLabel: 'Today’s tasks',
    choresEyebrow: 'Chores',
    choresHeading: 'Chores that pay off',
    choresBody: 'Transform effort into earning with in-app task lists. Your child can complete chores you set, and you send a reward for each one they tick off.',
    choresCta: 'Learn more ›',
    stat2Heading: 'Over 84 million chores completed in the Masroofi app',
    stat2Caption: 'Includes recurring daily chores as well as weekly tasks.',
    transfersEyebrow: 'Transfers',
    transfersHeading: 'Instant money transfers',
    transfersBody: 'Need-it-now money moment? With Masroofi instant transfers, you can send money straight to your child’s card at any time.',
    transfersCta: 'Learn more ›',
    transferFromName: 'From Dad',
    transferFromBalance: 'Balance £32.50',
    transferFromInitial: 'D',
    transferToName: 'To Nadine’s card',
    transferToBalance: 'Balance £10.50',
    transferToInitial: 'N',
    miniCardCta: 'Learn more ›',
    diariesHeading: 'Pocket money diaries: Liam',
    diariesBody: 'Liam has been growing money smarts with Masroofi since he was six. He boosts his pocket money with chores and uses Money Missions to understand the value of what he wants to buy.',
    diariesCta: 'Liam’s money story ›',
    testimonialQuote: 'Great app. Kids love using it and completing their tasks to earn their extra pocket money.',
    testimonialAuthor: 'Phil B. — verified member',
    testimonialCaption: 'Rated excellent by families like yours',
    faqHeading: 'Your questions, answered',
    readMoreSubtitle: 'Discover tips, tricks and earning insights on the Masroofi blog.',
  });

  chores: Chore[] = this.content.block<Chore[]>('earn', 'chores', [
    { label: 'Tidy your room', amount: '£1.50' },
    { label: 'Load the washing machine', amount: '£0.50' },
    { label: 'Walk the dog', amount: '£1.00' },
  ]);

  miniCards: MiniCard[] = this.content.block<MiniCard[]>('earn', 'mini_cards', [
    {
      icon: 'missions',
      title: 'Learn & earn',
      body: 'Discover Money Missions — gamified lessons where kids grow their money smarts and boost their pocket money at the same time.',
    },
    {
      icon: 'gift',
      title: 'Gifting, simplified',
      body: 'Gifting money to kids on Masroofi is easy with Gift links. Family and friends choose the amount, add a message and send it straight to the card.',
    },
    {
      icon: 'teen',
      title: 'Just for teens',
      body: 'Kids aged 13+ unlock extra benefits — get wages paid straight to their card and transfer money with friends, making splitting the bill easy.',
    },
  ]);

  blogCards: BlogCard[] = this.content.block<BlogCard[]>('earn', 'blog_cards', [
    { tag: 'Pocket money', title: 'Teaching kids to spend wisely', read: '2 min. read', accent: 'sky', img: '/blog/blog-1.png' },
    { tag: 'Guides', title: 'The power of pocket money', read: '2 min. read', accent: 'pink', img: '/blog/blog-2.png' },
    { tag: 'Chores', title: 'Turning chores into earnings', read: '4 min. read', accent: 'gold', img: '/blog/blog-3.png' },
  ]);

  faqs: FaqItem[] = this.content.block<FaqItem[]>('earn', 'faqs', [
    {
      q: 'How can kids earn money with Masroofi?',
      a: 'Kids earn through regular pocket money, one-off or recurring chores, gifts from family and friends via Gift links, and by completing Money Missions — all paid straight to their Masroofi card.',
    },
    {
      q: 'Can I set up automatic allowance payments for my child?',
      a: 'Yes. Set an amount and a schedule in your parent app once, and pocket money is paid to your child’s card automatically every week or month — no reminders needed.',
    },
    {
      q: 'What are Gift links, and how do they work?',
      a: 'Gift links let relatives and friends send money directly to your child’s card. They choose the amount, add a personal message, and the money lands safely in the child’s balance — no card details shared.',
    },
    {
      q: 'What are good ways for kids and teens to earn?',
      a: 'Chores at home, small jobs for neighbours, selling old toys, and completing Money Missions all build the habit of earning. Teens 13+ can also have wages paid straight to their Masroofi card.',
    },
  ]);
}
