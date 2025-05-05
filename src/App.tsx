import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CssBaseline, GlobalStyles, useTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import GuestList from './components/GuestList';
import SignIn from './components/SignIn';
import AddGuestForm from './components/AddGuestForm';
import Settings from './components/Settings';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import BulkImport from './components/BulkImport';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
    },
  },
});

const GlobalStylesWrapper = () => {
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();

  return (
    <GlobalStyles
      styles={{
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: theme.palette.primary.main,
          borderRadius: '4px',
          '&:hover': {
            background: theme.palette.primary.dark,
          },
        },
        body: {
          margin: 0,
          background: isDarkMode
            ? 'linear-gradient(45deg, #1A202C, #2D3748)'
            : 'linear-gradient(45deg, #F7FAFC, #FFFFFF)',
          minHeight: '100vh',
        },
      }}
    />
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return null; // or a loading spinner
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/signin" />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CssBaseline />
        <GlobalStylesWrapper />
        <Router basename={process.env.NODE_ENV === 'production' ? '/shaadi' : ''}>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="guests" element={<GuestList />} />
              <Route path="add-guest" element={<AddGuestForm />} />
              <Route path="settings" element={<Settings />} />
              <Route path="bulk-import" element={<BulkImport />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
