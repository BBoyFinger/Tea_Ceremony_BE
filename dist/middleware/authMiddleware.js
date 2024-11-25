"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const HttpStatusCode_1 = __importDefault(require("../utils/HttpStatusCode"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    // Get the token from the cookies
    const token = req.cookies?.token;
    if (!token) {
        return res.status(HttpStatusCode_1.default.Unauthorized).json({
            message: "Please Login before...!",
            success: false,
            error: true,
        });
    }
    try {
        // Verify token using JWT secret key
        const secretKey = process.env.JWT_SECRET_KEY;
        if (!secretKey) {
            throw new Error("JWT_SECRET_KEY is not defined in environment variables.");
        }
        jsonwebtoken_1.default.verify(token, secretKey, (err, decoded) => {
            if (err) {
                console.error("JWT verification error:", err);
                return res.status(403).json({ message: "Forbidden: Invalid token" });
            }
            // Type narrowing: Check if decoded is an object (JwtPayload) and has _id
            if (typeof decoded !== "string" &&
                decoded &&
                typeof decoded._id === "string") {
                req.userId = decoded._id; // Safely access _id if it's a JwtPayload
                req.role = decoded.role;
            }
            else {
                return res
                    .status(403)
                    .json({ message: "Forbidden: Invalid token payload" });
            }
            // Proceed to the next middleware
            next();
        });
    }
    catch (error) {
        console.error("Error during token verification:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.authMiddleware = authMiddleware;
