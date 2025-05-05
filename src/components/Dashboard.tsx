import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getGuests } from '../services/guestService';
import { Guest } from '../types/guest';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: getGuests,
  });

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading dashboard data...</Typography>
      </Box>
    );
  }

  // Calculate total guests and RSVP status
  const totalGuests = guests.length;

  // Calculate total people by RSVP status (including spouses and children)
  const calculateTotalPeople = (status: string) => {
    return guests
      .filter(g => g.rsvpStatus === status)
      .reduce((total, guest) => {
        return total + 1 + guest.spouse + guest.children;
      }, 0);
  };

  const totalAttending = calculateTotalPeople('accepted');
  const totalPending = calculateTotalPeople('pending');
  const totalDeclined = calculateTotalPeople('declined');

  // Calculate total children and infants
  const totalChildren = guests.reduce((total, guest) => total + guest.children, 0);
  const totalInfants = guests.reduce((total, guest) => total + guest.infants, 0);

  // Calculate gender distribution
  const genderDistribution = guests.reduce((acc, guest) => {
    acc[guest.gender] = (acc[guest.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate priority distribution
  const priorityDistribution = guests.reduce((acc, guest) => {
    acc[guest.priority] = (acc[guest.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate country distribution
  const countryDistribution = guests.reduce((acc, guest) => {
    acc[guest.country] = (acc[guest.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
    <Paper
      sx={{
        p: 3,
        background: `linear-gradient(45deg, ${theme.palette[color as keyof typeof theme.palette].main}, ${theme.palette[color as keyof typeof theme.palette].dark})`,
        color: 'white',
        borderRadius: 2,
        height: '100%',
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h3">{value}</Typography>
    </Paper>
  );

  const DistributionCard = ({ title, data, type = 'bar' }: { title: string; data: Record<string, number>; type?: 'bar' | 'pie' }) => (
    <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
      <Typography variant="h6" color="primary" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: 300, width: '100%', overflow: 'auto' }}>
        {Object.entries(data).map(([key, value]) => (
          <Box key={key} sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {value} ({((value / totalGuests) * 100).toFixed(1)}%)
              </Typography>
            </Box>
            <Box
              sx={{
                height: 8,
                backgroundColor: theme.palette.grey[200],
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${(value / totalGuests) * 100}%`,
                  backgroundColor: theme.palette.primary.main,
                  transition: 'width 0.3s ease-in-out',
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Guest List Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Guests Invited" value={totalGuests} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total People Attending" value={totalAttending} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total People Pending" value={totalPending} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total People Declined" value={totalDeclined} color="error" />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Children" value={totalChildren} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Infants" value={totalInfants} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Response Rate"
            value={Math.round(((totalAttending + totalDeclined) / totalGuests) * 100)}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Acceptance Rate"
            value={Math.round((totalAttending / (totalAttending + totalDeclined)) * 100)}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DistributionCard 
            title="RSVP Status Distribution" 
            data={{
              'Attending': totalAttending,
              'Pending': totalPending,
              'Declined': totalDeclined
            }} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DistributionCard title="Country Distribution" data={countryDistribution} />
        </Grid>
        <Grid item xs={12}>
          <DistributionCard title="Priority Distribution" data={priorityDistribution} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 