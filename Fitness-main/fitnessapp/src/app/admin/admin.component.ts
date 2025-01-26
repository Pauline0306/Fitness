import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';




@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

  trainerRequests = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      specialization: 'Fitness Trainer',
      status: 'Pending'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '987-654-3210',
      specialization: 'Yoga Instructor',
      status: 'Pending'
    }
  ];

  approveRequest(id: number): void {
    const request = this.trainerRequests.find(req => req.id === id);
    if (request) request.status = 'Approved';
  }

  rejectRequest(id: number): void {
    const request = this.trainerRequests.find(req => req.id === id);
    if (request) request.status = 'Rejected';
  }

  logout(): void {
    console.log('Logging out...');
    // Add your logout logic here
  }
}
