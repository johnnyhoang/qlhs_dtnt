export interface User {
    username: string;
    role: 'admin' | 'viewer';
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}
