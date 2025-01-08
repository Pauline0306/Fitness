import {  Routes,RouterModule, } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';

import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './registration/registration.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TrainersideComponent } from './trainerside/trainerside.component';
import { MessagesComponent } from './messages/messages.component';

export const routes: Routes = [
    { path: 'admin', component: AdminComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'trainerside', component: TrainersideComponent },
    { path: 'home', component:HomeComponent},
    { path: 'messages', component: MessagesComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes), FormsModule],
    exports: [RouterModule] 
  })
  export class AppRoutingModule { }