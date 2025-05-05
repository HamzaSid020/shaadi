import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  SelectChangeEvent,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { addGuest } from '../services/guestService';
import { Guest } from '../types/guest';

const AddGuestForm: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState<Omit<Guest, 'id'>>({
    name: '',
    spouse: 0,
    children: 0,
    infants: 0,
    gender: 'other',
    country: 'Pakistan',
    priority: 'medium',
    guestType: 'other',
    rsvpStatus: 'pending',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: addGuest,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to add guest');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    
    if (name === 'children' || name === 'spouse' || name === 'infants') {
      if (numValue < 0) {
        setError(`${name} cannot be negative`);
        return;
      }
      
      // If changing children, ensure infants don't exceed the new children count
      if (name === 'children' && formData.infants > numValue) {
        setFormData({
          ...formData,
          children: numValue,
          infants: numValue, // Reset infants to match new children count
        });
        return;
      }
      
      // If changing infants, ensure it doesn't exceed children count
      if (name === 'infants' && numValue > formData.children) {
        setError('Number of infants cannot exceed number of children');
        return;
      }
      
      setFormData({
        ...formData,
        [name]: numValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate infant count
    if (formData.infants > formData.children) {
      setError('Number of infants cannot exceed number of children');
      return;
    }
    
    mutation.mutate(formData);
  };

  return (
    <Box
      sx={{
        animation: `${theme.transitions.create(['opacity', 'transform'])} 0.3s ease-in-out`,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[2],
          background: theme.palette.background.paper,
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          gutterBottom 
          sx={{ textAlign: 'center', mb: 2 }}
        >
          Add New Guest
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.shape.borderRadius,
              },
            }}
          />
          <TextField
            fullWidth
            type="number"
            label="Number of Spouses"
            name="spouse"
            value={formData.spouse}
            onChange={handleInputChange}
            inputProps={{ min: 0 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: theme.shape.borderRadius,
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Number of Children"
              name="children"
              value={formData.children}
              onChange={handleInputChange}
              inputProps={{ min: 0 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.shape.borderRadius,
                },
              }}
            />
            <TextField
              fullWidth
              type="number"
              label="Number of Infants"
              name="infants"
              value={formData.infants}
              onChange={handleInputChange}
              inputProps={{ 
                min: 0,
                max: formData.children
              }}
              disabled={formData.children === 0}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.shape.borderRadius,
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleSelectChange}
                label="Gender"
                sx={{
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: theme.shape.borderRadius,
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleSelectChange}
                label="Priority"
                sx={{
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Guest Type</InputLabel>
              <Select
                name="guestType"
                value={formData.guestType}
                onChange={handleSelectChange}
                label="Guest Type"
                sx={{
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <MenuItem value="family">Family</MenuItem>
                <MenuItem value="friend">Friend</MenuItem>
                <MenuItem value="colleague">Colleague</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <FormControl fullWidth>
            <InputLabel>RSVP Status</InputLabel>
            <Select
              name="rsvpStatus"
              value={formData.rsvpStatus}
              onChange={handleSelectChange}
              label="RSVP Status"
              sx={{
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="declined">Declined</MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Alert severity="error">{error}</Alert>
          )}
          {success && (
            <Alert severity="success">Guest added successfully!</Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={mutation.isPending}
            sx={{
              mt: 2,
              borderRadius: theme.shape.borderRadius,
            }}
          >
            {mutation.isPending ? <CircularProgress size={24} /> : 'Add Guest'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddGuestForm; 