import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-list',
  imports: [CommonModule],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.css'
})
export class MessageListComponent {
  messages = Array(7).fill({ name: 'Trainer', text: 'Hello Po', time: '11:59 PM' });
}
