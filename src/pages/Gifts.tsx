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
  Grid,
  Typography,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CardGiftcard as GiftIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataTable } from '../components/DataTable';
import { Gift } from '../types/models';
import {
  createGift,
  getGifts,
  updateGift,
  deleteGift,
} from '../services/firebaseService';
import { format } from 'date-fns';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';

const GiftsPage: React.FC = () => {
  const { currency } = useCurrency();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [detailViewGift, setDetailViewGift] = useState<Gift | null>(null);
  const [formData, setFormData] = useState<Partial<Gift>>({
    name: '',
    description: '',
    price: 0,
    purchased: false,
    purchasedBy: '',
    notes: '',
  });

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    const loadedGifts = await getGifts();
    setGifts(loadedGifts.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleOpenDialog = (gift?: Gift) => {
    if (gift) {
      setSelectedGift(gift);
      setFormData(gift);
    } else {
      setSelectedGift(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        purchased: false,
        purchasedBy: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGift(null);
  };

  const handleOpenDetailView = (gift: Gift) => {
    setDetailViewGift(gift);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;

    try {
      if (selectedGift) {
        await updateGift(selectedGift.id, formData);
      } else {
        await createGift(formData as Omit<Gift, 'id' | 'createdAt' | 'updatedAt'>);
      }
      handleCloseDialog();
      loadGifts();
    } catch (error) {
      console.error('Error saving gift:', error);
    }
  };

  const handleDelete = async (giftId: string) => {
    try {
      await deleteGift(giftId);
      loadGifts();
    } catch (error) {
      console.error('Error deleting gift:', error);
    }
  };

  const columns = [
    { 
      id: 'name' as keyof Gift, 
      label: 'Name', 
      sortable: true,
      minWidth: 200,
    },
    { 
      id: 'purchased' as keyof Gift, 
      label: 'Status', 
      sortable: true,
      minWidth: 120,
      format: (value: boolean) => (
        <Chip 
          icon={<GiftIcon />}
          label={value ? 'Purchased' : 'Available'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    { 
      id: 'price' as keyof Gift, 
      label: 'Price', 
      sortable: true,
      minWidth: 120,
      format: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MoneyIcon fontSize="small" color="success" />
          {formatCurrency(value, currency)}
        </Box>
      ),
    },
    { 
      id: 'purchasedBy' as keyof Gift, 
      label: 'Purchased By', 
      sortable: true,
      minWidth: 150,
      format: (value: string) => value || '-',
    },
    { 
      id: 'description' as keyof Gift, 
      label: 'Description', 
      minWidth: 250,
      format: (value: string) => value || '-',
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
      field: 'purchased',
      label: 'Status',
      options: [
        { value: 'true', label: 'Purchased' },
        { value: 'false', label: 'Available' },
      ],
    },
  ];

  const getRowActions = (gift: Gift) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDialog(gift);
        }}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleDelete(gift.id);
        }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Details">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDetailView(gift);
        }}>
          <ViewIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <DataTable<Gift>
        title="Gift Registry"
        columns={columns}
        data={gifts}
        filters={filters}
        onAdd={() => handleOpenDialog()}
        onRowClick={handleOpenDetailView}
        getRowActions={getRowActions}
        searchFields={['name', 'description', 'purchasedBy']}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedGift ? 'Edit Gift' : 'Add Gift'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Name"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Price"
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <MoneyIcon sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Status"
                fullWidth
                value={formData.purchased}
                onChange={(e) => setFormData({ ...formData, purchased: e.target.value === 'true' })}
              >
                <MenuItem value="false">Available</MenuItem>
                <MenuItem value="true">Purchased</MenuItem>
              </TextField>
            </Grid>
            {formData.purchased && (
              <Grid item xs={12}>
                <TextField
                  label="Purchased By"
                  fullWidth
                  value={formData.purchasedBy}
                  onChange={(e) => setFormData({ ...formData, purchasedBy: e.target.value })}
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
            )}
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
          <Button variant="contained" onClick={handleSubmit}>
            {selectedGift ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog 
        open={Boolean(detailViewGift)} 
        onClose={() => setDetailViewGift(null)}
        maxWidth="md"
        fullWidth
      >
        {detailViewGift && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Gift Details
                <Chip
                  icon={<GiftIcon />}
                  label={detailViewGift.purchased ? 'Purchased' : 'Available'}
                  color={detailViewGift.purchased ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6">{detailViewGift.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Price</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MoneyIcon color="success" />
                      <Typography>{formatCurrency(detailViewGift.price, currency)}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                {detailViewGift.purchasedBy && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Purchased By</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon color="primary" />
                        <Typography>{detailViewGift.purchasedBy}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                {detailViewGift.description && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Description</Typography>
                      <Typography>{detailViewGift.description}</Typography>
                    </Paper>
                  </Grid>
                )}
                {detailViewGift.notes && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Notes</Typography>
                      <Typography>{detailViewGift.notes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailViewGift(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GiftsPage; 