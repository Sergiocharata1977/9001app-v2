"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superAdminController_1 = require("../controllers/superAdminController.js");
const superAdminMiddleware_1 = require("../middleware/superAdminMiddleware.js");
const router = (0, express_1.Router)();
// Aplicar middleware de super admin a todas las rutas
router.use(superAdminMiddleware_1.requireSuperAdmin);
router.use((0, superAdminMiddleware_1.rateLimitSuperAdmin)(100, 60000)); // 100 requests por minuto
// Dashboard y estadísticas
router.get('/dashboard/stats', (0, superAdminMiddleware_1.logSuperAdminAction)('VIEW_DASHBOARD_STATS'), superAdminController_1.getDashboardStats);
// Gestión de organizaciones
router.get('/organizations', (0, superAdminMiddleware_1.logSuperAdminAction)('LIST_ORGANIZATIONS'), superAdminController_1.getAllOrganizations);
router.post('/organizations', (0, superAdminMiddleware_1.logSuperAdminAction)('CREATE_ORGANIZATION'), superAdminController_1.createOrganization);
router.put('/organizations/:id', (0, superAdminMiddleware_1.logSuperAdminAction)('UPDATE_ORGANIZATION'), superAdminController_1.updateOrganization);
router.delete('/organizations/:id', (0, superAdminMiddleware_1.logSuperAdminAction)('DELETE_ORGANIZATION'), superAdminController_1.deleteOrganization);
// Gestión de usuarios de organizaciones
router.get('/organizations/:id/users', (0, superAdminMiddleware_1.logSuperAdminAction)('LIST_ORGANIZATION_USERS'), superAdminController_1.getOrganizationUsers);
router.put('/users/:userId/role', (0, superAdminMiddleware_1.logSuperAdminAction)('CHANGE_USER_ROLE'), superAdminController_1.changeUserRole);
exports.default = router;


