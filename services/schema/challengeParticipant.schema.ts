import { Schema } from "mongoose";
import {
    ChallengeParticipant,
    ChallengeParticipantStatus,
} from "../../models";

export function getChallengeParticipantSchema(): Schema<ChallengeParticipant> {
    return new Schema<ChallengeParticipant>(
        {
            challengeId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Challenge",
            },
            userId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "User",
            },
            status: {
                type: String,
                enum: Object.values(ChallengeParticipantStatus),
                default: ChallengeParticipantStatus.joined,
            },
            progress: {
                type: Number,
                default: 0,
            },
            progressValue: {
                type: Number,
                default: 0,
            },
            targetValue: {
                type: Number,
                required: true,
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
            completedAt: {
                type: Date,
            },
            scoreEarned: {
                type: Number,
                default: 0,
            },
        },
        {
            versionKey: false,
            collection: "challengeparticipants",
            timestamps: true,
        }
    );
}
