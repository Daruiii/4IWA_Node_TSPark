import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
    process.env.MONGODB_URI || "mongodb://tspark:tspark123@localhost:27017/tspark?authSource=admin";

async function seedGyms() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connecté à MongoDB");

        const db = mongoose.connection.db;
        const usersCollection = db?.collection("users");
        const gymsCollection = db?.collection("gyms");

        if (!usersCollection || !gymsCollection) {
            throw new Error("Collections introuvables");
        }

        let gymOwner = await usersCollection.findOne({ email: "gymowner@tspark.com" });
        if (!gymOwner) {
            const hashedPassword = await bcrypt.hash("gym123", 10);
            const result = await usersCollection.insertOne({
                email: "gymowner@tspark.com",
                password: hashedPassword,
                role: "gym_owner",
                firstName: "Jane",
                lastName: "Smith",
                isActive: true,
                score: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            gymOwner = await usersCollection.findOne({ _id: result.insertedId });
            console.log("Gym owner créé");
        }

        if (!gymOwner) {
            throw new Error("Impossible de créer le gym owner");
        }

        const existingGyms = await gymsCollection.countDocuments();
        if (existingGyms > 0) {
            console.log(`${existingGyms} gym(s) déjà présent(s)`);
            await mongoose.disconnect();
            return;
        }

        const gyms = [
            {
                name: "FitZone Paris Centre",
                address: "45 Rue de Rivoli, 75001 Paris",
                contact: "01 42 60 30 50",
                description: "Salle moderne au cœur de Paris avec vue sur les Tuileries",
                capacity: 150,
                equipments: ["Tapis de course", "Vélos elliptiques", "Poids libres", "Machines guidées"],
                activities: ["Cardio", "Musculation", "Cours collectifs"],
                ownerId: gymOwner._id,
                status: "approved",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: "PowerGym Montparnasse",
                address: "12 Boulevard du Montparnasse, 75015 Paris",
                contact: "01 45 38 72 90",
                description: "Spécialisé en musculation et préparation physique",
                capacity: 80,
                equipments: ["Rack à squats", "Bancs de développé", "Haltères jusqu'à 50kg", "Cages"],
                activities: ["Musculation", "CrossFit", "Préparation physique"],
                ownerId: gymOwner._id,
                status: "approved",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: "Wellness Studio Marais",
                address: "8 Rue des Francs Bourgeois, 75003 Paris",
                contact: "01 48 87 45 20",
                description: "Studio boutique axé bien-être et récupération",
                capacity: 40,
                equipments: ["Tapis de yoga", "Pilates reformer", "TRX", "Vélos spinning"],
                activities: ["Yoga", "Pilates", "Stretching", "Cycling"],
                ownerId: gymOwner._id,
                status: "pending",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await gymsCollection.insertMany(gyms);
        console.log(`${gyms.length} gyms créés avec succès`);

        await mongoose.disconnect();
        console.log("Déconnecté de MongoDB");
    } catch (error) {
        console.error("Erreur:", error);
        process.exit(1);
    }
}

seedGyms();
