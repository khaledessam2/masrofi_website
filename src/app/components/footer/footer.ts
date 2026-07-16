import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LogoComponent } from '../logo/logo';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogoComponent],
  templateUrl: './footer.html',
})
export class FooterComponent {
  year = 2026;

  columns = [
    { title: 'Product', links: ['Plans & Pricing', 'The card', 'Parent app', 'Kids app', 'Money Missions', 'Junior investing'] },
    { title: 'Company', links: ['About us', 'Careers', 'Press', 'Affiliates', 'Blog'] },
    { title: 'Help', links: ['Help centre', 'Contact us', 'Fees', 'Report a lost card', 'Safety tips'] },
    { title: 'Legal', links: ['Terms & Conditions', 'Privacy Policy', 'Cookie Policy', 'Complaints'] },
  ];
}
