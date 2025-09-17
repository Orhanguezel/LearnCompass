import { Router } from 'express';

import healthRouter from './health/router';
import eventsRouter from './events/router';
import plansRouter from './plans/router';
import curriculumRouter from './curriculum/router';
import studentsRouter from './students/router';

const api = Router();

// /api/v1/...
api.use('/health', healthRouter);
api.use('/events', eventsRouter);
api.use('/plans', plansRouter);
api.use('/curriculum', curriculumRouter);
api.use('/students', studentsRouter);

export default api;
