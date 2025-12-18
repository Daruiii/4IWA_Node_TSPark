import express, { Request, Response } from "express";
import { config } from "dotenv";
import { openMongooseConnection } from "./services/utils";
import {
    AuthController,
    ExerciseController,
    GymController,
    GymExerciseController,
    UserController,
    ChallengeController,
    ChallengeParticipantController,
    BadgeController,
    UserBadgeController,
    StatsController,
} from "./controllers";

config({ quiet: true });

async function main() {
    const conn = await openMongooseConnection();
    console.log(`MongoDB connected: ${conn.connection.name}`);

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.get("/", (req: Request, res: Response) => {
        res.json({ message: "TSPark API is running" });
    });

    const authController = new AuthController();
    app.use(authController.path, authController.buildRouter());

    const userController = new UserController();
    app.use(userController.path, userController.buildRouter());

    const gymController = new GymController();
    app.use(gymController.path, gymController.buildRouter());

    const exerciseController = new ExerciseController();
    app.use(exerciseController.path, exerciseController.buildRouter());

    const gymExerciseController = new GymExerciseController();
    app.use(gymExerciseController.path, gymExerciseController.buildRouter());

    const challengeController = new ChallengeController();
    app.use(challengeController.path, challengeController.buildRouter());

    const challengeParticipantController = new ChallengeParticipantController();
    app.use(challengeParticipantController.path,challengeParticipantController.buildRouter());

    const badgeController = new BadgeController();
    app.use(badgeController.path, badgeController.buildRouter());

    const userBadgeController = new UserBadgeController();
    app.use(userBadgeController.path, userBadgeController.buildRouter());

    const statsController = new StatsController();
    app.use(statsController.path, statsController.buildRouter());

    app.listen(PORT, () => {
        console.log(`listening on ${PORT}...`);
    });
}

main().catch(console.error);
