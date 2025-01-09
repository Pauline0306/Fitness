import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagingService } from '../services/messaging.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
  imports: [SidebarComponent, FormsModule, CommonModule],
})
export class MessagesComponent implements OnInit {
  users: User[] = [];
  conversations: any[] = []; // List of conversations
  messages: any[] = [];
  selectedUser: User | null = null;
  newMessage: string = '';
  currentUser: User | null = null;
  userRole: string | null = null;
  groupedConversations: { role: string; conversations: any[] }[] = [];



  constructor(
    private messagingService: MessagingService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.userRole = this.authService.userRole;
  }

  ngOnInit() {
    this.loadConversations();

    // Check for query parameters to load specific user messages
    this.route.queryParams.subscribe((params) => {
      if (params['userId'] && params['userName']) {
        this.selectedUser = {
          id: parseInt(params['userId']),
          name: params['userName'],
        } as User;
        this.loadMessages();
      }
    });
  }

  loadConversations() {
    this.messagingService.getConversations().subscribe((conversations) => {
      // Group conversations by role
      const grouped = conversations.reduce((acc, conv) => {
        const role = conv.role || 'Others'; // Default role if none provided
        if (!acc[role]) {
          acc[role] = [];
        }
        acc[role].push({
          id: conv.id,
          name: conv.name,
          role: conv.role,
          email: conv.email || 'No email provided', // Use email instead of lastMessage
        });
        return acc;
      }, {});
  
      // Convert grouped object to an array
      this.groupedConversations = Object.keys(grouped).map((role) => ({
        role,
        conversations: grouped[role],
      }));
    });
  }
  
  


  selectConversation(conversation: any) {
    this.selectedUser = { id: conversation.id, name: conversation.name } as User;
    this.loadMessages();
  }

  deselectUser() {
    this.selectedUser = null;
  }

  loadMessages() {
    if (this.selectedUser?.id) {
      this.messagingService.getConversation(this.selectedUser.id).subscribe((messages) => {
        this.messages = messages;
        // Mark unread messages as read
        messages.forEach((message) => {
          if (!message.is_read && message.receiver_id === this.currentUser?.id) {
            this.messagingService.markMessageAsRead(message.id).subscribe();
          }
        });
      });
    }
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedUser?.id) {
      this.messagingService.sendMessage(this.selectedUser.id, this.newMessage.trim()).subscribe(() => {
        this.loadMessages();
        this.newMessage = '';
      });
    }
  }
}
