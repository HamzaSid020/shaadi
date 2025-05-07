import React, { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  Avatar,
  Typography,
  Alert,
  AlertTitle,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
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
  Contacts as ContactIcon,
  Settings as SettingsIcon,
  Person as UserIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DataTable } from '../components/DataTable';
import { ActivityLog, getRecentActivities } from '../services/loggingService';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: <InfoIcon /> },
  { value: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { value: 'events', label: 'Events', icon: <EventIcon /> },
  { value: 'budget', label: 'Budget', icon: <BudgetIcon /> },
  { value: 'tasks', label: 'Tasks', icon: <TaskIcon /> },
  { value: 'guests', label: 'Guests', icon: <GuestIcon /> },
  { value: 'vendors', label: 'Vendors', icon: <VendorIcon /> },
  { value: 'gifts', label: 'Gifts', icon: <GiftIcon /> },
  { value: 'outfits', label: 'Outfits', icon: <OutfitIcon /> },
  { value: 'seating', label: 'Seating', icon: <FoodIcon /> },
  { value: 'check-in', label: 'Check-In', icon: <CheckInIcon /> },
  { value: 'documents', label: 'Documents', icon: <DocumentIcon /> },
  { value: 'contacts', label: 'Contacts', icon: <ContactIcon /> },
  { value: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  { value: 'user', label: 'User', icon: <UserIcon /> },
];

const ActivityLogPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      try {
        const recentActivities = await getRecentActivities();
        setActivities(recentActivities);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const getCategoryIcon = (category: string) => {
    const categoryItem = CATEGORIES.find(cat => cat.value === category);
    return categoryItem ? categoryItem.icon : <InfoIcon />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      default:
        return <InfoIcon color="info" />;
    }
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

  const columns = [
    { 
      id: 'timestamp' as keyof ActivityLog, 
      label: 'Time', 
      sortable: true,
      minWidth: 180,
      format: (value: any) => format(value.toDate(), 'MMM dd, yyyy HH:mm'),
    },
    { 
      id: 'category' as keyof ActivityLog, 
      label: 'Category', 
      sortable: true,
      minWidth: 150,
      format: (value: string) => {
        const category = CATEGORIES.find(cat => cat.value === value) || CATEGORIES[0];
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: theme.palette.primary.main 
              }}
            >
              {category.icon}
            </Avatar>
            {category.label}
          </Box>
        );
      },
    },
    { 
      id: 'action' as keyof ActivityLog, 
      label: 'Action', 
      sortable: true,
      minWidth: 200,
    },
    { 
      id: 'details' as keyof ActivityLog, 
      label: 'Details', 
      minWidth: 300,
    },
    { 
      id: 'status' as keyof ActivityLog, 
      label: 'Status', 
      sortable: true,
      minWidth: 120,
      format: (value: string) => (
        <Chip
          icon={getStatusIcon(value)}
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          color={getStatusColor(value)}
          size="small"
        />
      ),
    },
  ];

  const filters = [
    {
      field: 'category',
      label: 'Category',
      options: CATEGORIES.slice(1).map(category => ({
        value: category.value,
        label: category.label,
      })),
    },
    {
      field: 'status',
      label: 'Status',
      options: [
        { value: 'success', label: 'Success' },
        { value: 'error', label: 'Error' },
        { value: 'warning', label: 'Warning' },
        { value: 'info', label: 'Info' },
      ],
    },
  ];

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          <AlertTitle>Authentication Required</AlertTitle>
          Please log in to view the activity log.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <DataTable<ActivityLog>
        title="Activity Log"
        columns={columns}
        data={activities}
        filters={filters}
        searchFields={['action', 'details', 'category']}
        defaultSort={{ field: 'timestamp', direction: 'desc' }}
      />
    </Box>
  );
};

export default ActivityLogPage; 