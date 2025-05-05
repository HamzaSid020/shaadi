import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Guest } from '../types/guest';

const BulkImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Guest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (guests: Omit<Guest, 'id'>[]) => {
      const results = [];
      for (const guest of guests) {
        const docRef = await addDoc(collection(db, 'guests'), guest);
        results.push({ id: docRef.id, ...guest });
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setFile(null);
      setPreviewData([]);
      setError(null);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/json') {
      setError('Please upload a JSON file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!Array.isArray(data)) {
          setError('JSON file must contain an array of guests');
          return;
        }

        // Validate each guest object
        const validGuests = data.filter((guest: any) => {
          return (
            typeof guest.name === 'string' &&
            typeof guest.spouse === 'number' &&
            typeof guest.children === 'number' &&
            typeof guest.infants === 'number' &&
            typeof guest.country === 'string' &&
            typeof guest.guestType === 'string' &&
            typeof guest.priority === 'string' &&
            typeof guest.rsvpStatus === 'string'
          );
        });

        if (validGuests.length !== data.length) {
          setError('Some guest entries are invalid. Please check the format.');
        }

        setPreviewData(validGuests);
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = () => {
    if (previewData.length > 0) {
      addMutation.mutate(previewData);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Bulk Import Guests
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <input
            accept=".json"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              Upload JSON File
            </Button>
          </label>
        </Box>

        {previewData.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Preview ({previewData.length} guests)
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Spouse</TableCell>
                    <TableCell>Children</TableCell>
                    <TableCell>Infants</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Guest Type</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>RSVP Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((guest, index) => (
                    <TableRow key={index}>
                      <TableCell>{guest.name}</TableCell>
                      <TableCell>{guest.spouse}</TableCell>
                      <TableCell>{guest.children}</TableCell>
                      <TableCell>{guest.infants}</TableCell>
                      <TableCell>{guest.country}</TableCell>
                      <TableCell>{guest.guestType}</TableCell>
                      <TableCell>{guest.priority}</TableCell>
                      <TableCell>{guest.rsvpStatus}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? 'Uploading...' : 'Upload Guests'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default BulkImport; 