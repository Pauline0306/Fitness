import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { DashboardComponent } from "./dashboard/dashboard.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  showNavbar = true; // Controls visibility of the navbar
  showSidebar = false; // Controls visibility of the sidebar

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Listen to route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Check the current route
        if (event.url === '/messages', '/dashboard') {
          this.showNavbar = false; // Hide navbar
          this.showSidebar = true; // Show sidebar
        } else {
          this.showNavbar = true; // Show navbar
          this.showSidebar = false; // Hide sidebar
        }
      }
    });
  }
}