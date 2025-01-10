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
        // Assign and sort bookings
        this.bookings = response.sort((a: Booking, b: Booking) => {
          if (a.status === 'accepted' && b.status !== 'accepted') return -1;
          if (b.status === 'accepted' && a.status !== 'accepted') return 1;
          return 0;
        });
  
        // Filter accepted trainers
        this.acceptedTrainers = this.bookings.filter((booking: Booking) => booking.status === 'accepted');
        console.log('Accepted Trainers:', this.acceptedTrainers);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });
  }
  
}
