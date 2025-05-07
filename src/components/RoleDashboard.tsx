import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Event as EventIcon,
  Assignment as TaskIcon,
  People as GuestIcon,
  Store as VendorIcon,
  CardGiftcard as GiftIcon,
  Restaurant as FoodIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import { UserRole } from '../types/auth';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';

interface RoleDashboardProps {
  role: UserRole;
  metrics: {
    totalBudget: number;
    spent: number;
    remaining: number;
    upcomingEvents: number;
    pendingTasks: number;
    totalGuests: number;
    confirmedGuests: number;
    vendors: number;
    gifts: number;
    dietaryRequirements: number;
    documents: number;
  };
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    time: string;
    status: string;
  }>;
}

const RoleDashboard: React.FC<RoleDashboardProps> = ({ role, metrics, recentActivities }) => {
  const { currency } = useCurrency();

  const AdminDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Budget</Typography>
            <Typography variant="h4">{formatCurrency(metrics.totalBudget, currency)}</Typography>
            <LinearProgress
              variant="determinate"
              value={(metrics.spent / metrics.totalBudget) * 100}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">User Statistics</Typography>
            <List>
              <ListItem>
                <ListItemIcon><GuestIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.confirmedGuests}/${metrics.totalGuests} Guests`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><VendorIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.vendors} Vendors`} />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">System Overview</Typography>
            <List>
              <ListItem>
                <ListItemIcon><DocumentIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.documents} Documents`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><TaskIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.pendingTasks} Pending Tasks`} />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const OrganizerDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Event Planning</Typography>
            <List>
              <ListItem>
                <ListItemIcon><EventIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.upcomingEvents} Upcoming Events`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><TaskIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.pendingTasks} Tasks to Complete`} />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6">Guest Management</Typography>
            <List>
              <ListItem>
                <ListItemIcon><GuestIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.confirmedGuests}/${metrics.totalGuests} Confirmed`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><FoodIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.dietaryRequirements} Dietary Requirements`} />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const VendorDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">Your Services</Typography>
            <List>
              <ListItem>
                <ListItemIcon><EventIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.upcomingEvents} Assigned Events`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><TaskIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.pendingTasks} Pending Tasks`} />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const GuestDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">Event Information</Typography>
            <List>
              <ListItem>
                <ListItemIcon><EventIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.upcomingEvents} Upcoming Events`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><GiftIcon /></ListItemIcon>
                <ListItemText primary={`${metrics.gifts} Registry Items`} />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'organizer':
        return <OrganizerDashboard />;
      case 'vendor':
        return <VendorDashboard />;
      case 'guest':
        return <GuestDashboard />;
      default:
        return <GuestDashboard />;
    }
  };

  return (
    <Box>
      {renderDashboard()}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Activities</Typography>
              <List>
                {recentActivities.map((activity) => (
                  <ListItem key={activity.id}>
                    <ListItemIcon>
                      {activity.type === 'event' ? <EventIcon /> :
                       activity.type === 'task' ? <TaskIcon /> :
                       activity.type === 'guest' ? <GuestIcon /> :
                       <DocumentIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.time}
                    />
                    <Chip
                      label={activity.status}
                      color={activity.status === 'completed' ? 'success' :
                             activity.status === 'pending' ? 'warning' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoleDashboard; 