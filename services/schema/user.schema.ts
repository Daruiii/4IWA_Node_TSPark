import { Schema } from "mongoose";
import { User, UserRole } from "../../models";

export function getUserSchema(): Schema<User> {
    return new Schema<User>(
        {
            email: {
                type: String,
                required: true,
                unique: true,
            },
            password: {
                type: String,
                required: true,
            },
            role: {
                type: String,
                enum: Object.values(UserRole),
                required: true,
            },
            isActive: {
                type: Boolean,
                default: true,
            },
            score: {
                type: Number,
                default: 0,
            },
            firstName: {
                type: String,
            },
            lastName: {
                type: String,
            },
        },
        {
            versionKey: false,
            collection: "users",
            timestamps: true,
        }
    );
}
