import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { QueryProvider } from './hooks/useQueryClient';
import './index.css';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <div className="App">
              <Routes>
                {/* Usar AppRoutes, toda la app va bajo /app y públicas fuera */}
                <Route path="/*" element={<AppRoutes />} />
              </Routes>
              
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;