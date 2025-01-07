import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trainerside',
  imports: [CommonModule],
  templateUrl: './trainerside.component.html',
  styleUrl: './trainerside.component.css'
})
export class TrainersideComponent {
  trainee: any[] = [];
  error: string = '';
  isTrainee: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    
    // Check if the logged-in user is a trainee
    this.isTrainee = this.authService.userRole === 'trainer';

    if (this.isTrainee) {
      this.authService.getTrainee().subscribe({
        next: (data) => (this.trainee = data),
        error: (err) => (this.error = err.error?.message || 'Failed to fetch trainee'),
      });
    }
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
