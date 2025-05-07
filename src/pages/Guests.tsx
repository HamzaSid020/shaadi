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
  Switch,
  FormControlLabel,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Toolbar,
  TablePagination,
  TableSortLabel,
  Tooltip,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  QuestionMark as QuestionMarkIcon,
  Person,
  Email,
  Phone,
  Restaurant,
  TableRestaurant,
  ContentCopy,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Group,
  Favorite,
  EventAvailable,
  PersonAdd,
} from '@mui/icons-material';
import { createGuest, getGuests, updateGuest, deleteGuest } from '../services/firebaseService';
import { Guest } from '../types/models';
import { useAuth } from '../context/AuthContext';
import { logUserAction } from '../utils/loggingUtils';
import { generateInvitationToken } from '../services/invitationService';

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Guest | 'actions';
  label: string;
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
  { id: 'phone', label: 'Phone', sortable: true },
  { id: 'group', label: 'Group', sortable: true },
  { id: 'rsvpStatus', label: 'RSVP Status', sortable: true },
  { id: 'relationship', label: 'Relationship', sortable: true },
  { id: 'actions', label: 'Actions', sortable: false },
];

const GuestsPage: React.FC = () => {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<Partial<Guest>>({
    name: '',
    email: '',
    phone: '',
    group: 'other',
    relationship: '',
    rsvpStatus: 'pending',
    plusOne: false,
    notes: '',
  });
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [detailViewGuest, setDetailViewGuest] = useState<Guest | null>(null);
  
  // Table state
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Guest>('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');

  useEffect(() => {
    loadGuests();
  }, []);

  useEffect(() => {
    filterGuests();
  }, [guests, searchQuery, groupFilter, rsvpFilter]);

  const loadGuests = async () => {
    const guestsData = await getGuests();
    setGuests(guestsData);
  };

  const filterGuests = () => {
    let filtered = [...guests];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(guest => 
        guest.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply group filter
    if (groupFilter !== 'all') {
      filtered = filtered.filter(guest => guest.group === groupFilter);
    }

    // Apply RSVP filter
    if (rsvpFilter !== 'all') {
      filtered = filtered.filter(guest => guest.rsvpStatus === rsvpFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      
      if (order === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return bValue < aValue ? -1 : 1;
      }
    });

    setFilteredGuests(filtered);
  };

  const handleRequestSort = (property: keyof Guest) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (guest?: Guest) => {
    if (guest) {
      setSelectedGuest(guest);
      setFormData(guest);
    } else {
      setSelectedGuest(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        group: 'other',
        relationship: '',
        rsvpStatus: 'pending',
        plusOne: false,
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGuest(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedGuest) {
        await updateGuest(selectedGuest.id, formData);
        if (user) {
          await logUserAction(
            user.uid,
            'Updated Guest',
            `Updated guest: ${formData.name}`,
            'guest'
          );
        }
      } else {
        await createGuest(formData);
        if (user) {
          await logUserAction(
            user.uid,
            'Created Guest',
            `Added new guest: ${formData.name}`,
            'guest'
          );
        }
      }
      handleCloseDialog();
      loadGuests();
    } catch (error) {
      console.error('Error saving guest:', error);
      if (user) {
        await logUserAction(
          user.uid,
          selectedGuest ? 'Failed to Update Guest' : 'Failed to Create Guest',
          `Error with guest: ${formData.name}`,
          'guest',
          'error'
        );
      }
    }
  };

  const handleDelete = async (guestId: string) => {
    try {
      await deleteGuest(guestId);
      loadGuests();
      if (user) {
        await logUserAction(
          user.uid,
          'Deleted Guest',
          `Deleted guest with ID: ${guestId}`,
          'guest'
        );
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      if (user) {
        await logUserAction(
          user.uid,
          'Failed to Delete Guest',
          `Failed to delete guest with ID: ${guestId}`,
          'guest',
          'error'
        );
      }
    }
  };

  const handleRsvpChange = async (guestId: string, newStatus: Guest['rsvpStatus']) => {
    try {
      await updateGuest(guestId, { rsvpStatus: newStatus });
      loadGuests();
      if (user) {
        await logUserAction(
          user.uid,
          'Updated Guest RSVP',
          `Updated guest RSVP status to: ${newStatus}`,
          'guest'
        );
      }
    } catch (error) {
      console.error('Error updating guest RSVP:', error);
      if (user) {
        await logUserAction(
          user.uid,
          'Failed to Update Guest RSVP',
          `Failed to update guest RSVP status to: ${newStatus}`,
          'guest',
          'error'
        );
      }
    }
  };

  const generateInviteCode = async (guest: Guest) => {
    try {
      if (!user) return;
      
      const token = await generateInvitationToken(
        user.uid,
        'guest',
        user.uid,
        guest.email,
        guest.name
      );

      setInvitationCode(token);
    } catch (error) {
      console.error('Error generating invitation:', error);
    }
  };

  const getGroupColor = (group: string) => {
    switch (group) {
      case 'bride':
        return 'primary';
      case 'groom':
        return 'secondary';
      case 'family':
        return 'success';
      case 'friends':
        return 'info';
      default:
        return 'default';
    }
  };

  const getRsvpColor = (status: string) => {
    switch (status) {
      case 'attending':
        return 'success';
      case 'not-attending':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRsvpIcon = (status: string) => {
    switch (status) {
      case 'attending':
        return <CheckIcon />;
      case 'not-attending':
        return <CloseIcon />;
      case 'pending':
        return <QuestionMarkIcon />;
      default:
        return null;
    }
  };

  const guestGroups = [
    'bride',
    'groom',
    'family',
    'friends',
    'other',
  ];

  const rsvpStatuses = [
    'pending',
    'attending',
    'not-attending',
  ];

  const getRsvpChip = (status: string) => {
    const color = status === 'attending' ? 'success' : 
                 status === 'not-attending' ? 'error' : 
                 'warning';
    const icon = status === 'attending' ? <CheckIcon /> :
                status === 'not-attending' ? <CloseIcon /> :
                <QuestionMarkIcon />;
    return (
      <Chip
        icon={icon}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={color}
        size="small"
      />
    );
  };

  const handleOpenDetailView = (guest: Guest) => {
    setDetailViewGuest(guest);
  };

  const handleCloseDetailView = () => {
    setDetailViewGuest(null);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ pl: 2, pr: 1, justifyContent: 'space-between' }}>
          <Typography variant="h6">Guest List</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search guests..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Group</InputLabel>
              <Select
                value={groupFilter}
                label="Group"
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <MenuItem value="all">All Groups</MenuItem>
                {guestGroups.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group.charAt(0).toUpperCase() + group.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>RSVP Status</InputLabel>
              <Select
                value={rsvpFilter}
                label="RSVP Status"
                onChange={(e) => setRsvpFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                {rsvpStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Guest
            </Button>
          </Box>
        </Toolbar>

        {invitationCode && (
          <Alert 
            severity="success" 
            sx={{ mx: 2, mb: 2 }}
            action={
              <IconButton
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Join our wedding at ${window.location.origin}/invite using code: ${invitationCode}`
                  );
                }}
              >
                <ContentCopy />
              </IconButton>
            }
          >
            Invitation Code: <strong>{invitationCode}</strong>
            <Typography variant="body2">
              Share this link with your guest: {window.location.origin}/invite
            </Typography>
          </Alert>
        )}

        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id as keyof Guest)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGuests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <Button
                        variant="text"
                        onClick={() => handleOpenDetailView(guest)}
                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                      >
                        {guest.name}
                      </Button>
                    </TableCell>
                    <TableCell>{guest.email}</TableCell>
                    <TableCell>{guest.phone}</TableCell>
                    <TableCell>
                      <Chip 
                        label={guest.group} 
                        size="small"
                        color={getGroupColor(guest.group || 'other')}
                      />
                    </TableCell>
                    <TableCell>
                      {getRsvpChip(guest.rsvpStatus || 'pending')}
                    </TableCell>
                    <TableCell>{guest.relationship}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenDialog(guest)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(guest.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Generate Invitation">
                          <IconButton size="small" onClick={() => generateInviteCode(guest)}>
                            <Email />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
      </Paper>

      {/* Detail View Modal */}
      <Dialog 
        open={Boolean(detailViewGuest)} 
        onClose={handleCloseDetailView}
        maxWidth="md"
        fullWidth
      >
        {detailViewGuest && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Guest Details
                <IconButton onClick={handleCloseDetailView} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Person />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Name"
                          secondary={detailViewGuest.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Email />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email"
                          secondary={detailViewGuest.email}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Phone />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Phone"
                          secondary={detailViewGuest.phone}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Group />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Group"
                          secondary={
                            <Chip 
                              label={detailViewGuest.group} 
                              size="small"
                              color={getGroupColor(detailViewGuest.group || 'other')}
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Favorite />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Relationship"
                          secondary={detailViewGuest.relationship}
                        />
                      </ListItem>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>RSVP & Attendance</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <EventAvailable />
                        </ListItemIcon>
                        <ListItemText 
                          primary="RSVP Status"
                          secondary={getRsvpChip(detailViewGuest.rsvpStatus || 'pending')}
                        />
                      </ListItem>
                      {detailViewGuest.plusOne && (
                        <ListItem>
                          <ListItemIcon>
                            <PersonAdd />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Plus One"
                            secondary={detailViewGuest.plusOneName || 'Name not specified'}
                          />
                        </ListItem>
                      )}
                      {detailViewGuest.tableNumber && (
                        <ListItem>
                          <ListItemIcon>
                            <TableRestaurant />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Table Number"
                            secondary={detailViewGuest.tableNumber}
                          />
                        </ListItem>
                      )}
                      {detailViewGuest.dietaryRestrictions && (
                        <ListItem>
                          <ListItemIcon>
                            <Restaurant />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Dietary Restrictions"
                            secondary={detailViewGuest.dietaryRestrictions}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>

                {detailViewGuest.notes && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>Additional Notes</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {detailViewGuest.notes}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        handleCloseDetailView();
                        handleOpenDialog(detailViewGuest);
                      }}
                    >
                      Edit Guest
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Email />}
                      onClick={() => generateInviteCode(detailViewGuest)}
                    >
                      Generate Invitation
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedGuest ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Group</InputLabel>
                <Select
                  value={formData.group}
                  label="Group"
                  onChange={(e) => setFormData({ ...formData, group: e.target.value as any })}
                >
                  {guestGroups.map((group) => (
                    <MenuItem key={group} value={group}>
                      {group.charAt(0).toUpperCase() + group.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Relationship"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>RSVP Status</InputLabel>
                <Select
                  value={formData.rsvpStatus}
                  label="RSVP Status"
                  onChange={(e) => setFormData({ ...formData, rsvpStatus: e.target.value as any })}
                >
                  {rsvpStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.plusOne}
                    onChange={(e) => setFormData({ ...formData, plusOne: e.target.checked })}
                  />
                }
                label="Plus One"
              />
            </Grid>
            {formData.plusOne && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Plus One Name"
                  value={formData.plusOneName}
                  onChange={(e) => setFormData({ ...formData, plusOneName: e.target.value })}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dietary Restrictions"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Table Number"
                value={formData.tableNumber}
                onChange={(e) => setFormData({ ...formData, tableNumber: Number(e.target.value) })}
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
            {selectedGuest ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuestsPage; 