import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { WorkoutRoutine } from '../models/booking.interface';

interface Booking {
  id: number;
  user_id: number;
  trainee_name?: string;
  traineeName?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  status: string;
  fitness_goal?: string;
  fitnessGoal?: string;
  current_weight?: number;
  target_weight?: number;
  
}

interface WorkoutForm {
  body_part: string;
  exercises: string;
}


interface Trainee extends Booking {
  showWorkout: boolean;
  showDiet: boolean;
  workouts: any[] | null;
  dietEntries: any[] | null;
  weightLogs?: any[];
  name?: string;
  workoutForm: WorkoutForm;
  dietRecommendations: DietRecommendation[];
}



interface Trainee {
  id: number;
  user_id: number;
  trainee_name: string;
  start_date: string;
  end_date: string;
  status: string;
  fitness_goal: string;
  current_weight?: number;
  target_weight?: number;
  showWorkout: boolean;
  showDiet: boolean;
  workouts: any[] | null;
  dietEntries: any[] | null;
  weightLogs?: any[];
  workoutForm: WorkoutForm;
  dietRecommendation: string;
  newDietRecommendation: string; // Separate recommendation for each trainee
  goals?: any[];
}
interface EditableWorkout {
  id: number;
  body_part: string;
  exercises: string;
  isEditing?: boolean;
}

interface DietRecommendation {
  id: number;
  user_id: number;
  recommendation: string;
  created_at: string;
}


@Component({
  selector: 'app-trainersidebook',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './trainersidebook.component.html',
  styleUrl: './trainersidebook.component.css',
})
export class TrainersidebookComponent implements OnInit, OnDestroy {
  
  newDietRecommendation: string = '';
  goalsByTrainee: { [key: number]: any[] } = {}; // Initialize to an empty object
  bookings: any[] = [];
  trainees: any[] = [];
  dietRecommendations: { [key: number]: DietRecommendation[] } = {}; // Keyed by user ID
  private refreshSubscription?: Subscription;
  private readonly REFRESH_INTERVAL = 5000; // 5 seconds
  goals: any = {}; // Store the goals of each trainee
  

  editingWorkout: EditableWorkout = {
    id: 0,
    body_part: '',
    exercises: ''
  };
  
  

  newWorkout = {
    body_part: '',
    exercises: ''
  };
  
  constructor(private authService: AuthService, private router: Router) {}


  ngOnInit() {
    // Initial load
    this.loadBookings();
    this.loadTraineeGoals();
  
    // Set up automatic refresh for bookings and trainees
    this.refreshSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
      this.refreshData(); // Refresh bookings and other data
      this.loadTraineeGoals(); // Refresh trainee goals every interval
    });
  }
  
  ngOnDestroy() {
    // Unsubscribe from the refresh interval to prevent memory leaks
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  

  loadTraineeGoals(): void {
    // Assuming `trainees` is already populated
    this.trainees.forEach(trainee => {
      this.authService.getTraineeGoals(trainee.user_id).subscribe(
        (response) => {
          this.goals[trainee.user_id] = response.data; // Store goals by user_id
        },
        (error) => {
          console.error('Error fetching goals', error);
        }
      );
    });
  }
  
  startEditing(workout: any): void {
    this.editingWorkout = {
      id: workout.id,
      body_part: workout.body_part,
      exercises: workout.exercises,
      isEditing: true
    };
  }


cancelEditing(): void {
  this.editingWorkout = {
    id: 0,
    body_part: '',
    exercises: ''
  };
}



  private refreshData() {
    this.authService.getTrainerBookings().subscribe({
      next: (data: any[]) => {
        // Process pending bookings
        this.bookings = data.filter(booking => booking.status === 'pending');
  
        // Get unique trainees using user_id as the unique identifier
        const uniqueTrainees = Array.from(
          new Map(
            data
              .filter(booking => booking.status === 'accepted')
              .map(booking => [booking.user_id, booking])
          ).values()
        ).map(trainee => {
          const existingTrainee = this.trainees.find(t => t.user_id === trainee.user_id);
          return {
            ...trainee,
            showWorkout: existingTrainee?.showWorkout || false,
            showDiet: existingTrainee?.showDiet || false,
            workouts: existingTrainee?.workouts || [],
            dietEntries: existingTrainee?.dietEntries || [],
            workoutForm: existingTrainee?.workoutForm || { body_part: '', exercises: '' },
            dietRecommendation: existingTrainee?.dietRecommendation || '' ,
            newDietRecommendation: '',
            goals:''
            
          };
        });
  
        this.trainees = uniqueTrainees;
  
        // Fetch workout data for all unique trainees
        this.trainees.forEach(trainee => {
          this.refreshWorkoutData(trainee.user_id);
        });
      },
      error: (err) => {
        console.error('Error refreshing data:', err);
        this.showError('Failed to refresh data');
      }
    });
  }



  


  updateWorkoutCompletion(traineeId: number, workoutId: number, isCompleted: boolean) {
    this.authService.updateWorkoutCompletion(traineeId, workoutId, isCompleted).subscribe({
      next: (response) => {
        this.refreshWorkoutData(traineeId);
      },
      error: (err) => {
        console.error('Error updating workout completion:', err);
        Swal.fire('Error', 'Failed to update workout status', 'error');
      }
    });
  }


  private refreshWorkoutData(traineeId: number): void {
    const token = localStorage.getItem('authToken'); // Ensure token is passed
    if (!token) {
      console.error('No token found. Please log in.');
      this.showError('Unauthorized: Please log in.');
      return;
    }
  
    this.authService.getWorkoutRoutines(traineeId).subscribe({
      next: (data) => {
        const traineeIndex = this.trainees.findIndex(t => t.user_id === traineeId);
        if (traineeIndex !== -1) {
          this.trainees[traineeIndex].workouts = data || [];
        }
      },
      error: (err) => {
        console.error('Error fetching workout routines:', err);
        if (err.status === 403) {
          this.showError('You do not have permission to view this trainee\'s workouts.');
        } else {
          this.showError('Failed to fetch workout routines');
        }
      },
    });
  }
  
  
  





  addWorkoutRoutine(trainee: Trainee): void {
    if (!trainee.workoutForm.body_part) {
      Swal.fire('Warning', 'Body part is required.', 'warning');
      return;
    }
  
    const workoutData: WorkoutRoutine = {
      user_id: trainee.user_id,
      body_part: trainee.workoutForm.body_part,
      exercises: trainee.workoutForm.exercises || '',
      is_completed: false,
      completion_date: null
    };
    
    this.authService.addWorkoutRoutine(workoutData).subscribe({
      next: () => {
        Swal.fire('Success', 'Workout routine added successfully.', 'success');
        trainee.workoutForm = { body_part: '', exercises: '' };
        this.refreshWorkoutData(trainee.user_id);
      },
      error: (err) => {
        console.error('Error adding workout:', err);
        Swal.fire('Error', 'Failed to add workout routine.', 'error');
      },
    });
  }

  
  
  
  

  private showWarning(message: string): void {
    Swal.fire('Warning', message, 'warning');
  }
  
  private showSuccess(message: string): void {
    Swal.fire('Success', message, 'success');
  }
  
  private showError(message: string): void {
    Swal.fire('Error', message, 'error');
  }

  updateBookingStatus(bookingId: number, status: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${status} this booking?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'accepted' ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${status}!`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.updateBookingStatus(bookingId, status).subscribe({
          next: () => {
            Swal.fire('Success!', `Booking has been ${status}.`, 'success');
            // Refresh data immediately after status update
            this.refreshData();
          },
          error: (err) => {
            console.error('Failed to update booking status:', err);
            Swal.fire(
              'Error',
              'Failed to update booking status. Please try again.',
              'error'
            );
          },
        });
      }
    });
  }

  loadBookings(): void {
    this.authService.getTrainerBookings().subscribe({
      next: (data: any[]) => {
        if (!Array.isArray(data)) {
          console.error('Unexpected response format for bookings:', data);
          this.showError('Unexpected response format for bookings');
          return;
        }
  
        // Filter pending bookings and remove duplicates
        this.bookings = Array.from(
          new Map(
            data.filter((booking) => booking.status === 'pending').map((b) => [b.id, b])
          ).values()
        );
  
        // Filter accepted bookings and transform into trainee objects
        const acceptedTrainees = data.filter((booking) => booking.status === 'accepted');
        this.trainees = Array.from(
          new Map(
            acceptedTrainees.map((trainee) => [trainee.user_id, trainee])
          ).values()
        ).map((trainee) => ({
          ...trainee,
          showWorkout: false,
          showDiet: false,
          workouts: [],
          dietEntries: [],
          workoutForm: { body_part: '', exercises: '' },
          dietRecommendation: [],
        }));
  
        // Fetch additional data for each trainee
        this.trainees.forEach((trainee) => {
          if (trainee && trainee.user_id) {
            this.refreshWorkoutData(trainee.user_id);
            this.refreshDietRecommendations(trainee.user_id);
           
            this.getTraineeGoals(trainee); // Fetch goals
          } else {
            console.warn('Invalid trainee object or missing user_id:', trainee);
          }
        });
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.showError('Failed to fetch bookings');
      },
    });
  }
  
  
  getTraineeGoals(trainee: any) {
    const userId = trainee.user_id;  // Capture userId locally
    this.authService.getTraineeGoals(userId).subscribe({
      next: (data) => {
        this.goalsByTrainee[userId] = data?.data || [];
        console.log(`Goals for trainee ${userId}:`, this.goalsByTrainee[userId]);
      },
      error: (err) => {
        console.error(`Error fetching goals for trainee ${userId}:`, err);
        this.showError(`Failed to fetch goals for trainee ${userId}`);
      }
    });
  }
  
  
  
  



saveWorkoutEdit(traineeId: number): void {
  if (!this.editingWorkout.body_part || this.editingWorkout.exercises === undefined) {
    Swal.fire('Warning', 'Both body part and exercises are required.', 'warning');
    return;
  }

  const workoutData = {
    body_part: this.editingWorkout.body_part,
    exercises: typeof this.editingWorkout.exercises === 'string'
      ? this.editingWorkout.exercises
      : JSON.stringify(this.editingWorkout.exercises),
  };

  this.authService.editWorkoutRoutine(this.editingWorkout.id, workoutData).subscribe({
    next: () => {
      Swal.fire('Success', 'Workout updated successfully.', 'success');
      this.cancelEditing();
      this.refreshWorkoutData(traineeId);
    },
    error: (err) => {
      console.error('Error updating workout:', err);

      if (err.error && err.error.details) {
        Swal.fire('Error', err.error.details, 'error');
      } else {
        Swal.fire('Error', 'Failed to update workout.', 'error');
      }
    }
  });
}
deleteWorkout(workoutId: number, traineeId: number): void {
  console.log('Deleting workout with ID:', workoutId);

  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this workout routine?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.deleteWorkoutRoutine(workoutId).subscribe({
        next: () => {
          Swal.fire('Deleted!', 'The workout routine has been deleted.', 'success');
          this.refreshWorkoutData(traineeId); // Refresh data for the trainee
        },
        error: (err) => {
          console.error('Error deleting workout routine:', err); // Log error details
          Swal.fire('Error', 'Failed to delete workout routine.', 'error');
        },
      });
    }
  });
}
addDietRecommendation(trainee: Trainee): void {
  if (!trainee.newDietRecommendation) {
    Swal.fire('Warning', 'Diet recommendation cannot be empty.', 'warning');
    return;
  }

  this.authService.addDietRecommendation(
    trainee.user_id, 
    trainee.newDietRecommendation
  ).subscribe({
    next: (response) => {
      Swal.fire('Success', 'Diet recommendation added successfully.', 'success');
      trainee.newDietRecommendation = ''; // Clear the input
      this.refreshDietRecommendations(trainee.user_id);
    },
    error: (err) => {
      console.error('Error adding diet recommendation:', err);
      Swal.fire('Error', 'Failed to add diet recommendation.', 'error');
    }
  });
}

private refreshDietRecommendations(traineeId: number): void {
  this.authService.getDietRecommendations(traineeId).subscribe({
    next: (data) => {
      const traineeIndex = this.trainees.findIndex(t => t.user_id === traineeId);
      if (traineeIndex !== -1) {
        // Update the diet recommendations for the specific trainee
        this.dietRecommendations[traineeId] = data.data || [];
      }
    },
    error: (err) => {
      console.error('Error fetching diet recommendations:', err);
      this.showError('Failed to fetch diet recommendations');
    }
  });
}


deleteDietRecommendation(recommendationId: number, traineeId: number): void {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this diet recommendation?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.deleteDietRecommendation(recommendationId).subscribe({
        next: () => {
          Swal.fire('Deleted!', 'The diet recommendation has been deleted.', 'success');
          this.refreshDietRecommendations(traineeId);
        },
        error: (err) => {
          console.error('Error deleting diet recommendation:', err);
          Swal.fire('Error', 'Failed to delete diet recommendation.', 'error');
        }
      });
    }
  });




}}