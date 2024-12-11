import {  Routes,RouterModule, } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { RegistrationComponent } from './registration/registration.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessagesComponent } from './messages/messages.component';


export const routes: Routes = [
    { path: 'admin', component: AdminComponent },
    { path: 'login', component: LoginComponent },
    { path: 'about', component: AboutComponent },
    { path: 'home', component: HomeComponent },
    { path: 'registration', component: RegistrationComponent },
    { path: 'messages', component: MessagesComponent },

];

@NgModule({
    imports: [RouterModule.forRoot(routes), FormsModule],
    exports: [RouterModule] 
  })
  export class AppRoutingModule { }