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
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  QuestionMark as QuestionMarkIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  Store as StoreIcon,
  AccessTime as TimeIcon,
  Receipt as ReceiptIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataTable } from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { Vendor } from '../types/models';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';
import { logActivity } from '../services/loggingService';
import { format } from 'date-fns';
import { getVendors, createVendor, updateVendor, deleteVendor } from '../services/firebaseService';

const vendorCategories = [
  'Catering',
  'Decoration',
  'Photography',
  'Music',
  'Venue',
  'Transport',
  'Other',
];

const vendorStatuses = [
  'Contacted',
  'Negotiating',
  'Booked',
  'Confirmed',
  'Completed',
  'Cancelled',
];

const VendorsPage: React.FC = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [detailViewVendor, setDetailViewVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: '',
    category: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    cost: 0,
    status: 'Contacted',
    notes: '',
  });
  const { currency } = useCurrency();

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const loadedVendors = await getVendors();
      setVendors(loadedVendors.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return;

    try {
      if (selectedVendor) {
        await updateVendor(selectedVendor.id, formData);
      } else {
        await createVendor(formData as Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>);
      }
      handleCloseDialog();
      loadVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  };

  const handleDelete = async (vendorId: string) => {
    try {
      await deleteVendor(vendorId);
      loadVendors();
      if (user) {
        await logActivity({
          userId: user.uid,
          action: 'Deleted Vendor',
          details: `Deleted vendor with ID: ${vendorId}`,
          category: 'vendors',
          status: 'success'
        });
      }
    } catch (error) {
      console.error('Error deleting vendor:', error);
      if (user) {
        await logActivity({
          userId: user.uid,
          action: 'Failed to Delete Vendor',
          details: `Failed to delete vendor with ID: ${vendorId}`,
          category: 'vendors',
          status: 'error'
        });
      }
    }
  };

  const columns = [
    { 
      id: 'name' as keyof Vendor, 
      label: 'Name', 
      sortable: true,
      minWidth: 200,
    },
    { 
      id: 'category' as keyof Vendor, 
      label: 'Category', 
      sortable: true,
      minWidth: 150,
      format: (value: string) => (
        <Chip 
          label={value}
          color={getCategoryColor(value)}
          size="small"
        />
      ),
    },
    { 
      id: 'cost' as keyof Vendor, 
      label: 'Cost', 
      sortable: true,
      minWidth: 150,
      format: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MoneyIcon fontSize="small" color="primary" />
          {formatCurrency(value, currency)}
        </Box>
      ),
    },
    { 
      id: 'status' as keyof Vendor, 
      label: 'Status', 
      sortable: true,
      minWidth: 150,
      format: (value: string) => (
        <Chip 
          label={value}
          color={getStatusColor(value)}
          size="small"
        />
      ),
    },
    {
      id: 'actions' as const,
      label: 'Actions',
      minWidth: 100,
      align: 'center' as const,
    },
  ];

  const filters = [
    {
      field: 'category',
      label: 'Category',
      options: vendorCategories.map(cat => ({ value: cat, label: cat })),
    },
    {
      field: 'status',
      label: 'Status',
      options: vendorStatuses.map(status => ({ value: status, label: status })),
    },
  ];

  const handleOpenDialog = (vendor?: Vendor) => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        category: vendor.category,
        contact: vendor.contact,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        cost: vendor.cost,
        status: vendor.status,
        notes: vendor.notes,
      });
      setSelectedVendor(vendor);
    } else {
      setFormData({
        name: '',
        category: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        cost: 0,
        status: 'Contacted',
        notes: '',
      });
      setSelectedVendor(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVendor(null);
    setFormData({
      name: '',
      category: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      cost: 0,
      status: 'Contacted',
      notes: '',
    });
  };

  const handleOpenDetailView = (vendor: Vendor) => {
    setDetailViewVendor(vendor);
  };

  const getRowActions = (vendor: Vendor) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDialog(vendor);
        }}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleDelete(vendor.id);
        }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Email">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          window.location.href = `mailto:${vendor.email}`;
        }}>
          <EmailIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Call">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          window.location.href = `tel:${vendor.phone}`;
        }}>
          <PhoneIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Catering':
        return 'primary';
      case 'Decoration':
        return 'secondary';
      case 'Photography':
        return 'info';
      case 'Music':
        return 'success';
      case 'Venue':
        return 'warning';
      case 'Transport':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'success';
      case 'Booked':
        return 'primary';
      case 'Negotiating':
        return 'warning';
      case 'Contacted':
        return 'info';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <CheckIcon />;
      case 'Booked':
        return <TimeIcon />;
      case 'Negotiating':
        return <QuestionMarkIcon />;
      case 'Contacted':
        return <EventIcon />;
      case 'Cancelled':
        return <CloseIcon />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <DataTable<Vendor>
        title="Vendors"
        columns={columns}
        data={vendors}
        filters={filters}
        onAdd={() => handleOpenDialog()}
        onRowClick={handleOpenDetailView}
        getRowActions={getRowActions}
        searchFields={['name', 'contact', 'email', 'phone']}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {vendorCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Contact Person"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Cost"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              fullWidth
              InputProps={{
                startAdornment: <MoneyIcon color="action" />,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {vendorStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedVendor ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog
        open={Boolean(detailViewVendor)} 
        onClose={() => setDetailViewVendor(null)}
        maxWidth="md"
        fullWidth
      >
        {detailViewVendor && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Vendor Details
                <Chip
                  label={detailViewVendor.status}
                  color={getStatusColor(detailViewVendor.status)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={detailViewVendor.category}
                      color={getCategoryColor(detailViewVendor.category)}
                      size="small"
                    />
                    <Typography variant="h6">{detailViewVendor.name}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Cost</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MoneyIcon color="primary" />
                      <Typography>{formatCurrency(detailViewVendor.cost, currency)}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                {/* ... rest of the dialog content ... */}
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default VendorsPage; 