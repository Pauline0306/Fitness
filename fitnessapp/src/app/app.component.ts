import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { MessageListComponent } from "./message-list/message-list.component";
import { ChatWindowComponent } from "./chat-window/chat-window.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent, MessageListComponent, ChatWindowComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fitnessapp';
}
