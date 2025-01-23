import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../services/booking.service';
import { TrainerProfile, BookingRequest } from '../models/booking.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    MatNativeDateModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BookingsComponent implements OnInit {
  getQualifications(qualifications: string | string[]): string[] {
    if (Array.isArray(qualifications)) {
      return qualifications;
    }
    return qualifications ? qualifications.split(',').map(q => q.trim()) : [];
  }


  experienceLevels: string[] = ['beginner', 'intermediate', 'pro'];
  
  trainers: any[] = [];
  selectedTrainer: any = null; // Selected trainer for booking
  bookings: BookingRequest[] = [];
  isLoading = false;
  newBooking: any = {}; // Booking form data
  myBookings: any[] = []; // Bookings by the user

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.currentUserValue) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.authService.userRole !== 'trainee') {
      this.snackBar.open('Only trainees can access this page', 'Close', { duration: 3000 });
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadAvailableTrainers(); 
    this.loadBookings(); // Load bookings when component initializes
  }

  loadAvailableTrainers(): void {
    this.bookingService.getAvailableTrainers().subscribe(
      (trainers) => {
        this.trainers = trainers; // Filtered list of trainers
      },
      (error) => {
        console.error('Error fetching available trainers:', error);
        this.snackBar.open('Failed to load available trainers. Please try again.', 'Close', { duration: 3000 });
      }
    );
  }
  loadMyBookings(): void {
    this.myBookings = this.bookings.filter(
      (booking) => {
        if (!this.authService.currentUserValue) {
          console.error('Current user is null');
          return false;
        }
        return booking.trainerId === this.authService.currentUserValue.id;
      }
    );
  }

  

  viewTrainerDetails(trainer: TrainerProfile) {
    this.selectedTrainer = {
      ...trainer,
      qualifications: typeof trainer.qualifications === 'string'
        ? trainer.qualifications.split(',').map(q => q.trim())
        : trainer.qualifications
    };
    this.newBooking.trainerId = trainer.id;
  }
 
  submitBooking(): void {
    if (!this.selectedTrainer) {
      this.snackBar.open('No trainer selected. Please select a trainer before submitting.', 'Close', { duration: 3000 });
      return;
    }
  
    const bookingData = {
      ...this.newBooking,
      trainerId: this.selectedTrainer.id
    };
  
    this.bookingService.createBooking(bookingData).subscribe(
      (response) => {
        // Remove the booked trainer from available trainers
        this.trainers = this.trainers.filter((trainer) => trainer.id !== this.selectedTrainer!.id);
  
        // Add the new booking to "My Bookings"
        this.myBookings.push({
          trainer: this.selectedTrainer,
          ...this.newBooking,
          status: 'pending' // Default status
        });
  
        this.selectedTrainer = null;
        this.snackBar.open('Booking submitted successfully!', 'Close', { duration: 3000 });
      },
      (error) => {
        console.error('Error submitting booking:', error);
        this.snackBar.open('Failed to submit booking. Please try again.', 'Close', { duration: 3000 });
      }
    );
  }
  


  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  loadBookings() {
    this.isLoading = true;
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading bookings:', error);
        this.snackBar.open('Error loading bookings', 'Close', { duration: 3000 });
      },
    });
  }


  
  

  private validateBooking(): string | null {
    if (!this.newBooking.trainerId) {
      return 'Please select a trainer';
    }
    if (!this.newBooking.healthHistory?.trim()) {
      return 'Health history is required';
    }
    if (!this.newBooking.fitnessGoal?.trim()) {
      return 'Fitness goal is required';
    }
    if (!this.newBooking.preferredSchedule?.trim()) {
      return 'Preferred schedule is required';
    }
    if (!this.newBooking.experienceLevel) {
      return 'Experience level is required';
    }
    if (!this.newBooking.startDate || !this.newBooking.endDate) {
      return 'Both start and end dates are required';
    }

    const start = new Date(this.newBooking.startDate);
    const end = new Date(this.newBooking.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return 'Start date cannot be in the past';
    }
    if (end <= start) {
      return 'End date must be after start date';
    }
    if (!this.experienceLevels.includes(this.newBooking.experienceLevel)) {
      return 'Invalid experience level selected';
    }

    return null;
  }

  private resetForm() {
    this.selectedTrainer = null;
    this.newBooking = {
      trainerId: 0,
      healthHistory: '',
      medicationHistory: '',
      fitnessGoal: '',
      preferredSchedule: '',
      experienceLevel: 'beginner',
      startDate: null,
      endDate: null
    };
  }
}