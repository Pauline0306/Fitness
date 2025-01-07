import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
        // Store the user and token in local storage
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
        return response;
      })
    );
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getTrainers(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/api/trainers', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  }
  getTrainee(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/api/trainee', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
  }
}
