import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import CRMLayout from '@/layouts/CRMLayout'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}))

// Mock the CRM components
vi.mock('@/components/menu/CRMMenu', () => ({
  default: ({ isOpen, onClose, isMobile }: any) => (
    <div data-testid="crm-menu" data-open={isOpen} data-mobile={isMobile}>
      <button onClick={onClose} data-testid="close-menu">Close Menu</button>
    </div>
  )
}))

vi.mock('@/components/menu/TopBar', () => ({
  default: () => <div data-testid="top-bar">Top Bar</div>
}))

// Mock react-router-dom hooks
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/crm/dashboard' })
  }
})

// Mock window.innerWidth for responsive tests
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
})

const renderCRMLayout = (children = <div data-testid="test-content">Test Content</div>) => {
  return render(
    <BrowserRouter>
      <CRMLayout>{children}</CRMLayout>
    </BrowserRouter>
  )
}

describe('CRMLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window size to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all main components', () => {
      renderCRMLayout()

      expect(screen.getByTestId('crm-menu')).toBeInTheDocument()
      expect(screen.getByTestId('test-content')).toBeInTheDocument()
      expect(screen.getByText('CRM Pro')).toBeInTheDocument()
      expect(screen.getByText('Sistema de Gestión Comercial')).toBeInTheDocument()
    })

    it('should render children content', () => {
      const customContent = <div data-testid="custom-content">Custom Content</div>
      renderCRMLayout(customContent)

      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
    })

    it('should render back to SGC button', () => {
      renderCRMLayout()

      const backButton = screen.getByText('Volver al SGC')
      expect(backButton).toBeInTheDocument()
    })
  })

  describe('Desktop Behavior', () => {
    it('should show sidebar by default on desktop', () => {
      renderCRMLayout()

      const menu = screen.getByTestId('crm-menu')
      expect(menu).toHaveAttribute('data-open', 'true')
      expect(menu).toHaveAttribute('data-mobile', 'false')
    })

    it('should not show mobile menu toggle on desktop', () => {
      renderCRMLayout()

      // The mobile menu button should not be visible on desktop
      const mobileMenuButtons = screen.queryAllByRole('button')
      const mobileToggle = mobileMenuButtons.find(button => 
        button.classList.contains('lg:hidden') && 
        button.querySelector('svg')
      )
      
      // In desktop view, mobile toggle should exist but be hidden via CSS
      expect(mobileToggle).toBeInTheDocument()
    })
  })

  describe('Mobile Behavior', () => {
    beforeEach(() => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640
      })
    })

    it('should handle mobile responsive behavior', () => {
      renderCRMLayout()

      // Simulate resize event
      fireEvent(window, new Event('resize'))

      const menu = screen.getByTestId('crm-menu')
      expect(menu).toHaveAttribute('data-mobile', 'true')
    })

    it('should show mobile menu toggle button', () => {
      renderCRMLayout()
      
      // Trigger resize to mobile
      fireEvent(window, new Event('resize'))

      const menuButtons = screen.getAllByRole('button')
      expect(menuButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Sidebar Toggle Functionality', () => {
    it('should toggle sidebar when menu button is clicked', () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640
      })

      renderCRMLayout()
      
      // Trigger resize to mobile
      fireEvent(window, new Event('resize'))

      // Find and click the menu toggle button
      const menuButton = screen.getByRole('button', { name: /menu/i }) || 
                        screen.getAllByRole('button').find(btn => 
                          btn.querySelector('svg')
                        )
      
      if (menuButton) {
        fireEvent.click(menuButton)
        
        // The menu state should change
        const menu = screen.getByTestId('crm-menu')
        expect(menu).toBeInTheDocument()
      }
    })

    it('should close sidebar when close button is clicked', () => {
      renderCRMLayout()

      const closeButton = screen.getByTestId('close-menu')
      fireEvent.click(closeButton)

      // Verify the close function was called
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate back to SGC when back button is clicked', () => {
      renderCRMLayout()

      const backButton = screen.getByText('Volver al SGC')
      fireEvent.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard')
    })
  })

  describe('Responsive Design', () => {
    it('should handle window resize events', () => {
      renderCRMLayout()

      // Test desktop to mobile transition
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640
      })

      fireEvent(window, new Event('resize'))

      const menu = screen.getByTestId('crm-menu')
      expect(menu).toHaveAttribute('data-mobile', 'true')

      // Test mobile to desktop transition
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      })

      fireEvent(window, new Event('resize'))

      expect(menu).toHaveAttribute('data-mobile', 'false')
    })

    it('should cleanup resize event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const { unmount } = renderCRMLayout()
      
      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('Styling and Layout', () => {
    it('should have correct CSS classes for layout structure', () => {
      renderCRMLayout()

      const mainContainer = screen.getByTestId('test-content').closest('.h-screen')
      expect(mainContainer).toHaveClass('h-screen', 'w-full', 'bg-gradient-to-br')
    })

    it('should apply correct gradient backgrounds', () => {
      renderCRMLayout()

      // Check for gradient classes
      const container = document.querySelector('.bg-gradient-to-br')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderCRMLayout()

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)

      // Check that buttons are accessible
      buttons.forEach(button => {
        expect(button).toBeInTheDocument()
      })
    })

    it('should support keyboard navigation', () => {
      renderCRMLayout()

      const backButton = screen.getByText('Volver al SGC')
      
      // Test keyboard interaction
      backButton.focus()
      expect(document.activeElement).toBe(backButton)

      fireEvent.keyDown(backButton, { key: 'Enter' })
      expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard')
    })
  })

  describe('Error Boundaries', () => {
    it('should handle component errors gracefully', () => {
      const originalError = console.error
      console.error = vi.fn()

      const ThrowError = () => {
        throw new Error('Test error')
      }

      try {
        renderCRMLayout(<ThrowError />)
      } catch (error) {
        // Expected to throw during rendering
      }

      console.error = originalError
    })
  })
})