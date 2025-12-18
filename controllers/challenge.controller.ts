import { json, Request, Response, Router } from "express";
import { Challenge, ChallengeStatus } from "../models";
import { getChallengeSchema } from "../services/schema";
import { getOrCreateModel } from "../services/utils";
import { authMiddleware, requireRole } from "../middlewares";
import { UserRole } from "../models";

export class ChallengeController {
    readonly path: string;
    private challengeModel = getOrCreateModel<Challenge>("Challenge", getChallengeSchema());

    constructor() {
        this.path = "/challenges";
    }

    async getAll(req: Request, res: Response) {
        const { difficulty, type, duration } = req.query;

        const filter: {
            status: ChallengeStatus;
            difficulty?: string;
            type?: string;
            duration?: number;
        } = {
            status: ChallengeStatus.active,
        };

        if (difficulty) {
            filter.difficulty = difficulty as string;
        }

        if (type) {
            filter.type = type as string;
        }

        if (duration) {
            filter.duration = Number(duration);
        }

        const challenges = await this.challengeModel.find(filter).populate(["gymId", "createdBy"]);
        res.json(challenges);
    }

    async getAllByStatus(req: Request, res: Response) {
        const status = req.params.status;

        if (!Object.values(ChallengeStatus).includes(status as ChallengeStatus)) {
            res.status(400).json({
                error:
                    "Invalid status. Must be one of: " + Object.values(ChallengeStatus).join(", "),
            });
            return;
        }

        const challenges = await this.challengeModel
            .find({ status })
            .populate(["gymId", "createdBy"]);
        res.json(challenges);
    }

    async getByGymId(req: Request, res: Response) {
        const gymId = req.params.gymId;
        const challenges = await this.challengeModel
            .find({ gymId, status: ChallengeStatus.active })
            .populate(["gymId", "createdBy"]);
        res.json(challenges);
    }

    async getById(req: Request, res: Response) {
        const challengeId = req.params.id;
        const challenge = await this.challengeModel
            .findById(challengeId)
            .populate(["gymId", "createdBy"]);

        if (!challenge) {
            res.status(404).json({ error: "Challenge not found" });
            return;
        }

        res.json(challenge);
    }

    async create(req: Request, res: Response) {
        const {
            name,
            description,
            type,
            difficulty,
            duration,
            objective,
            gymId,
            rewards,
            startDate,
            endDate,
        } = req.body;

        if (
            !name ||
            !description ||
            !type ||
            !difficulty ||
            !duration ||
            !objective ||
            !gymId ||
            !rewards ||
            !startDate ||
            !endDate
        ) {
            res.status(400).json({
                error: "Missing required fields: name, description, type, difficulty, duration, objective, gymId, rewards, startDate, endDate",
            });
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            res.status(400).json({
                error: "End date must be after start date",
            });
            return;
        }

        const newChallenge = new this.challengeModel({
            name,
            description,
            type,
            difficulty,
            duration,
            objective,
            gymId,
            createdBy: (req as Request & { userId: string }).userId,
            rewards,
            status: ChallengeStatus.draft,
            startDate,
            endDate,
        });

        await newChallenge.save();
        const populatedChallenge = await this.challengeModel
            .findById(newChallenge._id)
            .populate(["gymId", "createdBy"]);

        res.status(201).json(populatedChallenge);
    }

    async update(req: Request, res: Response) {
        const challengeId = req.params.id;
        const updates = req.body;

        delete updates.createdBy;

        const challenge = await this.challengeModel
            .findByIdAndUpdate(challengeId, updates, { new: true })
            .populate(["gymId", "createdBy"]);

        if (!challenge) {
            res.status(404).json({ error: "Challenge not found" });
            return;
        }

        res.json(challenge);
    }

    async updateStatus(req: Request, res: Response) {
        const challengeId = req.params.id;
        const { status } = req.body;

        if (!Object.values(ChallengeStatus).includes(status)) {
            res.status(400).json({
                error:
                    "Invalid status. Must be one of: " + Object.values(ChallengeStatus).join(", "),
            });
            return;
        }

        const challenge = await this.challengeModel
            .findByIdAndUpdate(challengeId, { status }, { new: true })
            .populate(["gymId", "createdBy"]);

        if (!challenge) {
            res.status(404).json({ error: "Challenge not found" });
            return;
        }

        res.json(challenge);
    }

    async delete(req: Request, res: Response) {
        const challengeId = req.params.id;

        const challenge = await this.challengeModel.findByIdAndDelete(challengeId);

        if (!challenge) {
            res.status(404).json({ error: "Challenge not found" });
            return;
        }

        res.json({ message: "Challenge deleted successfully" });
    }

    buildRouter(): Router {
        const router = Router();
        router.get("/", this.getAll.bind(this));
        router.get("/status/:status", this.getAllByStatus.bind(this));
        router.get("/gym/:gymId", this.getByGymId.bind(this));
        router.get("/:id", this.getById.bind(this));
        router.post(
            "/",
            authMiddleware,
            requireRole(UserRole.gym_owner),
            json(),
            this.create.bind(this)
        );
        router.patch(
            "/:id/status",
            authMiddleware,
            requireRole(UserRole.gym_owner),
            json(),
            this.updateStatus.bind(this)
        );
        router.patch(
            "/:id",
            authMiddleware,
            requireRole(UserRole.gym_owner),
            json(),
            this.update.bind(this)
        );
        router.delete(
            "/:id",
            authMiddleware,
            requireRole(UserRole.gym_owner),
            this.delete.bind(this)
        );
        return router;
    }
}
