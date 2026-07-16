import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { FooterComponent } from '../../components/footer/footer';
import { StarComponent } from '../../components/star/star';
import { FaqComponent, FaqItem } from '../../components/faq/faq';
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
    RevealDirective,
  ],
  templateUrl: './earn.html',
})
export class EarnComponent {
  chores: Chore[] = [
    { label: 'Tidy your room', amount: '£1.50' },
    { label: 'Load the washing machine', amount: '£0.50' },
    { label: 'Walk the dog', amount: '£1.00' },
  ];

  miniCards: MiniCard[] = [
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
  ];

  faqs: FaqItem[] = [
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
  ];
}
