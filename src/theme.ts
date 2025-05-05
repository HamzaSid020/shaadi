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

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    light: colors.light,
    dark: colors.dark,
    white: colors.white,
    text: colors.text,
    background: colors.background,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '0.5rem',
          padding: '0.5rem 1rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 7px -1px rgba(0,0,0,0.11), 0 2px 4px -1px rgba(0,0,0,0.07)',
          },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: `linear-gradient(195deg, ${colors.primary.main}, ${colors.primary.dark})`,
          },
          '&.MuiButton-containedSecondary': {
            background: `linear-gradient(195deg, ${colors.secondary.main}, ${colors.secondary.dark})`,
          },
          '&.MuiButton-containedInfo': {
            background: `linear-gradient(195deg, ${colors.info.main}, ${colors.info.dark})`,
          },
          '&.MuiButton-containedSuccess': {
            background: `linear-gradient(195deg, ${colors.success.main}, ${colors.success.dark})`,
          },
          '&.MuiButton-containedWarning': {
            background: `linear-gradient(195deg, ${colors.warning.main}, ${colors.warning.dark})`,
          },
          '&.MuiButton-containedError': {
            background: `linear-gradient(195deg, ${colors.error.main}, ${colors.error.dark})`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: colors.white.main,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: colors.white.main,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        },
      },
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