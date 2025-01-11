import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { fadeAnimation, slideAnimation } from '../animations';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule],
  animations: [fadeAnimation, slideAnimation]
  
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
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log me out!',
      customClass: {
        popup: 'swal2-popup',
        title: 'swal2-title',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have successfully logged out.',
          customClass: {
            popup: 'swal2-popup',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm',
          },
        });
      }
    });
  }

  get homeLink(): string {
    return this.userRole === 'trainee' ? '/dashboard' : '/trainerside';
  }
}
