import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
    process.env.MONGODB_URI || "mongodb://tspark:tspark123@localhost:27017/tspark?authSource=owner";

async function seedOwner() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connecté à MongoDB");

        const db = mongoose.connection.db;
        const usersCollection = db?.collection("users");

        if (!usersCollection) {
            throw new Error("Collection users introuvable");
        }

        const existingOwner = await usersCollection.findOne({ role: "gym_owner" });
        if (existingOwner) {
            console.log("Un Gym Owner existe déjà:", existingOwner.email);
            await mongoose.disconnect();
            return;
        }

        const hashedPassword = await bcrypt.hash("owner123", 10);

        await usersCollection.insertOne({
            email: "owner@tspark.com",
            password: hashedPassword,
            role: "gym_owner",
            firstName: "Owner",
            lastName: "TSPark",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log("✅ Owner créé avec succès!");
        console.log("Email: owner@tspark.com");
        console.log("Password: owner123");

        await mongoose.disconnect();
        console.log("Déconnecté de MongoDB");
    } catch (error) {
        console.error("❌ Erreur:", error);
        process.exit(1);
    }
}

seedOwner();
