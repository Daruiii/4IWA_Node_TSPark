import { json, Request, Response, Router } from "express";
import { Badge, User, UserBadge, UserRole } from "../models";
import { getBadgeSchema, getUserBadgeSchema, getUserSchema } from "../services/schema";
import { getOrCreateModel } from "../services/utils";
import { authMiddleware, AuthRequest, requireRole } from "../middlewares";

export class UserBadgeController {
    readonly path: string;
    private userBadgeModel = getOrCreateModel<UserBadge>("UserBadge", getUserBadgeSchema());
    private badgeModel = getOrCreateModel<Badge>("Badge", getBadgeSchema());
    private userModel = getOrCreateModel<User>("User", getUserSchema());

    constructor() {
        this.path = "/user-badges";
    }

    async getByUserId(req: Request, res: Response) {
        const userId = req.params.userId;

        const userBadges = await this.userBadgeModel
            .find({ userId })
            .populate("badgeId")
            .sort({ earnedAt: -1 });

        res.json(userBadges);
    }

    async getMyBadges(req: AuthRequest, res: Response) {
        const userId = req.userId;

        const userBadges = await this.userBadgeModel
            .find({ userId })
            .populate("badgeId")
            .sort({ earnedAt: -1 });

        res.json(userBadges);
    }

    async checkUserBadge(req: Request, res: Response) {
        const { userId, badgeId } = req.params;

        const userBadge = await this.userBadgeModel
            .findOne({ userId, badgeId })
            .populate("badgeId");

        if (!userBadge) {
            res.json({ hasBadge: false });
            return;
        }

        res.json({ hasBadge: true, userBadge });
    }

    async awardBadge(req: AuthRequest, res: Response) {
        const { userId, badgeId } = req.body;

        if (!userId || !badgeId) {
            res.status(400).json({ error: "Missing required fields: userId, badgeId" });
            return;
        }

        const user = await this.userModel.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        if (!user.isActive) {
            res.status(400).json({ error: "Cannot award badge to inactive user" });
            return;
        }

        const badge = await this.badgeModel.findById(badgeId);
        if (!badge) {
            res.status(404).json({ error: "Badge not found" });
            return;
        }

        const existingUserBadge = await this.userBadgeModel.findOne({ userId, badgeId });
        if (existingUserBadge) {
            res.status(409).json({ error: "User already has this badge" });
            return;
        }

        const newUserBadge = new this.userBadgeModel({
            userId,
            badgeId,
            earnedAt: new Date(),
        });
        await newUserBadge.save();

        if (badge.scoreReward > 0) {
            await this.userModel.findByIdAndUpdate(userId, {
                $inc: { score: badge.scoreReward },
            });
        }

        const populatedBadge = await this.userBadgeModel
            .findById(newUserBadge._id)
            .populate("badgeId");

        res.status(201).json({
            message: "Badge awarded successfully",
            userBadge: populatedBadge,
            scoreReward: badge.scoreReward,
        });
    }

    async revokeBadge(req: Request, res: Response) {
        const { userId, badgeId } = req.params;

        const userBadge = await this.userBadgeModel.findOne({ userId, badgeId });

        if (!userBadge) {
            res.status(404).json({ error: "User does not have this badge" });
            return;
        }

        const badge = await this.badgeModel.findById(badgeId);
        if (badge && badge.scoreReward > 0) {
            const user = await this.userModel.findById(userId);
            if (user) {
                const newScore = Math.max(0, (user.score || 0) - badge.scoreReward);
                await this.userModel.findByIdAndUpdate(userId, { score: newScore });
            }
        }

        await this.userBadgeModel.findByIdAndDelete(userBadge._id);

        res.json({ message: "Badge revoked successfully" });
    }

    async getLeaderboard(req: Request, res: Response) {
        const requestedLimit = parseInt(req.query.limit as string) || 10;
        const limit = Math.min(Math.max(1, requestedLimit), 100);

        const leaderboard = await this.userBadgeModel.aggregate([
            {
                $group: {
                    _id: "$userId",
                    badgeCount: { $sum: 1 },
                },
            },
            { $sort: { badgeCount: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                },
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id: 0,
                    odUserId: "$_id",
                    badgeCount: 1,
                    firstName: "$user.firstName",
                    lastName: "$user.lastName",
                    score: "$user.score",
                },
            },
        ]);

        res.json(leaderboard);
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/leaderboard", this.getLeaderboard.bind(this));
        router.get("/user/:userId", this.getByUserId.bind(this));
        router.get("/check/:userId/:badgeId", this.checkUserBadge.bind(this));

        router.get("/me", authMiddleware, this.getMyBadges.bind(this));

        router.post(
            "/award",
            authMiddleware,
            requireRole(UserRole.admin),
            json(),
            this.awardBadge.bind(this)
        );
        router.delete(
            "/revoke/:userId/:badgeId",
            authMiddleware,
            requireRole(UserRole.admin),
            this.revokeBadge.bind(this)
        );

        return router;
    }
}
