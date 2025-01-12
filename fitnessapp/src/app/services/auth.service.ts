import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { BookingResponse } from '../models/booking-response';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getToken(): string | null {
    return localStorage.getItem('authToken'); // Adjust based on your implementation
  }
  private apiUrl = 'http://localhost:3000/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private workoutUpdatesSubject = new BehaviorSubject<any[]>([]);
  private dietUpdatesSubject = new BehaviorSubject<any[]>([]);

  workoutUpdates$ = this.workoutUpdatesSubject.asObservable();
  dietUpdates$ = this.dietUpdatesSubject.asObservable();

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
  getAcceptedTrainers() {
    return this.http.get<{ id: number; name: string; email: string }[]>('/api/bookings/accepted-trainers', {
        headers: { Authorization: `Bearer ${this.getToken()}` }
    });
}
bookTrainer(trainerId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/bookings`, { trainerId }, {
    headers: this.getAuthHeaders()
  });
}


updateBookingStatus(bookingId: number, status: string): Observable<BookingResponse> {
  if (!bookingId) {
    return throwError(() => new Error('Booking ID is required'));
  }

  const url = `${this.apiUrl}/bookings/${bookingId}/status`;
  console.log('Updating booking status:', { url, bookingId, status }); // Debug log

  return this.http.put<BookingResponse>(
    url,
    { status },
    { headers: this.getAuthHeaders() }
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error updating booking:', error); // Log the error
      return throwError(() => new Error(error.error?.message || 'Failed to update booking status'));
    })
  );
}

getTrainerBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching bookings:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to fetch bookings'));
      })
    );
  }
getBookings(): Observable<any> {
  return this.http.get(`${this.apiUrl}/bookings`, {
    headers: this.getAuthHeaders()
  });
}
getWorkoutRoutines(userId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/workout_routines/${userId}`, {
    headers: this.getAuthHeaders(),
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error fetching workout routines:', error);
      return throwError(() => new Error(error.error?.message || 'Failed to fetch workout routines'));
    })
  );
}


getDietEntries(userId: number): Observable<any> {
  // Constructing the API URL with the provided userId
  return this.http.get(`${this.apiUrl}/diet_entries/${userId}`, {
    headers: this.getAuthHeaders() // Including the Authorization header
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      // Logging the error to help with debugging
      console.error('Error fetching diet entries:', error);

      // Returning a descriptive error for the subscriber
      return throwError(() =>
        new Error(error.error?.message || 'Failed to fetch diet entries')
      );
    })
  );
}


}
