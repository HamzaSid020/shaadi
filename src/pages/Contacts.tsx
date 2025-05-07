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
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  LocalHospital as EmergencyIcon,
  DirectionsCar as DriverIcon,
  LocalTaxi as TransportIcon,
  Help as OtherIcon,
} from '@mui/icons-material';
import { DataTable } from '../components/DataTable';
import { createContact, getContacts, updateContact, deleteContact } from '../services/firebaseService';
import { Contact } from '../types/models';
import { format } from 'date-fns';

const contactTypes = [
  'emergency',
  'driver',
  'transport',
  'other',
];

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [detailViewContact, setDetailViewContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    type: 'emergency',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const contactsData = await getContacts();
    setContacts(contactsData.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleOpenDialog = (contact?: Contact) => {
    if (contact) {
      setSelectedContact(contact);
      setFormData(contact);
    } else {
      setSelectedContact(null);
      setFormData({
        name: '',
        type: 'emergency',
        phone: '',
        email: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedContact(null);
  };

  const handleOpenDetailView = (contact: Contact) => {
    setDetailViewContact(contact);
  };

  const handleSubmit = async () => {
    try {
      if (selectedContact) {
        await updateContact(selectedContact.id, formData);
      } else {
        await createContact(formData);
      }
      handleCloseDialog();
      loadContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDelete = async (contactId: string) => {
    try {
      await deleteContact(contactId);
      loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'error';
      case 'driver':
        return 'primary';
      case 'transport':
        return 'secondary';
      case 'other':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <EmergencyIcon />;
      case 'driver':
        return <DriverIcon />;
      case 'transport':
        return <TransportIcon />;
      case 'other':
        return <OtherIcon />;
      default:
        return null;
    }
  };

  const columns = [
    { 
      id: 'name' as keyof Contact, 
      label: 'Name', 
      sortable: true,
      minWidth: 200,
    },
    { 
      id: 'type' as keyof Contact, 
      label: 'Type', 
      sortable: true,
      minWidth: 120,
      format: (value: string) => (
        <Chip 
          icon={getTypeIcon(value)}
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          color={getTypeColor(value)}
          size="small"
        />
      ),
    },
    { 
      id: 'phone' as keyof Contact, 
      label: 'Phone', 
      sortable: true,
      minWidth: 150,
      format: (value: string) => (
        <Typography
          component="a"
          href={`tel:${value}`}
          sx={{ color: 'primary.main', textDecoration: 'none' }}
        >
          {value}
        </Typography>
      ),
    },
    { 
      id: 'email' as keyof Contact, 
      label: 'Email', 
      sortable: true,
      minWidth: 200,
      format: (value: string) => value ? (
        <Typography
          component="a"
          href={`mailto:${value}`}
          sx={{ color: 'primary.main', textDecoration: 'none' }}
        >
          {value}
        </Typography>
      ) : '-',
    },
    { 
      id: 'updatedAt' as keyof Contact, 
      label: 'Last Updated', 
      sortable: true,
      minWidth: 150,
      format: (value: Date) => format(value, 'MMM dd, yyyy'),
    },
    { 
      id: 'actions', 
      label: 'Actions', 
      minWidth: 100,
      align: 'center',
    },
  ];

  const filters = [
    {
      field: 'type',
      label: 'Contact Type',
      options: contactTypes.map(type => ({ 
        value: type, 
        label: type.charAt(0).toUpperCase() + type.slice(1) 
      })),
    },
  ];

  const getRowActions = (contact: Contact) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDialog(contact);
        }}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleDelete(contact.id);
        }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Details">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDetailView(contact);
        }}>
          <PersonIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <DataTable<Contact>
        title="Contacts"
        columns={columns}
        data={contacts}
        filters={filters}
        onAdd={() => handleOpenDialog()}
        onRowClick={handleOpenDetailView}
        getRowActions={getRowActions}
        searchFields={['name', 'phone', 'email', 'notes']}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedContact ? 'Edit Contact' : 'Add New Contact'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {contactTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            {selectedContact ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog 
        open={Boolean(detailViewContact)} 
        onClose={() => setDetailViewContact(null)}
        maxWidth="md"
        fullWidth
      >
        {detailViewContact && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Contact Details
                <IconButton onClick={() => setDetailViewContact(null)} size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6">{detailViewContact.name}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      icon={getTypeIcon(detailViewContact.type)}
                      label={detailViewContact.type.charAt(0).toUpperCase() + detailViewContact.type.slice(1)}
                      color={getTypeColor(detailViewContact.type)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Phone</Typography>
                    <Typography
                      component="a"
                      href={`tel:${detailViewContact.phone}`}
                      sx={{ color: 'primary.main', textDecoration: 'none' }}
                    >
                      {detailViewContact.phone}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Email</Typography>
                    {detailViewContact.email ? (
                      <Typography
                        component="a"
                        href={`mailto:${detailViewContact.email}`}
                        sx={{ color: 'primary.main', textDecoration: 'none' }}
                      >
                        {detailViewContact.email}
                      </Typography>
                    ) : (
                      <Typography color="textSecondary">-</Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Last Updated</Typography>
                    <Typography>
                      {format(detailViewContact.updatedAt, 'MMMM dd, yyyy')}
                    </Typography>
                  </Paper>
                </Grid>
                {detailViewContact.notes && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Notes</Typography>
                      <Typography color="textSecondary">
                        {detailViewContact.notes}
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

export default ContactsPage; 