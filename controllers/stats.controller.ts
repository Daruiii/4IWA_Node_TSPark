import { Request, Response, Router } from "express";
import {
    Badge,
    Challenge,
    ChallengeParticipant,
    ChallengeParticipantStatus,
    User,
    UserBadge,
} from "../models";
import {
    getBadgeSchema,
    getChallengeParticipantSchema,
    getChallengeSchema,
    getUserBadgeSchema,
    getUserSchema,
} from "../services/schema";
import { getOrCreateModel } from "../services/utils";
import { authMiddleware, AuthRequest } from "../middlewares";

export interface UserStats {
    userId: string;
    email: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    totalScore: number;
    totalBadges: number;
    challengesJoined: number;
    challengesCompleted: number;
    challengesFailed: number;
    challengesAbandoned: number;
    completionRate: number;
    recentBadges: any[];
    rank?: number;
}

export class StatsController {
    readonly path: string;
    private userModel = getOrCreateModel<User>("User", getUserSchema());
    private userBadgeModel = getOrCreateModel<UserBadge>("UserBadge", getUserBadgeSchema());
    private badgeModel = getOrCreateModel<Badge>("Badge", getBadgeSchema());
    private challengeParticipantModel = getOrCreateModel<ChallengeParticipant>(
        "ChallengeParticipant",
        getChallengeParticipantSchema()
    );
    private challengeModel = getOrCreateModel<Challenge>("Challenge", getChallengeSchema());

    constructor() {
        this.path = "/stats";
    }

    async getMyStats(req: AuthRequest, res: Response) {
        const userId = req.userId!;
        const stats = await this.getUserStats(userId);

        if (!stats) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(stats);
    }

    async getUserStatsById(req: Request, res: Response) {
        const userId = req.params.userId;

        if (!userId) {
            res.status(400).json({ error: "User ID is required" });
            return;
        }

        const stats = await this.getUserStats(userId);

        if (!stats) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(stats);
    }

    private async getUserStats(userId: string): Promise<UserStats | null> {
        const user = await this.userModel.findById(userId).select("-password");
        if (!user) return null;

        const totalBadges = await this.userBadgeModel.countDocuments({ userId });

        const recentBadges = await this.userBadgeModel
            .find({ userId })
            .populate("badgeId")
            .sort({ earnedAt: -1 })
            .limit(5);

        const challengeStats = await this.challengeParticipantModel.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        let challengesJoined = 0;
        let challengesCompleted = 0;
        let challengesFailed = 0;
        let challengesAbandoned = 0;

        challengeStats.forEach((stat) => {
            challengesJoined += stat.count;
            if (stat._id === ChallengeParticipantStatus.completed) {
                challengesCompleted = stat.count;
            } else if (stat._id === ChallengeParticipantStatus.failed) {
                challengesFailed = stat.count;
            } else if (stat._id === ChallengeParticipantStatus.abandoned) {
                challengesAbandoned = stat.count;
            }
        });

        const completionRate =
            challengesJoined > 0 ? Math.round((challengesCompleted / challengesJoined) * 100) : 0;

        const rank = await this.userModel.countDocuments({
            score: { $gt: user.score || 0 },
            isActive: true,
        });

        return {
            userId: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            totalScore: user.score || 0,
            totalBadges,
            challengesJoined,
            challengesCompleted,
            challengesFailed,
            challengesAbandoned,
            completionRate,
            recentBadges,
            rank: rank + 1,
        };
    }

    async getScoreLeaderboard(req: Request, res: Response) {
        const requestedLimit = parseInt(req.query.limit as string) || 10;
        const limit = Math.min(Math.max(1, requestedLimit), 100);

        const leaderboard = await this.userModel
            .find({ isActive: true })
            .select("firstName lastName score")
            .sort({ score: -1 })
            .limit(limit);

        const result = leaderboard.map((user, index) => ({
            rank: index + 1,
            odUserId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            score: user.score || 0,
        }));

        res.json(result);
    }

    async getGlobalStats(req: Request, res: Response) {
        const [totalUsers, totalBadges, totalChallenges, challengeParticipations] =
            await Promise.all([
                this.userModel.countDocuments({ isActive: true }),
                this.badgeModel.countDocuments({}),
                this.challengeModel.countDocuments({}),
                this.challengeParticipantModel.aggregate([
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ]),
            ]);

        const totalBadgesAwarded = await this.userBadgeModel.countDocuments({});

        let totalParticipations = 0;
        let totalCompleted = 0;

        challengeParticipations.forEach((stat) => {
            totalParticipations += stat.count;
            if (stat._id === ChallengeParticipantStatus.completed) {
                totalCompleted = stat.count;
            }
        });

        const globalCompletionRate =
            totalParticipations > 0
                ? Math.round((totalCompleted / totalParticipations) * 100)
                : 0;

        res.json({
            totalUsers,
            totalBadges,
            totalBadgesAwarded,
            totalChallenges,
            totalParticipations,
            totalCompleted,
            globalCompletionRate,
        });
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/leaderboard", this.getScoreLeaderboard.bind(this));
        router.get("/global", this.getGlobalStats.bind(this));
        router.get("/user/:userId", this.getUserStatsById.bind(this));

        router.get("/me", authMiddleware, this.getMyStats.bind(this));

        return router;
    }
}
