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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { DataTable } from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { Event } from '../types/models';
import { format } from 'date-fns';
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} from '../services/firebaseService';

const eventTypes = [
  'Ceremony',
  'Reception',
  'Mehendi',
  'Sangeet',
  'Haldi',
  'Engagement',
  'Other'
];

const eventStatuses: Event['status'][] = ['Planned', 'In Progress', 'Completed'];

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailViewEvent, setDetailViewEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    name: '',
    date: new Date(),
    time: '',
    location: '',
    type: eventTypes[0],
    status: 'Planned',
    description: '',
    attendees: 0,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const loadedEvents = await getEvents();
      console.log('Raw events from Firebase:', loadedEvents);
      
      // Convert Firestore timestamps to Date objects
      const eventsWithDates = loadedEvents.map(event => {
        console.log('Processing event:', event);
        console.log('Date value:', event.date);
        console.log('Date type:', typeof event.date);
        
        let date;
        try {
          if (event.date instanceof Date) {
            date = event.date;
          } else if (event.date && typeof event.date === 'object' && 'toDate' in event.date) {
            // Handle Firestore Timestamp
            date = event.date.toDate();
          } else if (typeof event.date === 'string') {
            // Handle string date
            date = new Date(event.date);
          } else {
            // If no valid date, use current date as fallback
            date = new Date();
          }

          // Validate the date
          if (isNaN(date.getTime())) {
            console.warn('Invalid date detected, using current date as fallback');
            date = new Date();
          }
        } catch (error) {
          console.error('Error processing date:', error);
          date = new Date();
        }

        return {
          ...event,
          date,
          createdAt: event.createdAt instanceof Date ? event.createdAt : new Date(event.createdAt),
          updatedAt: event.updatedAt instanceof Date ? event.updatedAt : new Date(event.updatedAt)
        };
      });

      console.log('Processed events with dates:', eventsWithDates);
      setEvents(eventsWithDates);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const columns = [
    { 
      id: 'name' as keyof Event, 
      label: 'Event Name', 
      sortable: true,
      minWidth: 200,
    },
    { 
      id: 'date' as keyof Event, 
      label: 'Date', 
      sortable: true,
      minWidth: 120,
      format: (value: Date | string | undefined) => {
        if (!value) return '-';
        try {
          const date = value instanceof Date ? value : new Date(value);
          return isNaN(date.getTime()) ? '-' : format(date, 'MMM dd, yyyy');
        } catch (error) {
          console.error('Error formatting date:', error);
          return '-';
        }
      },
    },
    { 
      id: 'time' as keyof Event, 
      label: 'Time', 
      sortable: true,
      minWidth: 100,
    },
    { 
      id: 'location' as keyof Event, 
      label: 'Location', 
      sortable: true,
      minWidth: 200,
    },
    { 
      id: 'type' as keyof Event, 
      label: 'Type', 
      sortable: true,
      minWidth: 120,
      format: (value: string) => (
        <Chip 
          label={value}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    { 
      id: 'status' as keyof Event, 
      label: 'Status', 
      sortable: true,
      minWidth: 120,
      format: (value: Event['status']) => (
        <Chip 
          label={value}
          size="small"
          color={getStatusColor(value)}
        />
      ),
    },
    { 
      id: 'actions', 
      label: 'Actions', 
      minWidth: 120,
      align: 'center',
    },
  ];

  const filters = [
    {
      field: 'type',
      label: 'Event Type',
      options: eventTypes.map(type => ({ value: type, label: type })),
    },
    {
      field: 'status',
      label: 'Status',
      options: eventStatuses.map(status => ({ value: status, label: status })),
    },
  ];

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      console.log('Opening dialog for edit:', event);
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0); // Reset time part to avoid timezone issues
      
      setSelectedEvent(event);
      setFormData({
        ...event,
        date: eventDate
      });
    } else {
      console.log('Opening dialog for new event');
      setSelectedEvent(null);
      setFormData({
        name: '',
        date: new Date(),
        time: '',
        location: '',
        type: eventTypes[0],
        status: 'Planned',
        description: '',
        attendees: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const handleOpenDetailView = (event: Event) => {
    setDetailViewEvent(event);
  };

  const getRowActions = (event: Event) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDialog(event);
        }}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleDelete(event.id);
        }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Location">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleViewLocation(event);
        }}>
          <LocationIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Guest List">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleViewGuests(event);
        }}>
          <PeopleIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Planned':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.date || !formData.time || !formData.location) {
        console.log('Missing required fields:', { formData });
        return;
      }

      // Ensure date is a proper Date object and handle timezone issues
      const eventDate = new Date(formData.date);
      eventDate.setHours(0, 0, 0, 0); // Reset time part to avoid timezone issues

      const eventData = {
        ...formData,
        date: eventDate,
        updatedAt: new Date()
      };

      console.log('Event data before update:', {
        selectedEvent,
        formData,
        eventData,
        dateType: typeof eventData.date,
        dateValue: eventData.date
      });

      if (selectedEvent) {
        console.log('Updating event:', selectedEvent.id, eventData);
        await updateEvent(selectedEvent.id, eventData);
        console.log('Event updated successfully');
      } else {
        console.log('Creating new event:', eventData);
        await createEvent(eventData as Omit<Event, 'id' | 'createdAt' | 'updatedAt'>);
        console.log('Event created successfully');
      }

      handleCloseDialog();
      await loadEvents(); // Wait for events to reload
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleViewLocation = (event: Event) => {
    // TODO: Implement location view/map
    window.open(`https://maps.google.com/?q=${encodeURIComponent(event.location)}`, '_blank');
  };

  const handleViewGuests = (event: Event) => {
    // TODO: Implement guest list view
  };

  return (
    <Box sx={{ p: 3 }}>
      <DataTable<Event>
        title="Events"
        columns={columns}
        data={events}
        filters={filters}
        onAdd={() => handleOpenDialog()}
        onRowClick={handleOpenDetailView}
        getRowActions={getRowActions}
        searchFields={['name', 'location', 'description']}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEvent ? 'Edit Event' : 'Add New Event'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Event Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Event['status'] })}
                >
                  {eventStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={format(formData.date || new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expected Attendees"
                type="number"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog 
        open={Boolean(detailViewEvent)} 
        onClose={() => setDetailViewEvent(null)}
        maxWidth="md"
        fullWidth
      >
        {detailViewEvent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Event Details
                <IconButton onClick={() => setDetailViewEvent(null)} size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6">{detailViewEvent.name}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip 
                      label={detailViewEvent.type}
                      color="primary"
                      size="small"
                    />
                    <Chip 
                      label={detailViewEvent.status}
                      color={getStatusColor(detailViewEvent.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Date & Time</Typography>
                    <Typography>
                      {format(detailViewEvent.date, 'MMMM dd, yyyy')} at {detailViewEvent.time}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Location</Typography>
                    <Typography>{detailViewEvent.location}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Expected Attendees</Typography>
                    <Typography variant="h6">
                      {detailViewEvent.attendees}
                    </Typography>
                  </Paper>
                </Grid>
                {detailViewEvent.description && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Description</Typography>
                      <Typography color="textSecondary">
                        {detailViewEvent.description}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EventsPage; 