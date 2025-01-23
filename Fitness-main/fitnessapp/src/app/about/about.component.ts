import { Component } from '@angular/core';
import { fadeAnimation, slideAnimation } from '../animations';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
  animations: [fadeAnimation, slideAnimation]
})
export class AboutComponent {

}
