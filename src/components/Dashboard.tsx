import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Guest } from '../types/guest';

const Dashboard: React.FC = () => {
  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, 'guests'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Guest[];
    }
  });

  const totalGuests = guests.length;
  const totalSpouses = guests.reduce((total, guest) => total + guest.spouse, 0);
  const totalChildren = guests.reduce((total, guest) => total + guest.children, 0);
  const totalInfants = guests.reduce((total, guest) => total + guest.infants, 0);

  const confirmedGuests = guests.filter(g => g.rsvpStatus === 'confirmed').length;
  const pendingGuests = guests.filter(g => g.rsvpStatus === 'pending').length;
  const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined').length;

  const familyGuests = guests.filter(g => g.guestType === 'family').length;
  const friendGuests = guests.filter(g => g.guestType === 'friend').length;
  const colleagueGuests = guests.filter(g => g.guestType === 'colleague').length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Guests
              </Typography>
              <Typography variant="h4">
                {totalGuests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Spouses
              </Typography>
              <Typography variant="h4">
                {totalSpouses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Children
              </Typography>
              <Typography variant="h4">
                {totalChildren}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Infants
              </Typography>
              <Typography variant="h4">
                {totalInfants}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                RSVP Status
              </Typography>
              <Typography>Confirmed: {confirmedGuests}</Typography>
              <Typography>Pending: {pendingGuests}</Typography>
              <Typography>Declined: {declinedGuests}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Guest Types
              </Typography>
              <Typography>Family: {familyGuests}</Typography>
              <Typography>Friends: {friendGuests}</Typography>
              <Typography>Colleagues: {colleagueGuests}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 