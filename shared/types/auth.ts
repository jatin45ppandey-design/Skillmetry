export type AuthUser = {
  id: string;
  email: string | null;
};

export type ServerAuthState = {
  configured: boolean;
  user: AuthUser | null;
  error: "unavailable" | null;
};
