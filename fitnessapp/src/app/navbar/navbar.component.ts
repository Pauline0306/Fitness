import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule,RouterModule],
})
export class NavbarComponent implements OnInit {
  showNavbar = false;
  private navbarRoutes = ['/home', '/about', '/login', '/registration'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Check if the current URL matches one of the allowed navbar routes
        this.showNavbar = this.navbarRoutes.includes(event.urlAfterRedirects);
      }
    });
  }
}
