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
  Add as AddIcon,
  TableRestaurant as TableIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DataTable } from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import {
  createSeatingArrangement,
  getSeatingArrangements,
  updateSeatingArrangement,
  deleteSeatingArrangement,
} from '../services/firebaseService';
import { logUserAction } from '../utils/loggingUtils';

interface SeatingArrangement {
  id: string;
  tableNumber: string;
  capacity: number;
  category: 'VIP' | 'Family' | 'Regular';
  status: 'Available' | 'Reserved' | 'Occupied';
  assignedGuests: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categories: SeatingArrangement['category'][] = ['VIP', 'Family', 'Regular'];
const statuses: SeatingArrangement['status'][] = ['Available', 'Reserved', 'Occupied'];

const SeatingArrangementPage: React.FC = () => {
  const { user } = useAuth();
  const [arrangements, setArrangements] = useState<SeatingArrangement[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedArrangement, setSelectedArrangement] = useState<SeatingArrangement | null>(null);
  const [formData, setFormData] = useState<Partial<SeatingArrangement>>({
    tableNumber: '',
    capacity: 4,
    category: 'Regular',
    status: 'Available',
    assignedGuests: [],
    notes: '',
  });

  useEffect(() => {
    loadArrangements();
  }, []);

  const loadArrangements = async () => {
    try {
      const loadedArrangements = await getSeatingArrangements();
      setArrangements(loadedArrangements);
    } catch (error) {
      console.error('Error loading seating arrangements:', error);
    }
  };

  const columns = [
    { 
      id: 'tableNumber' as keyof SeatingArrangement, 
      label: 'Table Number', 
      sortable: true,
      minWidth: 120,
    },
    { 
      id: 'capacity' as keyof SeatingArrangement, 
      label: 'Capacity', 
      sortable: true,
      minWidth: 100,
    },
    { 
      id: 'category' as keyof SeatingArrangement, 
      label: 'Category', 
      sortable: true,
      minWidth: 120,
      format: (value: SeatingArrangement['category']) => (
        <Chip 
          label={value} 
          color={getCategoryColor(value)}
          size="small"
        />
      ),
    },
    { 
      id: 'status' as keyof SeatingArrangement, 
      label: 'Status', 
      sortable: true,
      minWidth: 120,
      format: (value: SeatingArrangement['status']) => (
        <Chip 
          label={value} 
          color={getStatusColor(value)}
          size="small"
        />
      ),
    },
    { 
      id: 'assignedGuests' as keyof SeatingArrangement, 
      label: 'Assigned Guests', 
      sortable: true,
      minWidth: 150,
      format: (value: string[]) => value.length > 0 ? value.join(', ') : '-',
    },
    { 
      id: 'actions' as const, 
      label: 'Actions', 
      minWidth: 120,
      align: 'center' as const,
    },
  ];

  const filters = [
    {
      field: 'category',
      label: 'Category',
      options: categories.map(c => ({ value: c, label: c })),
    },
    {
      field: 'status',
      label: 'Status',
      options: statuses.map(s => ({ value: s, label: s })),
    },
  ];

  const handleOpenDialog = (arrangement?: SeatingArrangement) => {
    if (arrangement) {
      setSelectedArrangement(arrangement);
      setFormData(arrangement);
    } else {
      setSelectedArrangement(null);
      setFormData({
        tableNumber: '',
        capacity: 4,
        category: 'Regular',
        status: 'Available',
        assignedGuests: [],
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedArrangement(null);
  };

  const getCategoryColor = (category: SeatingArrangement['category']) => {
    switch (category) {
      case 'VIP':
        return 'error';
      case 'Family':
        return 'success';
      case 'Regular':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: SeatingArrangement['status']) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Reserved':
        return 'warning';
      case 'Occupied':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.tableNumber || !formData.category || !formData.status) {
        return;
      }

      if (selectedArrangement) {
        await updateSeatingArrangement(selectedArrangement.id, formData);
        if (user) {
          await logUserAction(
            user.uid,
            'Updated Seating Arrangement',
            `Updated table: ${formData.tableNumber}`,
            'seating'
          );
        }
      } else {
        await createSeatingArrangement(formData as Omit<SeatingArrangement, 'id' | 'createdAt' | 'updatedAt'>);
        if (user) {
          await logUserAction(
            user.uid,
            'Created Seating Arrangement',
            `Created new table: ${formData.tableNumber}`,
            'seating'
          );
        }
      }
      handleCloseDialog();
      loadArrangements();
    } catch (error) {
      console.error('Error saving seating arrangement:', error);
      if (user) {
        await logUserAction(
          user.uid,
          selectedArrangement ? 'Failed to Update Seating Arrangement' : 'Failed to Create Seating Arrangement',
          `Error with table: ${formData.tableNumber}`,
          'seating',
          'error'
        );
      }
    }
  };

  const handleDelete = async (arrangementId: string) => {
    try {
      await deleteSeatingArrangement(arrangementId);
      loadArrangements();
      if (user) {
        await logUserAction(
          user.uid,
          'Deleted Seating Arrangement',
          `Deleted table with ID: ${arrangementId}`,
          'seating'
        );
      }
    } catch (error) {
      console.error('Error deleting seating arrangement:', error);
      if (user) {
        await logUserAction(
          user.uid,
          'Failed to Delete Seating Arrangement',
          `Failed to delete table with ID: ${arrangementId}`,
          'seating',
          'error'
        );
      }
    }
  };

  const getRowActions = (arrangement: SeatingArrangement) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDialog(arrangement);
        }}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleDelete(arrangement.id);
        }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Guests">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          // Handle viewing assigned guests
        }}>
          <PersonIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Seating Arrangement</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Table
        </Button>
      </Box>

      <DataTable<SeatingArrangement>
        title="Tables"
        columns={columns}
        data={arrangements}
        filters={filters}
        getRowActions={getRowActions}
        searchFields={['tableNumber', 'assignedGuests', 'notes']}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedArrangement ? 'Edit Table' : 'Add New Table'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Table Number"
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as SeatingArrangement['category'] })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as SeatingArrangement['status'] })}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assigned Guests"
                value={formData.assignedGuests?.join(', ') || ''}
                onChange={(e) => setFormData({ ...formData, assignedGuests: e.target.value.split(',').map(g => g.trim()) })}
                helperText="Enter guest names separated by commas"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedArrangement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeatingArrangementPage; 