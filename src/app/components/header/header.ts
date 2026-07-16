import { Component, signal, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoComponent } from '../logo/logo';

interface NavLink { label: string; path: string; fragment?: string; }

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogoComponent, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class HeaderComponent {
  scrolled = signal(false);
  menuOpen = signal(false);

  links: NavLink[] = [
    { label: 'Plans & Pricing', path: '/pricing' },
    { label: 'Earn', path: '/earn' },
    { label: 'Spend', path: '/spend' },
    { label: 'Save', path: '/save' },
    { label: 'Invest', path: '/invest' },
    { label: 'Learn', path: '/learn' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleMenu() { this.menuOpen.update((v) => !v); }
  closeMenu() { this.menuOpen.set(false); }
}
