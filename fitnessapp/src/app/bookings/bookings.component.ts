import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';

interface Booking {
  id: number;
  opposite_name: string;
  opposite_role: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  acceptedTrainers: Booking[] = []; // List for trainers with accepted bookings

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.authService.getBookings().subscribe({
      next: (response) => {
        this.processBookings(response);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });
  }

  /**
   * Processes the bookings to separate accepted trainers from pending/rejected bookings.
   */
  private processBookings(bookings: Booking[]): void {
    // Filter accepted trainers and store them in a separate list
    this.acceptedTrainers = bookings.filter((booking) => booking.status === 'accepted');

    // Keep only bookings that are pending or rejected
    this.bookings = bookings.filter((booking) => booking.status !== 'accepted');

    console.log('Processed Bookings:', this.bookings);
    console.log('Accepted Trainers:', this.acceptedTrainers);
  }
}
