import { Page } from './page.model'; // Assuming page.model exists

export interface UserResponse {
  trackingId: string;
  lastName: string;
  firstName: string;
  phoneNumber?: string; // Optional as in backend
  email: string;
  role: string;
  registrationDate?: string; // LocalDateTime from backend -> string
  kycStatus?: string;
  isActive: boolean;
}

export interface AdminBanqueRequest {
    lastName: string;
    firstName: string;
    phoneNumber: string;
    email: string;
    password?: string; // Optional if existing user update, required for new registration
    role: string;
    bankTrackingId: string;
}
