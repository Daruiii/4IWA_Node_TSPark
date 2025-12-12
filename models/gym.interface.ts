import { Types } from "mongoose";

export enum GymStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}

export interface Gym {
    _id: string;    
    name: string;
    address: string;
    contact: string;
    description: string;
    capacity: number;
    equipments: string[];
    activities: string[];
    ownerId: Types.ObjectId | string;
    status: GymStatus;
    createdAt: Date;
    updatedAt: Date;
}
