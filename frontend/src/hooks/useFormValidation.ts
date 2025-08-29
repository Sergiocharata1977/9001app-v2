import { useForm, UseFormProps, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

interface UseFormValidationOptions<T extends FieldValues> extends UseFormProps<T> {
  schema: z.ZodSchema<T>
  onSuccess?: (data: T) => void | Promise<void>
  onError?: (error: any) => void
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  transformData?: (data: T) => T | Promise<T>
}

export function useFormValidation<T extends FieldValues>({
  schema,
  onSuccess,
  onError,
  showSuccessToast = false,
  showErrorToast = true,
  successMessage = 'Operación exitosa',
  transformData,
  ...formOptions
}: UseFormValidationOptions<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)

  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    ...formOptions
  })

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setError,
    clearErrors,
    reset,
    watch,
    trigger
  } = form

  // Real-time validation for specific fields
  const validateField = useCallback(async (fieldName: Path<T>) => {
    try {
      await trigger(fieldName)
    } catch (error) {
      console.warn('Field validation error:', error)
    }
  }, [trigger])

  // Validate all fields
  const validateAllFields = useCallback(async () => {
    return await trigger()
  }, [trigger])

  // Enhanced submit handler with loading states and error handling
  const onSubmit = handleSubmit(async (data) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitCount(prev => prev + 1)

    try {
      // Transform data if transformer provided
      const finalData = transformData ? await transformData(data) : data

      // Additional validation before submission
      const validationResult = schema.safeParse(finalData)
      if (!validationResult.success) {
        validationResult.error.errors.forEach(error => {
          const fieldName = error.path.join('.') as Path<T>
          setError(fieldName, {
            type: 'manual',
            message: error.message
          })
        })
        throw new Error('Validation failed')
      }

      // Call success handler
      await onSuccess?.(finalData)

      if (showSuccessToast) {
        toast.success(successMessage)
      }
    } catch (error: any) {
      console.error('Form submission error:', error)
      
      if (showErrorToast) {
        const errorMessage = error?.response?.data?.message || 
                            error?.message || 
                            'Error al procesar la solicitud'
        toast.error(errorMessage)
      }

      // Handle API validation errors
      if (error?.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          setError(field as Path<T>, {
            type: 'server',
            message: message as string
          })
        })
      }

      onError?.(error)
    } finally {
      setIsSubmitting(false)
    }
  })

  // Reset form with optional data
  const resetForm = useCallback((data?: Partial<T>) => {
    reset(data)
    clearErrors()
    setSubmitCount(0)
  }, [reset, clearErrors])

  // Get field error message
  const getFieldError = useCallback((fieldName: Path<T>): string | undefined => {
    return errors[fieldName]?.message as string | undefined
  }, [errors])

  // Check if field has error
  const hasFieldError = useCallback((fieldName: Path<T>): boolean => {
    return !!errors[fieldName]
  }, [errors])

  // Get field state (for styling)
  const getFieldState = useCallback((fieldName: Path<T>) => {
    const hasError = hasFieldError(fieldName)
    const fieldValue = watch(fieldName)
    const isEmpty = !fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')
    
    return {
      hasError,
      isEmpty,
      isValid: !hasError && !isEmpty,
      isDirty: isDirty
    }
  }, [hasFieldError, watch, isDirty])

  // Debounced validation
  const [debouncedValidation, setDebouncedValidation] = useState<NodeJS.Timeout>()

  const debouncedValidateField = useCallback((fieldName: Path<T>, delay = 300) => {
    if (debouncedValidation) {
      clearTimeout(debouncedValidation)
    }

    const timeout = setTimeout(() => {
      validateField(fieldName)
    }, delay)

    setDebouncedValidation(timeout)
  }, [validateField, debouncedValidation])

  // Cleanup debounced validation on unmount
  useEffect(() => {
    return () => {
      if (debouncedValidation) {
        clearTimeout(debouncedValidation)
      }
    }
  }, [debouncedValidation])

  // Auto-save functionality
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout>()
  
  const enableAutoSave = useCallback((
    saveFunction: (data: T) => void | Promise<void>,
    delay = 2000
  ) => {
    const watchedValues = watch()

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }

    if (isDirty && isValid) {
      const timeout = setTimeout(async () => {
        try {
          const validationResult = schema.safeParse(watchedValues)
          if (validationResult.success) {
            await saveFunction(validationResult.data)
            toast.success('Guardado automático', { duration: 2000 })
          }
        } catch (error) {
          console.warn('Auto-save failed:', error)
        }
      }, delay)

      setAutoSaveTimeout(timeout)
    }
  }, [watch, isDirty, isValid, schema, autoSaveTimeout])

  // Cleanup auto-save on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
    }
  }, [autoSaveTimeout])

  // Form state summary
  const formState = {
    isSubmitting,
    isValid,
    isDirty,
    hasErrors: Object.keys(errors).length > 0,
    submitCount,
    canSubmit: isValid && !isSubmitting
  }

  return {
    // React Hook Form methods
    ...form,
    
    // Enhanced methods
    onSubmit,
    resetForm,
    validateField,
    validateAllFields,
    debouncedValidateField,
    enableAutoSave,
    
    // Helper methods
    getFieldError,
    hasFieldError,
    getFieldState,
    
    // State
    formState,
    isSubmitting
  }
}

// Hook for multi-step forms
export function useMultiStepForm<T extends FieldValues>(
  steps: { schema: z.ZodSchema<any>; name: string }[],
  finalSchema: z.ZodSchema<T>
) {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepData, setStepData] = useState<Record<number, any>>({})

  const currentStepConfig = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const form = useFormValidation({
    schema: currentStepConfig.schema,
    onSuccess: async (data) => {
      setStepData(prev => ({ ...prev, [currentStep]: data }))
      
      if (isLastStep) {
        // Combine all step data and validate against final schema
        const allData = { ...stepData, [currentStep]: data }
        const combinedData = Object.values(allData).reduce((acc, curr) => ({ ...acc, ...curr }), {})
        
        const finalValidation = finalSchema.safeParse(combinedData)
        if (finalValidation.success) {
          return combinedData as T
        } else {
          throw new Error('Final validation failed')
        }
      } else {
        setCurrentStep(prev => prev + 1)
      }
    }
  })

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }, [isFirstStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step)
    }
  }, [steps.length])

  const resetMultiStepForm = useCallback(() => {
    setCurrentStep(0)
    setStepData({})
    form.resetForm()
  }, [form])

  return {
    ...form,
    currentStep,
    currentStepName: currentStepConfig.name,
    isLastStep,
    isFirstStep,
    totalSteps: steps.length,
    stepData,
    goToPreviousStep,
    goToStep,
    resetMultiStepForm,
    progress: ((currentStep + 1) / steps.length) * 100
  }
}

// Hook for form arrays (dynamic forms)
export function useFormArray<T extends FieldValues>(
  name: Path<T>,
  defaultItem: any,
  minItems = 0,
  maxItems = Infinity
) {
  const form = useFormValidation({ schema: z.any() })
  const { control, watch } = form

  const items = watch(name) || []

  const addItem = useCallback(() => {
    if (items.length < maxItems) {
      const newItems = [...items, { ...defaultItem }]
      form.setValue(name, newItems)
    }
  }, [items, maxItems, defaultItem, form, name])

  const removeItem = useCallback((index: number) => {
    if (items.length > minItems) {
      const newItems = items.filter((_: any, i: number) => i !== index)
      form.setValue(name, newItems)
    }
  }, [items, minItems, form, name])

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    const newItems = [...items]
    const [movedItem] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, movedItem)
    form.setValue(name, newItems)
  }, [items, form, name])

  return {
    ...form,
    items,
    addItem,
    removeItem,
    moveItem,
    canAddItem: items.length < maxItems,
    canRemoveItem: items.length > minItems
  }
}