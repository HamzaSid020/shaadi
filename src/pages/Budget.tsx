import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
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
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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
import { createBudget, getBudgets, updateBudget, deleteBudget } from '../services/firebaseService';
import { Budget } from '../types/models';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../services/loggingService';
import { DataTable } from '../components/DataTable';
import { format } from 'date-fns';

const BudgetPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [detailViewBudget, setDetailViewBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState<Partial<Budget>>({
    category: '',
    item: '',
    estimatedCost: 0,
    actualCost: 0,
    status: 'Unpaid',
    notes: '',
  });
  const { currency } = useCurrency();
  const { user } = useAuth();

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    const budgetsData = await getBudgets();
    setBudgets(budgetsData.sort((a, b) => a.category.localeCompare(b.category)));
  };

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setSelectedBudget(budget);
      setFormData({
        ...budget,
        dueDate: budget.dueDate ? new Date(budget.dueDate) : undefined
      });
    } else {
      setSelectedBudget(null);
      setFormData({
        category: '',
        item: '',
        estimatedCost: 0,
        actualCost: 0,
        status: 'Unpaid',
        notes: '',
        dueDate: undefined
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBudget(null);
  };

  const handleOpenDetailView = (budget: Budget) => {
    setDetailViewBudget(budget);
  };

  const handleSubmit = async () => {
    try {
      if (selectedBudget) {
        await updateBudget(selectedBudget.id, formData);
      } else {
        await createBudget(formData);
      }
      handleCloseDialog();
      loadBudgets();
      if (user) {
        await logActivity({
          userId: user.uid,
          action: selectedBudget ? 'Updated Budget' : 'Created Budget',
          details: `${selectedBudget ? 'Updated' : 'Created'} budget: ${formData.item} (${formatCurrency(formData.estimatedCost || 0, currency)})`,
          category: 'budget',
          status: 'success'
        });
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      if (user) {
        await logActivity({
          userId: user.uid,
          action: 'Failed to Save Budget',
          details: `Failed to ${selectedBudget ? 'update' : 'create'} budget: ${formData.item}`,
          category: 'budget',
          status: 'error'
        });
      }
    }
  };

  const handleDelete = async (budgetId: string) => {
    try {
      await deleteBudget(budgetId);
      loadBudgets();
      if (user) {
        await logActivity({
          userId: user.uid,
          action: 'Deleted Budget',
          details: `Deleted budget with ID: ${budgetId}`,
          category: 'budget',
          status: 'success'
        });
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      if (user) {
        await logActivity({
          userId: user.uid,
          action: 'Failed to Delete Budget',
          details: `Failed to delete budget with ID: ${budgetId}`,
          category: 'budget',
          status: 'error'
        });
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'venue':
        return 'primary';
      case 'catering':
        return 'success';
      case 'decor':
        return 'info';
      case 'attire':
        return 'warning';
      case 'photography':
        return 'secondary';
      case 'entertainment':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Partially Paid':
        return 'warning';
      case 'Unpaid':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckIcon />;
      case 'Partially Paid':
        return <TimeIcon />;
      case 'Unpaid':
        return <CloseIcon />;
      default:
        return null;
    }
  };

  const budgetCategories = [
    'Venue',
    'Catering',
    'Decor',
    'Attire',
    'Photography',
    'Entertainment',
    'Transportation',
    'Other',
  ];

  const budgetStatuses = [
    'Unpaid',
    'Partially Paid',
    'Paid',
  ];

  const totalEstimated = budgets.reduce((sum, budget) => sum + budget.estimatedCost, 0);
  const totalActual = budgets.reduce((sum, budget) => sum + budget.actualCost, 0);
  const progress = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;

  const columns = [
    { 
      id: 'category' as keyof Budget, 
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
      id: 'item' as keyof Budget, 
      label: 'Item', 
      sortable: true,
      minWidth: 200,
    },
    { 
      id: 'estimatedCost' as keyof Budget, 
      label: 'Estimated Cost', 
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
      id: 'actualCost' as keyof Budget, 
      label: 'Actual Cost', 
      sortable: true,
      minWidth: 150,
      format: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MoneyIcon fontSize="small" color="success" />
          {formatCurrency(value, currency)}
        </Box>
      ),
    },
    { 
      id: 'status' as keyof Budget, 
      label: 'Status', 
      sortable: true,
      minWidth: 150,
      format: (value: string) => (
        <Chip 
          icon={getStatusIcon(value)}
          label={value}
          color={getStatusColor(value)}
          size="small"
        />
      ),
    },
    { 
      id: 'dueDate' as keyof Budget, 
      label: 'Due Date', 
      sortable: true,
      minWidth: 150,
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
      id: 'actions', 
      label: 'Actions', 
      minWidth: 120,
      align: 'center',
    },
  ];

  const filters = [
    {
      field: 'category',
      label: 'Category',
      options: budgetCategories.map(category => ({
        value: category,
        label: category,
      })),
    },
    {
      field: 'status',
      label: 'Status',
      options: budgetStatuses.map(status => ({
        value: status,
        label: status,
      })),
    },
  ];

  const getRowActions = (budget: Budget) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDialog(budget);
        }}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleDelete(budget.id);
        }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Details">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDetailView(budget);
        }}>
          <ViewIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Budget</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Expense
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Budget Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Total Estimated: {formatCurrency(totalEstimated, currency)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Total Actual: {formatCurrency(totalActual, currency)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {progress.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <DataTable<Budget>
        title="Budget Items"
        columns={columns}
        data={budgets}
        filters={filters}
        onRowClick={handleOpenDetailView}
        getRowActions={getRowActions}
        searchFields={['category', 'item', 'notes']}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedBudget ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {budgetCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Cost"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Actual Cost"
                value={formData.actualCost}
                onChange={(e) => setFormData({ ...formData, actualCost: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {budgetStatuses.map((status) => (
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
                type="date"
                label="Due Date"
                value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  setFormData({ ...formData, dueDate: date });
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedBudget ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={Boolean(detailViewBudget)} 
        onClose={() => setDetailViewBudget(null)}
        maxWidth="md"
        fullWidth
      >
        {detailViewBudget && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Budget Item Details
                <Chip
                  icon={getStatusIcon(detailViewBudget.status)}
                  label={detailViewBudget.status}
                  color={getStatusColor(detailViewBudget.status)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={detailViewBudget.category}
                      color={getCategoryColor(detailViewBudget.category)}
                      size="small"
                    />
                    <Typography variant="h6">{detailViewBudget.item}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Estimated Cost</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MoneyIcon color="primary" />
                      <Typography>{formatCurrency(detailViewBudget.estimatedCost, currency)}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Actual Cost</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <MoneyIcon color="success" />
                      <Typography>{formatCurrency(detailViewBudget.actualCost, currency)}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                {detailViewBudget.dueDate && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Due Date</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EventIcon color="primary" />
                        <Typography>
                          {format(new Date(detailViewBudget.dueDate), 'MMMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )}
                {detailViewBudget.notes && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Notes</Typography>
                      <Typography color="textSecondary">
                        {detailViewBudget.notes}
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

export default BudgetPage; 