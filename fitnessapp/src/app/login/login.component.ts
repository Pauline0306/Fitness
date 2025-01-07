import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
    // Redirect to the homepage if the user is already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Easy access to form controls
  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    // Stop if the form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService
      .login(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe({
        next: () => {
          // On successful login, redirect to dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Login failed. Please try again.';
          this.loading = false;
        },
      });
  }
}
