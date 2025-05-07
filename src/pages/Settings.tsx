import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { updateUserEmail, updateUserPassword } from '../services/authService';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { logUserAction } from '../utils/loggingUtils';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
];

const Settings: React.FC = () => {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { currency, setCurrency } = useCurrency();
  const { user } = useAuth();

  const handleUpdateEmail = async () => {
    try {
      await updateUserEmail(newEmail, currentPassword);
      setIsEditingEmail(false);
      setNewEmail('');
      setCurrentPassword('');
      if (user) {
        await logUserAction(
          user.uid,
          'Updated Email',
          'Successfully updated email address',
          'settings'
        );
      }
    } catch (error) {
      console.error('Error updating email:', error);
      if (user) {
        await logUserAction(
          user.uid,
          'Failed to Update Email',
          'Failed to update email address',
          'settings',
          'error'
        );
      }
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      if (user) {
        await logUserAction(
          user.uid,
          'Failed to Update Password',
          'Passwords do not match',
          'settings',
          'error'
        );
      }
      return;
    }

    try {
      await updateUserPassword(newPassword, currentPassword);
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (user) {
        await logUserAction(
          user.uid,
          'Updated Password',
          'Successfully updated password',
          'settings'
        );
      }
    } catch (error) {
      console.error('Error updating password:', error);
      if (user) {
        await logUserAction(
          user.uid,
          'Failed to Update Password',
          'Failed to update password',
          'settings',
          'error'
        );
      }
    }
  };

  const handleCurrencyChange = async (event: React.ChangeEvent<{ value: unknown }>) => {
    const newCurrency = event.target.value as string;
    setCurrency(newCurrency);
    if (user) {
      await logUserAction(
        user.uid,
        'Changed Currency',
        `Changed currency to: ${newCurrency}`,
        'settings'
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Settings
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Email"
              secondary={isEditingEmail ? (
                <Box sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    label="New Email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </Box>
              ) : 'Current email address'}
            />
            <ListItemSecondaryAction>
              {isEditingEmail ? (
                <IconButton edge="end" onClick={handleUpdateEmail}>
                  <SaveIcon />
                </IconButton>
              ) : (
                <IconButton edge="end" onClick={() => setIsEditingEmail(true)}>
                  <EditIcon />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Password"
              secondary={isEditingPassword ? (
                <Box sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Box>
              ) : 'Change your password'}
            />
            <ListItemSecondaryAction>
              {isEditingPassword ? (
                <IconButton edge="end" onClick={handleUpdatePassword}>
                  <SaveIcon />
                </IconButton>
              ) : (
                <IconButton edge="end" onClick={() => setIsEditingPassword(true)}>
                  <EditIcon />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Preferences
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Currency"
              secondary="Select your preferred currency for all monetary values"
            />
            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={currency}
                onChange={handleCurrencyChange}
                displayEmpty
              >
                {CURRENCIES.map((curr) => (
                  <MenuItem key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.name} ({curr.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Settings; 