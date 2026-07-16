import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./screens/home/home').then((m) => m.Home),
  },
  {
    path: 'lock',
    loadComponent: () => import('./screens/lock/lock').then((m) => m.Lock),
  },
  {
    path: 'unlock',
    loadComponent: () =>
      import('./screens/unlock/unlock').then((m) => m.Unlock),
  },
  {
    path: 'faqs',
    loadComponent: () => import('./screens/faqs/faqs').then((m) => m.Faqs),
  },
  { path: '**', redirectTo: '' },
];
