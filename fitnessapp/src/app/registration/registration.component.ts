import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  role: string = 'trainee';
  termsAccepted: boolean = false;

  onSubmit() {
    if (this.termsAccepted) {
      console.log('Registration Form Submitted:', {
        username: this.username,
        email: this.email,
        password: this.password,
        role: this.role
      });
    } else {
      alert('Please accept the terms and conditions.');
    }
  }
}