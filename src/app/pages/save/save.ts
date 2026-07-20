import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  features: Feature[] = [
    {
      title: 'The power of growth',
      body: 'Plus and Max members can make their money work harder by earning 2.63% AER interest on their savings — a real-life lesson in compound growth.',
      note: 'Interest rate is variable. Additional terms and conditions apply.',
    },
    {
      title: 'Reward with extra savings',
      body: 'Motivate money-smart habits by paying extra interest on your child’s savings. Just choose the amount in your parent app and adjust it any time.',
    },
  ];

  blogCards: BlogCard[] = [
    { tag: 'Saving', title: 'Teaching kids the savings habit', read: '2 min. read', accent: 'sky', img: '/blog/blog-1.png' },
    { tag: 'Guides', title: 'The power of pocket money', read: '2 min. read', accent: 'pink', img: '/blog/blog-2.png' },
    { tag: 'Interest', title: 'Compound interest, explained simply', read: '4 min. read', accent: 'gold', img: '/blog/blog-3.png' },
  ];

  faqs: FaqItem[] = [
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
  ];
}
