import {json, Request, Response, Router} from "express";
import {model} from "mongoose";
import {Gym, GymStatus} from "../models";
import {getGymSchema} from "../services/schema";

export class GymController {
    readonly path: string;
    private gymModel = model<Gym>("Gym", getGymSchema());

    constructor() {
        this.path = "/gyms";
    }

    async getAll(req: Request, res: Response) {
        const gyms = await this.gymModel.find({});
        res.json(gyms);
    }

    async getAllApproved(req: Request, res: Response) {
        const gyms = await this.gymModel.find({status: GymStatus.approved});
        res.json(gyms);
    }

    async getAllPending(req: Request, res: Response) {
        const gyms = await this.gymModel.find({status: GymStatus.pending});
        res.json(gyms);
    }

    async getAllRejected(req: Request, res: Response) {
        const gyms = await this.gymModel.find({status: GymStatus.rejected});
        res.json(gyms);
    }

    async getById(req: Request, res: Response) {
        const gymId = req.params.id;
        const gym = await this.gymModel.findById(gymId);
        
        if(!gym) {
            res.status(404).json({error: "Gym not found"});
            return;
        }
        
        res.json(gym);
    }

    async create(req: Request, res: Response) {
        const gymData = req.body;
        
        if(!gymData.name || !gymData.address || !gymData.contact || !gymData.description || !gymData.capcaity || !gymData.equipments || !gymData.activities || !gymData.owenerId) {
            res.status(400).json({error: "Missing required fields: name, address, contact, description, capcaity, equipments, activities, owenerId"});
            return;
        }

        const newGym = new this.gymModel(gymData);
        await newGym.save();
        
        res.status(201).json(newGym);
    }

    async update(req: Request, res: Response) {
        const gymId = req.params.id;
        const updates = req.body;
        
        const gym = await this.gymModel.findByIdAndUpdate(
            gymId, 
            updates, 
            {new: true}
        );
        
        if(!gym) {
            res.status(404).json({error: "Gym not found"});
            return;
        }
        
        res.json(gym);
    }

    async delete(req: Request, res: Response) {
        const gymId = req.params.id;
        
        const gym = await this.gymModel.findByIdAndDelete(gymId);
        
        if(!gym) {
            res.status(404).json({error: "Gym not found"});
            return;
        }
        
        res.json({message: "Gym deleted successfully"});
    }

    async updateStatus(req: Request, res: Response) {
        const gymId = req.params.id;
        const {status} = req.body;

        if(!Object.values(GymStatus).includes(status)) {
            res.status(400).json({error: "Invalid status. Must be one of: " + Object.values(GymStatus).join(", ")});
            return;
        }

        const gym = await this.gymModel.findByIdAndUpdate(
            gymId,
            {status},
            {new: true}
        );

        if(!gym) {
            res.status(404).json({error: "Gym not found"});
            return;
        }

        res.json(gym);
    }

    buildRouter(): Router {
        const router = Router();
        router.get("/", this.getAll.bind(this));
        router.get("/approved", this.getAllApproved.bind(this));
        router.get("/pending", this.getAllPending.bind(this));
        router.get("/rejected", this.getAllRejected.bind(this));
        router.get("/:id", this.getById.bind(this));
        router.post("/", json(), this.create.bind(this));
        router.patch("/:id", json(), this.update.bind(this));
        router.patch("/:id/status", json(), this.updateStatus.bind(this));
        router.delete("/:id", this.delete.bind(this));
        return router;
    }
}
