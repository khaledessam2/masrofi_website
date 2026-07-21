import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { StarComponent } from '../star/star';
import { RevealDirective } from '../../directives/reveal.directive';
import { ContentService } from '../../services/content.service';

/** Shared "Don't just take our word for it" testimonials slider. */
@Component({
  selector: 'app-testimonials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StarComponent, RevealDirective],
  templateUrl: './testimonials.html',
})
export class TestimonialsComponent {
  private content = inject(ContentService);

  header = this.content.block('global', 'testimonials_header', {
    heading: 'Don’t just take our word for it',
    subtitle: 'See why 9 in 10 parents would recommend Masroofi to a friend.',
    ratingLabel: 'Rated excellent',
  });

  testimonials = this.content.block('global', 'testimonials', [
    {
      quote:
        'It has helped my daughter manage her money from an early age. She’s learned how to save and how to spend responsibly — I recommend it to every parent.',
    },
    {
      quote:
        'Excellent service, very easy to use, and my son loves having his own card and money. Highly recommended.',
    },
    {
      quote:
        'A brilliant app that has been a big help in teaching my son about money and banking. Wonderful idea.',
    },
    {
      quote:
        'Great for giving kids financial independence while parents keep a watchful eye on everything.',
    },
  ]);

  scrollTrack(el: HTMLElement, dir: number): void {
    el.scrollBy({ left: el.clientWidth * dir, behavior: 'smooth' });
  }
}
