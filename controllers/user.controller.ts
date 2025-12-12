import { json, Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import { User, UserRole } from "../models";
import { getUserSchema } from "../services/schema";
import { getOrCreateModel } from "../services/utils";
import { authMiddleware, requireRole, requireOwnerOrAdmin } from "../middlewares";

export class UserController {
    readonly path: string;
    private userModel = getOrCreateModel<User>("User", getUserSchema());

    constructor() {
        this.path = "/users";
    }

    async getAll(req: Request, res: Response) {
        const users = await this.userModel.find({ isActive: true }).select("-password");
        res.json(users);
    }

    async getById(req: Request, res: Response) {
        const userId = req.params.id;
        const user = await this.userModel.findById(userId).select("-password");

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user);
    }

    async create(req: Request, res: Response) {
        const { email, password, role, firstName, lastName } = req.body;

        if (!email || !password || !role) {
            res.status(400).json({ error: "Missing required fields: email, password, role" });
            return;
        }

        if (!Object.values(UserRole).includes(role)) {
            res.status(400).json({ error: "Invalid role. Must be: client, gym_owner, or admin" });
            return;
        }

        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            res.status(409).json({ error: "Email already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new this.userModel({
            email,
            password: hashedPassword,
            role,
            firstName,
            lastName,
        });
        await newUser.save();

        const userResponse = {
            _id: newUser._id,
            email: newUser.email,
            role: newUser.role,
            isActive: newUser.isActive,
            score: newUser.score,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        };

        res.status(201).json(userResponse);
    }

    async update(req: Request, res: Response) {
        const userId = req.params.id;
        const updates = req.body;

        delete updates.password;
        delete updates.role;
        delete updates.isActive;

        const user = await this.userModel
            .findByIdAndUpdate(userId, updates, { new: true })
            .select("-password");

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user);
    }

    async delete(req: Request, res: Response) {
        const userId = req.params.id;

        const user = await this.userModel
            .findByIdAndUpdate(userId, { isActive: false }, { new: true })
            .select("-password");

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json({ message: "User deactivated successfully" });
    }

    async activate(req: Request, res: Response) {
        const userId = req.params.id;

        const user = await this.userModel
            .findByIdAndUpdate(userId, { isActive: true }, { new: true })
            .select("-password");

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json({ message: "User activated successfully", user });
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/", authMiddleware, this.getAll.bind(this));
        router.get("/:id", authMiddleware, this.getById.bind(this));

        router.post(
            "/",
            authMiddleware,
            requireRole(UserRole.admin),
            json(),
            this.create.bind(this)
        );
        router.patch(
            "/:id/activate",
            authMiddleware,
            requireRole(UserRole.admin),
            this.activate.bind(this)
        );

        router.patch("/:id", authMiddleware, requireOwnerOrAdmin, json(), this.update.bind(this));
        router.delete("/:id", authMiddleware, requireOwnerOrAdmin, this.delete.bind(this));

        return router;
    }
}
