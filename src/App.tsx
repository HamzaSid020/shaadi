import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { CssBaseline, GlobalStyles, useTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Budget from './pages/Budget';
import Tasks from './pages/Tasks';
import Guests from './pages/Guests';
import Vendors from './pages/Vendors';
import Gifts from './pages/Gifts';
import Outfits from './pages/Outfits';
import Seating from './pages/Seating';
import CheckIn from './pages/CheckIn';
import Documents from './pages/Documents';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ActivityLog from './pages/ActivityLog';
import UserManagement from './pages/UserManagement';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { AdminRoute, OrganizerRoute } from './components/ProtectedRoute';
import { PERMISSIONS } from './types/auth';
import WeddingSetupWizard from './pages/WeddingSetupWizard';
import ErrorBoundary from './components/ErrorBoundary';
import InviteLogin from './pages/InviteLogin';
import SeatingArrangement from './pages/SeatingArrangement';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/invite',
    element: <InviteLogin />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout>
          <Outlet />
        </Layout>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'wedding-setup',
        element: (
          <AdminRoute>
            <WeddingSetupWizard />
          </AdminRoute>
        ),
      },
      {
        path: 'events',
        element: (
          <ProtectedRoute requiredPermission={PERMISSIONS.EVENTS.READ}>
            <Events />
          </ProtectedRoute>
        ),
      },
      {
        path: 'budget',
        element: (
          <ProtectedRoute requiredPermission={PERMISSIONS.BUDGET.READ}>
            <Budget />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks',
        element: (
          <ProtectedRoute requiredPermission={PERMISSIONS.TASKS.READ}>
            <Tasks />
          </ProtectedRoute>
        ),
      },
      {
        path: 'guests',
        element: (
          <ProtectedRoute requiredPermission={PERMISSIONS.GUESTS.READ}>
            <Guests />
          </ProtectedRoute>
        ),
      },
      {
        path: 'vendors',
        element: (
          <ProtectedRoute requiredPermission={PERMISSIONS.VENDORS.READ}>
            <Vendors />
          </ProtectedRoute>
        ),
      },
      {
        path: 'gifts',
        element: (
          <OrganizerRoute>
            <Gifts />
          </OrganizerRoute>
        ),
      },
      {
        path: 'outfits',
        element: (
          <OrganizerRoute>
            <Outfits />
          </OrganizerRoute>
        ),
      },
      {
        path: 'seating',
        element: (
          <OrganizerRoute>
            <SeatingArrangement />
          </OrganizerRoute>
        ),
      },
      {
        path: 'check-in',
        element: (
          <OrganizerRoute>
            <CheckIn />
          </OrganizerRoute>
        ),
      },
      {
        path: 'documents',
        element: (
          <ProtectedRoute requiredPermission={PERMISSIONS.DOCUMENTS.READ}>
            <Documents />
          </ProtectedRoute>
        ),
      },
      {
        path: 'contacts',
        element: (
          <ProtectedRoute requiredPermission={PERMISSIONS.CONTACTS.READ}>
            <Contacts />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <AdminRoute>
            <Settings />
          </AdminRoute>
        ),
      },
      {
        path: 'activity-log',
        element: (
          <AdminRoute>
            <ActivityLog />
          </AdminRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        ),
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
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

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <CssBaseline />
            <GlobalStylesWrapper />
            <ErrorBoundary>
              <RouterProvider router={router} />
            </ErrorBoundary>
          </CurrencyProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
