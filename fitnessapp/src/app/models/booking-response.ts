export interface BookingResponse {
    id: number;              // The unique ID of the booking
    trainerId: number;       // ID of the trainer associated with the booking
    traineeId: number;       // ID of the trainee associated with the booking
    status: string;          // Booking status (e.g., "pending", "approved", "cancelled")
    createdAt: string;       // Timestamp of when the booking was created
    updatedAt: string;       // Timestamp of when the booking was last updated
  }
  