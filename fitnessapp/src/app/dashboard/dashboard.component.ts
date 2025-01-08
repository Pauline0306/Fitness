import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, SidebarComponent]
})
export class DashboardComponent {
  trainers: { name: string; email: string }[] = []; // Explicitly define structure
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
            name: trainer.name, // Full name (first and last name)
            email: trainer.email, // Email
          }));
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to fetch trainers';
        },
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
