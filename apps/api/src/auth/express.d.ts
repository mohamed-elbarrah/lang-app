import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      name: string | null;
      email: string;
      emailVerified: boolean;
      image: string | null;
      role: string;
      createdAt: Date;
      updatedAt: Date;
    };
    session?: {
      id: string;
      expiresAt: Date;
      token: string;
      userId: string;
      ipAddress: string | null;
      userAgent: string | null;
    };
  }
}
