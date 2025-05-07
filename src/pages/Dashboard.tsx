import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import {
  Event as EventIcon,
  AccountBalance as BudgetIcon,
  Assignment as TaskIcon,
  People as GuestIcon,
  Store as VendorIcon,
  CardGiftcard as GiftIcon,
  Checkroom as OutfitIcon,
  Restaurant as FoodIcon,
  QrCode as CheckInIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as TimeIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useCurrency } from '../context/CurrencyContext';
import { formatCurrency } from '../utils/currencyUtils';
import {
  getEvents,
  getBudgets,
  getTasks,
  getGuests,
  getVendors,
  getGifts,
  getOutfits,
  getDocuments,
} from '../services/firebaseService';
import { getRecentActivities } from '../services/loggingService';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { currency } = useCurrency();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalBudget: 0,
    spent: 0,
    remaining: 0,
    upcomingEvents: 0,
    pendingTasks: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    vendors: 0,
    gifts: 0,
    outfits: 0,
    dietaryRequirements: 0,
    checkIns: 0,
    documents: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [
          events,
          budgets,
          tasks,
          guests,
          vendors,
          gifts,
          outfits,
          documents,
          activities,
        ] = await Promise.all([
          getEvents(),
          getBudgets(),
          getTasks(),
          getGuests(),
          getVendors(),
          getGifts(),
          getOutfits(),
          getDocuments(),
          getRecentActivities(5),
        ]);

        // Calculate metrics
        const now = new Date();
        console.log('Current time:', now.toISOString());
        
        const upcomingEvents = events.filter(event => {
          try {
            // Handle Firestore Timestamp
            let eventDate: Date;
            if (event.date instanceof Timestamp) {
              eventDate = event.date.toDate();
            } else if (event.date instanceof Date) {
              eventDate = event.date;
            } else {
              eventDate = new Date(event.date);
            }

            if (isNaN(eventDate.getTime())) {
              console.warn('Invalid event date:', event.date);
              return false;
            }
            
            // Create a new date object for today at midnight
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            
            console.log('Event:', event.name, 'Date:', eventDate.toISOString());
            return eventDate >= today;
          } catch (error) {
            console.warn('Error processing event date:', error);
            return false;
          }
        }).length;
        
        console.log('Upcoming events count:', upcomingEvents);
        const pendingTasks = tasks.filter(task => task.status !== 'Completed').length;
        const confirmedGuests = guests.filter(guest => guest.rsvpStatus === 'attending').length;
        const totalBudget = budgets.reduce((sum, budget) => sum + (budget.estimatedCost || 0), 0);
        const spent = budgets.reduce((sum, budget) => sum + (budget.actualCost || 0), 0);
        const dietaryRequirements = guests.filter(guest => guest.dietaryRestrictions && guest.dietaryRestrictions.length > 0).length;
        const checkIns = guests.filter(guest => guest.checkInStatus === 'checked_in').length;

        // Format activities for display
        const formattedActivities = activities.map(activity => ({
          id: activity.id,
          type: activity.category,
          title: activity.action,
          time: format(activity.timestamp.toDate(), 'MMM dd, HH:mm'),
          status: activity.status,
          details: activity.details,
        }));

        setRecentActivities(formattedActivities);
        setMetrics({
          totalBudget,
          spent,
          remaining: totalBudget - spent,
          upcomingEvents,
          pendingTasks,
          totalGuests: guests.length,
          confirmedGuests,
          vendors: vendors.length,
          gifts: gifts.length,
          outfits: outfits.length,
          dietaryRequirements,
          checkIns,
          documents: documents.length,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, []);

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Budget Spent',
        data: [30000, 45000, 60000, 80000, 100000, 120000],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        tension: 0.4,
      },
      {
        label: 'Budget Planned',
        data: [40000, 50000, 70000, 90000, 110000, 130000],
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.light,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Budget Overview',
      },
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'dashboard':
        return <DashboardIcon />;
      case 'events':
        return <EventIcon />;
      case 'budget':
        return <BudgetIcon />;
      case 'tasks':
        return <TaskIcon />;
      case 'guests':
        return <GuestIcon />;
      case 'vendors':
        return <VendorIcon />;
      case 'gifts':
        return <GiftIcon />;
      case 'outfits':
        return <OutfitIcon />;
      case 'check-in':
        return <CheckInIcon />;
      case 'documents':
        return <DocumentIcon />;
      default:
        return <TimeIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.primary.main, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Total Budget
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(metrics.totalBudget || 0, currency)}
                  </Typography>
                </Box>
                <BudgetIcon sx={{ fontSize: 40 }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.totalBudget ? (metrics.spent / metrics.totalBudget) * 100 : 0}
                sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {formatCurrency(metrics.spent || 0, currency)} spent
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.secondary.main, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Guests
                  </Typography>
                  <Typography variant="h4">
                    {metrics.confirmedGuests || 0}/{metrics.totalGuests || 0}
                  </Typography>
                </Box>
                <GuestIcon sx={{ fontSize: 40 }} />
              </Box>
              <LinearProgress
                variant="determinate"
                value={metrics.totalGuests ? (metrics.confirmedGuests / metrics.totalGuests) * 100 : 0}
                sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {metrics.confirmedGuests || 0} confirmed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.success.main, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Tasks
                  </Typography>
                  <Typography variant="h4">
                    {metrics.pendingTasks || 0}
                  </Typography>
                </Box>
                <TaskIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Pending tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: theme.palette.info.main, color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Events
                  </Typography>
                  <Typography variant="h4">
                    {metrics.upcomingEvents || 0}
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Events scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Vendors
                  </Typography>
                  <Typography variant="h4">
                    {metrics.vendors || 0}
                  </Typography>
                </Box>
                <VendorIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Gifts
                  </Typography>
                  <Typography variant="h4">
                    {metrics.gifts || 0}
                  </Typography>
                </Box>
                <GiftIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Outfits
                  </Typography>
                  <Typography variant="h4">
                    {metrics.outfits || 0}
                  </Typography>
                </Box>
                <OutfitIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Documents
                  </Typography>
                  <Typography variant="h4">
                    {metrics.documents || 0}
                  </Typography>
                </Box>
                <DocumentIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Line data={chartData} options={chartOptions} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Activities
                </Typography>
                <Button
                  size="small"
                  endIcon={<HistoryIcon />}
                  onClick={() => window.location.href = '/activity-log'}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentActivities.map((activity) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary">
                              {activity.details}
                            </Typography>
                            <br />
                            {activity.time}
                          </React.Fragment>
                        }
                      />
                      <Chip
                        label={activity.status}
                        color={getStatusColor(activity.status)}
                        size="small"
                      />
                    </ListItem>
                    {activity !== recentActivities[recentActivities.length - 1] && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Vendor Management
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VendorIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body1">
                      {metrics.vendors} Vendors
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <GiftIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body1">
                      {metrics.gifts} Gifts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <OutfitIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                    <Typography variant="body1">
                      {metrics.outfits} Outfits
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FoodIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                    <Typography variant="body1">
                      {metrics.dietaryRequirements} Dietary Requirements
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Event Progress
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckInIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="body1">
                      {metrics.checkIns}/{metrics.confirmedGuests} Check-ins
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DocumentIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                    <Typography variant="body1">
                      {metrics.documents} Documents
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Check-in Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={metrics.confirmedGuests ? (metrics.checkIns / metrics.confirmedGuests) * 100 : 0}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      {metrics.checkIns} of {metrics.confirmedGuests} guests checked in
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 