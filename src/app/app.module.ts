import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SnackbarComponent } from './components/snackbar/snackbar.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { HomeComponent } from './pages/home/home.component';
import { LockComponent } from './pages/lock/lock.component';
import { UnlockComponent } from './pages/unlock/unlock.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LockComponent,
    UnlockComponent,
    FaqsComponent,
    HeaderComponent,
    SnackbarComponent,
  ],
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
