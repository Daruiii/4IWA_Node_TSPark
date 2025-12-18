import { json, Request, Response, Router } from "express";
import { Badge, BadgeCategory, BadgeRarity, UserRole } from "../models";
import { getBadgeSchema } from "../services/schema";
import { getOrCreateModel } from "../services/utils";
import { authMiddleware, requireRole } from "../middlewares";

export class BadgeController {
    readonly path: string;
    private badgeModel = getOrCreateModel<Badge>("Badge", getBadgeSchema());

    constructor() {
        this.path = "/badges";
    }

    async getAll(req: Request, res: Response) {
        const badges = await this.badgeModel.find({});
        res.json(badges);
    }

    async getByCategory(req: Request, res: Response) {
        const category = req.params.category;

        if (!Object.values(BadgeCategory).includes(category as BadgeCategory)) {
            res.status(400).json({
                error:
                    "Invalid category. Must be one of: " + Object.values(BadgeCategory).join(", "),
            });
            return;
        }

        const badges = await this.badgeModel.find({ category });
        res.json(badges);
    }

    async getByRarity(req: Request, res: Response) {
        const rarity = req.params.rarity;

        if (!Object.values(BadgeRarity).includes(rarity as BadgeRarity)) {
            res.status(400).json({
                error: "Invalid rarity. Must be one of: " + Object.values(BadgeRarity).join(", "),
            });
            return;
        }

        const badges = await this.badgeModel.find({ rarity });
        res.json(badges);
    }

    async getById(req: Request, res: Response) {
        const badgeId = req.params.id;
        const badge = await this.badgeModel.findById(badgeId);

        if (!badge) {
            res.status(404).json({ error: "Badge not found" });
            return;
        }

        res.json(badge);
    }

    async create(req: Request, res: Response) {
        const { name, description, icon, category, rarity, condition, scoreReward } = req.body;

        if (!name || !description || !icon || !category || !rarity || !condition) {
            res.status(400).json({
                error: "Missing required fields: name, description, icon, category, rarity, condition",
            });
            return;
        }

        if (!Object.values(BadgeCategory).includes(category)) {
            res.status(400).json({
                error:
                    "Invalid category. Must be one of: " + Object.values(BadgeCategory).join(", "),
            });
            return;
        }

        if (!Object.values(BadgeRarity).includes(rarity)) {
            res.status(400).json({
                error: "Invalid rarity. Must be one of: " + Object.values(BadgeRarity).join(", "),
            });
            return;
        }

        if (!condition.conditionType || typeof condition.value !== "number") {
            res.status(400).json({
                error: "Condition must have 'conditionType' (string) and 'value' (number)",
            });
            return;
        }

        const existingBadge = await this.badgeModel.findOne({ name });
        if (existingBadge) {
            res.status(409).json({ error: "Badge with this name already exists" });
            return;
        }

        const newBadge = new this.badgeModel({
            name,
            description,
            icon,
            category,
            rarity,
            condition,
            scoreReward: scoreReward || 0,
        });

        await newBadge.save();
        res.status(201).json(newBadge);
    }

    async update(req: Request, res: Response) {
        const badgeId = req.params.id;
        const updates = req.body;

        if (updates.category && !Object.values(BadgeCategory).includes(updates.category)) {
            res.status(400).json({
                error:
                    "Invalid category. Must be one of: " + Object.values(BadgeCategory).join(", "),
            });
            return;
        }

        if (updates.rarity && !Object.values(BadgeRarity).includes(updates.rarity)) {
            res.status(400).json({
                error: "Invalid rarity. Must be one of: " + Object.values(BadgeRarity).join(", "),
            });
            return;
        }

        const badge = await this.badgeModel.findByIdAndUpdate(badgeId, updates, { new: true });

        if (!badge) {
            res.status(404).json({ error: "Badge not found" });
            return;
        }

        res.json(badge);
    }

    async delete(req: Request, res: Response) {
        const badgeId = req.params.id;

        const badge = await this.badgeModel.findByIdAndDelete(badgeId);

        if (!badge) {
            res.status(404).json({ error: "Badge not found" });
            return;
        }

        res.json({ message: "Badge deleted successfully" });
    }

    buildRouter(): Router {
        const router = Router();

        router.get("/", this.getAll.bind(this));
        router.get("/category/:category", this.getByCategory.bind(this));
        router.get("/rarity/:rarity", this.getByRarity.bind(this));
        router.get("/:id", this.getById.bind(this));

        router.post(
            "/",
            authMiddleware,
            requireRole(UserRole.admin),
            json(),
            this.create.bind(this)
        );
        router.patch(
            "/:id",
            authMiddleware,
            requireRole(UserRole.admin),
            json(),
            this.update.bind(this)
        );
        router.delete("/:id", authMiddleware, requireRole(UserRole.admin), this.delete.bind(this));

        return router;
    }
}
