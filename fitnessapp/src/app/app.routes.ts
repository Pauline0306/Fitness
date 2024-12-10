import {  Routes,RouterModule, } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';



export const routes: Routes = [
    { path: 'admin', component: AdminComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: RegistrationComponent }

];

@NgModule({
    imports: [RouterModule.forRoot(routes), FormsModule],
    exports: [RouterModule] 
  })
  export class AppRoutingModule { }