import { json, Request, Response, Router } from "express";
import { model } from "mongoose";
import { Exercise } from "../models";
import { getExerciseSchema } from "../services/schema";

export class ExerciseController {
    readonly path: string;
    private exerciseModel = model<Exercise>("Exercise", getExerciseSchema());

    constructor() {
        this.path = "/exercises";
    }

    async getAll(req: Request, res: Response) {
        const exercises = await this.exerciseModel.find({});
        res.json(exercises);
    }

    async getById(req: Request, res: Response) {
        const exerciseId = req.params.id;
        const exercise = await this.exerciseModel.findById(exerciseId);

        if (!exercise) {
            res.status(404).json({ error: "Exercise not found" });
            return;
        }

        res.json(exercise);
    }

    async getByDifficulty(req: Request, res: Response) {
        const difficulty = req.params.difficulty;
        const exercises = await this.exerciseModel.find({ difficulty });
        res.json(exercises);
    }

    async create(req: Request, res: Response) {
        const exerciseData = req.body;

        if (!exerciseData.name || !exerciseData.targetedMuscles || !exerciseData.difficulty) {
            res.status(400).json({
                error: "Missing required fields: name, targetedMuscles, difficulty",
            });
            return;
        }

        const newExercise = new this.exerciseModel(exerciseData);
        await newExercise.save();

        res.status(201).json(newExercise);
    }

    async update(req: Request, res: Response) {
        const exerciseId = req.params.id;
        const updates = req.body;

        const exercise = await this.exerciseModel.findByIdAndUpdate(exerciseId, updates, {
            new: true,
        });

        if (!exercise) {
            res.status(404).json({ error: "Exercise not found" });
            return;
        }

        res.json(exercise);
    }

    async delete(req: Request, res: Response) {
        const exerciseId = req.params.id;

        const exercise = await this.exerciseModel.findByIdAndDelete(exerciseId);

        if (!exercise) {
            res.status(404).json({ error: "Exercise not found" });
            return;
        }

        res.json({ message: "Exercise deleted successfully" });
    }

    buildRouter(): Router {
        const router = Router();
        router.get("/", this.getAll.bind(this));
        router.get("/difficulty/:difficulty", this.getByDifficulty.bind(this));
        router.get("/:id", this.getById.bind(this));
        router.post("/", json(), this.create.bind(this));
        router.patch("/:id", json(), this.update.bind(this));
        router.delete("/:id", this.delete.bind(this));
        return router;
    }
}
