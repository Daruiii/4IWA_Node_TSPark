import { Schema } from "mongoose";
import { UserBadge } from "../../models";

export function getUserBadgeSchema(): Schema<UserBadge> {
    return new Schema<UserBadge>(
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            badgeId: {
                type: Schema.Types.ObjectId,
                ref: "Badge",
                required: true,
            },
            earnedAt: {
                type: Date,
                default: Date.now,
            },
        },
        {
            versionKey: false,
            collection: "userbadges",
            timestamps: true,
        }
    );
}
