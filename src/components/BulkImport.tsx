import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';
import { bulkImportGuests } from '../utils/bulkImport';

const BulkImport: React.FC = () => {
  const [jsonData, setJsonData] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Parse the JSON data
      const guests = JSON.parse(jsonData);
      
      // Validate the data structure
      if (!Array.isArray(guests)) {
        throw new Error('Data must be an array of guests');
      }

      // Import the guests
      await bulkImportGuests(guests);
      setSuccess(true);
      setJsonData(''); // Clear the input after successful import
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import guests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Bulk Import Guests
        </Typography>
        
        <Typography variant="body1" paragraph>
          Paste your guest data in JSON format below. The data should be an array of guest objects.
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" paragraph>
          Example format:
        </Typography>
        <Box component="pre" sx={{ 
          p: 2, 
          bgcolor: 'grey.100', 
          borderRadius: 1,
          overflow: 'auto',
          mb: 2
        }}>
          {`[
  {
    "id": "guest_1",
    "name": "John Doe",
    "spouse": 1,
    "children": 2,
    "infants": 0,
    "hasInfant": false,
    "country": "US",
    "guestType": "family",
    "priority": "high",
    "rsvpStatus": "pending"
  }
]`}
        </Box>

        <TextField
          fullWidth
          multiline
          rows={10}
          value={jsonData}
          onChange={(e) => setJsonData(e.target.value)}
          placeholder="Paste your JSON data here..."
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleImport}
          disabled={loading || !jsonData.trim()}
          sx={{ mb: 2 }}
        >
          {loading ? 'Importing...' : 'Import Guests'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Guests imported successfully!
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default BulkImport; 