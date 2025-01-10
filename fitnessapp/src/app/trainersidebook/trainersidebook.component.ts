import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-trainersidebook',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './trainersidebook.component.html',
  styleUrl: './trainersidebook.component.css',
})
export class TrainersidebookComponent {
  bookings: any;

  constructor(private authService: AuthService, private router: Router) {}

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
            this.loadBookings(); // Reload bookings
          },
          error: (err) => {
            console.error('Failed to update booking status:', err); // Log detailed error
            Swal.fire('Error', 'Failed to update booking status. Please try again.', 'error');
          },
        });
      }
    });
  }

  loadBookings() {
    this.authService.getTrainerBookings().subscribe({
      next: (data) => {
        console.log('Bookings data:', data); // Debug log
        this.bookings = data;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        Swal.fire('Error', 'Failed to fetch bookings. Please try again.', 'error');
      },
    });
  }

  ngOnInit() {
    this.loadBookings();
  }
}
