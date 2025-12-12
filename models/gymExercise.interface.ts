import { Types } from "mongoose";

export interface GymExercise {
    _id: string;
    gymId: Types.ObjectId | string;
    exerciseId: Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}
