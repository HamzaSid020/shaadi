import { createBrowserRouter } from 'react-router-dom';
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
import Login from './pages/Login';
import SignUp from './pages/SignUp';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/events',
        element: <Events />,
      },
      {
        path: '/budget',
        element: <Budget />,
      },
      {
        path: '/tasks',
        element: <Tasks />,
      },
      {
        path: '/guests',
        element: <Guests />,
      },
      {
        path: '/vendors',
        element: <Vendors />,
      },
      {
        path: '/gifts',
        element: <Gifts />,
      },
      {
        path: '/outfits',
        element: <Outfits />,
      },
      {
        path: '/seating',
        element: <Seating />,
      },
      {
        path: '/check-in',
        element: <CheckIn />,
      },
      {
        path: '/documents',
        element: <Documents />,
      },
      {
        path: '/contacts',
        element: <Contacts />,
      },
    ],
  },
]); 