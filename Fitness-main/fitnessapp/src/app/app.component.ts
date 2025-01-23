import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "./navbar/navbar.component";
import { fadeAnimation, slideAnimation } from './animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [fadeAnimation, slideAnimation]
})
export class AppComponent implements OnInit {
  showSidebar = false;
  navigationCounter = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showSidebar = ['/messages', '/dashboard', '/trainerside', '/bookings', 'trainersidebook'].includes(event.url);
        this.navigationCounter++;
      }
    });
  }

  // Add this method to handle route animation states
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && this.navigationCounter;
  }
}