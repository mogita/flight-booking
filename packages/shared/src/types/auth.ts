export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expires_in: string
}

export interface AuthUser {
  username: string
  token: string
}
