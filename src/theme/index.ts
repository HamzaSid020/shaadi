import { createTheme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';

const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(124, 58, 237, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(124, 58, 237, 0.5);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C3AED',
      dark: '#6D28D9',
    },
    secondary: {
      main: '#10B981',
      dark: '#059669',
    },
    background: {
      default: '#111827',
      paper: '#1F2937',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(124, 58, 237, 0.5)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
          animation: `${fadeIn} 0.3s ease-in-out`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
          animation: `${glowAnimation} 2s infinite`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#7C3AED',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#7C3AED',
              boxShadow: '0 0 0 4px rgba(124, 58, 237, 0.1)',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          background: 'rgba(31, 41, 55, 0.8)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(10px)',
          background: 'rgba(31, 41, 55, 0.8)',
        },
      },
    },
  },
});

export default theme; 