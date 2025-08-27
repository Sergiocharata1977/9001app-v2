// Constantes para el sistema de seguridad
export const SECURITY_CONSTANTS = {
  // Niveles de seguridad
  SECURITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },

  // Métodos de autenticación
  AUTHENTICATION_METHODS: {
    NONE: 'none',
    TOKEN: 'token',
    CERTIFICATE: 'certificate',
    BIOMETRIC: 'biometric',
    MULTI_FACTOR: 'multi_factor',
    OAUTH: 'oauth',
    SAML: 'saml',
    LDAP: 'ldap',
    KERBEROS: 'kerberos',
    RADIUS: 'radius',
    TACACS: 'tacacs',
    CUSTOM: 'custom'
  },

  // Niveles de encriptación
  ENCRYPTION_LEVELS: {
    NONE: 'none',
    BASIC: 'basic',
    STANDARD: 'standard',
    HIGH: 'high',
    MILITARY: 'military',
    QUANTUM: 'quantum'
  },

  // Tipos de políticas
  POLICY_TYPES: {
    ACCESS_CONTROL: 'access_control',
    DATA_PROTECTION: 'data_protection',
    NETWORK_SECURITY: 'network_security',
    APPLICATION_SECURITY: 'application_security',
    INCIDENT_RESPONSE: 'incident_response',
    BUSINESS_CONTINUITY: 'business_continuity',
    RISK_MANAGEMENT: 'risk_management',
    COMPLIANCE: 'compliance',
    PRIVACY: 'privacy',
    CRYPTOGRAPHY: 'cryptography'
  },

  // Tipos de reglas
  RULE_TYPES: {
    ALLOW: 'allow',
    DENY: 'deny',
    REQUIRE: 'require',
    LOG: 'log',
    ALERT: 'alert',
    QUARANTINE: 'quarantine',
    BLOCK: 'block',
    REDIRECT: 'redirect',
    TRANSFORM: 'transform',
    CUSTOM: 'custom'
  },

  // Tipos de incidentes
  INCIDENT_TYPES: {
    UNAUTHORIZED_ACCESS: 'unauthorized_access',
    DATA_BREACH: 'data_breach',
    MALWARE_INFECTION: 'malware_infection',
    DENIAL_OF_SERVICE: 'denial_of_service',
    PRIVILEGE_ESCALATION: 'privilege_escalation',
    DATA_EXFILTRATION: 'data_exfiltration',
    INSIDER_THREAT: 'insider_threat',
    SOCIAL_ENGINEERING: 'social_engineering',
    PHYSICAL_SECURITY: 'physical_security',
    CONFIGURATION_ERROR: 'configuration_error',
    VULNERABILITY_EXPLOIT: 'vulnerability_exploit',
    CREDENTIAL_COMPROMISE: 'credential_compromise',
    API_ABUSE: 'api_abuse',
    RESOURCE_EXHAUSTION: 'resource_exhaustion',
    NETWORK_INTRUSION: 'network_intrusion',
    APPLICATION_ATTACK: 'application_attack',
    DATABASE_BREACH: 'database_breach',
    CLOUD_SECURITY: 'cloud_security',
    MOBILE_SECURITY: 'mobile_security',
    IOT_SECURITY: 'iot_security'
  },

  // Severidades de incidentes
  INCIDENT_SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },

  // Estados de incidentes
  INCIDENT_STATUS: {
    DETECTED: 'detected',
    INVESTIGATING: 'investigating',
    CONTAINED: 'contained',
    RESOLVED: 'resolved',
    CLOSED: 'closed',
    ESCALATED: 'escalated',
    FALSE_POSITIVE: 'false_positive'
  },

  // Tipos de autenticación
  AUTHENTICATION_TYPES: {
    LOCAL: 'local',
    LDAP: 'ldap',
    ACTIVE_DIRECTORY: 'active_directory',
    OAUTH: 'oauth',
    SAML: 'saml',
    OPENID_CONNECT: 'openid_connect',
    KERBEROS: 'kerberos',
    RADIUS: 'radius',
    TACACS: 'tacacs',
    BIOMETRIC: 'biometric',
    MULTI_FACTOR: 'multi_factor',
    FEDERATED: 'federated',
    CUSTOM: 'custom'
  },

  // Métodos MFA
  MFA_METHODS: {
    TOTP: 'totp',
    HOTP: 'hotp',
    SMS: 'sms',
    EMAIL: 'email',
    PUSH: 'push',
    BIOMETRIC: 'biometric',
    HARDWARE_TOKEN: 'hardware_token',
    SMART_CARD: 'smart_card',
    CERTIFICATE: 'certificate',
    CUSTOM: 'custom'
  },

  // Modelos de autorización
  AUTHORIZATION_MODELS: {
    ROLE_BASED: 'role_based',
    ATTRIBUTE_BASED: 'attribute_based',
    POLICY_BASED: 'policy_based',
    IDENTITY_BASED: 'identity_based',
    HYBRID: 'hybrid',
    ZERO_TRUST: 'zero_trust',
    JUST_IN_TIME: 'just_in_time',
    RISK_BASED: 'risk_based'
  },

  // Tipos de algoritmos
  ALGORITHM_TYPES: {
    SYMMETRIC: 'symmetric',
    ASYMMETRIC: 'asymmetric',
    HASH: 'hash',
    HMAC: 'hmac',
    KDF: 'kdf',
    PRNG: 'prng',
    QUANTUM: 'quantum',
    POST_QUANTUM: 'post_quantum'
  },

  // Tipos de claves
  KEY_TYPES: {
    MASTER: 'master',
    DATA: 'data',
    SESSION: 'session',
    TRANSPORT: 'transport',
    BACKUP: 'backup',
    RECOVERY: 'recovery',
    SIGNING: 'signing',
    VERIFICATION: 'verification'
  },

  // Estados de claves
  KEY_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    EXPIRED: 'expired',
    COMPROMISED: 'compromised',
    REVOKED: 'revoked'
  },

  // Usos de claves
  KEY_USAGES: {
    ENCRYPT: 'encrypt',
    DECRYPT: 'decrypt',
    SIGN: 'sign',
    VERIFY: 'verify',
    WRAP: 'wrap',
    UNWRAP: 'unwrap'
  },

  // Tipos de políticas de encriptación
  ENCRYPTION_POLICY_TYPES: {
    DATA_AT_REST: 'data_at_rest',
    DATA_IN_TRANSIT: 'data_in_transit',
    DATA_IN_USE: 'data_in_use'
  },

  // Estrategias de backup
  BACKUP_STRATEGIES: {
    FULL: 'full',
    INCREMENTAL: 'incremental',
    DIFFERENTIAL: 'differential',
    SNAPSHOT: 'snapshot',
    CONTINUOUS: 'continuous',
    HYBRID: 'hybrid'
  },

  // Políticas de retención
  RETENTION_POLICIES: {
    DELETE: 'delete',
    ARCHIVE: 'archive',
    COMPRESS: 'compress'
  },

  // Configuración por defecto
  DEFAULT_CONFIG: {
    AUTHENTICATION_TIMEOUT: 300000, // 5 minutos
    SESSION_TIMEOUT: 3600000, // 1 hora
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 900000, // 15 minutos
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    PASSWORD_EXPIRATION_DAYS: 90,
    PASSWORD_HISTORY_COUNT: 5,
    MFA_REQUIRED: false,
    MFA_GRACE_PERIOD: 86400000, // 24 horas
    ENCRYPTION_ENABLED: true,
    AUDIT_ENABLED: true,
    COMPLIANCE_ENABLED: true,
    SECURITY_SCANNING_ENABLED: true,
    VULNERABILITY_SCANNING_ENABLED: true,
    PENETRATION_TESTING_ENABLED: false,
    SECURITY_ASSESSMENT_ENABLED: true
  },

  // Límites del sistema
  SYSTEM_LIMITS: {
    MAX_SESSIONS_PER_USER: 10,
    MAX_CONCURRENT_SESSIONS: 1000,
    MAX_AUTHENTICATION_ATTEMPTS: 10,
    MAX_PASSWORD_LENGTH: 256,
    MAX_PASSWORD_HISTORY: 10,
    MAX_MFA_ATTEMPTS: 3,
    MAX_ENCRYPTION_KEYS: 1000,
    MAX_BACKUP_COPIES: 10,
    MAX_AUDIT_ENTRIES: 1000000,
    MAX_SECURITY_POLICIES: 1000,
    MAX_ACCESS_RULES: 10000,
    MAX_INCIDENT_RECORDS: 100000,
    MAX_COMPLIANCE_REPORTS: 1000,
    MAX_VULNERABILITY_SCANS: 100,
    MAX_SECURITY_ASSESSMENTS: 100
  },

  // Timeouts
  TIMEOUTS: {
    AUTHENTICATION: 300000, // 5 minutos
    SESSION: 3600000, // 1 hora
    IDLE: 1800000, // 30 minutos
    ABSOLUTE: 86400000, // 24 horas
    MFA_CHALLENGE: 300000, // 5 minutos
    PASSWORD_RESET: 3600000, // 1 hora
    ACCOUNT_UNLOCK: 900000, // 15 minutos
    ENCRYPTION_OPERATION: 30000, // 30 segundos
    DECRYPTION_OPERATION: 30000, // 30 segundos
    KEY_GENERATION: 60000, // 1 minuto
    KEY_ROTATION: 300000, // 5 minutos
    BACKUP_OPERATION: 3600000, // 1 hora
    RESTORE_OPERATION: 7200000, // 2 horas
    AUDIT_OPERATION: 10000, // 10 segundos
    COMPLIANCE_CHECK: 300000, // 5 minutos
    SECURITY_SCAN: 1800000, // 30 minutos
    VULNERABILITY_SCAN: 3600000, // 1 hora
    PENETRATION_TEST: 86400000, // 24 horas
    SECURITY_ASSESSMENT: 7200000 // 2 horas
  },

  // Intervalos
  INTERVALS: {
    SESSION_CHECK: 60000, // 1 minuto
    PASSWORD_EXPIRATION_CHECK: 86400000, // 24 horas
    MFA_GRACE_PERIOD_CHECK: 3600000, // 1 hora
    KEY_ROTATION: 2592000000, // 30 días
    BACKUP_SCHEDULE: 86400000, // 24 horas
    AUDIT_LOG_ROTATION: 604800000, // 7 días
    COMPLIANCE_CHECK: 604800000, // 7 días
    SECURITY_SCAN: 86400000, // 24 horas
    VULNERABILITY_SCAN: 604800000, // 7 días
    PENETRATION_TEST: 2592000000, // 30 días
    SECURITY_ASSESSMENT: 2592000000, // 30 días
    INCIDENT_REVIEW: 3600000, // 1 hora
    THREAT_INTELLIGENCE_UPDATE: 3600000, // 1 hora
    SECURITY_POLICY_REVIEW: 2592000000, // 30 días
    ACCESS_REVIEW: 2592000000 // 30 días
  },

  // Códigos de error
  ERROR_CODES: {
    AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
    AUTHORIZATION_FAILED: 'AUTHORIZATION_FAILED',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    SESSION_INVALID: 'SESSION_INVALID',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
    PASSWORD_EXPIRED: 'PASSWORD_EXPIRED',
    PASSWORD_INVALID: 'PASSWORD_INVALID',
    MFA_REQUIRED: 'MFA_REQUIRED',
    MFA_FAILED: 'MFA_FAILED',
    MFA_TIMEOUT: 'MFA_TIMEOUT',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    TOKEN_REVOKED: 'TOKEN_REVOKED',
    CERTIFICATE_EXPIRED: 'CERTIFICATE_EXPIRED',
    CERTIFICATE_INVALID: 'CERTIFICATE_INVALID',
    CERTIFICATE_REVOKED: 'CERTIFICATE_REVOKED',
    ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
    DECRYPTION_FAILED: 'DECRYPTION_FAILED',
    KEY_NOT_FOUND: 'KEY_NOT_FOUND',
    KEY_EXPIRED: 'KEY_EXPIRED',
    KEY_INVALID: 'KEY_INVALID',
    KEY_REVOKED: 'KEY_REVOKED',
    BACKUP_FAILED: 'BACKUP_FAILED',
    RESTORE_FAILED: 'RESTORE_FAILED',
    AUDIT_FAILED: 'AUDIT_FAILED',
    COMPLIANCE_FAILED: 'COMPLIANCE_FAILED',
    SECURITY_SCAN_FAILED: 'SECURITY_SCAN_FAILED',
    VULNERABILITY_SCAN_FAILED: 'VULNERABILITY_SCAN_FAILED',
    PENETRATION_TEST_FAILED: 'PENETRATION_TEST_FAILED',
    SECURITY_ASSESSMENT_FAILED: 'SECURITY_ASSESSMENT_FAILED',
    INCIDENT_DETECTION_FAILED: 'INCIDENT_DETECTION_FAILED',
    INCIDENT_RESPONSE_FAILED: 'INCIDENT_RESPONSE_FAILED',
    THREAT_DETECTION_FAILED: 'THREAT_DETECTION_FAILED',
    THREAT_RESPONSE_FAILED: 'THREAT_RESPONSE_FAILED',
    POLICY_VIOLATION: 'POLICY_VIOLATION',
    ACCESS_DENIED: 'ACCESS_DENIED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    RESOURCE_PROTECTED: 'RESOURCE_PROTECTED',
    DATA_CLASSIFICATION_VIOLATION: 'DATA_CLASSIFICATION_VIOLATION',
    PRIVACY_VIOLATION: 'PRIVACY_VIOLATION',
    COMPLIANCE_VIOLATION: 'COMPLIANCE_VIOLATION',
    SECURITY_VIOLATION: 'SECURITY_VIOLATION',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
    RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED'
  },

  // Eventos de seguridad
  EVENTS: {
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    USER_LOGIN_FAILED: 'user_login_failed',
    USER_ACCOUNT_LOCKED: 'user_account_locked',
    USER_ACCOUNT_UNLOCKED: 'user_account_unlocked',
    USER_PASSWORD_CHANGED: 'user_password_changed',
    USER_PASSWORD_EXPIRED: 'user_password_expired',
    USER_MFA_ENABLED: 'user_mfa_enabled',
    USER_MFA_DISABLED: 'user_mfa_disabled',
    USER_MFA_CHALLENGE: 'user_mfa_challenge',
    USER_MFA_FAILED: 'user_mfa_failed',
    USER_SESSION_CREATED: 'user_session_created',
    USER_SESSION_DESTROYED: 'user_session_destroyed',
    USER_SESSION_EXPIRED: 'user_session_expired',
    USER_ACCESS_GRANTED: 'user_access_granted',
    USER_ACCESS_DENIED: 'user_access_denied',
    USER_PERMISSION_GRANTED: 'user_permission_granted',
    USER_PERMISSION_DENIED: 'user_permission_denied',
    USER_ROLE_ASSIGNED: 'user_role_assigned',
    USER_ROLE_REMOVED: 'user_role_removed',
    USER_PROFILE_UPDATED: 'user_profile_updated',
    USER_PROFILE_DELETED: 'user_profile_deleted',
    TOKEN_CREATED: 'token_created',
    TOKEN_REVOKED: 'token_revoked',
    TOKEN_EXPIRED: 'token_expired',
    CERTIFICATE_CREATED: 'certificate_created',
    CERTIFICATE_REVOKED: 'certificate_revoked',
    CERTIFICATE_EXPIRED: 'certificate_expired',
    KEY_CREATED: 'key_created',
    KEY_ROTATED: 'key_rotated',
    KEY_REVOKED: 'key_revoked',
    KEY_EXPIRED: 'key_expired',
    ENCRYPTION_PERFORMED: 'encryption_performed',
    DECRYPTION_PERFORMED: 'decryption_performed',
    BACKUP_CREATED: 'backup_created',
    BACKUP_RESTORED: 'backup_restored',
    BACKUP_DELETED: 'backup_deleted',
    AUDIT_LOG_CREATED: 'audit_log_created',
    AUDIT_LOG_ARCHIVED: 'audit_log_archived',
    AUDIT_LOG_DELETED: 'audit_log_deleted',
    COMPLIANCE_CHECK_PERFORMED: 'compliance_check_performed',
    COMPLIANCE_VIOLATION_DETECTED: 'compliance_violation_detected',
    SECURITY_SCAN_PERFORMED: 'security_scan_performed',
    SECURITY_VULNERABILITY_DETECTED: 'security_vulnerability_detected',
    VULNERABILITY_SCAN_PERFORMED: 'vulnerability_scan_performed',
    VULNERABILITY_DETECTED: 'vulnerability_detected',
    PENETRATION_TEST_PERFORMED: 'penetration_test_performed',
    PENETRATION_TEST_COMPLETED: 'penetration_test_completed',
    SECURITY_ASSESSMENT_PERFORMED: 'security_assessment_performed',
    SECURITY_ASSESSMENT_COMPLETED: 'security_assessment_completed',
    INCIDENT_DETECTED: 'incident_detected',
    INCIDENT_INVESTIGATED: 'incident_investigated',
    INCIDENT_CONTAINED: 'incident_contained',
    INCIDENT_RESOLVED: 'incident_resolved',
    INCIDENT_CLOSED: 'incident_closed',
    THREAT_DETECTED: 'threat_detected',
    THREAT_BLOCKED: 'threat_blocked',
    THREAT_QUARANTINED: 'threat_quarantined',
    POLICY_CREATED: 'policy_created',
    POLICY_UPDATED: 'policy_updated',
    POLICY_DELETED: 'policy_deleted',
    POLICY_VIOLATION_DETECTED: 'policy_violation_detected',
    ACCESS_REQUESTED: 'access_requested',
    ACCESS_GRANTED: 'access_granted',
    ACCESS_DENIED: 'access_denied',
    ACCESS_REVOKED: 'access_revoked',
    DATA_CLASSIFIED: 'data_classified',
    DATA_DECLASSIFIED: 'data_declassified',
    DATA_ENCRYPTED: 'data_encrypted',
    DATA_DECRYPTED: 'data_decrypted',
    DATA_BACKED_UP: 'data_backed_up',
    DATA_RESTORED: 'data_restored',
    DATA_DELETED: 'data_deleted',
    PRIVACY_VIOLATION_DETECTED: 'privacy_violation_detected',
    COMPLIANCE_VIOLATION_DETECTED: 'compliance_violation_detected',
    SECURITY_VIOLATION_DETECTED: 'security_violation_detected'
  },

  // Configuración de políticas de contraseñas
  PASSWORD_POLICY: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    PREVENT_COMMON_PASSWORDS: true,
    EXPIRATION_DAYS: 90,
    HISTORY_COUNT: 5,
    COMPLEXITY_SCORE: 3
  },

  // Configuración de sesiones
  SESSION_POLICY: {
    MAX_SESSIONS: 10,
    SESSION_TIMEOUT: 3600000, // 1 hora
    IDLE_TIMEOUT: 1800000, // 30 minutos
    ABSOLUTE_TIMEOUT: 86400000, // 24 horas
    CONCURRENT_SESSIONS: true,
    SESSION_FIXATION: true,
    SECURE_COOKIES: true,
    HTTP_ONLY: true,
    SAME_SITE: 'strict'
  },

  // Configuración MFA
  MFA_POLICY: {
    ENABLED: false,
    REQUIRED: false,
    GRACE_PERIOD: 86400000, // 24 horas
    BACKUP_CODES: true,
    REMEMBER_DEVICE: true,
    DEVICE_TRUST: true
  },

  // Configuración de auditoría
  AUDIT_POLICY: {
    ENABLED: true,
    RETENTION: 2592000000, // 30 días
    ENCRYPTION: true,
    INTEGRITY: true,
    REAL_TIME: true
  },

  // Configuración de cumplimiento
  COMPLIANCE_POLICY: {
    ENABLED: true,
    STANDARDS: ['ISO_27001', 'SOC_2', 'GDPR', 'HIPAA'],
    REPORTING: true,
    VALIDATION: true,
    CERTIFICATION: true
  },

  // Configuración de escaneo de seguridad
  SECURITY_SCANNING_POLICY: {
    ENABLED: true,
    VULNERABILITY_SCANNING: true,
    PENETRATION_TESTING: false,
    SECURITY_ASSESSMENT: true,
    THREAT_INTELLIGENCE: true
  },

  // Configuración de respuesta a incidentes
  INCIDENT_RESPONSE_POLICY: {
    ENABLED: true,
    AUTOMATED_RESPONSE: true,
    ESCALATION: true,
    NOTIFICATION: true,
    DOCUMENTATION: true
  },

  // Configuración de gestión de amenazas
  THREAT_MANAGEMENT_POLICY: {
    ENABLED: true,
    THREAT_DETECTION: true,
    THREAT_PREVENTION: true,
    THREAT_RESPONSE: true,
    THREAT_INTELLIGENCE: true
  },

  // Configuración de gestión de riesgos
  RISK_MANAGEMENT_POLICY: {
    ENABLED: true,
    RISK_ASSESSMENT: true,
    RISK_MITIGATION: true,
    RISK_MONITORING: true,
    RISK_REPORTING: true
  },

  // Configuración de gestión de accesos
  ACCESS_MANAGEMENT_POLICY: {
    ENABLED: true,
    ACCESS_REQUEST: true,
    ACCESS_APPROVAL: true,
    ACCESS_REVIEW: true,
    ACCESS_REVOCATION: true
  },

  // Configuración de gestión de identidades
  IDENTITY_MANAGEMENT_POLICY: {
    ENABLED: true,
    IDENTITY_PROVISIONING: true,
    IDENTITY_DEPROVISIONING: true,
    IDENTITY_SYNCHRONIZATION: true,
    IDENTITY_GOVERNANCE: true
  },

  // Configuración de gestión de datos
  DATA_MANAGEMENT_POLICY: {
    ENABLED: true,
    DATA_CLASSIFICATION: true,
    DATA_ENCRYPTION: true,
    DATA_BACKUP: true,
    DATA_RETENTION: true
  },

  // Configuración de privacidad
  PRIVACY_POLICY: {
    ENABLED: true,
    DATA_PROTECTION: true,
    PRIVACY_BY_DESIGN: true,
    PRIVACY_IMPACT_ASSESSMENT: true,
    PRIVACY_COMPLIANCE: true
  }
} as const;

// Exportar tipos derivados de las constantes
export type SecurityLevel = typeof SECURITY_CONSTANTS.SECURITY_LEVELS[keyof typeof SECURITY_CONSTANTS.SECURITY_LEVELS];
export type AuthenticationMethod = typeof SECURITY_CONSTANTS.AUTHENTICATION_METHODS[keyof typeof SECURITY_CONSTANTS.AUTHENTICATION_METHODS];
export type EncryptionLevel = typeof SECURITY_CONSTANTS.ENCRYPTION_LEVELS[keyof typeof SECURITY_CONSTANTS.ENCRYPTION_LEVELS];
export type PolicyType = typeof SECURITY_CONSTANTS.POLICY_TYPES[keyof typeof SECURITY_CONSTANTS.POLICY_TYPES];
export type RuleType = typeof SECURITY_CONSTANTS.RULE_TYPES[keyof typeof SECURITY_CONSTANTS.RULE_TYPES];
export type IncidentType = typeof SECURITY_CONSTANTS.INCIDENT_TYPES[keyof typeof SECURITY_CONSTANTS.INCIDENT_TYPES];
export type IncidentSeverity = typeof SECURITY_CONSTANTS.INCIDENT_SEVERITY[keyof typeof SECURITY_CONSTANTS.INCIDENT_SEVERITY];
export type IncidentStatus = typeof SECURITY_CONSTANTS.INCIDENT_STATUS[keyof typeof SECURITY_CONSTANTS.INCIDENT_STATUS];
export type AuthenticationType = typeof SECURITY_CONSTANTS.AUTHENTICATION_TYPES[keyof typeof SECURITY_CONSTANTS.AUTHENTICATION_TYPES];
export type MFAMethod = typeof SECURITY_CONSTANTS.MFA_METHODS[keyof typeof SECURITY_CONSTANTS.MFA_METHODS];
export type AuthorizationModel = typeof SECURITY_CONSTANTS.AUTHORIZATION_MODELS[keyof typeof SECURITY_CONSTANTS.AUTHORIZATION_MODELS];
export type AlgorithmType = typeof SECURITY_CONSTANTS.ALGORITHM_TYPES[keyof typeof SECURITY_CONSTANTS.ALGORITHM_TYPES];
export type KeyType = typeof SECURITY_CONSTANTS.KEY_TYPES[keyof typeof SECURITY_CONSTANTS.KEY_TYPES];
export type KeyStatus = typeof SECURITY_CONSTANTS.KEY_STATUS[keyof typeof SECURITY_CONSTANTS.KEY_STATUS];
export type KeyUsage = typeof SECURITY_CONSTANTS.KEY_USAGES[keyof typeof SECURITY_CONSTANTS.KEY_USAGES];
export type EncryptionPolicyType = typeof SECURITY_CONSTANTS.ENCRYPTION_POLICY_TYPES[keyof typeof SECURITY_CONSTANTS.ENCRYPTION_POLICY_TYPES];
export type BackupStrategy = typeof SECURITY_CONSTANTS.BACKUP_STRATEGIES[keyof typeof SECURITY_CONSTANTS.BACKUP_STRATEGIES];
export type RetentionPolicy = typeof SECURITY_CONSTANTS.RETENTION_POLICIES[keyof typeof SECURITY_CONSTANTS.RETENTION_POLICIES];