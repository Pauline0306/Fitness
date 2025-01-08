import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      localStorage.getItem('currentUser')
        ? JSON.parse(localStorage.getItem('currentUser')!)
        : null
    );

    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Getter for the current user's value
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Getter for the current user's role
  public get userRole(): string | null {
    return this.currentUserValue?.role || null; // Assuming `role` exists on the user object
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, user);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      map((response) => {
        // Store token and user information in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        return response.user;
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  // Helper method to get the Authorization header
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Fetch users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Fetch trainers with token in the Authorization header
  getTrainers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/trainers`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Fetch trainees with token in the Authorization header
  getTrainee(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/trainee`, {
      headers: this.getAuthHeaders(),
    });
  }
}
