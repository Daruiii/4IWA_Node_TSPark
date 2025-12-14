import { Schema } from "mongoose";
import { Gym, GymStatus } from "../../models";

export function getGymSchema(): Schema<Gym> {
    return new Schema<Gym>(
        {
            name: {
                type: String,
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
            contact: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            capacity: {
                type: Number,
                required: true,
            },
            equipments: {
                type: [String],
                required: true,
            },
            activities: {
                type: [String],
                required: true,
            },
            ownerId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "User",
            },
            status: {
                type: String,
                enum: Object.values(GymStatus),
                default: GymStatus.pending,
            },
        },
        {
            versionKey: false,
            collection: "Gyms",
            timestamps: true,
        }
    );
}
