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

  constructor(private authService: AuthService, private http: HttpClient) {} 

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.authService.getBookings().subscribe({
      next: (response) => {
        this.bookings = response;
        console.log('Bookings loaded:', this.bookings);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });
  }
}