import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-trainersidebook',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './trainersidebook.component.html',
  styleUrl: './trainersidebook.component.css'
  
})
export class TrainersidebookComponent {
bookings: any;

  

  constructor(private authService: AuthService, private router: Router) {}

  updateBookingStatus(bookingId: number, status: string) {
    this.authService.updateBookingStatus(bookingId, status).subscribe({
      next: () => {
        alert(`Booking ${status}`);
        this.loadBookings(); // Reload bookings
      },
      error: () => alert('Failed to update booking status'),
    });
  }
  
  
  loadBookings() {
    this.authService.getTrainerBookings().subscribe({
      next: (data) => (this.bookings = data),
      error: (err) => console.error('Error fetching bookings:', err),
    });
  }
  
  ngOnInit() {
    this.loadBookings();
  }

}
