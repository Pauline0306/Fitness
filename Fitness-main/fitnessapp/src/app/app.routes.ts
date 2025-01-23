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
import { AboutComponent } from './about/about.component';
import { BookingsComponent } from './bookings/bookings.component';
import { TrainersidebookComponent } from './trainersidebook/trainersidebook.component';

export const routes: Routes = [
    { path: 'home', component:HomeComponent},
    { path: 'admin', component: AdminComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'trainerside', component: TrainersideComponent },
    { path: 'messages', component: MessagesComponent},
    { path: 'about', component: AboutComponent},
    { path: 'bookings', component:BookingsComponent},
    { path: 'trainersidebook', component: TrainersidebookComponent},
    { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes), FormsModule],
    exports: [RouterModule] 
  })
  export class AppRoutingModule { }