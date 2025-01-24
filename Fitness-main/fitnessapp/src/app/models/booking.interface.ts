// src/app/interfaces/booking.interface.ts

export interface TrainerProfile {
  id: number;
  name: string;
  qualifications: string | string[];
  experience: string;
  availability: string;
  specialization: string;
  is_booked: boolean; 
}


export interface BookingRequest {
  traineeId: number | undefined;
  id?: number; // Optional ID for tracking
  trainerId: number;
  userId: number; // Add the userId field
  trainer_name?: string; // Add this to display trainer names in "My Bookings"
  health_history: string;
  medication_history: string;
  fitness_goal: string;
  preferred_schedule: string;
  experience_level: string;
  start_date?: string | null;
  end_date?: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed'; // Add status for booking status
}


export interface WorkoutRoutine {
  user_id: number;
  body_part: string;
  exercises: string;
  is_completed?: boolean;
  completion_date?: Date | null;
  created_at?: Date;
}


export interface DietEntry {
  id: number;
  meal: string;
  food_name: string;
  calories: number;
  created_at: Date;
  isFollowed: boolean;
}

export interface WeightLog {
  id: number;
  weight: number;
  date: Date;
  notes?: string;
}