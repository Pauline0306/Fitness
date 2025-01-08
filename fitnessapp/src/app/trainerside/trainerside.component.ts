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
  trainee: { name: string; email: string }[] = []; // Explicitly define structure
  error: string = '';
  isTrainer: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Check if the user is a trainer
    this.isTrainer = this.authService.userRole === 'trainer';

    if (this.isTrainer) {
      this.authService.getTrainee().subscribe({
        next: (data) => {
          // Map the data to ensure proper structure
          this.trainee = data.map((trainee) => ({
            name: trainee.name, // Full name
            email: trainee.email, // Email
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
}
