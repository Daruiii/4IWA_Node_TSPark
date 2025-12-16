import { Schema } from "mongoose";
import { GymExercise } from "../../models";

export function getGymExerciseSchema(): Schema<GymExercise> {
    return new Schema<GymExercise>(
        {
            gymId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Gym",
            },
            exerciseId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Exercise",
            },
        },
        {
            versionKey: false,
            collection: "gymexercises",
            timestamps: true,
        }
    );
}
