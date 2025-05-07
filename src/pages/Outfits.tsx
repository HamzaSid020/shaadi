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
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataTable } from '../components/DataTable';
import { Outfit } from '../types/models';
import {
  createOutfit,
  getOutfits,
  updateOutfit,
  deleteOutfit,
} from '../services/firebaseService';
import { format } from 'date-fns';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';

const outfitTypes = [
  "Bride's Dress",
  "Groom's Suit",
  'Bridesmaid Dress',
  'Groomsman Suit',
  'Other',
] as const;

const OutfitsPage: React.FC = () => {
  const { currency } = useCurrency();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [detailViewOutfit, setDetailViewOutfit] = useState<Outfit | null>(null);
  const [formData, setFormData] = useState<Partial<Outfit>>({
    name: '',
    type: '',
    vendor: '',
    cost: 0,
    purchaseDate: '',
    fittingDate: '',
    notes: '',
  });

  useEffect(() => {
    loadOutfits();
  }, []);

  const loadOutfits = async () => {
    const loadedOutfits = await getOutfits();
    setOutfits(loadedOutfits.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleOpenDialog = (outfit?: Outfit) => {
    if (outfit) {
      setSelectedOutfit(outfit);
      setFormData(outfit);
    } else {
      setSelectedOutfit(null);
      setFormData({
        name: '',
        type: '',
        vendor: '',
        cost: 0,
        purchaseDate: '',
        fittingDate: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOutfit(null);
  };

  const handleOpenDetailView = (outfit: Outfit) => {
    setDetailViewOutfit(outfit);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) return;

    try {
      if (selectedOutfit) {
        await updateOutfit(selectedOutfit.id, formData);
      } else {
        await createOutfit(formData as Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>);
      }
      handleCloseDialog();
      loadOutfits();
    } catch (error) {
      console.error('Error saving outfit:', error);
    }
  };

  const handleDelete = async (outfitId: string) => {
    try {
      await deleteOutfit(outfitId);
      loadOutfits();
    } catch (error) {
      console.error('Error deleting outfit:', error);
    }
  };

  const columns = [
    { 
      id: 'name' as keyof Outfit, 
      label: 'Name', 
      sortable: true,
      minWidth: 200,
    },
    { 
      id: 'type' as keyof Outfit, 
      label: 'Type', 
      sortable: true,
      minWidth: 150,
      format: (value: string) => (
        <Chip 
          label={value}
          color="primary"
          size="small"
        />
      ),
    },
    { 
      id: 'vendor' as keyof Outfit, 
      label: 'Vendor', 
      sortable: true,
      minWidth: 150,
    },
    { 
      id: 'cost' as keyof Outfit, 
      label: 'Cost', 
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
      id: 'purchaseDate' as keyof Outfit, 
      label: 'Purchase Date', 
      sortable: true,
      minWidth: 150,
      format: (value: string) => value ? format(new Date(value), 'MMM dd, yyyy') : '-',
    },
    { 
      id: 'fittingDate' as keyof Outfit, 
      label: 'Fitting Date', 
      sortable: true,
      minWidth: 150,
      format: (value: string) => value ? format(new Date(value), 'MMM dd, yyyy') : '-',
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
      label: 'Outfit Type',
      options: outfitTypes.map(type => ({ 
        value: type, 
        label: type 
      })),
    },
  ];

  const getRowActions = (outfit: Outfit) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDialog(outfit);
        }}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleDelete(outfit.id);
        }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Details">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDetailView(outfit);
        }}>
          <ViewIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <DataTable<Outfit>
        title="Wedding Outfits"
        columns={columns}
        data={outfits}
        filters={filters}
        onAdd={() => handleOpenDialog()}
        onRowClick={handleOpenDetailView}
        getRowActions={getRowActions}
        searchFields={['name', 'vendor', 'type']}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedOutfit ? 'Edit Outfit' : 'Add Outfit'}
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
                select
                label="Type"
                fullWidth
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                {outfitTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Vendor"
                fullWidth
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Cost"
                type="number"
                fullWidth
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                InputProps={{
                  startAdornment: <MoneyIcon sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Purchase Date"
                type="date"
                fullWidth
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fitting Date"
                type="date"
                fullWidth
                value={formData.fittingDate}
                onChange={(e) => setFormData({ ...formData, fittingDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
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
          <Button variant="contained" onClick={handleSubmit}>
            {selectedOutfit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog 
        open={Boolean(detailViewOutfit)} 
        onClose={() => setDetailViewOutfit(null)}
        maxWidth="md"
        fullWidth
      >
        {detailViewOutfit && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Outfit Details
                <Chip
                  label={detailViewOutfit.type}
                  color="primary"
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6">{detailViewOutfit.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Vendor</Typography>
                    <Typography>{detailViewOutfit.vendor || '-'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Cost</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MoneyIcon color="success" />
                      <Typography>{formatCurrency(detailViewOutfit.cost, currency)}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                {detailViewOutfit.purchaseDate && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Purchase Date</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon color="primary" />
                        <Typography>
                          {format(new Date(detailViewOutfit.purchaseDate), 'MMMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                {detailViewOutfit.fittingDate && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Fitting Date</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon color="primary" />
                        <Typography>
                          {format(new Date(detailViewOutfit.fittingDate), 'MMMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                {detailViewOutfit.notes && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Notes</Typography>
                      <Typography>{detailViewOutfit.notes}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailViewOutfit(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OutfitsPage; 