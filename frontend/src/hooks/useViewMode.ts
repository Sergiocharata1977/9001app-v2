// View Mode Hook
// Hook personalizado para manejar el estado de las vistas y sus configuraciones

import { useState, useEffect, useCallback } from 'react';
import { ViewMode, ViewConfig } from '../types/view-types';
import { useLocalStorage } from './useLocalStorage';

interface ViewModeState {
  currentView: ViewMode;
  settings: Record<string, any>;
  availableViews: ViewMode[];
  isLoading: boolean;
}

interface UseViewModeOptions {
  defaultView?: ViewMode;
  availableViews?: ViewMode[];
  moduleName?: string;
  settingsKey?: string;
  onViewChange?: (view: ViewMode) => void;
  onSettingsChange?: (settings: Record<string, any>) => void;
}

interface UseViewModeReturn {
  currentView: ViewMode;
  settings: Record<string, any>;
  availableViews: ViewMode[];
  isLoading: boolean;
  setCurrentView: (view: ViewMode) => void;
  updateSettings: (newSettings: Record<string, any>) => void;
  resetSettings: () => void;
  getViewConfig: () => ViewConfig;
  hasView: (view: ViewMode) => boolean;
  switchToNextView: () => void;
  switchToPreviousView: () => void;
}

// Default settings for each view mode
const defaultViewSettings: Record<ViewMode, Record<string, any>> = {
  card: {
    columns: 3,
    cardSize: 'medium',
    gap: 4,
    showImage: true,
    showActions: true
  },
  list: {
    pageSize: 10,
    sortable: true,
    filterable: true,
    selectable: true,
    showActions: true,
    defaultSort: 'createdAt',
    defaultSortDirection: 'desc'
  },
  calendar: {
    defaultView: 'month',
    showWeekends: true,
    businessHours: {
      start: '09:00',
      end: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5]
    },
    slotDuration: 30
  },
  kanban: {
    showCardCount: true,
    allowDragAndDrop: true,
    allowColumnReorder: true,
    maxCardsPerColumn: 50,
    defaultGrouping: 'status'
  }
};

export function useViewMode(options: UseViewModeOptions = {}): UseViewModeReturn {
  const {
    defaultView = 'list',
    availableViews = ['card', 'list', 'calendar', 'kanban'],
    moduleName = 'default',
    settingsKey = 'viewSettings',
    onViewChange,
    onSettingsChange
  } = options;

  // Local storage keys
  const viewKey = `${moduleName}_currentView`;
  const settingsKeyWithModule = `${moduleName}_${settingsKey}`;

  // Local storage hooks
  const [storedView, setStoredView] = useLocalStorage<ViewMode>(viewKey, defaultView);
  const [storedSettings, setStoredSettings] = useLocalStorage<Record<string, any>>(
    settingsKeyWithModule,
    defaultViewSettings[defaultView]
  );

  // State
  const [state, setState] = useState<ViewModeState>({
    currentView: storedView,
    settings: storedSettings,
    availableViews: availableViews.filter(view => availableViews.includes(view)),
    isLoading: false
  });

  // Validate current view against available views
  useEffect(() => {
    if (!availableViews.includes(state.currentView)) {
      const newView = availableViews[0] || defaultView;
      setCurrentView(newView);
    }
  }, [availableViews, state.currentView, defaultView]);

  // Set current view
  const setCurrentView = useCallback((view: ViewMode) => {
    if (!availableViews.includes(view)) {
      console.warn(`View mode "${view}" is not available for this module`);
      return;
    }

    setState(prev => ({ ...prev, currentView: view }));
    setStoredView(view);
    onViewChange?.(view);

    // Load settings for the new view if they don't exist
    if (!storedSettings[view]) {
      const newSettings = {
        ...storedSettings,
        [view]: defaultViewSettings[view]
      };
      setStoredSettings(newSettings);
      setState(prev => ({ ...prev, settings: newSettings }));
    } else {
      setState(prev => ({ ...prev, settings: { ...storedSettings, [view]: storedSettings[view] } }));
    }
  }, [availableViews, storedSettings, setStoredView, setStoredSettings, onViewChange]);

  // Update settings
  const updateSettings = useCallback((newSettings: Record<string, any>) => {
    const updatedSettings = {
      ...storedSettings,
      [state.currentView]: {
        ...storedSettings[state.currentView],
        ...newSettings
      }
    };

    setState(prev => ({ ...prev, settings: updatedSettings }));
    setStoredSettings(updatedSettings);
    onSettingsChange?.(newSettings);
  }, [state.currentView, storedSettings, setStoredSettings, onSettingsChange]);

  // Reset settings for current view
  const resetSettings = useCallback(() => {
    const resetSettings = {
      ...storedSettings,
      [state.currentView]: defaultViewSettings[state.currentView]
    };

    setState(prev => ({ ...prev, settings: resetSettings }));
    setStoredSettings(resetSettings);
    onSettingsChange?.(defaultViewSettings[state.currentView]);
  }, [state.currentView, storedSettings, setStoredSettings, onSettingsChange]);

  // Get current view configuration
  const getViewConfig = useCallback((): ViewConfig => {
    return {
      mode: state.currentView,
      columns: state.settings.columns || [],
      filters: state.settings.filters || [],
      sort: {
        field: state.settings.defaultSort || 'createdAt',
        direction: state.settings.defaultSortDirection || 'desc'
      },
      pagination: {
        page: 1,
        limit: state.settings.pageSize || 10,
        total: 0
      }
    };
  }, [state.currentView, state.settings]);

  // Check if view is available
  const hasView = useCallback((view: ViewMode): boolean => {
    return availableViews.includes(view);
  }, [availableViews]);

  // Switch to next available view
  const switchToNextView = useCallback(() => {
    const currentIndex = availableViews.indexOf(state.currentView);
    const nextIndex = (currentIndex + 1) % availableViews.length;
    setCurrentView(availableViews[nextIndex]);
  }, [availableViews, state.currentView, setCurrentView]);

  // Switch to previous available view
  const switchToPreviousView = useCallback(() => {
    const currentIndex = availableViews.indexOf(state.currentView);
    const prevIndex = currentIndex === 0 ? availableViews.length - 1 : currentIndex - 1;
    setCurrentView(availableViews[prevIndex]);
  }, [availableViews, state.currentView, setCurrentView]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + V to cycle through views
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        switchToNextView();
      }

      // Ctrl/Cmd + Shift + V to cycle backwards
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        switchToPreviousView();
      }

      // Number keys 1-4 to switch to specific views
      if (event.key >= '1' && event.key <= '4') {
        const viewIndex = parseInt(event.key) - 1;
        if (availableViews[viewIndex]) {
          event.preventDefault();
          setCurrentView(availableViews[viewIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableViews, setCurrentView, switchToNextView, switchToPreviousView]);

  return {
    currentView: state.currentView,
    settings: state.settings[state.currentView] || defaultViewSettings[state.currentView],
    availableViews: state.availableViews,
    isLoading: state.isLoading,
    setCurrentView,
    updateSettings,
    resetSettings,
    getViewConfig,
    hasView,
    switchToNextView,
    switchToPreviousView
  };
}

// Hook for managing view transitions
export function useViewTransition(duration: number = 300) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = useCallback(async (callback: () => void) => {
    setIsTransitioning(true);
    
    // Wait for transition to complete
    await new Promise(resolve => setTimeout(resolve, duration));
    
    callback();
    
    setIsTransitioning(false);
  }, [duration]);

  return {
    isTransitioning,
    transitionTo
  };
}

// Hook for view analytics
export function useViewAnalytics(moduleName: string) {
  const trackViewChange = useCallback((fromView: ViewMode, toView: ViewMode) => {
    // Track view changes for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_change', {
        event_category: 'user_interaction',
        event_label: moduleName,
        custom_parameters: {
          from_view: fromView,
          to_view: toView
        }
      });
    }
  }, [moduleName]);

  const trackViewUsage = useCallback((view: ViewMode, action: string) => {
    // Track specific view actions
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_action', {
        event_category: 'user_interaction',
        event_label: moduleName,
        custom_parameters: {
          view: view,
          action: action
        }
      });
    }
  }, [moduleName]);

  return {
    trackViewChange,
    trackViewUsage
  };
}

// Export types
export type { UseViewModeOptions, UseViewModeReturn };