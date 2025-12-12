import express, {Request, Response} from 'express';
import {config} from 'dotenv';
import {openMongooseConnection} from "./services/utils";
import {ExerciseController, GymController, GymExerciseController, UserController} from "./controllers";

config({quiet: true});

async function main() {
    const conn = await openMongooseConnection();
    console.log(`MongoDB connected: ${conn.connection.name}`);

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.get('/', (req: Request, res: Response) => {
        res.json({message: 'TSPark API is running'});
    });

    const userController = new UserController();
    app.use(userController.path, userController.buildRouter());
    
    const gymController = new GymController();
    app.use(gymController.path, gymController.buildRouter());

    const exerciseController = new ExerciseController();
    app.use(exerciseController.path, exerciseController.buildRouter());

    const gymExerciseController = new GymExerciseController();
    app.use(gymExerciseController.path, gymExerciseController.buildRouter());
    
    app.listen(PORT, () => {
        console.log(`listening on ${PORT}...`);
    });
}

main().catch(console.error);
