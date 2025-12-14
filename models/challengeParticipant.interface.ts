import { Types } from "mongoose";

export enum ChallengeParticipantStatus {
    joined = "joined",
    completed = "completed",
    abandoned = "abandoned",
    failed = "failed",
}

export interface ChallengeParticipant {
    _id: string;
    challengeId: Types.ObjectId | string;
    userId: Types.ObjectId | string;
    status: ChallengeParticipantStatus;
    progress: number;
    progressValue: number;
    targetValue: number;
    joinedAt: Date;
    completedAt?: Date;
    scoreEarned: number;
    createdAt: Date;
    updatedAt: Date;
}
