import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-trainerside',
  imports: [CommonModule, SidebarComponent],
  templateUrl: './trainerside.component.html',
  styleUrl: './trainerside.component.css'
})
export class TrainersideComponent {
  trainees: { id: number; name: string; email: string }[] = []; // Added id to structure
  error: string = '';
  isTrainer: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Check if the user is a trainer
    this.isTrainer = this.authService.userRole === 'trainer';

    if (this.isTrainer) {
      this.authService.getTrainee().subscribe({
        next: (data) => {
          // Ensure trainees include an id field
          this.trainees = data.map((trainee) => ({
            id: trainee.id,     // Map the id from the API
            name: trainee.name, // Map the name
            email: trainee.email // Map the email
          }));
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to fetch trainees';
        },
      });
    }
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
