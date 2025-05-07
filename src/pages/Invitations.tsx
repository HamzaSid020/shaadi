import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { createInvitation, getInvitationsByStatus, Invitation } from '../services/invitationService';
import { UserRole } from '../types/auth';
import { logUserAction } from '../utils/loggingUtils';

const InvitationsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'guest' as UserRole,
  });

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const pendingInvites = await getInvitationsByStatus('pending');
      const expiredInvites = await getInvitationsByStatus('expired');
      const acceptedInvites = await getInvitationsByStatus('accepted');
      setInvitations([...pendingInvites, ...expiredInvites, ...acceptedInvites]);
    } catch (error) {
      setError('Failed to load invitations');
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      email: '',
      role: 'guest',
    });
  };

  const handleSubmit = async () => {
    try {
      if (!user) return;

      await createInvitation(formData.email, formData.role, user.uid);
      await logUserAction(
        user.uid,
        'Created Invitation',
        `Invited ${formData.email} as ${formData.role}`,
        'user'
      );
      handleCloseDialog();
      loadInvitations();
    } catch (error) {
      console.error('Error creating invitation:', error);
      setError('Failed to create invitation');
    }
  };

  const getStatusColor = (status: Invitation['status']) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'expired':
        return 'error';
      default:
        return 'warning';
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
        <Typography variant="h4">Invitations</Typography>
        <Button
          variant="contained"
          onClick={handleOpenDialog}
        >
          Send Invitation
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
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Invited By</TableCell>
              <TableCell>Expires</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Chip
                    label={invitation.role}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={invitation.status}
                    color={getStatusColor(invitation.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{invitation.invitedBy}</TableCell>
                <TableCell>
                  {new Date(invitation.expiresAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Send Invitation</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
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
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvitationsPage; 