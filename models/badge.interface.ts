export enum BadgeCategory {
    challenge = "challenge",
    streak = "streak",
    social = "social",
    milestone = "milestone",
}

export enum BadgeRarity {
    common = "common",
    rare = "rare",
    epic = "epic",
    legendary = "legendary",
}

export interface BadgeCondition {
    conditionType: string;
    value: number;
}

export interface Badge {
    _id: string;
    name: string;
    description: string;
    icon: string;
    category: BadgeCategory;
    rarity: BadgeRarity;
    condition: BadgeCondition;
    scoreReward: number;
    createdAt: Date;
    updatedAt: Date;
}
