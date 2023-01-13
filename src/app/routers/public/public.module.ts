import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LoginComponent } from './components/login/login.component';
import { PublicRoutingModule } from './public-routing.module';
import { PublicComponent } from './public.component';
import {InputTextModule} from 'primeng/inputtext';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AvatarModule } from 'primeng/avatar';
import { ProgressBarModule } from 'primeng/progressbar';
import {CardModule} from 'primeng/card';
import { NgxCaptchaModule } from 'ngx-captcha';

@NgModule({
  declarations: [
    PublicComponent,LoginComponent
  ],
  imports: [
    NgxCaptchaModule,
    CommonModule,
    InputTextModule,
    BrowserModule,
    PublicRoutingModule,
    BrowserAnimationsModule,
    ButtonModule,
    DialogModule,
    DividerModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    CarouselModule,
    GalleriaModule,
    HttpClientModule,

    ConfirmPopupModule,
    ToastModule,
    CardModule,
    CommonModule,
    AvatarGroupModule,
    AvatarModule,
    ProgressBarModule
  ],
  providers: [],
  bootstrap: [PublicComponent]
})
export class PublicModule { }
