import mongoose from 'mongoose';
import { logger } from '../config/logger';
import { env } from '../config/env';


export async function connectMongo() {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    logger.info('🗄️ Mongo connected');
}