import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  TextField,
  Typography,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Notes as NotesIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { TimelineEvent } from '../types/models';
import {
  createTimelineEvent,
  getTimelineEvents,
  updateTimelineEvent,
  deleteTimelineEvent,
} from '../services/firebaseService';

const TimelinePage: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [formData, setFormData] = useState<Partial<TimelineEvent>>({
    title: '',
    description: '',
    date: new Date(),
    type: 'other',
    status: 'upcoming',
    location: '',
    notes: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const loadedEvents = await getTimelineEvents();
    setEvents(loadedEvents.sort((a, b) => a.date.getTime() - b.date.getTime()));
  };

  const handleOpenDialog = (event?: TimelineEvent) => {
    if (event) {
      setSelectedEvent(event);
      setFormData(event);
    } else {
      setSelectedEvent(null);
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        type: 'other',
        status: 'upcoming',
        location: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      date: new Date(),
      type: 'other',
      status: 'upcoming',
      location: '',
      notes: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) return;

    try {
      if (selectedEvent) {
        await updateTimelineEvent(selectedEvent.id, formData);
      } else {
        await createTimelineEvent(formData as Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>);
      }
      handleCloseDialog();
      loadEvents();
    } catch (error) {
      console.error('Error saving timeline event:', error);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteTimelineEvent(eventId);
      loadEvents();
    } catch (error) {
      console.error('Error deleting timeline event:', error);
    }
  };

  const getTypeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'ceremony':
        return 'primary';
      case 'reception':
        return 'secondary';
      case 'preparation':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon />;
      case 'in-progress':
        return <PendingIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Wedding Timeline</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Event
        </Button>
      </Box>

      <List>
        {events.map((event) => (
          <React.Fragment key={event.id}>
            <ListItem
              sx={{
                bgcolor: 'background.paper',
                mb: 2,
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <ListItemIcon>
                <EventIcon color={getStatusColor(event.status)} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">{event.title}</Typography>
                    <Chip
                      label={event.type}
                      color={getTypeColor(event.type)}
                      size="small"
                    />
                    <Chip
                      icon={getStatusIcon(event.status)}
                      label={event.status}
                      color={getStatusColor(event.status)}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.date).toLocaleDateString()} - {event.location}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {event.description}
                    </Typography>
                    {event.notes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Notes: {event.notes}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => handleOpenDialog(event)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(event.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Type"
                select
                fullWidth
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TimelineEvent['type'] })}
              >
                <MenuItem value="ceremony">Ceremony</MenuItem>
                <MenuItem value="reception">Reception</MenuItem>
                <MenuItem value="preparation">Preparation</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Status"
                select
                fullWidth
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TimelineEvent['status'] })}
              >
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                fullWidth
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedEvent ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimelinePage; 