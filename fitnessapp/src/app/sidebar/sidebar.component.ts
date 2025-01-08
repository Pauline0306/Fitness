import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [RouterModule,CommonModule],
})
export class SidebarComponent implements OnInit {
  userName: string | null = '';
  userRole: string | null = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Get current user details
    const currentUser = this.authService.currentUserValue;
    this.userName = currentUser?.name || 'Guest';
    this.userRole = currentUser?.role || 'Unknown';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get homeLink(): string {
    return this.userRole === 'trainee' ? '/dashboard' : '/trainerside';
  }
}
