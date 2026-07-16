import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/** The Masroofi signature 8-point star — a decorative brand element. */
@Component({
  selector: 'app-star',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './star.html',
})
export class StarComponent {
  @Input() size = 60;
  @Input() color = 'var(--color-gold)';
  @Input() stroke = '';
}
