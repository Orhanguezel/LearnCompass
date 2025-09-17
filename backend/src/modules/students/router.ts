import { Router, type Request, type Response, type NextFunction } from 'express';
import { listStudents, getStudent, upsertStudent, patchStudent, deleteStudent } from './controller';
import { requireAuth, type Role } from '@/middlewares/auth';
import { requireTenant } from '@/middlewares/tenant';
import { AppError } from '@/utils/AppError';

const router = Router();

// Basit rol kontrolü
function requireRole(allowed: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.auth?.role;
    if (!role || !allowed.includes(role)) {
      throw new AppError(403, 'FORBIDDEN', 'Insufficient role');
    }
    next();
  };
}

// Liste & detay: tüm roller erişebilir
router.get('/', requireAuth, requireTenant, listStudents);
router.get('/:studentKey', requireAuth, requireTenant, getStudent);

// Oluştur/Güncelle: teacher|admin
router.post('/', requireAuth, requireTenant, requireRole(['teacher', 'admin']), upsertStudent);
router.patch('/:studentKey', requireAuth, requireTenant, requireRole(['teacher', 'admin']), patchStudent);

// Sil (soft): admin
router.delete('/:studentKey', requireAuth, requireTenant, requireRole(['admin']), deleteStudent);

export default router;
