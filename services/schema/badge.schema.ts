import { Schema } from "mongoose";
import { Badge, BadgeCategory, BadgeRarity } from "../../models";

export function getBadgeSchema(): Schema<Badge> {
    return new Schema<Badge>(
        {
            name: {
                type: String,
                required: true,
                unique: true,
            },
            description: {
                type: String,
                required: true,
            },
            icon: {
                type: String,
                required: true,
            },
            category: {
                type: String,
                enum: Object.values(BadgeCategory),
                required: true,
            },
            rarity: {
                type: String,
                enum: Object.values(BadgeRarity),
                required: true,
            },
            condition: {
                conditionType: {
                    type: String,
                    required: true,
                },
                value: {
                    type: Number,
                    required: true,
                },
            },
            scoreReward: {
                type: Number,
                default: 0,
            },
        },
        {
            versionKey: false,
            collection: "badges",
            timestamps: true,
        }
    );
}
