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
import { BehaviorSubject, interval } from 'rxjs';
import Swal from 'sweetalert2'; // Import SweetAlert2

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
  bookingsSubject = new BehaviorSubject<BookingRequest[]>([]);
  bookings$ = this.bookingsSubject.asObservable();
  bookings: BookingRequest[] = [];
  bookedTrainerIds: number[] = [];
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

    
  
    // Subscribe to bookings observable
    this.bookings$.subscribe((bookings) => {
      this.bookings = bookings;
      this.loadMyBookings();
    });
  
    this.loadBookings();

    interval(8000).subscribe(() => {
      this.loadBookings(); // Automatically refresh bookings
    });
  }
  

  

  loadAvailableTrainers(): void {
    this.bookingService.getAvailableTrainers().subscribe(
      (trainers) => {
        this.trainers = trainers; // Load all trainers without filtering
  
        // Optional: You can add a property to indicate if the trainer is booked
        this.trainers.forEach((trainer) => {
          trainer.isBooked = this.bookings.some(
            (booking) => booking.trainerId === trainer.id &&
              (booking.status === 'pending' || booking.status === 'accepted')
          );
        });
  
        if (this.trainers.length === 0) {
          console.log('No trainers available at the moment.');
        }
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
    // Check if trainer is already booked
    if (this.bookedTrainerIds.includes(trainer.id)) {
      this.snackBar.open('This trainer is already booked.', 'Close', { duration: 3000 });
      return;
    }

    this.selectedTrainer = {
      ...trainer,
      qualifications: typeof trainer.qualifications === 'string'
        ? trainer.qualifications.split(',').map(q => q.trim())
        : trainer.qualifications
    };
    this.newBooking.trainerId = trainer.id;
  }
 
 
  submitBooking(): void {
    const hasExistingBooking = this.bookings.some(
      (booking) =>
        booking.userId === this.authService.currentUserValue?.id &&
        (booking.status === 'pending' || booking.status === 'accepted')
    );
  
    if (hasExistingBooking) {
      Swal.fire({
        icon: 'warning',
        title: 'Active Booking Found',
        text: 'You already have a pending or accepted booking.',
        confirmButtonText: 'Close',
      });
      return;
    }
  
    const validationError = this.validateBooking();
    if (validationError) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: validationError,
        confirmButtonText: 'Close',
      });
      return;
    }
  
    if (!this.selectedTrainer) {
      Swal.fire({
        icon: 'info',
        title: 'No Trainer Selected',
        text: 'Please select a trainer before submitting.',
        confirmButtonText: 'Close',
      });
      return;
    }
  
    const bookingData: BookingRequest = {
      trainerId: this.selectedTrainer.id,
      health_history: this.newBooking.health_history,
      medication_history: this.newBooking.medication_history,
      fitness_goal: this.newBooking.fitness_goal,
      preferred_schedule: this.newBooking.preferred_schedule,
      experience_level: this.newBooking.experience_level,
      start_date: this.newBooking.start_date,
      end_date: this.newBooking.end_date,
      traineeId: this.authService.currentUserValue?.id,
      status: 'pending',
      userId: 0,
    };
  
    this.bookingService.createBooking(bookingData).subscribe(
      (newBooking) => {
        const updatedBookings = [...this.bookingsSubject.value, newBooking];
        this.bookingsSubject.next(updatedBookings); // Automatically refresh
        this.resetForm();
        this.selectedTrainer = null;
  
        Swal.fire({
          icon: 'success',
          title: 'Booking Submitted',
          text: 'Your booking has been submitted successfully!',
          confirmButtonText: 'Close',
        });
  
        this.loadAvailableTrainers();
      },
      (error) => {
        console.error('Error submitting booking:', error);
        Swal.fire({
          icon: 'error',
          title: 'Booking Submission Failed',
          text: 'You already have a booking submitted to a trainer.',
          confirmButtonText: 'Close',
        });
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
        this.bookingsSubject.next(bookings); // Automatically update the subject
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

      },
    });
  }
  


  
  

  private validateBooking(): string | null {
    if (!this.newBooking.trainerId) {
      return 'Please select a trainer';
    }
    if (!this.newBooking.health_history?.trim()) {
      return 'Health history is required';
    }
    if (!this.newBooking.fitness_goal?.trim()) {
      return 'Fitness goal is required';
    }
    if (!this.newBooking.preferred_schedule?.trim()) {
      return 'Preferred schedule is required';
    }
    if (!this.newBooking.experience_level) {
      return 'Experience level is required';
    }
    if (!this.newBooking.start_date || !this.newBooking.end_date) {
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
    if (!this.experienceLevels.includes(this.newBooking.experience_level)) {
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