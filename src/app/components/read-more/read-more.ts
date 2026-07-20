import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StarComponent } from '../star/star';
import { RevealDirective } from '../../directives/reveal.directive';

export interface BlogCard {
  tag: string;
  title: string;
  read: string;
  accent: string;
  /** Optional thumbnail image. Falls back to the star mark when omitted. */
  img?: string;
}

/** Shared "Want to read more?" blog teaser section. */
@Component({
  selector: 'app-read-more',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, StarComponent, RevealDirective],
  templateUrl: './read-more.html',
})
export class ReadMoreComponent {
  @Input() heading = 'Want to read more?';
  @Input() subtitle = 'Discover tips, tricks and money insights on the Masroofi blog.';
  @Input() cards: BlogCard[] = [
    { tag: 'Spending', title: 'Teaching kids to spend wisely', read: '2 min. read', accent: 'sky', img: '/blog/blog-1.png' },
    { tag: 'Guides', title: 'The power of pocket money', read: '2 min. read', accent: 'pink', img: '/blog/blog-2.png' },
    { tag: 'Safety', title: 'Keeping your child’s card safe', read: '4 min. read', accent: 'gold', img: '/blog/blog-3.png' },
  ];

  accentVar(a: string): string {
    return `var(--color-${a})`;
  }
}
