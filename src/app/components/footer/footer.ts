import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../services/content.service';

interface FooterLink { label: string; href: string; }
interface FooterColumn { title: string; links: FooterLink[]; }
interface SocialLink { network: 'facebook' | 'x' | 'youtube' | 'instagram'; href: string; }
interface AppLinks { appStore: string; googlePlay: string; }

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './footer.html',
})
export class FooterComponent {
  private content = inject(ContentService);
  year = 2026; 

  columns = this.content.block<FooterColumn[]>('global', 'footer_columns', [
    { title: 'Product', links: [
      { label: 'Plans & Pricing', href: '/pricing' },
      { label: 'The card', href: '/spend' },
      { label: 'Parent app', href: '/' },
      { label: 'Kids app', href: '/' },
      { label: 'Money Missions', href: '/earn' },
      { label: 'Junior investing', href: '/invest' },
    ] },
    { title: 'Company', links: [
      { label: 'About us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Affiliates', href: '#' },
      { label: 'Blog', href: '#' },
    ] },
    { title: 'Help', links: [
      { label: 'Help centre', href: '#' },
      { label: 'Contact us', href: '#' },
      { label: 'Fees', href: '/pricing' },
      { label: 'Report a lost card', href: '#' },
      { label: 'Safety tips', href: '/learn' },
    ] },
    { title: 'Legal', links: [
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'Complaints', href: '#' },
    ] },
  ]);

  social = this.content.block<SocialLink[]>('global', 'footer_social', [
    { network: 'facebook', href: '#' },
    { network: 'x', href: '#' },
    { network: 'youtube', href: '#' },
    { network: 'instagram', href: '#' },
  ]);

  apps = this.content.block<AppLinks>('global', 'footer_apps', {
    appStore: '#',
    googlePlay: '#',
  });

  legal = this.content.block<FooterLink[]>('global', 'footer_legal', [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms & Conditions', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Accessibility', href: '#' },
  ]);

  /** Internal routes start with "/" and use routerLink; everything else is a plain href. */
  isInternal(href: string): boolean {
    return href.startsWith('/');
  }
}
