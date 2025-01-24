import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { BookingResponse } from '../models/booking-response';




interface DietRecommendation {
  id: number;
  user_id: number;
  recommendation: string;
  created_at: string;
}


interface WorkoutRoutine {
  user_id: number;
  body_part: string;
  exercises: string;
  is_completed?: boolean;
  completion_date?: Date | null;
  created_at?: Date;
}

interface DietEntry {
  id?: number;
  meal: string;
  food_name: string;
  calories: number;
  is_followed?: boolean;
  created_at?: string;
}

interface WeightLog {
  trainee_id: number;
  weight: number;
  date: string;
}



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
  private workoutUpdates: { [traineeId: number]: BehaviorSubject<any[]> } = {};
  private dietUpdates: { [traineeId: number]: BehaviorSubject<any[]> } = {};
  
  // Poll interval in milliseconds (e.g., 10000 = 10 seconds)
  private readonly POLL_INTERVAL = 10000;

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
  

  

  // In auth.service.ts
register(formData: any) {
  const endpoint = formData.role === 'trainer' ? 'register/trainer' : 'register/trainee';
  return this.http.post(`${this.apiUrl}/auth/${endpoint}`, formData);
}



login(email: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password })
    .pipe(
      map(response => {
        // Validate response structure
        if (!response?.user?.role) {
          throw new Error('Invalid response format: missing user role');
        }

        // Save auth data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));

        // Update current user
        this.currentUserSubject.next(response.user);

        return response;
      }),
      catchError(error => {
        console.error('Login error:', error);
        // Clear any partial data
        this.logout();
        return throwError(() => error);
      })
    );
}



  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }
  

  // Helper method to get the Authorization header
  public getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication token is missing.');
    }
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
 
  bookTrainer(trainerId: number): Observable<any> {
    return this.http
      .post(
        `${this.apiUrl}/bookings`,
        { trainerId },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError));
  }



updateBookingStatus(bookingId: number, status: string): Observable<BookingResponse> {
  if (!bookingId) {
    return throwError(() => new Error('Booking ID is required'));
  }

  return this.http.put<BookingResponse>(
    `${this.apiUrl}/bookings/${bookingId}/status`,
    { status },
    { headers: this.getAuthHeaders() }
  ).pipe(
    catchError(this.handleError)
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

  logWeight(traineeId: number, weight: number): Observable<WeightLog> {
    const payload: WeightLog = {
      trainee_id: traineeId,
      weight: weight,
      date: new Date().toISOString()
    };

    return this.http.post<WeightLog>(
      `${this.apiUrl}/weight-logs`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getWeightLogs(traineeId: number): Observable<WeightLog[]> {
    return this.http.get<WeightLog[]>(
      `${this.apiUrl}/weight-logs/${traineeId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }


  
  getWorkoutRoutines(userId: number): Observable<any[]> {
    const url = `${this.apiUrl}/workout_routines/${userId}`;
    const token = localStorage.getItem('authToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get<any[]>(url, { headers });
  }
  



// In auth.service.ts, update the addWorkoutRoutine method:

addWorkoutRoutine(workoutData: WorkoutRoutine): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/workout-routines`, workoutData)
    .pipe(
      catchError(this.handleError)
    );
}

// In auth.service.ts
editWorkoutRoutine(workoutId: number, workoutData: Partial<WorkoutRoutine>): Observable<WorkoutRoutine> {
  return this.http.put<WorkoutRoutine>(
    // Change this line to match your endpoint
    `${this.apiUrl}/workout-routines/${workoutId}`, // Notice the hyphen instead of underscore
    workoutData,
    { headers: this.getAuthHeaders() }
  ).pipe(
    catchError(this.handleError)
  );
}


updateWorkoutCompletion(traineeId: number, workoutId: number, isCompleted: boolean): Observable<WorkoutRoutine> {
    const payload = {
      is_completed: isCompleted,
      completion_date: isCompleted ? new Date().toISOString() : null
    };

    return this.http.put<WorkoutRoutine>(
      `${this.apiUrl}/workout_routines/${workoutId}/completion`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  deleteWorkoutRoutine(workoutId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/workout-routines/${workoutId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }


  addDietEntry(traineeId: number, diet: DietEntry): Observable<DietEntry> {
    const payload = {
      ...diet,
      trainee_id: traineeId,
      created_at: new Date().toISOString()
    };

    return this.http.post<DietEntry>(
      `${this.apiUrl}/diet_entries`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }



 updateDietFollowed(traineeId: number, dietId: number, isFollowed: boolean): Observable<DietEntry> {
    const payload = {
      is_followed: isFollowed,
      followed_date: isFollowed ? new Date().toISOString() : null
    };

    return this.http.put<DietEntry>(
      `${this.apiUrl}/diet_entries/${dietId}/followed`,
      payload,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }



deleteDietEntry(traineeId: number, dietId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/diet_entries/${dietId}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getDietEntries(userId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/diet_entries/${userId}`, { headers });
  }



postSuggestion(suggestionPayload: { user_id: number; suggestion: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/suggestions`, suggestionPayload, {
    headers: this.getAuthHeaders()
  }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Error posting suggestion:', error);
      return throwError(() => new Error(error.error?.message || 'Failed to post suggestion'));
    })
  );
}
private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An error occurred';

  if (error.status === 401) {
    // Unauthorized access (token might be invalid or expired)
    errorMessage = 'Unauthorized access. Please login again.';
    this.logout(); // Clear invalid token and redirect to login
    location.href = '/login'; // Or route programmatically with a router
  } else if (error.status === 403) {
    errorMessage = 'Forbidden. You do not have permission.';
  } else if (error.error instanceof ErrorEvent) {
    // Client-side errors
    errorMessage = error.error.message;
  } else {
    // Server-side errors
    errorMessage =
      error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
  }

  console.error('API Error:', errorMessage, error);
  return throwError(() => new Error(errorMessage));
}

addDietRecommendation(userId: number, recommendation: string) {
  const token = localStorage.getItem('authToken');
  return this.http.post<any>(`${this.apiUrl}/diet-recommendations`, 
    { user_id: userId, recommendation },
    { headers: this.getAuthHeaders() }
  );
}

// Get Diet Recommendations for a Trainee
getDietRecommendations(userId: number) {
  const token = localStorage.getItem('authToken');
  return this.http.get<any>(`${this.apiUrl}/diet-recommendations/${userId}`, 
    { headers: this.getAuthHeaders() }
  );
}

// Delete Diet Recommendation
deleteDietRecommendation(recommendationId: number) {
  const token = localStorage.getItem('authToken');
  return this.http.delete<any>(`${this.apiUrl}/diet-recommendations/${recommendationId}`, 
    { headers: this.getAuthHeaders() }
  );
}

getTraineeGoals(userId: number) {
  const token = localStorage.getItem('authToken');
  return this.http.get<any>(`${this.apiUrl}/goals?user_id=${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}


}









