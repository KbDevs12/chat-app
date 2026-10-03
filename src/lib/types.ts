export type User = {
  id: string;
  email: string;
  created_at: string | null;
};

export type RegisterResponse = User;

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: User;
};
