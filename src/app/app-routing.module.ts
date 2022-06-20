import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LockComponent } from './pages/lock/lock.component';
import { UnlockComponent } from './pages/unlock/unlock.component';
import { FaqsComponent } from './pages/faqs/faqs.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'lock', component: LockComponent },
  { path: 'unlock', component: UnlockComponent },
  { path: 'faqs', component: FaqsComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
