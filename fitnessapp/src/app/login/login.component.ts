import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
  
    if (this.loginForm.invalid) {
      return;
    }
  
    this.loading = true;
  
    this.authService
      .login(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe({
        next: (user) => {
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: `Welcome ${user.name || 'User'}!`,
            customClass: {
              popup: 'swal2-popup',
              title: 'swal2-title',
              confirmButton: 'swal2-confirm',
            },
          });
  
          if (user.role === 'trainee') {
            this.router.navigate(['/dashboard']);
          } else if (user.role === 'trainer') {
            this.router.navigate(['/trainerside']);
          } else {
            this.error = 'Unknown user role';
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: err.error?.message || 'Login failed. Please try again.',
            customClass: {
              popup: 'swal2-popup',
              title: 'swal2-title',
              confirmButton: 'swal2-confirm',
            },
          });
          this.loading = false;
        },
      });
  }
}  