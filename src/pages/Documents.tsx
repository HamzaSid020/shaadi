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
  Link,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  CloudUpload as UploadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataTable } from '../components/DataTable';
import { Document } from '../types/models';
import {
  createDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
} from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../services/loggingService';
import { format } from 'date-fns';

const documentTypes = [
  'contract',
  'receipt',
  'id',
  'other',
] as const;

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [detailViewDocument, setDetailViewDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState<Partial<Document>>({
    name: '',
    type: 'other',
    url: '',
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    const loadedDocuments = await getDocuments();
    setDocuments(loadedDocuments.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleOpenDialog = (document?: Document) => {
    if (document) {
      setSelectedDocument(document);
      setFormData(document);
    } else {
      setSelectedDocument(null);
      setFormData({
        name: '',
        type: 'other',
        url: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDocument(null);
  };

  const handleOpenDetailView = (document: Document) => {
    setDetailViewDocument(document);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.url) return;

    try {
      if (selectedDocument) {
        await updateDocument(selectedDocument.id, formData);
      } else {
        await createDocument(formData as Omit<Document, 'id' | 'createdAt'>);
      }
      handleCloseDialog();
      loadDocuments();
      if (user) {
        await logActivity({
          userId: user.uid,
          action: 'Updated Document',
          details: `Updated document: ${formData.name}`,
          category: 'documents',
          status: 'success'
        });
      }
    } catch (error) {
      console.error('Error saving document:', error);
      if (user) {
        await logActivity({
          userId: user.uid,
          action: 'Failed to Update Document',
          details: `Failed to update document: ${formData.name}`,
          category: 'documents',
          status: 'error'
        });
      }
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      if (user) {
        await logActivity({
          userId: user.uid,
          action: 'Deleted Document',
          details: `Deleted document with ID: ${documentId}`,
          category: 'documents',
          status: 'success'
        });
      }
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      if (user) {
        await logActivity({
          userId: user.uid,
          action: 'Failed to Delete Document',
          details: `Failed to delete document with ID: ${documentId}`,
          category: 'documents',
          status: 'error'
        });
      }
    }
  };

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'contract':
        return 'primary';
      case 'receipt':
        return 'success';
      case 'id':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'contract':
        return <DescriptionIcon />;
      case 'receipt':
        return <PdfIcon />;
      case 'id':
        return <ImageIcon />;
      default:
        return <FileIcon />;
    }
  };

  const columns = [
    { 
      id: 'name' as keyof Document, 
      label: 'Name', 
      sortable: true,
      minWidth: 200,
    },
    { 
      id: 'type' as keyof Document, 
      label: 'Type', 
      sortable: true,
      minWidth: 120,
      format: (value: Document['type']) => (
        <Chip 
          icon={getTypeIcon(value)}
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          color={getTypeColor(value)}
          size="small"
        />
      ),
    },
    { 
      id: 'uploadedBy' as keyof Document, 
      label: 'Uploaded By', 
      sortable: true,
      minWidth: 150,
    },
    { 
      id: 'createdAt' as keyof Document, 
      label: 'Upload Date', 
      sortable: true,
      minWidth: 150,
      format: (value: Date) => format(value, 'MMM dd, yyyy'),
    },
    { 
      id: 'url' as keyof Document, 
      label: 'Document', 
      minWidth: 120,
      format: (value: string) => (
        <Link
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
        >
          <ViewIcon fontSize="small" />
          View
        </Link>
      ),
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
      field: 'type',
      label: 'Document Type',
      options: documentTypes.map(type => ({ 
        value: type, 
        label: type.charAt(0).toUpperCase() + type.slice(1) 
      })),
    },
  ];

  const getRowActions = (document: Document) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDialog(document);
        }}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleDelete(document.id);
        }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="View Details">
        <IconButton size="small" onClick={(e) => {
          e.stopPropagation();
          handleOpenDetailView(document);
        }}>
          <ViewIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <DataTable<Document>
        title="Documents"
        columns={columns}
        data={documents}
        filters={filters}
        onAdd={() => handleOpenDialog()}
        onRowClick={handleOpenDetailView}
        getRowActions={getRowActions}
        searchFields={['name', 'uploadedBy']}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedDocument ? 'Edit Document' : 'Add New Document'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Document['type'] })}
                >
                  {documentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document URL"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                helperText="Enter the URL where the document is stored"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedDocument ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog 
        open={Boolean(detailViewDocument)} 
        onClose={() => setDetailViewDocument(null)}
        maxWidth="md"
        fullWidth
      >
        {detailViewDocument && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Document Details
                <IconButton onClick={() => setDetailViewDocument(null)} size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6">{detailViewDocument.name}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      icon={getTypeIcon(detailViewDocument.type)}
                      label={detailViewDocument.type.charAt(0).toUpperCase() + detailViewDocument.type.slice(1)}
                      color={getTypeColor(detailViewDocument.type)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Uploaded By</Typography>
                    <Typography>{detailViewDocument.uploadedBy}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Upload Date</Typography>
                    <Typography>
                      {format(detailViewDocument.createdAt, 'MMMM dd, yyyy')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Document Link</Typography>
                    <Link
                      href={detailViewDocument.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <ViewIcon fontSize="small" />
                      View Document
                    </Link>
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

export default DocumentsPage; 