import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Digi-Cloak - Hide Secrets in Images',
    loadComponent: () => import('./screens/home/home').then((m) => m.Home),
  },
  {
    path: 'lock',
    title: 'Lock a Secret - Digi-Cloak',
    loadComponent: () => import('./screens/lock/lock').then((m) => m.Lock),
  },
  {
    path: 'unlock',
    title: 'Unlock a Secret - Digi-Cloak',
    loadComponent: () =>
      import('./screens/unlock/unlock').then((m) => m.Unlock),
  },
  {
    path: 'faqs',
    title: 'FAQs - Digi-Cloak',
    loadComponent: () => import('./screens/faqs/faqs').then((m) => m.Faqs),
  },
  { path: '**', redirectTo: '' },
];
