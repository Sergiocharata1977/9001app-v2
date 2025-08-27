import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'isoflow4-super-secret-key-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'isoflow4-refresh-secret-key-2024',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'isoflow4-api',
    audience: process.env.JWT_AUDIENCE || 'isoflow4-client',
  },

  // OIDC Configuration (Auth0/Keycloak)
  oidc: {
    enabled: process.env.OIDC_ENABLED === 'true' || false,
    issuer: process.env.OIDC_ISSUER || '',
    clientId: process.env.OIDC_CLIENT_ID || '',
    clientSecret: process.env.OIDC_CLIENT_SECRET || '',
    redirectUri: process.env.OIDC_REDIRECT_URI || 'http://localhost:3000/auth/callback',
    scopes: process.env.OIDC_SCOPES?.split(',') || ['openid', 'profile', 'email'],
    responseType: process.env.OIDC_RESPONSE_TYPE || 'code',
    grantType: process.env.OIDC_GRANT_TYPE || 'authorization_code',
  },

  // Multi-Factor Authentication
  mfa: {
    enabled: process.env.MFA_ENABLED === 'true' || false,
    issuer: process.env.MFA_ISSUER || 'ISOFlow4',
    totpWindow: parseInt(process.env.MFA_TOTP_WINDOW, 10) || 1,
    backupCodesCount: parseInt(process.env.MFA_BACKUP_CODES_COUNT, 10) || 10,
    smsEnabled: process.env.MFA_SMS_ENABLED === 'true' || false,
    emailEnabled: process.env.MFA_EMAIL_ENABLED === 'true' || false,
  },

  // Single Sign-On
  sso: {
    enabled: process.env.SSO_ENABLED === 'true' || false,
    providers: {
      google: {
        enabled: process.env.SSO_GOOGLE_ENABLED === 'true' || false,
        clientId: process.env.SSO_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.SSO_GOOGLE_CLIENT_SECRET || '',
      },
      microsoft: {
        enabled: process.env.SSO_MICROSOFT_ENABLED === 'true' || false,
        clientId: process.env.SSO_MICROSOFT_CLIENT_ID || '',
        clientSecret: process.env.SSO_MICROSOFT_CLIENT_SECRET || '',
        tenantId: process.env.SSO_MICROSOFT_TENANT_ID || 'common',
      },
      saml: {
        enabled: process.env.SSO_SAML_ENABLED === 'true' || false,
        entryPoint: process.env.SSO_SAML_ENTRY_POINT || '',
        issuer: process.env.SSO_SAML_ISSUER || '',
        cert: process.env.SSO_SAML_CERT || '',
      },
    },
  },

  // Password policies
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 8,
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true' || true,
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true' || true,
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true' || true,
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL === 'true' || true,
    maxAge: parseInt(process.env.PASSWORD_MAX_AGE_DAYS, 10) || 90,
    history: parseInt(process.env.PASSWORD_HISTORY_COUNT, 10) || 5,
    lockoutAttempts: parseInt(process.env.PASSWORD_LOCKOUT_ATTEMPTS, 10) || 5,
    lockoutDuration: parseInt(process.env.PASSWORD_LOCKOUT_DURATION, 10) || 300, // 5 minutes
  },

  // Session management
  session: {
    maxConcurrentSessions: parseInt(process.env.SESSION_MAX_CONCURRENT, 10) || 3,
    idleTimeout: parseInt(process.env.SESSION_IDLE_TIMEOUT, 10) || 1800, // 30 minutes
    absoluteTimeout: parseInt(process.env.SESSION_ABSOLUTE_TIMEOUT, 10) || 28800, // 8 hours
    cookieSecure: process.env.SESSION_COOKIE_SECURE === 'true' || true,
    cookieSameSite: process.env.SESSION_COOKIE_SAMESITE || 'strict',
  },

  // Rate limiting for auth endpoints
  rateLimit: {
    login: {
      windowMs: parseInt(process.env.AUTH_RATE_WINDOW, 10) || 900000, // 15 minutes
      max: parseInt(process.env.AUTH_RATE_MAX, 10) || 5, // 5 attempts
    },
    register: {
      windowMs: parseInt(process.env.REGISTER_RATE_WINDOW, 10) || 3600000, // 1 hour
      max: parseInt(process.env.REGISTER_RATE_MAX, 10) || 3, // 3 attempts
    },
    passwordReset: {
      windowMs: parseInt(process.env.RESET_RATE_WINDOW, 10) || 3600000, // 1 hour
      max: parseInt(process.env.RESET_RATE_MAX, 10) || 3, // 3 attempts
    },
  },

  // Tenant resolution
  tenant: {
    resolveBy: process.env.TENANT_RESOLVE_BY || 'header', // 'subdomain', 'header', 'both'
    headerName: process.env.TENANT_HEADER_NAME || 'X-Tenant-ID',
    subdomainPattern: process.env.TENANT_SUBDOMAIN_PATTERN || '{tenant}.isoflow4.com',
    defaultTenant: process.env.DEFAULT_TENANT_ID || null,
  },

  // Security headers
  security: {
    enableCSP: process.env.SECURITY_CSP_ENABLED === 'true' || true,
    enableHSTS: process.env.SECURITY_HSTS_ENABLED === 'true' || true,
    enableXFrame: process.env.SECURITY_XFRAME_ENABLED === 'true' || true,
    enableXContentType: process.env.SECURITY_XCONTENT_ENABLED === 'true' || true,
    enableReferrerPolicy: process.env.SECURITY_REFERRER_ENABLED === 'true' || true,
  },
}));