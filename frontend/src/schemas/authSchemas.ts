import { z } from 'zod'

// Common validation patterns
const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Formato de email inválido')
  .max(255, 'El email no puede exceder 255 caracteres')

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede exceder 128 caracteres')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'
  )

const nameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede exceder 100 caracteres')
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .max(128, 'La contraseña no puede exceder 128 caracteres'),
  remember: z.boolean().optional().default(false)
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register Schema
export const registerSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    organizationName: z
      .string()
      .min(2, 'El nombre de la organización debe tener al menos 2 caracteres')
      .max(200, 'El nombre de la organización no puede exceder 200 caracteres'),
    phone: z
      .string()
      .min(10, 'El teléfono debe tener al menos 10 dígitos')
      .max(20, 'El teléfono no puede exceder 20 caracteres')
      .regex(/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido')
      .optional(),
    acceptTerms: z
      .boolean()
      .refine(value => value === true, {
        message: 'Debes aceptar los términos y condiciones'
      })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// Password Reset Schema
export const passwordResetSchema = z.object({
  email: emailSchema
})

export type PasswordResetFormData = z.infer<typeof passwordResetSchema>

// Change Password Schema
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'La contraseña actual es requerida'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Confirma tu nueva contraseña')
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword']
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword']
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// Profile Update Schema
export const profileUpdateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  avatar: z
    .instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'El archivo debe ser menor a 5MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Solo se permiten archivos JPG, PNG o WebP'
    )
    .optional()
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

// Organization Settings Schema
export const organizationSettingsSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Formato de URL inválido')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'La dirección no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  logo: z
    .instanceof(File)
    .refine(file => file.size <= 2 * 1024 * 1024, 'El logo debe ser menor a 2MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type),
      'Solo se permiten archivos JPG, PNG o SVG'
    )
    .optional()
})

export type OrganizationSettingsFormData = z.infer<typeof organizationSettingsSchema>

// Two Factor Authentication Schema
export const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener exactamente 6 dígitos')
    .regex(/^\d{6}$/, 'El código solo puede contener números')
})

export type TwoFactorFormData = z.infer<typeof twoFactorSchema>

// Invitation Schema
export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'user', 'viewer'], {
    errorMap: () => ({ message: 'Selecciona un rol válido' })
  }),
  departments: z
    .array(z.string())
    .min(1, 'Selecciona al menos un departamento')
    .optional(),
  message: z
    .string()
    .max(500, 'El mensaje no puede exceder 500 caracteres')
    .optional()
    .or(z.literal(''))
})

export type InviteUserFormData = z.infer<typeof inviteUserSchema>

// Validation helpers
export const validateField = <T>(schema: z.ZodSchema<T>, value: unknown) => {
  try {
    schema.parse(value)
    return { isValid: true, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        isValid: false, 
        error: error.errors[0]?.message || 'Error de validación' 
      }
    }
    return { isValid: false, error: 'Error desconocido' }
  }
}

export const getFieldError = (errors: any, fieldName: string): string | undefined => {
  return errors?.[fieldName]?.message
}

// Common validation rules for reuse
export const commonValidations = {
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido'),
  url: z.string().url('Formato de URL inválido'),
  required: (message: string) => z.string().min(1, message),
  optional: z.string().optional().or(z.literal('')),
  file: (maxSize: number, allowedTypes: string[]) =>
    z
      .instanceof(File)
      .refine(file => file.size <= maxSize, `El archivo debe ser menor a ${Math.round(maxSize / 1024 / 1024)}MB`)
      .refine(
        file => allowedTypes.includes(file.type),
        `Solo se permiten archivos ${allowedTypes.join(', ')}`
      )
}