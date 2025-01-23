// src/app/interfaces/booking.interface.ts

export interface TrainerProfile {
  id: number;
  name: string;
  qualifications: string | string[];
  experience: string;
  availability: string;
}


export interface BookingRequest {
  traineeId: number | undefined;
  id?: number; // Optional ID for tracking
  trainerId: number;
  userId: number; // Add the userId field
  trainerName?: string; // Add this to display trainer names in "My Bookings"
  healthHistory: string;
  medicationHistory: string;
  fitnessGoal: string;
  preferredSchedule: string;
  experienceLevel: string;
  startDate?: string | null;
  endDate?: string | null;
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