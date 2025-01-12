import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trainersidebook',
  imports: [CommonModule, SidebarComponent,FormsModule],
  templateUrl: './trainersidebook.component.html',
  styleUrl: './trainersidebook.component.css',
})
export class TrainersidebookComponent {
  bookings: any[] = [];
  trainees: any[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  toggleWorkout(traineeId: number) {
    const trainee = this.trainees.find((t) => t.id === traineeId);
    if (trainee) {
      if (!trainee.workouts) {
        this.authService.getWorkoutRoutines(traineeId).subscribe({
          next: (data) => {
            trainee.workouts = data;
            trainee.showWorkout = true;
          },
          error: (err) => {
            console.error('Error fetching workout routines:', err);
            Swal.fire(
              'Error',
              'Failed to fetch workout routines. Please try again.',
              'error'
            );
          },
        });
      } else {
        trainee.showWorkout = !trainee.showWorkout;
      }
    }
  }

  toggleDiet(traineeId: number) {
    const trainee = this.trainees.find((t) => t.id === traineeId);
    if (trainee) {
      if (!trainee.dietEntries) {
        this.authService.getDietEntries(traineeId).subscribe({
          next: (data) => {
            trainee.dietEntries = data;
            trainee.showDiet = true;
          },
          error: (err) => {
            console.error('Error fetching diet entries:', err);
            Swal.fire(
              'Error',
              'Failed to fetch diet entries. Please try again.',
              'error'
            );
          },
        });
      } else {
        trainee.showDiet = !trainee.showDiet;
      }
    }
  }

  updateBookingStatus(bookingId: number, status: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${status} this booking?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'accepted' ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${status}!`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.updateBookingStatus(bookingId, status).subscribe({
          next: () => {
            Swal.fire('Success!', `Booking has been ${status}.`, 'success');
            if (status === 'accepted') {
              const acceptedBooking = this.bookings.find(
                (booking) => booking.id === bookingId
              );
              if (acceptedBooking) {
                this.trainees.push({
                  ...acceptedBooking,
                  showWorkout: false,
                  showDiet: false,
                  workouts: null,
                  dietEntries: null,
                });
                this.bookings = this.bookings.filter(
                  (booking) => booking.id !== bookingId
                );
              }
            } else if (status === 'rejected') {
              this.bookings = this.bookings.filter(
                (booking) => booking.id !== bookingId
              );
            }
          },
          error: (err) => {
            console.error('Failed to update booking status:', err);
            Swal.fire(
              'Error',
              'Failed to update booking status. Please try again.',
              'error'
            );
          },
        });
      }
    });
  }

  loadBookings() {
    this.authService.getTrainerBookings().subscribe({
      next: (data) => {
        this.bookings = data.filter(
          (booking) => booking.status === 'pending'
        );
        this.trainees = data
          .filter((booking) => booking.status === 'accepted')
          .map((trainee) => ({
            ...trainee,
            showWorkout: false,
            showDiet: false,
            workouts: null,
            dietEntries: null,
          }));
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        Swal.fire(
          'Error',
          'Failed to fetch bookings. Please try again.',
          'error'
        );
      },
    });
  }
  postSuggestion(traineeId: number, suggestionText: string) {
    if (!suggestionText || suggestionText.trim() === '') {
      Swal.fire('Warning', 'Suggestion cannot be empty.', 'warning');
      return;
    }
  
    const suggestionPayload = {
      user_id: traineeId,
      suggestion: suggestionText.trim()
    };
  
    this.authService.postSuggestion(suggestionPayload).subscribe({
      next: (response) => {
        Swal.fire('Success!', 'Suggestion posted successfully.', 'success');
        // Clear the suggestion text for the trainee
        const trainee = this.trainees.find((t) => t.id === traineeId);
        if (trainee) {
          trainee.suggestionText = '';
        }
      },
      error: (error) => {
        console.error('Error posting suggestion:', error);
        let errorMessage = 'Failed to post suggestion. Please try again.';
        
        // Handle specific error messages from the backend
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }
  

  ngOnInit() {
    this.loadBookings();
  }
}