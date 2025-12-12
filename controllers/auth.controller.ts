import { json, Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models";
import { getUserSchema } from "../services/schema";
import { getOrCreateModel } from "../services/utils";

export class AuthController {
    readonly path: string;
    private userModel = getOrCreateModel<User>("User", getUserSchema());

    constructor() {
        this.path = "/auth";
    }

    async register(req: Request, res: Response) {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Missing required fields: email, password" });
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
            role: "client",
            firstName,
            lastName,
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
            },
        });
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Missing required fields: email, password" });
            return;
        }

        const user = await this.userModel.findOne({ email, isActive: true });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET!, {
            expiresIn: "7d",
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    }

    buildRouter(): Router {
        const router = Router();
        router.post("/register", json(), this.register.bind(this));
        router.post("/login", json(), this.login.bind(this));
        return router;
    }
}
