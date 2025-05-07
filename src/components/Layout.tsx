import React, { useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, useTheme, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  AccountBalance as BudgetIcon,
  Assignment as TaskIcon,
  People as GuestIcon,
  Store as VendorIcon,
  CardGiftcard as GiftIcon,
  Checkroom as OutfitIcon,
  Restaurant as FoodIcon,
  QrCode as CheckInIcon,
  Description as DocumentIcon,
  Contacts as ContactIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  History as ActivityLogIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { signOutUser, setupInactivityTimer, cleanupInactivityTimer } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../types/auth';

const drawerWidth = 240;
const collapsedWidth = 0;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    setupInactivityTimer();
    return () => {
      cleanupInactivityTimer();
    };
  }, []);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleSignOut = async () => {
    const success = await signOutUser();
    if (success) {
      navigate('/login');
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Events', icon: <EventIcon />, path: '/events' },
    { text: 'Budget', icon: <BudgetIcon />, path: '/budget' },
    { text: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
    { text: 'Guests', icon: <GuestIcon />, path: '/guests' },
    { text: 'Vendors', icon: <VendorIcon />, path: '/vendors' },
    { text: 'Gifts', icon: <GiftIcon />, path: '/gifts' },
    { text: 'Outfits', icon: <OutfitIcon />, path: '/outfits' },
    { text: 'Seating', icon: <FoodIcon />, path: '/seating' },
    { text: 'Check-in', icon: <CheckInIcon />, path: '/check-in' },
    { text: 'Documents', icon: <DocumentIcon />, path: '/documents' },
    { text: 'Contacts', icon: <ContactIcon />, path: '/contacts' },
    ...(isAdmin ? [
      { text: 'User Management', icon: <PeopleIcon />, path: '/users' },
      { text: 'Activity Log', icon: <ActivityLogIcon />, path: '/activity-log' },
    ] : []),
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          Shaadi Manager
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          ml: 0,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          <Button
            color="inherit"
            onClick={handleSignOut}
            startIcon={<LogoutIcon />}
          >
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: isDrawerOpen ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width: isDrawerOpen ? drawerWidth : collapsedWidth,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          ml: isDrawerOpen ? `${drawerWidth}px` : 0,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 