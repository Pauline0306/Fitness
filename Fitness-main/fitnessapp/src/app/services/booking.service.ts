import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TrainerProfile, BookingRequest, WorkoutRoutine, DietEntry, WeightLog } from '../models/booking.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }


  
  getAvailableTrainers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/trainers`, {
      headers: this.authService.getAuthHeaders() // Use the getAuthHeaders() method from AuthService
    }).pipe(
      catchError(error => {
        console.error('Error fetching available trainers:', error);
        throw error;
      })
    );
  }

  private formatQualifications(qualifications: string | string[]): string[] {
    if (Array.isArray(qualifications)) {
      return qualifications;
    }
    return qualifications ? qualifications.split(',').map(q => q.trim()) : [];
  }
  
  
  // Trainer-related endpoints
  getAllTrainers(): Observable<TrainerProfile[]> {
    return this.http.get<TrainerProfile[]>(`${this.baseUrl}/trainers`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling method
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Unauthorized access. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to access this resource.';
      } else {
        errorMessage = error.error?.message || 'Server error';
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  // Rest of your service methods...
 
  createBooking(booking: BookingRequest): Observable<any> {
    // Make sure all required fields are included in the request
    const bookingData = {
      trainerId: booking.trainerId,
      healthHistory: booking.health_history,
      medicationHistory: booking.medication_history,
      fitnessGoal: booking.fitness_goal,
      preferredSchedule: booking.preferred_schedule,
      experienceLevel: booking.experience_level,
      startDate: booking.start_date,
      endDate: booking.end_date
    };

    return this.http.post(`${this.baseUrl}/bookings`, bookingData, {
      headers: this.getHeaders()
    });
  }
  


  
  getBookingDetails(bookingId: number): Observable<BookingRequest> {
    return this.http.get<BookingRequest>(`${this.baseUrl}/bookings/${bookingId}`, { headers: this.getHeaders() });
  }

  updateBookingStatus(bookingId: number, status: 'accepted' | 'rejected'): Observable<any> {
    return this.http.put(`${this.baseUrl}/bookings/${bookingId}/status`, { status }, { headers: this.getHeaders() });
  }

  


  trackWorkout(workoutId: number, completed: boolean, notes?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/workout/track`, { workoutId, completed, notes }, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  trackDiet(dietEntryId: number, caloriesConsumed: number, goalMet: boolean): Observable<any> {
    return this.http.post(`${this.baseUrl}/diet/track`, { dietEntryId, caloriesConsumed, goalMet }, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  getWeightHistory(traineeId: number): Observable<WeightLog[]> {
    return this.http.get<WeightLog[]>(`${this.baseUrl}/weight/history/${traineeId}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateWeight(weight: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/weight/update`, { weight }, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  getTraineeProgress(traineeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/trainee/progress/${traineeId}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }
  getBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/bookings`, {
      headers: this.getHeaders()
    });
  }
}