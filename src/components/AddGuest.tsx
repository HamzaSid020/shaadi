import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Guest } from '../types/guest';

const AddGuest: React.FC = () => {
  const [formData, setFormData] = useState<Omit<Guest, 'id'>>({
    name: '',
    spouse: 0,
    children: 0,
    infants: 0,
    country: '',
    guestType: '',
    priority: '',
    rsvpStatus: '',
  });

  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (newGuest: Omit<Guest, 'id'>) => {
      const docRef = await addDoc(collection(db, 'guests'), newGuest);
      return { id: docRef.id, ...newGuest };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setFormData({
        name: '',
        spouse: 0,
        children: 0,
        infants: 0,
        country: '',
        guestType: '',
        priority: '',
        rsvpStatus: '',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: typeof value === 'string' ? value : Number(value)
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Add New Guest
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Spouse"
              name="spouse"
              type="number"
              value={formData.spouse}
              onChange={handleChange}
              required
            />
            <TextField
              label="Children"
              name="children"
              type="number"
              value={formData.children}
              onChange={handleChange}
              required
            />
            <TextField
              label="Infants"
              name="infants"
              type="number"
              value={formData.infants}
              onChange={handleChange}
              required
            />
            <TextField
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Guest Type</InputLabel>
              <Select
                name="guestType"
                value={formData.guestType}
                onChange={handleChange}
              >
                <MenuItem value="family">Family</MenuItem>
                <MenuItem value="friend">Friend</MenuItem>
                <MenuItem value="colleague">Colleague</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>RSVP Status</InputLabel>
              <Select
                name="rsvpStatus"
                value={formData.rsvpStatus}
                onChange={handleChange}
              >
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="declined">Declined</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" color="primary">
              Add Guest
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddGuest; 