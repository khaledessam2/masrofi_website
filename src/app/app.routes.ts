import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { PricingComponent } from './pages/pricing/pricing';
import { EarnComponent } from './pages/earn/earn';
import { SpendComponent } from './pages/spend/spend';
import { SaveComponent } from './pages/save/save';
import { InvestComponent } from './pages/invest/invest';
import { LearnComponent } from './pages/learn/learn';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'earn', component: EarnComponent },
  { path: 'spend', component: SpendComponent },
  { path: 'save', component: SaveComponent },
  { path: 'invest', component: InvestComponent },
  { path: 'learn', component: LearnComponent },
  { path: '**', redirectTo: '' },
];
