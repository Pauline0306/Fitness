import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  userName: string | null = '';
  userRole: string | null = '';
  router: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Get the current user details from AuthService
    const currentUser = this.authService.currentUserValue;
    this.userName = currentUser?.name || 'Guest';
    this.userRole = currentUser?.role || 'Unknown';
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
