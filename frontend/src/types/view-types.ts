// View Types for Standardized UI Components
// Tipos para vistas estandarizadas del sistema

import { ViewMode, ViewConfig } from './mongodb-types';

// Base Component Props
export interface BaseViewProps<T = any> {
  data: T[];
  loading: boolean;
  error?: string;
  onRefresh?: () => void;
  onItemClick?: (item: T) => void;
  onItemEdit?: (item: T) => void;
  onItemDelete?: (item: T) => void;
  className?: string;
}

// Card View Types
export interface CardViewProps<T = any> extends BaseViewProps<T> {
  renderCard: (item: T) => React.ReactNode;
  columns?: number;
  gap?: number;
  cardClassName?: string;
  emptyState?: React.ReactNode;
}

export interface CardViewConfig {
  showImage?: boolean;
  imageField?: string;
  titleField: string;
  subtitleFields: string[];
  actionButtons: ActionButton[];
  highlightFields: HighlightField[];
}

export interface ActionButton {
  label: string;
  icon?: string;
  action: 'view' | 'edit' | 'delete' | 'custom';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: (item: any) => void;
}

export interface HighlightField {
  field: string;
  type: 'text' | 'badge' | 'status' | 'number' | 'date';
  label?: string;
  className?: string;
}

// List View Types
export interface ListViewProps<T = any> extends BaseViewProps<T> {
  columns: ColumnConfig[];
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  onFilterChange?: (filters: FilterConfig[]) => void;
}

export interface ColumnConfig {
  key: string;
  title: string;
  type: 'text' | 'number' | 'date' | 'status' | 'badge' | 'avatar' | 'actions' | 'custom';
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: any) => React.ReactNode;
  className?: string;
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex' | 'contains';
  value: any;
  label?: string;
}

// Calendar View Types
export interface CalendarViewProps<T = any> extends BaseViewProps<T> {
  dateField: string;
  titleField: string;
  descriptionField?: string;
  startField?: string;
  endField?: string;
  colorField?: string;
  view: CalendarViewType;
  onDateClick?: (date: Date, events: T[]) => void;
  onEventClick?: (event: T) => void;
  onDateRangeChange?: (start: Date, end: Date) => void;
}

export type CalendarViewType = 'day' | 'week' | 'month' | 'year';

export interface CalendarEvent<T = any> {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end?: Date;
  color?: string;
  data: T;
}

export interface CalendarViewConfig {
  defaultView: CalendarViewType;
  showWeekends: boolean;
  businessHours: {
    start: string;
    end: string;
    daysOfWeek: number[];
  };
  slotDuration: number;
  slotMinTime: string;
  slotMaxTime: string;
}

// Kanban View Types
export interface KanbanViewProps<T = any> extends BaseViewProps<T> {
  columns: KanbanColumn[];
  groupField: string;
  sortField?: string;
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string) => void;
  onColumnAdd?: (column: KanbanColumn) => void;
  onColumnEdit?: (columnId: string, updates: Partial<KanbanColumn>) => void;
  onColumnDelete?: (columnId: string) => void;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  maxCards?: number;
  allowDrop: boolean;
  status: string;
  order: number;
}

export interface KanbanCard<T = any> {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dueDate?: Date;
  tags: string[];
  data: T;
}

export interface KanbanViewConfig {
  showCardCount: boolean;
  allowDragAndDrop: boolean;
  allowColumnReorder: boolean;
  maxCardsPerColumn?: number;
  cardTemplate: (card: KanbanCard) => React.ReactNode;
}

// View Selector Types
export interface ViewSelectorProps {
  currentView: ViewMode;
  availableViews: ViewMode[];
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export interface ViewModeOption {
  value: ViewMode;
  label: string;
  icon: string;
  description: string;
}

// Pagination Types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  className?: string;
}

// Search and Filter Types
export interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: FilterConfig[];
  onFilterChange: (filters: FilterConfig[]) => void;
  availableFilters: FilterOption[];
  className?: string;
}

export interface FilterOption {
  field: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'dateRange' | 'number' | 'boolean';
  options?: { value: any; label: string }[];
  placeholder?: string;
}

// Bulk Actions Types
export interface BulkActionsProps {
  selectedItems: string[];
  onClearSelection: () => void;
  actions: BulkAction[];
  className?: string;
}

export interface BulkAction {
  label: string;
  icon?: string;
  action: (itemIds: string[]) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

// Empty State Types
export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

// Loading States
export interface LoadingStateProps {
  type: 'skeleton' | 'spinner' | 'dots' | 'pulse';
  count?: number;
  className?: string;
}

// Error State Types
export interface ErrorStateProps {
  title: string;
  message: string;
  retry?: () => void;
  className?: string;
}

// Responsive Breakpoints
export interface ResponsiveConfig {
  mobile: {
    columns: number;
    cardSize: 'small' | 'medium' | 'large';
    showFilters: boolean;
  };
  tablet: {
    columns: number;
    cardSize: 'small' | 'medium' | 'large';
    showFilters: boolean;
  };
  desktop: {
    columns: number;
    cardSize: 'small' | 'medium' | 'large';
    showFilters: boolean;
  };
}

// Accessibility Types
export interface AccessibilityProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  keyboardNavigation?: boolean;
}

// Animation Types
export interface AnimationProps {
  enter?: string;
  exit?: string;
  duration?: number;
  delay?: number;
  easing?: string;
}

// Export all types
export type {
  CardViewProps, CardViewConfig, ActionButton, HighlightField,
  ListViewProps, ColumnConfig, FilterConfig,
  CalendarViewProps, CalendarEvent, CalendarViewConfig,
  KanbanViewProps, KanbanColumn, KanbanCard, KanbanViewConfig,
  ViewSelectorProps, ViewModeOption,
  PaginationProps, SearchFilterProps, FilterOption,
  BulkActionsProps, BulkAction,
  EmptyStateProps, LoadingStateProps, ErrorStateProps,
  ResponsiveConfig, AccessibilityProps, AnimationProps
};