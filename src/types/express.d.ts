// src/types/express.d.ts
import { JwtPayload } from '../middleware/authMiddleware'; // Import the interface JwtPayload

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: string; 
    }
  }
}