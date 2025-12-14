import { Types } from "mongoose";

export enum ChallengeType {
    cardio = "cardio",
    strength = "strength",
    flexibility = "flexibility",
    endurance = "endurance",
}

export enum ChallengeDifficulty {
    easy = "easy",
    medium = "medium",
    hard = "hard",
}

export enum ChallengeStatus {
    draft = "draft",
    active = "active",
    paused = "paused",
    completed = "completed",
    cancelled = "cancelled",
}

export interface ChallengeRewards {
    scorePoints: number;
    description: string;
}

export interface Challenge {
    _id: string;
    name: string;
    description: string;
    type: ChallengeType;
    difficulty: ChallengeDifficulty;
    duration: number;
    objective: string;
    gymId: Types.ObjectId | string;
    createdBy: Types.ObjectId | string;
    rewards: ChallengeRewards;
    status: ChallengeStatus;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
