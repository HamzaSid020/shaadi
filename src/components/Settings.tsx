import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { updateUserEmail, updateUserPassword } from '../services/authService';
import { useThemeContext } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDarkMode, toggleTheme } = useThemeContext();

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
    currentPassword: '',
  });

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const emailMutation = useMutation({
    mutationFn: () => updateUserEmail(emailForm.newEmail, emailForm.currentPassword),
    onSuccess: () => {
      setEmailSuccess(true);
      setEmailForm({ newEmail: '', currentPassword: '' });
      setTimeout(() => setEmailSuccess(false), 3000);
    },
    onError: (error: any) => {
      setEmailError(error.message || 'Failed to update email');
      setTimeout(() => setEmailError(null), 3000);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => updateUserPassword(passwordForm.newPassword, passwordForm.currentPassword),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordForm({ newPassword: '', confirmPassword: '', currentPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (error: any) => {
      setPasswordError(error.message || 'Failed to update password');
      setTimeout(() => setPasswordError(null), 3000);
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    
    if (!emailForm.newEmail || !emailForm.currentPassword) {
      setEmailError('Please fill in all fields');
      return;
    }

    emailMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (!passwordForm.newPassword || !passwordForm.confirmPassword || !passwordForm.currentPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    passwordMutation.mutate();
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        p: 3,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[2],
        }}
      >
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isDarkMode}
              onChange={toggleTheme}
              color="primary"
            />
          }
          label="Dark Mode"
        />
      </Paper>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[2],
        }}
      >
        <Typography variant="h6" gutterBottom>
          Update Email
        </Typography>
        <form onSubmit={handleEmailSubmit}>
          <TextField
            fullWidth
            label="New Email"
            type="email"
            value={emailForm.newEmail}
            onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={emailForm.currentPassword}
            onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
            margin="normal"
            required
          />
          {emailError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {emailError}
            </Alert>
          )}
          {emailSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Email updated successfully!
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={emailMutation.isPending}
          >
            {emailMutation.isPending ? <CircularProgress size={24} /> : 'Update Email'}
          </Button>
        </form>
      </Paper>

      <Paper
        sx={{
          p: 3,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[2],
        }}
      >
        <Typography variant="h6" gutterBottom>
          Update Password
        </Typography>
        <form onSubmit={handlePasswordSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            margin="normal"
            required
          />
          {passwordError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Password updated successfully!
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={passwordMutation.isPending}
          >
            {passwordMutation.isPending ? <CircularProgress size={24} /> : 'Update Password'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Settings; 