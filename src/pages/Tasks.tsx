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
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { DataTable } from '../components/DataTable';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types/models';
import { format } from 'date-fns';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../services/firebaseService';
import { logUserAction } from '../utils/loggingUtils';

const priorities: Task['priority'][] = ['Low', 'Medium', 'High'];
const statuses: Task['status'][] = ['Todo', 'In Progress', 'Completed'];

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailViewTask, setDetailViewTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'Medium',
    status: 'Todo',
    assignedTo: '',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const columns = [
    { 
      id: 'title' as keyof Task, 
      label: 'Task', 
      sortable: true,
      minWidth: 200,
    },
    { 
      id: 'priority' as keyof Task, 
      label: 'Priority', 
      sortable: true,
      minWidth: 100,
      format: (value: Task['priority']) => (
        <Chip 
          label={value} 
          color={getPriorityColor(value)}
          size="small"
        />
      ),
    },
    { 
      id: 'status' as keyof Task, 
      label: 'Status', 
      sortable: true,
      minWidth: 120,
      format: (value: Task['status']) => (
        <Chip 
          label={value} 
          color={getStatusColor(value)}
          size="small"
        />
      ),
    },
    { 
      id: 'dueDate' as keyof Task, 
      label: 'Due Date', 
      sortable: true,
      minWidth: 120,
      format: (value: Date | string | undefined) => {
        if (!value) return '-';
        try {
          const date = value instanceof Date ? value : new Date(value);
          return isNaN(date.getTime()) ? '-' : format(date, 'MMM dd, yyyy');
        } catch (error) {
          console.error('Error formatting date:', error);
          return '-';
        }
      },
    },
    { 
      id: 'assignedTo' as keyof Task, 
      label: 'Assigned To', 
      sortable: true,
      minWidth: 150,
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
      field: 'priority',
      label: 'Priority',
      options: priorities.map(p => ({ value: p, label: p })),
    },
    {
      field: 'status',
      label: 'Status',
      options: statuses.map(s => ({ value: s, label: s })),
    },
  ];

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        dueDate: undefined,
        priority: 'Medium',
        status: 'Todo',
        assignedTo: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleOpenDetailView = (task: Task) => {
    setDetailViewTask(task);
  };

  const getRowActions = (task: Task) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDialog(task);
        }}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleDelete(task.id);
        }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Assignee">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          // Handle viewing assignee details
        }}>
          <PersonIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Timeline">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          // Handle viewing task timeline
        }}>
          <ScheduleIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Todo':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.status || !formData.priority) {
        return;
      }

      if (selectedTask) {
        await updateTask(selectedTask.id, formData);
        if (user) {
          await logUserAction(
            user.uid,
            'Updated Task',
            `Updated task: ${formData.title}`,
            'tasks'
          );
        }
      } else {
        await createTask(formData as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
        if (user) {
          await logUserAction(
            user.uid,
            'Created Task',
            `Created new task: ${formData.title}`,
            'tasks'
          );
        }
      }
      handleCloseDialog();
      loadTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      if (user) {
        await logUserAction(
          user.uid,
          selectedTask ? 'Failed to Update Task' : 'Failed to Create Task',
          `Error with task: ${formData.title}`,
          'tasks',
          'error'
        );
      }
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      loadTasks();
      if (user) {
        await logUserAction(
          user.uid,
          'Deleted Task',
          `Deleted task with ID: ${taskId}`,
          'tasks'
        );
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      if (user) {
        await logUserAction(
          user.uid,
          'Failed to Delete Task',
          `Failed to delete task with ID: ${taskId}`,
          'tasks',
          'error'
        );
      }
    }
  };

  const handleStatusChange = async (task: Task) => {
    const newStatus: Task['status'] = task.status === 'Todo' ? 'In Progress' : 
                                    task.status === 'In Progress' ? 'Completed' : 'Todo';
    try {
      await updateTask(task.id, { status: newStatus });
      loadTasks();
      if (user) {
        await logUserAction(
          user.uid,
          'Updated Task Status',
          `Updated task status to: ${newStatus}`,
          'tasks'
        );
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      if (user) {
        await logUserAction(
          user.uid,
          'Failed to Update Task Status',
          `Failed to update task status to: ${newStatus}`,
          'tasks',
          'error'
        );
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <DataTable<Task>
        title="Tasks"
        columns={columns}
        data={tasks}
        filters={filters}
        onAdd={() => handleOpenDialog()}
        onRowClick={handleOpenDetailView}
        getRowActions={getRowActions}
        searchFields={['title', 'description', 'assignedTo']}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={format(formData.dueDate || new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setFormData({ ...formData, dueDate: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Assigned To"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog 
        open={Boolean(detailViewTask)} 
        onClose={() => setDetailViewTask(null)}
        maxWidth="md"
        fullWidth
      >
        {detailViewTask && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Task Details
                <IconButton onClick={() => setDetailViewTask(null)} size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6">{detailViewTask.title}</Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {detailViewTask.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Status</Typography>
                    <Chip 
                      label={detailViewTask.status}
                      color={getStatusColor(detailViewTask.status)}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Priority</Typography>
                    <Chip 
                      label={detailViewTask.priority}
                      color={getPriorityColor(detailViewTask.priority)}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Due Date</Typography>
                    <Typography>
                      {format(detailViewTask.dueDate, 'MMMM dd, yyyy')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Assigned To</Typography>
                    <Typography>{detailViewTask.assignedTo}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TasksPage; 