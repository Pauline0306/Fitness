import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule]
})
export class DashboardComponent {
  trainers: any[] = [];
  error: string = '';
  isTrainee: boolean = false;
  
  constructor(private authService: AuthService, private router: Router) {}


  ngOnInit() {
    
    // Check if the logged-in user is a trainee
    this.isTrainee = this.authService.userRole === 'trainee';

    if (this.isTrainee) {
      this.authService.getTrainers().subscribe({
        next: (data) => (this.trainers = data),
        error: (err) => (this.error = err.error?.message || 'Failed to fetch trainers'),
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
