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
  Restaurant as RestaurantIcon,
  Group as GroupIcon,
  TableRestaurant as TableIcon,
} from '@mui/icons-material';
import { Seating } from '../types/models';
import {
  createSeating,
  getSeatings,
  updateSeating,
  deleteSeating,
} from '../services/firebaseService';

const SeatingPage: React.FC = () => {
  const [seatings, setSeatings] = useState<Seating[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSeating, setSelectedSeating] = useState<Seating | null>(null);
  const [formData, setFormData] = useState<Partial<Seating>>({
    tableNumber: '',
    capacity: 0,
    guests: [],
    dietaryRequirements: [],
    notes: '',
  });

  useEffect(() => {
    loadSeatings();
  }, []);

  const loadSeatings = async () => {
    const loadedSeatings = await getSeatings();
    setSeatings(loadedSeatings.sort((a, b) => a.tableNumber.localeCompare(b.tableNumber)));
  };

  const handleOpenDialog = (seating?: Seating) => {
    if (seating) {
      setSelectedSeating(seating);
      setFormData(seating);
    } else {
      setSelectedSeating(null);
      setFormData({
        tableNumber: '',
        capacity: 0,
        guests: [],
        dietaryRequirements: [],
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSeating(null);
    setFormData({
      tableNumber: '',
      capacity: 0,
      guests: [],
      dietaryRequirements: [],
      notes: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.tableNumber || !formData.capacity) return;

    try {
      if (selectedSeating) {
        await updateSeating(selectedSeating.id, formData);
      } else {
        await createSeating(formData as Omit<Seating, 'id' | 'createdAt' | 'updatedAt'>);
      }
      handleCloseDialog();
      loadSeatings();
    } catch (error) {
      console.error('Error saving seating:', error);
    }
  };

  const handleDelete = async (seatingId: string) => {
    try {
      await deleteSeating(seatingId);
      loadSeatings();
    } catch (error) {
      console.error('Error deleting seating:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Seating Arrangement</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Table
        </Button>
      </Box>

      <Grid container spacing={3}>
        {seatings.map((seating) => (
          <Grid item xs={12} sm={6} md={4} key={seating.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Table {seating.tableNumber}
                  </Typography>
                  <Chip
                    icon={<GroupIcon />}
                    label={`${seating.guests.length}/${seating.capacity} guests`}
                    color={seating.guests.length === seating.capacity ? 'success' : 'default'}
                  />
                </Box>
                
                {seating.guests.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Guests:
                    </Typography>
                    <List dense>
                      {seating.guests.map((guest, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={guest} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {seating.dietaryRequirements.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Dietary Requirements:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {seating.dietaryRequirements.map((req, index) => (
                        <Chip
                          key={index}
                          label={req}
                          size="small"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {seating.notes && (
                  <Typography variant="body2" color="text.secondary">
                    Notes: {seating.notes}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleOpenDialog(seating)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(seating.id)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedSeating ? 'Edit Table' : 'Add Table'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Table Number"
                fullWidth
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Capacity"
                type="number"
                fullWidth
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Guests"
                fullWidth
                multiline
                rows={3}
                value={formData.guests?.join('\n')}
                onChange={(e) => setFormData({
                  ...formData,
                  guests: e.target.value.split('\n').filter(g => g.trim())
                })}
                helperText="Enter one guest per line"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Dietary Requirements"
                fullWidth
                value={formData.dietaryRequirements?.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  dietaryRequirements: e.target.value.split(',').map(r => r.trim())
                })}
                helperText="Enter requirements separated by commas"
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
            {selectedSeating ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeatingPage; 