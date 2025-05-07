import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
  getUsersByRole,
  updateUserRole,
  updateUserProfile,
  createUser,
} from '../services/authService';
import { UserProfile, UserRole, ROLE_PERMISSIONS } from '../types/auth';
import { logUserAction } from '../utils/loggingUtils';

const UserManagement: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'guest' as UserRole,
    password: '',
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await Promise.all([
        getUsersByRole('admin'),
        getUsersByRole('organizer'),
        getUsersByRole('guest'),
        getUsersByRole('vendor'),
      ]);
      setUsers(allUsers.flat());
    } catch (error) {
      setError('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (userProfile?: UserProfile) => {
    if (userProfile) {
      setSelectedUser(userProfile);
      setFormData({
        email: userProfile.email,
        displayName: userProfile.displayName,
        role: userProfile.role,
        password: '',
        isActive: userProfile.isActive,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        displayName: '',
        role: 'guest',
        password: '',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      displayName: '',
      role: 'guest',
      password: '',
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        // Update existing user
        await updateUserRole(selectedUser.uid, formData.role);
        await updateUserProfile(selectedUser.uid, {
          displayName: formData.displayName,
          isActive: formData.isActive,
        });

        if (user) {
          await logUserAction(
            user.uid,
            'Updated User',
            `Updated user: ${formData.email}`,
            'user'
          );
        }
      } else {
        // Create new user
        await createUser(formData.email, formData.password, formData.role);
        if (user) {
          await logUserAction(
            user.uid,
            'Created User',
            `Created new user: ${formData.email}`,
            'user'
          );
        }
      }

      handleCloseDialog();
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user');
    }
  };

  const handleToggleStatus = async (userProfile: UserProfile) => {
    try {
      await updateUserProfile(userProfile.uid, {
        isActive: !userProfile.isActive,
      });
      if (user) {
        await logUserAction(
          user.uid,
          `${userProfile.isActive ? 'Deactivated' : 'Activated'} User`,
          `${userProfile.isActive ? 'Deactivated' : 'Activated'} user: ${userProfile.email}`,
          'user'
        );
      }
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Failed to update user status');
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'organizer':
        return 'primary';
      case 'vendor':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to access this page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((userProfile) => (
              <TableRow key={userProfile.uid}>
                <TableCell>{userProfile.displayName}</TableCell>
                <TableCell>{userProfile.email}</TableCell>
                <TableCell>
                  <Chip
                    label={userProfile.role}
                    color={getRoleColor(userProfile.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={userProfile.isActive ? 'Active' : 'Inactive'}
                    color={userProfile.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(userProfile.lastLoginAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(userProfile)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleToggleStatus(userProfile)}>
                    {userProfile.isActive ? <BlockIcon /> : <ActiveIcon />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!selectedUser}
            />
            <TextField
              label="Display Name"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            />
            {!selectedUser && (
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            )}
            <FormControl>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              >
                <MenuItem value="guest">Guest</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="organizer">Organizer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 