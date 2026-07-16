import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/**
 * Masroofi brand mark — a faithful SVG recreation of the coin + "M" monogram
 * + signature star, optionally paired with the lowercase "masroofi" wordmark.
 *
 * Inputs:
 *   wordmark   — show the "masroofi" text next to the coin (default true)
 *   wordColor  — CSS color for the wordmark ("gold" | "ink" | any css color)
 *   coinOnly   — render just the coin mark
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logo.html',
})
export class LogoComponent {
  // Deterministic unique gradient id per instance. A shared counter keeps
  // server and client markup identical (Math.random would break hydration).
  private static seq = 0;

  @Input() size = 40;
  @Input() wordmark = true;
  @Input() wordColor: 'gold' | 'ink' | string = 'gold';

  gid = 'coin-' + ++LogoComponent.seq;

  // 8-point signature star
  starPath =
    'M14 0 L17.5 9.5 L27 6 L20.5 14 L27 22 L17.5 18.5 L14 28 L10.5 18.5 L1 22 L7.5 14 L1 6 L10.5 9.5 Z';

  get resolvedWordColor(): string {
    if (this.wordColor === 'gold') return 'var(--color-gold)';
    if (this.wordColor === 'ink') return 'var(--color-ink)';
    return this.wordColor;
  }
}
