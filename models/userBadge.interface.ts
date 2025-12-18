import { Types } from "mongoose";

export interface UserBadge {
    _id: string;
    userId: Types.ObjectId | string;
    badgeId: Types.ObjectId | string;
    earnedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

