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
  trainee: any[] = [];
  error: string = '';
  isTrainer: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    
 
    this.isTrainer = this.authService.userRole === 'trainer';

    if (this.isTrainer) {
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
