import { Routes } from '@angular/router';

export const routes: Routes = [
  // The tool is the home page: land straight on the Hide mode.
  { path: '', pathMatch: 'full', redirectTo: 'lock' },
  {
    path: 'lock',
    title: 'Hide a Message in an Image - Digi-Cloak',
    loadComponent: () => import('./screens/lock/lock').then((m) => m.Lock),
  },
  {
    path: 'unlock',
    title: 'Reveal a Hidden Message - Digi-Cloak',
    loadComponent: () =>
      import('./screens/unlock/unlock').then((m) => m.Unlock),
  },
  {
    path: 'faqs',
    title: 'FAQ - Digi-Cloak',
    loadComponent: () => import('./screens/faqs/faqs').then((m) => m.Faqs),
  },
  { path: '**', redirectTo: 'lock' },
];
