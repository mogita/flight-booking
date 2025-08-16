export interface LoginRequest {
	username: string
	password: string
}

export interface LoginResponse {
		token: string
		expires_in: string
		user: {
			username: string
		}
	}

export interface AuthUser {
	username: string
	token: string
}
