import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Import RouterModule for routing support

@Component({
  selector: 'app-navbar',
  standalone: true, // Assuming standalone components are used
  imports: [RouterModule], // Include RouterModule for routing links
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {}
