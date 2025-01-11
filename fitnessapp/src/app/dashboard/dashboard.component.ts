import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, SidebarComponent, FormsModule]
})
export class DashboardComponent {
  trainers: { id: number; name: string; email: string }[] = []; // Include id in the structure
  error: string = '';
  isTrainee: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Check if the logged-in user is a trainee
    this.isTrainee = this.authService.userRole === 'trainee';

    if (this.isTrainee) {
      this.authService.getTrainers().subscribe({
        next: (data) => {
          // Map the data to ensure proper structure
          this.trainers = data.map((trainer) => ({
            id: trainer.id, // Add id here
            name: trainer.name,
            email: trainer.email,
          }));
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to fetch trainers';
        },
      });
    }
  }
  bookTrainer(trainerId: number, trainerName: string) {
    Swal.fire({
      title: `Book ${trainerName}?`,
      text: 'Are you sure you want to book this trainer?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, book!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.bookTrainer(trainerId).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Success!',
              text: 'Trainer has been booked.',
              icon: 'success'
            }).then(() => {
              this.router.navigate(['/bookings']);
            });
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Failed to book trainer.', 'error');
            console.error('Booking error:', err);
          }
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToMessages(userId: number, userName: string) {
    this.router.navigate(['/messages'], {
      queryParams: { userId, userName }
    });
  }
}
