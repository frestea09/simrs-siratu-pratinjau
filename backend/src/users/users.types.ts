export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  unit?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
  unit?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  unit?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
