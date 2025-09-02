import { Router } from 'express';
import {
  getDashboardStats,
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers,
  changeUserRole
} from '../controllers/superAdminController';
import {
  requireSuperAdmin,
  logSuperAdminAction,
  rateLimitSuperAdmin
} from '../middleware/superAdminMiddleware';

const router = Router();

// Aplicar middleware de super admin a todas las rutas
router.use(requireSuperAdmin);
router.use(rateLimitSuperAdmin(100, 60000)); // 100 requests por minuto

// Dashboard y estadísticas
router.get(
  '/dashboard/stats',
  logSuperAdminAction('VIEW_DASHBOARD_STATS'),
  getDashboardStats
);

// Gestión de organizaciones
router.get(
  '/organizations',
  logSuperAdminAction('LIST_ORGANIZATIONS'),
  getAllOrganizations
);

router.post(
  '/organizations',
  logSuperAdminAction('CREATE_ORGANIZATION'),
  createOrganization
);

router.put(
  '/organizations/:id',
  logSuperAdminAction('UPDATE_ORGANIZATION'),
  updateOrganization
);

router.delete(
  '/organizations/:id',
  logSuperAdminAction('DELETE_ORGANIZATION'),
  deleteOrganization
);

// Gestión de usuarios de organizaciones
router.get(
  '/organizations/:id/users',
  logSuperAdminAction('LIST_ORGANIZATION_USERS'),
  getOrganizationUsers
);

router.put(
  '/users/:userId/role',
  logSuperAdminAction('CHANGE_USER_ROLE'),
  changeUserRole
);

export default router;

