import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  sendMessage(receiverId: number, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages`, 
      { receiverId, content },
      { headers: this.getAuthHeaders() }
    );
  }

  getConversation(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/messages/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  markMessageAsRead(messageId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/messages/${messageId}/read`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
  getConversations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/conversations`, {
      headers: this.getAuthHeaders(),
    });
  }
  
}