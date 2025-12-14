export enum UserRole {
    admin = "admin",
    gym_owner = "gym_owner",
    client = "client",
}

export interface User {
    _id: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    score?: number;
    firstName?: string;
    lastName?: string;
    createdAt: Date;
    updatedAt: Date;
}
