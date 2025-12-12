import {json, Request, Response, Router} from "express";
import {model} from "mongoose";
import {GymExercise} from "../models";
import {getGymExerciseSchema} from "../services/schema";

export class GymExerciseController {
    readonly path: string;
    private gymExerciseModel = model<GymExercise>("GymExercise", getGymExerciseSchema());

    constructor() {
        this.path = "/gym-exercises";
    }

    async getAll(req: Request, res: Response) {
        const gymExercises = await this.gymExerciseModel.find({}).populate(["gymId", "exerciseId"]);
        res.json(gymExercises);
    }

    async getByGymId(req: Request, res: Response) {
        const gymId = req.params.gymId;
        const gymExercises = await this.gymExerciseModel.find({gymId}).populate("exerciseId");
        res.json(gymExercises);
    }

    async create(req: Request, res: Response) {
        const {gymId, exerciseId} = req.body;
        
        if(!gymId || !exerciseId) {
            res.status(400).json({error: "Missing required fields: gymId, exerciseId"});
            return;
        }

        const existingRelation = await this.gymExerciseModel.findOne({gymId, exerciseId});
        if(existingRelation) {
            res.status(409).json({error: "This exercise is already assigned to this gym"});
            return;
        }

        const newGymExercise = new this.gymExerciseModel({gymId, exerciseId});
        await newGymExercise.save();
        
        const populatedGymExercise = await this.gymExerciseModel.findById(newGymExercise._id).populate(["gymId", "exerciseId"]);
        
        res.status(201).json(populatedGymExercise);
    }

    async delete(req: Request, res: Response) {
        const gymExerciseId = req.params.id;
        
        const gymExercise = await this.gymExerciseModel.findByIdAndDelete(gymExerciseId);
        
        if(!gymExercise) {
            res.status(404).json({error: "GymExercise relation not found"});
            return;
        }
        
        res.json({message: "Exercise removed from gym successfully"});
    }

    async deleteByGymAndExercise(req: Request, res: Response) {
        const {gymId, exerciseId} = req.body;

        if(!gymId || !exerciseId) {
            res.status(400).json({error: "Missing required fields: gymId, exerciseId"});
            return;
        }

        const gymExercise = await this.gymExerciseModel.findOneAndDelete({gymId, exerciseId});
        
        if(!gymExercise) {
            res.status(404).json({error: "GymExercise relation not found"});
            return;
        }
        
        res.json({message: "Exercise removed from gym successfully"});
    }

    buildRouter(): Router {
        const router = Router();
        router.get("/", this.getAll.bind(this));
        router.get("/gym/:gymId", this.getByGymId.bind(this));
        router.post("/", json(), this.create.bind(this));
        router.delete("/:id", this.delete.bind(this));
        router.delete("/", json(), this.deleteByGymAndExercise.bind(this));
        return router;
    }
}
