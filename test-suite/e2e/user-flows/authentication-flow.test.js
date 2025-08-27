const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login antes de cada test
    await page.goto('http://localhost:3000/login');
  });

  test('should complete full authentication flow successfully', async ({ page }) => {
    // Test de registro de usuario
    await test.step('User Registration', async () => {
      await page.click('text=Register');
      await page.fill('[data-testid="email-input"]', 'newuser@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.fill('[data-testid="name-input"]', 'New Test User');
      await page.click('[data-testid="register-button"]');

      // Verificar que el usuario fue registrado exitosamente
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('registered successfully');
    });

    // Test de login
    await test.step('User Login', async () => {
      await page.fill('[data-testid="email-input"]', 'newuser@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="login-button"]');

      // Verificar que el usuario fue logueado exitosamente
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-name"]')).toContainText('New Test User');
    });

    // Test de logout
    await test.step('User Logout', async () => {
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Verificar que el usuario fue deslogueado exitosamente
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    });
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await test.step('Invalid Email', async () => {
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="login-button"]');

      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email format');
    });

    await test.step('Invalid Password', async () => {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');

      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    });

    await test.step('Non-existent User', async () => {
      await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.click('[data-testid="login-button"]');

      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('User not found');
    });
  });

  test('should handle registration validation errors', async ({ page }) => {
    await page.click('text=Register');

    await test.step('Empty Required Fields', async () => {
      await page.click('[data-testid="register-button"]');

      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    });

    await test.step('Invalid Email Format', async () => {
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.click('[data-testid="register-button"]');

      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');
    });

    await test.step('Weak Password', async () => {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', '123');
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.click('[data-testid="register-button"]');

      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters');
    });

    await test.step('Existing Email', async () => {
      await page.fill('[data-testid="email-input"]', 'existing@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.fill('[data-testid="name-input"]', 'Test User');
      await page.click('[data-testid="register-button"]');

      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('already exists');
    });
  });

  test('should handle password reset flow', async ({ page }) => {
    await test.step('Request Password Reset', async () => {
      await page.click('[data-testid="forgot-password-link"]');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.click('[data-testid="reset-password-button"]');

      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('reset email sent');
    });

    await test.step('Reset Password with Token', async () => {
      // Simular acceso al link de reset (en un test real, esto sería un email real)
      await page.goto('http://localhost:3000/reset-password?token=valid-reset-token');
      await page.fill('[data-testid="new-password-input"]', 'NewPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'NewPassword123!');
      await page.click('[data-testid="update-password-button"]');

      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('password updated');
    });
  });

  test('should handle session management', async ({ page, context }) => {
    // Login exitoso
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL(/.*dashboard/);

    await test.step('Session Persistence', async () => {
      // Recargar la página
      await page.reload();
      
      // Verificar que el usuario sigue logueado
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    await test.step('Session Expiration', async () => {
      // Simular expiración de sesión (en un test real, esto sería configurado en el backend)
      await page.evaluate(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('user');
      });

      await page.reload();

      // Verificar que el usuario fue redirigido al login
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    });

    await test.step('Multiple Tabs Session', async () => {
      // Crear nueva pestaña
      const newPage = await context.newPage();
      await newPage.goto('http://localhost:3000/dashboard');

      // Verificar que la nueva pestaña también tiene la sesión
      await expect(newPage.locator('[data-testid="user-menu"]')).toBeVisible();

      // Logout en una pestaña
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Verificar que la otra pestaña también fue deslogueada
      await expect(newPage).toHaveURL(/.*login/);
    });
  });

  test('should handle remember me functionality', async ({ page }) => {
    await test.step('Login with Remember Me', async () => {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'TestPassword123!');
      await page.check('[data-testid="remember-me-checkbox"]');
      await page.click('[data-testid="login-button"]');

      await expect(page).toHaveURL(/.*dashboard/);
    });

    await test.step('Verify Remember Me Token', async () => {
      // Verificar que se guardó el token de "remember me"
      const rememberMeToken = await page.evaluate(() => {
        return localStorage.getItem('rememberMeToken');
      });
      expect(rememberMeToken).toBeTruthy();
    });

    await test.step('Auto-login with Remember Me', async () => {
      // Simular cierre y reapertura del navegador
      await page.evaluate(() => {
        sessionStorage.clear();
      });

      await page.reload();

      // Verificar que el usuario fue auto-logueado
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });
  });

  test('should handle concurrent login attempts', async ({ page, context }) => {
    await test.step('Multiple Login Attempts', async () => {
      // Crear múltiples pestañas
      const pages = [];
      for (let i = 0; i < 3; i++) {
        const newPage = await context.newPage();
        await newPage.goto('http://localhost:3000/login');
        pages.push(newPage);
      }

      // Intentar login en todas las pestañas simultáneamente
      const loginPromises = pages.map(async (page, index) => {
        await page.fill('[data-testid="email-input"]', `test${index}@example.com`);
        await page.fill('[data-testid="password-input"]', 'TestPassword123!');
        return page.click('[data-testid="login-button"]');
      });

      await Promise.all(loginPromises);

      // Verificar que solo una sesión está activa
      const activeSessions = await Promise.all(
        pages.map(page => page.locator('[data-testid="user-menu"]').isVisible())
      );

      const activeCount = activeSessions.filter(Boolean).length;
      expect(activeCount).toBeLessThanOrEqual(1);
    });
  });

  test('should handle security headers and CSRF protection', async ({ page }) => {
    await test.step('Check Security Headers', async () => {
      const response = await page.goto('http://localhost:3000/login');
      
      // Verificar headers de seguridad
      const headers = response.headers();
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
    });

    await test.step('CSRF Token Validation', async () => {
      // Verificar que el formulario incluye CSRF token
      const csrfToken = await page.locator('[name="csrf-token"]').getAttribute('value');
      expect(csrfToken).toBeTruthy();

      // Intentar enviar formulario sin CSRF token
      await page.evaluate(() => {
        document.querySelector('[name="csrf-token"]').remove();
      });

      await page.click('[data-testid="login-button"]');

      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('CSRF token');
    });
  });

  test('should handle rate limiting', async ({ page }) => {
    await test.step('Rate Limiting on Login', async () => {
      // Intentar múltiples logins rápidamente
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', 'wrongpassword');
        await page.click('[data-testid="login-button"]');
        await page.waitForTimeout(100); // Pequeña pausa entre intentos
      }

      // Verificar que se activó el rate limiting
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Too many attempts');
    });

    await test.step('Rate Limiting on Registration', async () => {
      await page.click('text=Register');

      // Intentar múltiples registros rápidamente
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email-input"]', `test${i}@example.com`);
        await page.fill('[data-testid="password-input"]', 'TestPassword123!');
        await page.fill('[data-testid="name-input"]', `Test User ${i}`);
        await page.click('[data-testid="register-button"]');
        await page.waitForTimeout(100);
      }

      // Verificar que se activó el rate limiting
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Too many attempts');
    });
  });
});