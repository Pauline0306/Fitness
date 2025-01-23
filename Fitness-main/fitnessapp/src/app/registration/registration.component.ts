import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { fadeAnimation, slideAnimation } from '../animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
  animations: [fadeAnimation, slideAnimation]
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['trainee', Validators.required], // Set default role to trainee
      // Trainee-specific fields
      age: ['', Validators.required],
      gender: ['', Validators.required],
      height: ['', Validators.required],
      weight: ['', Validators.required],
      // Trainer-specific fields
      qualifications: [''],
      experience: [''],
      specialization: [''],
      availability: ['']
    });

    // Initially set up validators for trainee fields
    this.onRoleChange();
  }

  onRoleChange() {
    const role = this.registerForm.get('role')?.value;
    
    if (role === 'trainer') {
      // Add validators for trainer-specific fields
      this.registerForm.get('qualifications')?.setValidators([Validators.required]);
      this.registerForm.get('experience')?.setValidators([Validators.required]);
      this.registerForm.get('specialization')?.setValidators([Validators.required]);
      this.registerForm.get('availability')?.setValidators([Validators.required]);
      
      // Remove validators from trainee fields
      this.registerForm.get('age')?.clearValidators();
      this.registerForm.get('gender')?.clearValidators();
      this.registerForm.get('height')?.clearValidators();
      this.registerForm.get('weight')?.clearValidators();
    } else {
      // Add validators for trainee-specific fields
      this.registerForm.get('age')?.setValidators([Validators.required]);
      this.registerForm.get('gender')?.setValidators([Validators.required]);
      this.registerForm.get('height')?.setValidators([Validators.required]);
      this.registerForm.get('weight')?.setValidators([Validators.required]);
      
      // Remove validators from trainer fields
      this.registerForm.get('qualifications')?.clearValidators();
      this.registerForm.get('experience')?.clearValidators();
      this.registerForm.get('specialization')?.clearValidators();
      this.registerForm.get('availability')?.clearValidators();
    }
    
    // Update the validation status for all fields
    ['qualifications', 'experience', 'specialization', 'availability',
     'age', 'gender', 'height', 'weight'].forEach(field => {
      this.registerForm.get(field)?.updateValueAndValidity();
    });
  }

  onSubmit() {
    this.submitted = true;
  
    if (this.registerForm.invalid) {
      return;
    }

    const formData = this.registerForm.value;
  
    this.authService.register(formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'You can now log in to your account.',
          customClass: {
            popup: 'swal2-popup',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm',
          },
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: error.error?.message || 'Registration failed. Please try again.',
          customClass: {
            popup: 'swal2-popup',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm',
          },
        });
      },
    });
  }
}