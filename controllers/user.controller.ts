import {json, Request, Response, Router} from "express";
import {model} from "mongoose";
import {User, UserRole} from "../models";
import {getUserSchema} from "../services/schema";

export class UserController {
    readonly path: string;
    private userModel = model<User>("User", getUserSchema());

    constructor() {
        this.path = "/users";
    }

    async getAll(req: Request, res: Response) {
        const users = await this.userModel.find({isActive: true}).select('-password');
        res.json(users);
    }

    async getById(req: Request, res: Response) {
        const userId = req.params.id;
        const user = await this.userModel.findById(userId).select('-password');
        
        if(!user) {
            res.status(404).json({error: "User not found"});
            return;
        }
        
        res.json(user);
    }

    async create(req: Request, res: Response) {
        const userData = req.body;
        
        if(!userData.email || !userData.password || !userData.role) {
            res.status(400).json({error: "Missing required fields: email, password, role"});
            return;
        }

        const existingUser = await this.userModel.findOne({email: userData.email});
        if(existingUser) {
            res.status(409).json({error: "Email already exists"});
            return;
        }

        const newUser = new this.userModel(userData);
        await newUser.save();
        
        const userResponse = newUser.toObject();
        const {password, ...userWithoutPassword} = userResponse;
        
        res.status(201).json(userWithoutPassword);
    }

    async update(req: Request, res: Response) {
        const userId = req.params.id;
        const updates = req.body;
        
        delete updates.password;
        
        const user = await this.userModel.findByIdAndUpdate(
            userId, 
            updates, 
            {new: true}
        ).select('-password');
        
        if(!user) {
            res.status(404).json({error: "User not found"});
            return;
        }
        
        res.json(user);
    }

    async delete(req: Request, res: Response) {
        const userId = req.params.id;
        
        const user = await this.userModel.findByIdAndUpdate(
            userId,
            {isActive: false},
            {new: true}
        ).select('-password');
        
        if(!user) {
            res.status(404).json({error: "User not found"});
            return;
        }
        
        res.json({message: "User deactivated successfully"});
    }

    buildRouter(): Router {
        const router = Router();
        router.get("/", this.getAll.bind(this));
        router.get("/:id", this.getById.bind(this));
        router.post("/", json(), this.create.bind(this));
        router.patch("/:id", json(), this.update.bind(this));
        router.delete("/:id", this.delete.bind(this));
        return router;
    }
}
