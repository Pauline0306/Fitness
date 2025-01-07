export interface User {
    id?: number;
    name: string;
    email: string;
    role?: 'trainer' | 'trainee';
    password?: string;
    created_at?: Date;
  }