import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models";

export interface AuthRequest extends Request {
    userId?: string;
    userRole?: UserRole;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid authorization header" });
        return;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            role: UserRole;
        };
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }
}

export function requireRole(...roles: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            res.status(403).json({ error: "Insufficient permissions" });
            return;
        }
        next();
    };
}

export function requireSelfOrAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    const targetUserId = req.params.id;

    if (req.userRole === UserRole.admin || req.userId === targetUserId) {
        next();
    } else {
        res.status(403).json({
            error: "You can only modify your own profile or you must be an admin",
        });
        return;
    }
}
