// Card Component
// Componente Card reutilizable para las vistas

import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  hoverable?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    hoverable = false, 
    clickable = false, 
    disabled = false,
    loading = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'relative overflow-hidden transition-all duration-200',
      {
        // Variants
        'bg-white border border-gray-200': variant === 'default',
        'bg-white border border-gray-300': variant === 'outlined',
        'bg-white border border-gray-200 shadow-md': variant === 'elevated',
        'bg-gray-50 border border-gray-100': variant === 'flat',
        
        // Interactive states
        'hover:shadow-lg hover:border-gray-300': hoverable && !disabled,
        'cursor-pointer': clickable && !disabled,
        'cursor-not-allowed opacity-50': disabled,
        
        // Loading state
        'animate-pulse': loading,
      },
      className
    );

    return (
      <div
        ref={ref}
        className={baseClasses}
        aria-disabled={disabled}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        {children}
      </div>
    );
  }
);

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  avatar?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, actions, avatar, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between p-4 border-b border-gray-100', className)}
        {...props}
      >
        <div className="flex items-center space-x-3">
          {avatar && (
            <div className="flex-shrink-0">
              {avatar}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 truncate">
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </div>
        {actions && (
          <div className="flex-shrink-0 ml-4">
            {actions}
          </div>
        )}
      </div>
    );
  }
);

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding = 'medium', children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      small: 'p-3',
      medium: 'p-4',
      large: 'p-6'
    };

    return (
      <div
        ref={ref}
        className={cn(paddingClasses[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, align = 'left', children, ...props }, ref) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center p-4 border-t border-gray-100',
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Card Image Component
export interface CardImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'ultra-wide';
  overlay?: React.ReactNode;
}

export const CardImage = forwardRef<HTMLImageElement, CardImageProps>(
  ({ className, aspectRatio = 'square', overlay, alt, ...props }, ref) => {
    const aspectRatioClasses = {
      square: 'aspect-square',
      video: 'aspect-video',
      wide: 'aspect-[16/9]',
      'ultra-wide': 'aspect-[21/9]'
    };

    return (
      <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio])}>
        <img
          ref={ref}
          alt={alt}
          className={cn('w-full h-full object-cover', className)}
          {...props}
        />
        {overlay && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            {overlay}
          </div>
        )}
      </div>
    );
  }
);

// Card Badge Component
export interface CardBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
}

export const CardBadge = forwardRef<HTMLSpanElement, CardBadgeProps>(
  ({ className, variant = 'default', size = 'medium', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800'
    };

    const sizeClasses = {
      small: 'px-2 py-1 text-xs',
      medium: 'px-3 py-1 text-sm',
      large: 'px-4 py-2 text-base'
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

// Card Stats Component
export interface CardStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  label: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
}

export const CardStats = forwardRef<HTMLDivElement, CardStatsProps>(
  ({ className, value, label, change, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between p-4', className)}
        {...props}
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="flex-shrink-0 text-gray-400">
              {icon}
            </div>
          )}
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
            {change && (
              <div className="flex items-center mt-1">
                <span
                  className={cn(
                    'text-xs font-medium',
                    change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change.type === 'increase' ? '↗' : '↘'} {Math.abs(change.value)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Set display names
Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';
CardImage.displayName = 'CardImage';
CardBadge.displayName = 'CardBadge';
CardStats.displayName = 'CardStats';

// Export all components
export default {
  Card,
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
  Image: CardImage,
  Badge: CardBadge,
  Stats: CardStats
};