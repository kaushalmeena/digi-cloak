import { Routes } from '@angular/router';

export const routes: Routes = [
  // The tool is the home page: land straight on the Conceal mode.
  { path: '', pathMatch: 'full', redirectTo: 'conceal' },
  {
    path: 'conceal',
    title: 'Conceal a Message in an Image - Digi-Cloak',
    loadComponent: () =>
      import('./screens/conceal/conceal').then((m) => m.Conceal),
  },
  {
    path: 'uncover',
    title: 'Uncover a Hidden Message - Digi-Cloak',
    loadComponent: () =>
      import('./screens/uncover/uncover').then((m) => m.Uncover),
  },
  {
    path: 'faqs',
    title: 'FAQ - Digi-Cloak',
    loadComponent: () => import('./screens/faqs/faqs').then((m) => m.Faqs),
  },
  // Old links from before the rename keep working.
  { path: 'lock', redirectTo: 'conceal' },
  { path: 'unlock', redirectTo: 'uncover' },
  { path: '**', redirectTo: 'conceal' },
];
