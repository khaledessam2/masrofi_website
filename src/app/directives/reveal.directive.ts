import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Reveals an element with a fade/slide animation the moment it scrolls into
 * view. Add `reveal` to any element; optional inputs tune the motion:
 *
 *   <div reveal>…</div>
 *   <div reveal revealFrom="left" [revealDelay]="120">…</div>
 *
 * Uses IntersectionObserver so nothing animates until the user reaches it.
 * Honours `prefers-reduced-motion` (handled in CSS) and degrades gracefully
 * on the server / when IntersectionObserver is unavailable.
 */
@Directive({
  selector: '[reveal]',
  standalone: true,
  host: {
    '[class.reveal]': 'true',
    '[class.reveal--left]': "revealFrom === 'left'",
    '[class.reveal--right]': "revealFrom === 'right'",
    '[class.reveal--scale]': "revealFrom === 'scale'",
    '[style.transitionDelay]': 'delayStyle',
    '[style.animationDelay]': 'delayStyle',
  },
})
export class RevealDirective implements OnInit, OnDestroy {
  /** Direction the element travels in from: 'up' (default), 'left', 'right', 'scale'. */
  @Input() revealFrom: 'up' | 'left' | 'right' | 'scale' = 'up';

  /** Stagger, in milliseconds, before this element animates. */
  @Input() revealDelay = 0;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  get delayStyle(): string | null {
    return this.revealDelay ? `${this.revealDelay}ms` : null;
  }

  ngOnInit(): void {
    // On the server (or if the API is missing) reveal immediately so content
    // is never left hidden.
    if (
      !isPlatformBrowser(this.platformId) ||
      typeof IntersectionObserver === 'undefined'
    ) {
      this.el.nativeElement.classList.add('reveal--visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
