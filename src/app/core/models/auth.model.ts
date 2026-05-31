export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  trackingId: string;
  token: string;
  type: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  roles: string;
  rolesList: string[];
  country: string;
  active: boolean;
}
