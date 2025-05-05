import { createTheme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';

// Material Dashboard 2 React theme colors
const colors = {
  primary: {
    main: '#CB0C9F',
    light: '#E3F2FD',
    dark: '#9A0C7A',
  },
  secondary: {
    main: '#8392AB',
    light: '#E3E8EE',
    dark: '#5E6E82',
  },
  info: {
    main: '#17C1E8',
    light: '#E3F2FD',
    dark: '#0D8AB0',
  },
  success: {
    main: '#82D616',
    light: '#E8F5E9',
    dark: '#5A9B0F',
  },
  warning: {
    main: '#FB8C00',
    light: '#FFF3E0',
    dark: '#B06000',
  },
  error: {
    main: '#EA0606',
    light: '#FFEBEE',
    dark: '#A30404',
  },
  light: {
    main: '#E9ECEF',
    light: '#F8F9FA',
    dark: '#DEE2E6',
  },
  dark: {
    main: '#344767',
    light: '#4A5568',
    dark: '#1A202C',
  },
  white: {
    main: '#FFFFFF',
    light: '#FFFFFF',
    dark: '#F8F9FA',
  },
  text: {
    primary: '#344767',
    secondary: '#7B809A',
    disabled: '#AEAEAE',
  },
  background: {
    default: '#F0F2F5',
    paper: '#FFFFFF',
  },
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2c3e50', // Dark blue-gray
    },
    secondary: {
      main: '#34495e', // Darker blue-gray
    },
    background: {
      default: '#f0f2f5', // Light gray background
      paper: '#ffffff',   // White for paper components
    },
    text: {
      primary: '#2c3e50',  // Dark blue-gray for primary text
      secondary: '#34495e', // Slightly lighter blue-gray for secondary text
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#2c3e50',
          color: '#ffffff',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(44, 62, 80, 0.1)',
        },
        head: {
          backgroundColor: '#f8f9fa',
          color: '#2c3e50',
          fontWeight: 600,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#2c3e50',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#2c3e50',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#2c3e50',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2c3e50',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2c3e50',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#2c3e50',
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7C3AED',
      light: '#9F7AEA',
      dark: '#6B46C1',
    },
    secondary: {
      main: '#4C51BF',
      light: '#667EEA',
      dark: '#434190',
    },
    background: {
      default: '#F7FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9F7AEA',
      light: '#B794F4',
      dark: '#805AD5',
    },
    secondary: {
      main: '#667EEA',
      light: '#7F9CF5',
      dark: '#5A67D8',
    },
    background: {
      default: '#1A202C',
      paper: '#2D3748',
    },
    text: {
      primary: '#F7FAFC',
      secondary: '#CBD5E0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme; 