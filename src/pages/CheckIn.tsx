import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataTable } from '../components/DataTable';
import { Guest } from '../types/models';
import {
  getGuests,
  updateGuest,
} from '../services/firebaseService';
import { format } from 'date-fns';

const CheckInPage: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [detailViewGuest, setDetailViewGuest] = useState<Guest | null>(null);

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    const loadedGuests = await getGuests();
    setGuests(loadedGuests.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleCheckIn = async (guest: Guest) => {
    try {
      await updateGuest(guest.id, {
        ...guest,
        rsvpStatus: 'attending',
        checkedIn: true,
        checkInTime: new Date().toISOString(),
      });
      loadGuests();
    } catch (error) {
      console.error('Error checking in guest:', error);
    }
  };

  const handleCheckOut = async (guest: Guest) => {
    try {
      await updateGuest(guest.id, {
        ...guest,
        checkedIn: false,
        checkOutTime: new Date().toISOString(),
      });
      loadGuests();
    } catch (error) {
      console.error('Error checking out guest:', error);
    }
  };

  const handleOpenDetailView = (guest: Guest) => {
    setDetailViewGuest(guest);
  };

  const columns = [
    { 
      id: 'name' as keyof Guest, 
      label: 'Name', 
      sortable: true,
      minWidth: 200,
    },
    { 
      id: 'checkedIn' as keyof Guest, 
      label: 'Status', 
      sortable: true,
      minWidth: 120,
      format: (value: boolean) => (
        <Chip 
          icon={value ? <CheckCircleIcon /> : <CancelIcon />}
          label={value ? 'Checked In' : 'Not Checked In'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    { 
      id: 'group' as keyof Guest, 
      label: 'Group', 
      sortable: true,
      minWidth: 150,
    },
    { 
      id: 'relationship' as keyof Guest, 
      label: 'Relationship', 
      sortable: true,
      minWidth: 150,
    },
    { 
      id: 'checkInTime' as keyof Guest, 
      label: 'Check-in Time', 
      sortable: true,
      minWidth: 180,
      format: (value: string | null) => value ? format(new Date(value), 'MMM dd, yyyy HH:mm') : '-',
    },
    { 
      id: 'actions', 
      label: 'Actions', 
      minWidth: 200,
      align: 'center',
    },
  ];

  const filters = [
    {
      field: 'checkedIn',
      label: 'Check-in Status',
      options: [
        { value: 'true', label: 'Checked In' },
        { value: 'false', label: 'Not Checked In' },
      ],
    },
  ];

  const getRowActions = (guest: Guest) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      {!guest.checkedIn ? (
        <Tooltip title="Check In">
          <IconButton 
            size="small" 
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleCheckIn(guest);
            }}
          >
            <CheckCircleIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Check Out">
          <IconButton 
            size="small" 
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleCheckOut(guest);
            }}
          >
            <CancelIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="View Details">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDetailView(guest);
        }}>
          <ViewIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <DataTable<Guest>
        title="Guest Check-In"
        columns={columns}
        data={guests}
        filters={filters}
        onRowClick={handleOpenDetailView}
        getRowActions={getRowActions}
        searchFields={['name', 'group', 'relationship', 'plusOneName']}
      />

      {/* Detail View Dialog */}
      <Dialog 
        open={Boolean(detailViewGuest)} 
        onClose={() => setDetailViewGuest(null)}
        maxWidth="md"
        fullWidth
      >
        {detailViewGuest && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Guest Details
                <Chip
                  icon={detailViewGuest.checkedIn ? <CheckCircleIcon /> : <CancelIcon />}
                  label={detailViewGuest.checkedIn ? 'Checked In' : 'Not Checked In'}
                  color={detailViewGuest.checkedIn ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6">{detailViewGuest.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Group</Typography>
                    <Typography>{detailViewGuest.group}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Relationship</Typography>
                    <Typography>{detailViewGuest.relationship}</Typography>
                  </Paper>
                </Grid>
                {detailViewGuest.plusOne && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Plus One</Typography>
                      <Typography>{detailViewGuest.plusOneName || 'Unnamed'}</Typography>
                    </Paper>
                  </Grid>
                )}
                {detailViewGuest.dietaryRestrictions && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Dietary Restrictions</Typography>
                      <Typography>{detailViewGuest.dietaryRestrictions}</Typography>
                    </Paper>
                  </Grid>
                )}
                {detailViewGuest.checkedIn && detailViewGuest.checkInTime && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Check-in Time</Typography>
                      <Typography>
                        {format(new Date(detailViewGuest.checkInTime), 'MMMM dd, yyyy HH:mm')}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {detailViewGuest.checkOutTime && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Check-out Time</Typography>
                      <Typography>
                        {format(new Date(detailViewGuest.checkOutTime), 'MMMM dd, yyyy HH:mm')}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {!detailViewGuest.checkedIn ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    handleCheckIn(detailViewGuest);
                    setDetailViewGuest(null);
                  }}
                >
                  Check In
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    handleCheckOut(detailViewGuest);
                    setDetailViewGuest(null);
                  }}
                >
                  Check Out
                </Button>
              )}
              <Button onClick={() => setDetailViewGuest(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CheckInPage; 