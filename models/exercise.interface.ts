export enum ExerciseDifficulty {
    easy = "easy",
    medium = "medium",
    hard = "hard"
}

export interface Exercise {
    _id: string;
    name: string;
    description?: string;
    targetedMuscles: string[];
    difficulty: ExerciseDifficulty;
    createdAt: Date;
}
