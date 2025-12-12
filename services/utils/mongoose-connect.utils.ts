import {connect, Mongoose} from "mongoose";

export function openMongooseConnection(): Promise<Mongoose> {
    if(typeof process.env.MONGODB_URI === 'undefined') {
        throw new Error(`Missing MONGODB_URI env variable`);
    }
    return connect(process.env.MONGODB_URI);
}
