import { Response, Request, NextFunction } from "express";
import HttpStatusCode from "../utils/HttpStatusCode";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";

// Interface for JWT payload
declare module "express-serve-static-core" {
  interface Request {
    userId: string;
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get the token from the cookies
  const token = req.cookies?.token;

  if (!token) {
    return res.status(HttpStatusCode.Unauthorized).json({
      message: "Please Login before...!",
      success: false,
      error: true,
    });
  }

  try {
    // Verify token using JWT secret key
    const secretKey = process.env.JWT_SECRET_KEY as string;

    if (!secretKey) {
      throw new Error(
        "JWT_SECRET_KEY is not defined in environment variables."
      );
    }

    jwt.verify(
      token,
      secretKey,
      (
        err: JsonWebTokenError | null,
        decoded: JwtPayload | string | undefined
      ) => {
        if (err) {
          console.error("JWT verification error:", err);
          return res.status(403).json({ message: "Forbidden: Invalid token" });
        }

        // Type narrowing: Check if decoded is an object (JwtPayload) and has _id
        if (
          typeof decoded !== "string" &&
          decoded &&
          typeof decoded._id === "string"
        ) {
          req.userId = decoded._id; // Safely access _id if it's a JwtPayload
        } else {
          return res
            .status(403)
            .json({ message: "Forbidden: Invalid token payload" });
        }

        // Proceed to the next middleware
        next();
      }
    );
  } catch (error) {
    console.error("Error during token verification:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
