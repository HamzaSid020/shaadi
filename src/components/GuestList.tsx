import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Chip,
  TablePagination,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Clear as ClearIcon, Edit as EditIcon, Check as CheckIcon, Close as CloseIcon, Refresh as RefreshIcon, CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Guest } from '../types/guest';
import { getGuests, updateGuest, guestKeys } from '../services/guestService';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const GuestList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterGuestType, setFilterGuestType] = useState<string>('all');
  const [filterRsvpStatus, setFilterRsvpStatus] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Guest> | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Update guest mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedGuest: Guest) => {
      if (!updatedGuest.id) return;
      const guestRef = doc(db, 'guests', updatedGuest.id);
      await updateDoc(guestRef, updatedGuest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setEditingId(null);
      setEditingData(null);
      setOpenEditDialog(false);
    }
  });

  // Fetch all guests with caching
  const { data: allGuests, isLoading, error } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, 'guests'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Guest[];
    }
  });

  // Apply filters and search
  const filteredGuests = React.useMemo(() => {
    if (!allGuests) {
      console.log('No guests data available');
      return [];
    }
    
    console.log('Filtering guests:', allGuests);
    let result = [...allGuests];
    
    // Apply search
    if (searchTerm) {
      result = result.filter(guest => 
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply filters
    if (filterPriority !== 'all') {
      result = result.filter(guest => guest.priority === filterPriority);
    }
    if (filterGuestType !== 'all') {
      result = result.filter(guest => guest.guestType === filterGuestType);
    }
    if (filterRsvpStatus !== 'all') {
      result = result.filter(guest => guest.rsvpStatus === filterRsvpStatus);
    }
    if (filterCountry !== 'all') {
      result = result.filter(guest => guest.country === filterCountry);
    }
    
    console.log('Filtered guests:', result);
    return result;
  }, [allGuests, searchTerm, filterPriority, filterGuestType, filterRsvpStatus, filterCountry]);

  // Get unique countries for the filter
  const uniqueCountries = React.useMemo(() => {
    if (!allGuests) {
      console.log('No guests data available for countries');
      return [];
    }
    const countries = Array.from(new Set(allGuests.map(guest => guest.country))).sort();
    console.log('Unique countries:', countries);
    return countries;
  }, [allGuests]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleRsvpFilterChange = (event: any) => {
    setFilterRsvpStatus(event.target.value);
    setPage(0);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'very high':
        return theme.palette.error.main;
      case 'high':
        return theme.palette.warning.main;
      case 'medium':
        return theme.palette.info.main;
      case 'low':
        return theme.palette.success.main;
      case 'very low':
        return theme.palette.text.secondary;
      default:
        return theme.palette.text.primary;
    }
  };

  const getRSVPColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return theme.palette.success.main;
      case 'declined':
        return theme.palette.error.main;
      case 'pending':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingId(guest.id);
    setEditingData({ ...guest });
    setOpenEditDialog(true);
  };

  const handleEditChange = (field: keyof Guest, value: string | number) => {
    if (editingData) {
      // Convert string numbers to actual numbers
      const numValue = typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value;
      
      // Special handling for infants to ensure it doesn't exceed children
      if (field === 'infants' && typeof numValue === 'number') {
        const children = editingData.children || 0;
        if (numValue > children) {
          return; // Don't update if infants would exceed children
        }
      }
      
      // Special handling for children to ensure infants don't exceed new children count
      if (field === 'children' && typeof numValue === 'number') {
        const currentInfants = editingData.infants || 0;
        if (currentInfants > numValue) {
          setEditingData({
            ...editingData,
            children: numValue,
            infants: numValue, // Reset infants to match new children count
          });
          return;
        }
      }

      setEditingData({
        ...editingData,
        [field]: numValue,
      });
    }
  };

  const handleEditSave = () => {
    if (editingId && editingData) {
      updateMutation.mutate(editingData);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingData(null);
    setOpenEditDialog(false);
  };

  const handleBulkImport = () => {
    navigate('/bulk-import');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    console.log('Loading guests...');
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error('Error in GuestList:', error);
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading guests: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  if (!allGuests || allGuests.length === 0) {
    console.log('No guests found');
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No guests found. Add some guests to get started!</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Guest List
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh List">
            <IconButton
              color="primary"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['guests'] })}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Add New Guest">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-guest')}
            >
              Add Guest
            </Button>
          </Tooltip>
          <Tooltip title="Bulk Import">
            <Button
              variant="contained"
              color="secondary"
              startIcon={<CloudUploadIcon />}
              onClick={handleBulkImport}
            >
              Bulk Import
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 2, mb: 3 }}>
        <Box>
          <TextField
            fullWidth
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={clearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.shape.borderRadius,
                background: theme.palette.background.paper,
              },
            }}
          />
        </Box>
        <Box>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              label="Priority"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <FormControl fullWidth>
            <InputLabel>Guest Type</InputLabel>
            <Select
              value={filterGuestType}
              onChange={(e) => setFilterGuestType(e.target.value)}
              label="Guest Type"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="friend">Friend</MenuItem>
              <MenuItem value="relative">Relative</MenuItem>
              <MenuItem value="colleague">Colleague</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <FormControl fullWidth>
            <InputLabel>RSVP Status</InputLabel>
            <Select
              value={filterRsvpStatus}
              onChange={handleRsvpFilterChange}
              label="RSVP Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="declined">Declined</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <FormControl fullWidth>
            <InputLabel>Country</InputLabel>
            <Select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              label="Country"
            >
              <MenuItem value="all">All</MenuItem>
              {uniqueCountries.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Spouse</TableCell>
              <TableCell>Children</TableCell>
              <TableCell>Infants</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>RSVP</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredGuests
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>
                    {editingId === guest.id ? (
                      <TextField
                        value={editingData?.name || ''}
                        onChange={(e) => handleEditChange('name', e.target.value)}
                        size="small"
                      />
                    ) : (
                      guest.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === guest.id ? (
                      <TextField
                        type="number"
                        value={editingData?.spouse || 0}
                        onChange={(e) => handleEditChange('spouse', Number(e.target.value))}
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    ) : (
                      guest.spouse
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === guest.id ? (
                      <TextField
                        type="number"
                        value={editingData?.children || 0}
                        onChange={(e) => handleEditChange('children', Number(e.target.value))}
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    ) : (
                      guest.children
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === guest.id ? (
                      <TextField
                        type="number"
                        value={editingData?.infants || 0}
                        onChange={(e) => handleEditChange('infants', e.target.value)}
                        size="small"
                        inputProps={{ 
                          min: 0,
                          max: editingData?.children || 0
                        }}
                        disabled={!editingData?.children}
                      />
                    ) : (
                      guest.infants
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === guest.id ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={editingData?.gender || 'other'}
                          onChange={(e) => handleEditChange('gender', e.target.value)}
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      guest.gender
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === guest.id ? (
                      <TextField
                        value={editingData?.country || ''}
                        onChange={(e) => handleEditChange('country', e.target.value)}
                        size="small"
                      />
                    ) : (
                      guest.country
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === guest.id ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={editingData?.priority || 'medium'}
                          onChange={(e) => handleEditChange('priority', e.target.value)}
                        >
                          <MenuItem value="very high">Very High</MenuItem>
                          <MenuItem value="high">High</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="low">Low</MenuItem>
                          <MenuItem value="very low">Very Low</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={guest.priority}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(guest.priority),
                          color: 'white',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === guest.id ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={editingData?.guestType || 'other'}
                          onChange={(e) => handleEditChange('guestType', e.target.value)}
                        >
                          <MenuItem value="family">Family</MenuItem>
                          <MenuItem value="friend">Friend</MenuItem>
                          <MenuItem value="colleague">Colleague</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      guest.guestType
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === guest.id ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={editingData?.rsvpStatus || 'pending'}
                          onChange={(e) => handleEditChange('rsvpStatus', e.target.value)}
                        >
                          <MenuItem value="accepted">Accepted</MenuItem>
                          <MenuItem value="declined">Declined</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={guest.rsvpStatus}
                        size="small"
                        sx={{
                          backgroundColor: getRSVPColor(guest.rsvpStatus),
                          color: 'white',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === guest.id ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={handleEditSave}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? <CircularProgress size={20} /> : <CheckIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={handleEditCancel}
                          disabled={updateMutation.isPending}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(guest)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredGuests.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={openEditDialog} onClose={handleEditCancel}>
        <DialogTitle>Edit Guest</DialogTitle>
        <DialogContent>
          {editingData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Name"
                value={editingData.name}
                onChange={(e) => handleEditChange('name', e.target.value)}
              />
              <TextField
                label="Spouse"
                type="number"
                value={editingData.spouse}
                onChange={(e) => handleEditChange('spouse', Number(e.target.value))}
              />
              <TextField
                label="Children"
                type="number"
                value={editingData.children}
                onChange={(e) => handleEditChange('children', Number(e.target.value))}
              />
              <TextField
                label="Infants"
                type="number"
                value={editingData.infants}
                onChange={(e) => handleEditChange('infants', Number(e.target.value))}
              />
              <TextField
                label="Country"
                value={editingData.country}
                onChange={(e) => handleEditChange('country', e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Guest Type</InputLabel>
                <Select
                  value={editingData.guestType}
                  onChange={(e) => handleEditChange('guestType', e.target.value)}
                >
                  <MenuItem value="family">Family</MenuItem>
                  <MenuItem value="friend">Friend</MenuItem>
                  <MenuItem value="colleague">Colleague</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editingData.priority}
                  onChange={(e) => handleEditChange('priority', e.target.value)}
                >
                  <MenuItem value="very high">Very High</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="very low">Very Low</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>RSVP Status</InputLabel>
                <Select
                  value={editingData.rsvpStatus}
                  onChange={(e) => handleEditChange('rsvpStatus', e.target.value)}
                >
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="declined">Declined</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuestList; 