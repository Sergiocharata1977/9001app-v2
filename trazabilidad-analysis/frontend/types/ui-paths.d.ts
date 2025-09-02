// Declaraciones para diferentes variaciones de rutas de componentes UI
// Este archivo maneja las diferentes formas en que los componentes pueden ser importados

import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// Declaraciones para rutas relativas desde componentes
declare module '../ui/button' {
  export * from '@/components/ui/button';
}

declare module '../ui/input' {
  export * from '@/components/ui/input';
}

declare module '../ui/label' {
  export * from '@/components/ui/label';
}

declare module '../ui/select' {
  export * from '@/components/ui/select';
}

declare module '../ui/card' {
  export * from '@/components/ui/card';
}

declare module '../ui/badge' {
  export * from '@/components/ui/badge';
}

declare module '../ui/dialog' {
  export * from '@/components/ui/dialog';
}

declare module '../ui/textarea' {
  export * from '@/components/ui/textarea';
}

declare module '../ui/checkbox' {
  export * from '@/components/ui/checkbox';
}

declare module '../ui/alert' {
  export * from '@/components/ui/alert';
}

declare module '../ui/separator' {
  export * from '@/components/ui/separator';
}

declare module '../ui/avatar' {
  export * from '@/components/ui/avatar';
}

declare module '../ui/skeleton' {
  export * from '@/components/ui/skeleton';
}

declare module '../ui/table' {
  export * from '@/components/ui/table';
}

declare module '../ui/tabs' {
  export * from '@/components/ui/tabs';
}

declare module '../ui/progress' {
  export * from '@/components/ui/progress';
}

declare module '../ui/dropdown-menu' {
  export * from '@/components/ui/dropdown-menu';
}

declare module '../ui/popover' {
  export * from '@/components/ui/popover';
}

declare module '../ui/tooltip' {
  export * from '@/components/ui/tooltip';
}

declare module '../ui/scroll-area' {
  export * from '@/components/ui/scroll-area';
}

declare module '../ui/calendar' {
  export * from '@/components/ui/calendar';
}

declare module '../ui/collapsible' {
  export * from '@/components/ui/collapsible';
}

declare module '../ui/accordion' {
  export * from '@/components/ui/accordion';
}

declare module '../ui/radio-group' {
  export * from '@/components/ui/radio-group';
}

declare module '../ui/alert-dialog' {
  export * from '@/components/ui/alert-dialog';
}

declare module '../ui/toast' {
  export * from '@/components/ui/toast';
}

declare module '../ui/use-toast' {
  export * from '@/components/ui/use-toast';
}

// Declaraciones para rutas desde tres niveles arriba
declare module '../../../ui/button' {
  export * from '@/components/ui/button';
}

declare module '../../../ui/input' {
  export * from '@/components/ui/input';
}

declare module '../../../ui/label' {
  export * from '@/components/ui/label';
}

declare module '../../../ui/select' {
  export * from '@/components/ui/select';
}

declare module '../../../ui/card' {
  export * from '@/components/ui/card';
}

declare module '../../../ui/badge' {
  export * from '@/components/ui/badge';
}

// Declaraciones para componentes custom UI
declare module '../ui/DataTable' {
  export * from '@/components/ui/DataTable';
}

declare module '../ui/FormBuilder' {
  export * from '@/components/ui/FormBuilder';
}

declare module '../ui/GenericCard' {
  export * from '@/components/ui/GenericCard';
}

declare module '../ui/MermaidDiagram' {
  export * from '@/components/ui/MermaidDiagram';
}

declare module '../ui/Pagination' {
  export * from '@/components/ui/Pagination';
}

declare module '../ui/PlanBadge' {
  export * from '@/components/ui/PlanBadge';
}

declare module '../ui/confirm-dialog' {
  export * from '@/components/ui/confirm-dialog';
}

declare module '../../ui/DataTable' {
  export * from '@/components/ui/DataTable';
}

declare module '../../ui/FormBuilder' {
  export * from '@/components/ui/FormBuilder';
}

declare module '../../ui/GenericCard' {
  export * from '@/components/ui/GenericCard';
}

declare module '../../ui/MermaidDiagram' {
  export * from '@/components/ui/MermaidDiagram';
}

declare module '../../ui/Pagination' {
  export * from '@/components/ui/Pagination';
}

declare module '../../ui/PlanBadge' {
  export * from '@/components/ui/PlanBadge';
}

declare module '../../ui/confirm-dialog' {
  export * from '@/components/ui/confirm-dialog';
}

export {};