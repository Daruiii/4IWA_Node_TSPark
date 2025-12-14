import { Schema } from "mongoose";
import { Challenge, ChallengeType, ChallengeDifficulty, ChallengeStatus } from "../../models";

export function getChallengeSchema(): Schema<Challenge> {
    return new Schema<Challenge>(
        {
            name: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                enum: Object.values(ChallengeType),
                required: true,
            },
            difficulty: {
                type: String,
                enum: Object.values(ChallengeDifficulty),
                required: true,
            },
            duration: {
                type: Number,
                required: true,
            },
            objective: {
                type: String,
                required: true,
            },
            gymId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Gym",
            },
            createdBy: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "User",
            },
            rewards: {
                scorePoints: {
                    type: Number,
                    required: true,
                },
                description: {
                    type: String,
                    required: true,
                },
            },
            status: {
                type: String,
                enum: Object.values(ChallengeStatus),
                default: ChallengeStatus.draft,
            },
            startDate: {
                type: Date,
                required: true,
            },
            endDate: {
                type: Date,
                required: true,
            },
        },
        {
            versionKey: false,
            collection: "Challenges",
            timestamps: true,
        }
    );
}
