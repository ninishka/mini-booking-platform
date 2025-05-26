export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface BookableObject {
  id: string;
  name: string;
  address: string;
  capacity: number;
  image_url: string;
  created_by: string;
  created_at: string;
  price?: number;
}

export interface Booking {
  id: string;
  object_id: string;
  user_id: string;
  booking_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
} 