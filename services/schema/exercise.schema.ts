import { Schema } from "mongoose";
import { Exercise, ExerciseDifficulty } from "../../models";

export function getExerciseSchema(): Schema<Exercise> {
  return new Schema<Exercise>(
    {
      name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: false
      },
      targetedMuscles: {
        type: [String],
        required: true
      },
      difficulty: {
        type: String,
        enum: Object.values(ExerciseDifficulty),
        required: true
      }
    },
    {
      versionKey: false,
      collection: "Exercises",
      timestamps: true
    }
  );
}
