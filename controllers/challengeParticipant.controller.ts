import { json, Request, Response, Router } from "express";
import { model } from "mongoose";
import { ChallengeParticipant, ChallengeParticipantStatus, Challenge, User } from "../models";
import { getChallengeParticipantSchema, getChallengeSchema, getUserSchema } from "../services/schema";
import { getOrCreateModel } from "../services/utils";
import { authMiddleware } from "../middlewares";

export class ChallengeParticipantController {
    readonly path: string;
    private challengeParticipantModel = getOrCreateModel<ChallengeParticipant>(
        "ChallengeParticipant",
        getChallengeParticipantSchema()
    );
    private challengeModel = getOrCreateModel<Challenge>("Challenge", getChallengeSchema());
    private userModel = getOrCreateModel<User>("User", getUserSchema());

    constructor() {
        this.path = "/challenge-participants";
    }

    async getAll(req: Request, res: Response) {
        const participants = await this.challengeParticipantModel
            .find({})
            .populate(["challengeId", "userId"]);
        res.json(participants);
    }

    async getByChallengeId(req: Request, res: Response) {
        const challengeId = req.params.challengeId;
        const participants = await this.challengeParticipantModel
            .find({ challengeId })
            .populate(["challengeId", "userId"]);
        res.json(participants);
    }

    async getByUserId(req: Request, res: Response) {
        const userId = req.params.userId;
        const participants = await this.challengeParticipantModel
            .find({ userId })
            .populate(["challengeId", "userId"]);
        res.json(participants);
    }

    async getById(req: Request, res: Response) {
        const participantId = req.params.id;
        const participant = await this.challengeParticipantModel
            .findById(participantId)
            .populate(["challengeId", "userId"]);

        if (!participant) {
            res.status(404).json({ error: "Participant not found" });
            return;
        }

        res.json(participant);
    }

    async joinChallenge(req: Request, res: Response) {
        const { challengeId, targetValue } = req.body;
        const userId = (req as any).userId;

        if (!challengeId || !targetValue) {
            res.status(400).json({ error: "Missing required fields: challengeId, targetValue" });
            return;
        }

        const challenge = await this.challengeModel.findById(challengeId);
        if (!challenge) {
            res.status(404).json({ error: "Challenge not found" });
            return;
        }

        const existingParticipant = await this.challengeParticipantModel.findOne({
            challengeId,
            userId,
        });
        if (existingParticipant) {
            res.status(409).json({ error: "User is already participating in this challenge" });
            return;
        }

        const newParticipant = new this.challengeParticipantModel({
            challengeId,
            userId,
            targetValue,
            status: ChallengeParticipantStatus.joined,
            progress: 0,
            progressValue: 0,
            scoreEarned: 0,
        });

        await newParticipant.save();
        const populatedParticipant = await this.challengeParticipantModel
            .findById(newParticipant._id)
            .populate(["challengeId", "userId"]);

        res.status(201).json(populatedParticipant);
    }

    async updateProgress(req: Request, res: Response) {
        const participantId = req.params.id;
        const { progressValue } = req.body;

        if (progressValue === undefined) {
            res.status(400).json({ error: "Missing required field: progressValue" });
            return;
        }

        const participant = await this.challengeParticipantModel.findById(participantId);

        if (!participant) {
            res.status(404).json({ error: "Participant not found" });
            return;
        }

        const progress = Math.min(
            Math.round((progressValue / participant.targetValue) * 100),
            100
        );

        const updates: any = {
            progressValue,
            progress,
        };

        if (progress >= 100) {
            updates.status = ChallengeParticipantStatus.completed;
            updates.completedAt = new Date();

            const challenge = await this.challengeModel.findById(participant.challengeId);
            if (challenge) {
                updates.scoreEarned = challenge.rewards.scorePoints;
                
                await this.userModel.findByIdAndUpdate(
                    participant.userId,
                    { $inc: { score: challenge.rewards.scorePoints } },
                    { new: true }
                );
            }
        }

        const updatedParticipant = await this.challengeParticipantModel
            .findByIdAndUpdate(participantId, updates, { new: true })
            .populate(["challengeId", "userId"]);

        res.json(updatedParticipant);
    }

    async updateStatus(req: Request, res: Response) {
        const participantId = req.params.id;
        const { status } = req.body;

        if (!Object.values(ChallengeParticipantStatus).includes(status)) {
            res.status(400).json({
                error:
                    "Invalid status. Must be one of: " +
                    Object.values(ChallengeParticipantStatus).join(", "),
            });
            return;
        }

        const participant = await this.challengeParticipantModel.findById(participantId);

        if (!participant) {
            res.status(404).json({ error: "Participant not found" });
            return;
        }

        const updates: any = { status };

        if (status === ChallengeParticipantStatus.completed) {
            updates.completedAt = new Date();

            if (participant.status !== ChallengeParticipantStatus.completed) {
                const challenge = await this.challengeModel.findById(participant.challengeId);
                if (challenge && !participant.scoreEarned) {
                    updates.scoreEarned = challenge.rewards.scorePoints;
                    
                    await this.userModel.findByIdAndUpdate(
                        participant.userId,
                        { $inc: { score: challenge.rewards.scorePoints } },
                        { new: true }
                    );
                }
            }
        }

        const updatedParticipant = await this.challengeParticipantModel
            .findByIdAndUpdate(participantId, updates, { new: true })
            .populate(["challengeId", "userId"]);

        res.json(updatedParticipant);
    }

    async abandon(req: Request, res: Response) {
        const participantId = req.params.id;

        const participant = await this.challengeParticipantModel.findByIdAndUpdate(
            participantId,
            { status: ChallengeParticipantStatus.abandoned },
            { new: true }
        );

        if (!participant) {
            res.status(404).json({ error: "Participant not found" });
            return;
        }

        res.json({ message: "Challenge abandoned successfully", participant });
    }

    async delete(req: Request, res: Response) {
        const participantId = req.params.id;

        const participant = await this.challengeParticipantModel.findByIdAndDelete(participantId);

        if (!participant) {
            res.status(404).json({ error: "Participant not found" });
            return;
        }

        res.json({ message: "Participant removed successfully" });
    }

    buildRouter(): Router {
        const router = Router();
        router.get("/", this.getAll.bind(this));
        router.get("/challenge/:challengeId", this.getByChallengeId.bind(this));
        router.get("/user/:userId", authMiddleware, this.getByUserId.bind(this));
        router.get("/:id", this.getById.bind(this));
        router.post("/join", authMiddleware, json(), this.joinChallenge.bind(this));
        router.patch("/:id/progress", authMiddleware, json(), this.updateProgress.bind(this));
        router.patch("/:id/status", authMiddleware, json(), this.updateStatus.bind(this));
        router.patch("/:id/abandon", authMiddleware, this.abandon.bind(this));
        router.delete("/:id", authMiddleware, this.delete.bind(this));
        return router;
    }
}
