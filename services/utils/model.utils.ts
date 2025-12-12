import { Model, Schema, model } from "mongoose";

export function getOrCreateModel<T>(modelName: string, schema: Schema<T>): Model<T> {
    try {
        return model<T>(modelName);
    } catch {
        return model<T>(modelName, schema);
    }
}
