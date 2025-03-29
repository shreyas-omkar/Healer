export interface AuthResponse {
  message: string;
}

export interface CheckAuthResponse {
  authenticated: boolean;
  email?: string;
} 