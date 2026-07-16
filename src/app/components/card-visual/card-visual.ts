import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { LogoComponent } from '../logo/logo';

/** A Masroofi Visa debit card, in the brand's three collateral colourways. */
@Component({
  selector: 'app-card-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogoComponent],
  templateUrl: './card-visual.html',
})
export class CardVisualComponent {
  @Input() color: 'ink' | 'green' | 'red' = 'ink';

  private map = {
    ink:   { bg: '#191919', fg: '#fbd963', watermark: 'rgba(251,217,99,0.35)' },
    green: { bg: '#02956e', fg: '#eafff7', watermark: 'rgba(255,255,255,0.28)' },
    red:   { bg: '#f0493e', fg: '#fff4ec', watermark: 'rgba(255,255,255,0.28)' },
  } as const;

  get bg() { return this.map[this.color].bg; }
  get fg() { return this.map[this.color].fg; }
  get watermark() { return this.map[this.color].watermark; }
}
