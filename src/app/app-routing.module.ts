import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { LockComponent } from './pages/lock/lock.component';
import { UnlockComponent } from './pages/unlock/unlock.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'lock', component: LockComponent },
  { path: 'unlock', component: UnlockComponent },
  { path: 'faqs', component: FaqsComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
