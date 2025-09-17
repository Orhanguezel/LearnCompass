import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  listCurriculumTopics,
  getCurriculumTopic,
  upsertCurriculumTopic,
  bulkUpsertCurriculum,
  updateCurriculumTopic,
  deleteCurriculumTopic,
} from './controller';
import { requireAuth, type Role } from '../../middlewares/auth';
import { requireTenant } from '../../middlewares/tenant';
import { AppError } from '../../utils/AppError';

const router = Router();

/** Basit rol kontrolü (admin/teacher/student) */
function requireRole(allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.auth?.role;
    if (!role || !allowed.includes(role)) {
      throw new AppError(403, 'FORBIDDEN', 'Insufficient role');
    }
    next();
  };
}

/**
 * GET /api/v1/curriculum
 * Query: courseCode?, search?, page?, pageSize?
 * Erişim: tüm roller (öğrenci dahil)
 */
router.get('/', requireAuth, requireTenant, listCurriculumTopics);

/**
 * GET /api/v1/curriculum/:topicCode
 * Erişim: tüm roller (öğrenci dahil)
 */
router.get('/:topicCode', requireAuth, requireTenant, getCurriculumTopic);

/**
 * POST /api/v1/curriculum
 * Body: tek kayıt (upsert)
 * Erişim: teacher | admin
 */
router.post('/', requireAuth, requireTenant, requireRole(['teacher', 'admin']), upsertCurriculumTopic);

/**
 * POST /api/v1/curriculum/bulk
 * Body: [{...}, {...}] toplu upsert
 * Erişim: teacher | admin
 */
router.post('/bulk', requireAuth, requireTenant, requireRole(['teacher', 'admin']), bulkUpsertCurriculum);

/**
 * PATCH /api/v1/curriculum/:topicCode
 * Erişim: teacher | admin
 */
router.patch('/:topicCode', requireAuth, requireTenant, requireRole(['teacher', 'admin']), updateCurriculumTopic);

/**
 * DELETE /api/v1/curriculum/:topicCode
 * Erişim: admin
 */
router.delete('/:topicCode', requireAuth, requireTenant, requireRole(['admin']), deleteCurriculumTopic);

export default router;
