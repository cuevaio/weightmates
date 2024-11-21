export type User = {
  email: string;
  createdAt: string;
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
};
