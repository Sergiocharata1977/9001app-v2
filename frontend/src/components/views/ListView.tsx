// List View Component
// Componente de vista de lista reutilizable y estandarizado

import React, { useState, useMemo } from 'react';
import { 
  ListViewProps, 
  ColumnConfig, 
  FilterConfig 
} from '../../types/view-types';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Table } from '../ui/Table';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { Pagination } from '../common/Pagination';
import { BulkActions } from '../common/BulkActions';
import { SearchFilter } from '../common/SearchFilter';
import { cn } from '../../utils/cn';
import { formatDate, formatCurrency, formatNumber } from '../../utils/formatters';

interface ListViewState {
  selectedItems: Set<string>;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  filters: FilterConfig[];
  searchTerm: string;
  currentPage: number;
  pageSize: number;
}

export function ListView<T extends { _id: string }>({
  data,
  loading,
  error,
  onRefresh,
  onItemClick,
  onItemEdit,
  onItemDelete,
  columns,
  sortable = true,
  filterable = true,
  selectable = true,
  onSelectionChange,
  onSortChange,
  onFilterChange,
  className
}: ListViewProps<T>) {
  const [state, setState] = useState<ListViewState>({
    selectedItems: new Set(),
    sortField: '',
    sortDirection: 'asc',
    filters: [],
    searchTerm: '',
    currentPage: 1,
    pageSize: 10
  });

  // Responsive handling
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  // Handle item selection
  const handleItemSelect = (itemId: string) => {
    const newSelected = new Set(state.selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setState(prev => ({ ...prev, selectedItems: newSelected }));
    onSelectionChange?.(Array.from(newSelected));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (state.selectedItems.size === data.length) {
      setState(prev => ({ ...prev, selectedItems: new Set() }));
      onSelectionChange?.([]);
    } else {
      const allIds = data.map(item => item._id);
      setState(prev => ({ ...prev, selectedItems: new Set(allIds) }));
      onSelectionChange?.(allIds);
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (!sortable) return;
    
    const direction = state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc';
    setState(prev => ({ 
      ...prev, 
      sortField: field, 
      sortDirection: direction 
    }));
    onSortChange?.(field, direction);
  };

  // Handle filtering
  const handleFilterChange = (filters: FilterConfig[]) => {
    setState(prev => ({ ...prev, filters, currentPage: 1 }));
    onFilterChange?.(filters);
  };

  // Handle search
  const handleSearchChange = (searchTerm: string) => {
    setState(prev => ({ ...prev, searchTerm, currentPage: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setState(prev => ({ ...prev, pageSize, currentPage: 1 }));
  };

  // Render cell content based on column type
  const renderCell = (item: T, column: ColumnConfig) => {
    const value = column.key.split('.').reduce((obj: any, key) => obj?.[key], item);

    if (column.render) {
      return column.render(value, item);
    }

    switch (column.type) {
      case 'text':
        return <span className="text-sm text-gray-900">{value || '-'}</span>;
      
      case 'number':
        return <span className="text-sm font-medium text-gray-900">{formatNumber(value)}</span>;
      
      case 'date':
        return <span className="text-sm text-gray-600">{formatDate(value)}</span>;
      
      case 'status':
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          pending: 'bg-yellow-100 text-yellow-800',
          error: 'bg-red-100 text-red-800',
          completed: 'bg-blue-100 text-blue-800',
          cancelled: 'bg-red-100 text-red-800'
        };
        return (
          <Badge 
            variant={value === 'active' ? 'success' : 'secondary'}
            className={statusColors[value as keyof typeof statusColors] || statusColors.inactive}
          >
            {value}
          </Badge>
        );
      
      case 'badge':
        return <Badge variant="secondary">{value}</Badge>;
      
      case 'avatar':
        return (
          <Avatar
            src={value}
            alt={item._id}
            className="w-8 h-8"
          />
        );
      
      case 'actions':
        return (
          <div className="flex items-center space-x-2">
            {onItemClick && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onItemClick(item);
                }}
              >
                Ver
              </Button>
            )}
            {onItemEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onItemEdit(item);
                }}
              >
                Editar
              </Button>
            )}
            {onItemDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('¿Está seguro de que desea eliminar este elemento?')) {
                    onItemDelete(item);
                  }
                }}
              >
                Eliminar
              </Button>
            )}
          </div>
        );
      
      default:
        return <span className="text-sm text-gray-900">{value || '-'}</span>;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex space-x-4 p-4 bg-white rounded-lg">
              {columns.map((column, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  className="h-4 flex-1" 
                  style={{ width: column.width }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="primary">
              Reintentar
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <EmptyState
          title="No hay datos disponibles"
          description="No se encontraron elementos para mostrar"
          icon="inbox"
          action={onRefresh ? {
            label: "Recargar",
            onClick: onRefresh,
            variant: "primary"
          } : undefined}
        />
      </div>
    );
  }

  // Calculate pagination
  const startIndex = (state.currentPage - 1) * state.pageSize;
  const endIndex = startIndex + state.pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / state.pageSize);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters */}
      {filterable && (
        <SearchFilter
          searchTerm={state.searchTerm}
          onSearchChange={handleSearchChange}
          filters={state.filters}
          onFilterChange={handleFilterChange}
          availableFilters={columns
            .filter(col => col.filterable)
            .map(col => ({
              field: col.key,
              label: col.title,
              type: 'text',
              placeholder: `Buscar por ${col.title.toLowerCase()}...`
            }))}
        />
      )}

      {/* Bulk Actions */}
      {selectable && state.selectedItems.size > 0 && (
        <BulkActions
          selectedItems={Array.from(state.selectedItems)}
          onClearSelection={() => {
            setState(prev => ({ ...prev, selectedItems: new Set() }));
            onSelectionChange?.([]);
          }}
          actions={[
            {
              label: "Eliminar seleccionados",
              action: (ids) => {
                if (confirm(`¿Está seguro de que desea eliminar ${ids.length} elementos?`)) {
                  ids.forEach(id => {
                    const item = data.find(d => d._id === id);
                    if (item && onItemDelete) {
                      onItemDelete(item);
                    }
                  });
                }
              },
              variant: "danger"
            },
            {
              label: "Exportar seleccionados",
              action: (ids) => {
                console.log('Export selected items:', ids);
              },
              variant: "secondary"
            }
          ]}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              {selectable && (
                <Table.HeaderCell className="w-12">
                  <input
                    type="checkbox"
                    checked={state.selectedItems.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </Table.HeaderCell>
              )}
              {columns.map((column) => (
                <Table.HeaderCell
                  key={column.key}
                  className={cn(column.className, {
                    'cursor-pointer hover:bg-gray-50': sortable && column.sortable
                  })}
                  onClick={() => handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {sortable && column.sortable && state.sortField === column.key && (
                      <span className="text-gray-400">
                        {state.sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedData.map((item) => (
              <Table.Row
                key={item._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onItemClick?.(item)}
              >
                {selectable && (
                  <Table.Cell>
                    <input
                      type="checkbox"
                      checked={state.selectedItems.has(item._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleItemSelect(item._id);
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </Table.Cell>
                )}
                {columns.map((column) => (
                  <Table.Cell key={column.key} className={column.className}>
                    {renderCell(item, column)}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={state.currentPage}
          totalPages={totalPages}
          totalItems={data.length}
          pageSize={state.pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSizeSelector
        />
      )}

      {/* Mobile view for small screens */}
      {isMobile && (
        <div className="space-y-3 sm:hidden">
          {paginatedData.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow p-4 space-y-2 cursor-pointer hover:bg-gray-50"
              onClick={() => onItemClick?.(item)}
            >
              {selectable && (
                <div className="flex items-center justify-between">
                  <input
                    type="checkbox"
                    checked={state.selectedItems.has(item._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleItemSelect(item._id);
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    {onItemEdit && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemEdit(item);
                        }}
                      >
                        Editar
                      </Button>
                    )}
                    {onItemDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('¿Está seguro de que desea eliminar este elemento?')) {
                            onItemDelete(item);
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              )}
              {columns.map((column) => (
                <div key={column.key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">{column.title}:</span>
                  <div className="text-sm text-gray-900">
                    {renderCell(item, column)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Export default list view
export default ListView;