import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';
import { signOutUser } from '../services/authService';

const drawerWidth = 280;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: `linear-gradient(45deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: theme.palette.text.primary,
          }}
        >
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mb: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.5)',
          }}
        >
          GL
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: open ? 'block' : 'none',
          }}
        >
          Guest List Manager
        </Typography>
      </Box>
      <List sx={{ flex: 1 }}>
        <ListItemButton onClick={() => navigate('/')}>
          <ListItemIcon>
            <DashboardIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Dashboard" sx={{ display: open ? 'block' : 'none' }} />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/guests')}>
          <ListItemIcon>
            <PeopleIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Guest List" sx={{ display: open ? 'block' : 'none' }} />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/add-guest')}>
          <ListItemIcon>
            <PersonAddIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Add Guest" sx={{ display: open ? 'block' : 'none' }} />
        </ListItemButton>
        <ListItemButton onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <SettingsIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Settings" sx={{ display: open ? 'block' : 'none' }} />
        </ListItemButton>
      </List>
      <Divider />
      <ListItemButton onClick={handleSignOut} sx={{ mt: 'auto' }}>
        <ListItemIcon>
          <ExitToAppIcon color="primary" />
        </ListItemIcon>
        <ListItemText primary="Sign Out" sx={{ display: open ? 'block' : 'none' }} />
      </ListItemButton>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: theme.transitions.create('transform', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            transform: open ? 'translateX(0)' : `translateX(-${drawerWidth}px)`,
            position: 'relative',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: open ? `${drawerWidth}px` : 0,
        }}
      >
        <IconButton
          color="primary"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          edge="start"
          sx={{ 
            mr: 2,
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.background.paper,
            '&:hover': {
              backgroundColor: theme.palette.background.default,
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 