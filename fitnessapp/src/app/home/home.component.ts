import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { fadeAnimation, slideAnimation } from '../animations';


@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [fadeAnimation, slideAnimation]
})
export class HomeComponent {

}
