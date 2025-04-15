import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  IconButton, 
  Tooltip, 
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  CloudUpload as UploadIcon, 
  CloudDownload as DownloadIcon, 
  Save as SaveIcon, 
  Refresh as RefreshIcon,
  Backup as BackupIcon,
  History as HistoryIcon,
  RestoreFromTrash as RestoreIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';

const DataManager: React.FC = () => {
  const dispatch = useDispatch();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState('json');
  const [exportScope, setExportScope] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Mock data for backups
  const backups = [
    { id: 'backup1', name: 'Auto Backup', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), size: '2.4 MB' },
    { id: 'backup2', name: 'Manual Backup', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), size: '2.3 MB' },
    { id: 'backup3', name: 'Pre-Update Backup', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), size: '2.1 MB' },
    { id: 'backup4', name: 'Initial Setup', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), size: '1.8 MB' }
  ];
  
  // Handle file selection for import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  // Handle import
  const handleImport = () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    // Simulate import process
    setTimeout(() => {
      setIsProcessing(false);
      setImportDialogOpen(false);
      setSelectedFile(null);
      
      // Show success message
      setSnackbarMessage('Data imported successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 2000);
  };
  
  // Handle export
  const handleExport = () => {
    setIsProcessing(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsProcessing(false);
      setExportDialogOpen(false);
      
      // Create and download a dummy file
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify({ data: 'sample export data' })], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `organization-structure-export.${exportFormat}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Show success message
      setSnackbarMessage('Data exported successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 2000);
  };
  
  // Handle backup
  const handleBackup = () => {
    setIsProcessing(true);
    
    // Simulate backup process
    setTimeout(() => {
      setIsProcessing(false);
      setBackupDialogOpen(false);
      
      // Show success message
      setSnackbarMessage('Backup created successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 2000);
  };
  
  // Handle restore
  const handleRestore = (backupId: string) => {
    setIsProcessing(true);
    
    // Simulate restore process
    setTimeout(() => {
      setIsProcessing(false);
      setRestoreDialogOpen(false);
      
      // Show success message
      setSnackbarMessage('Data restored successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 2000);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Data Management
      </Typography>
      
      <Typography variant="body1" paragraph>
        Import, export, backup, and restore your organizational structure data.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader title="Data Import & Export" />
            <CardContent>
              <Typography variant="body2" paragraph>
                Import data from external sources or export your current organization structure.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<UploadIcon />}
                  onClick={() => setImportDialogOpen(true)}
                  fullWidth
                >
                  Import Data
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={() => setExportDialogOpen(true)}
                  fullWidth
                >
                  Export Data
                </Button>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Supported Formats:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 60 }}>
                    Import:
                  </Typography>
                  <Typography variant="body2">
                    JSON, CSV, Excel (.xlsx)
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 60 }}>
                    Export:
                  </Typography>
                  <Typography variant="body2">
                    JSON, CSV, Excel (.xlsx), PDF
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardHeader title="Backup & Restore" />
            <CardContent>
              <Typography variant="body2" paragraph>
                Create backups of your data or restore from previous backups.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<BackupIcon />}
                  onClick={() => setBackupDialogOpen(true)}
                  fullWidth
                >
                  Create Backup
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<RestoreIcon />}
                  onClick={() => setRestoreDialogOpen(true)}
                  fullWidth
                >
                  Restore Data
                </Button>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Backup Schedule:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 100 }}>
                    Auto Backup:
                  </Typography>
                  <Typography variant="body2">
                    Every 24 hours
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 100 }}>
                    Retention:
                  </Typography>
                  <Typography variant="body2">
                    Last 10 backups
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Import data from an external file. This will merge with or replace your existing data.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <input
              accept=".json,.csv,.xlsx"
              style={{ display: 'none' }}
              id="import-file-button"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="import-file-button">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Select File
              </Button>
            </label>
            
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {selectedFile.name}
              </Typography>
            )}
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="import-mode-label">Import Mode</InputLabel>
            <Select
              labelId="import-mode-label"
              value="merge"
              label="Import Mode"
            >
              <MenuItem value="merge">Merge with existing data</MenuItem>
              <MenuItem value="replace">Replace existing data</MenuItem>
            </Select>
          </FormControl>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            Importing data may overwrite existing information. Make sure to backup your data first.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleImport}
            disabled={!selectedFile || isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            {isProcessing ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Export your organization structure data to a file.
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="export-format-label">Export Format</InputLabel>
            <Select
              labelId="export-format-label"
              value={exportFormat}
              label="Export Format"
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="export-scope-label">Export Scope</InputLabel>
            <Select
              labelId="export-scope-label"
              value={exportScope}
              label="Export Scope"
              onChange={(e) => setExportScope(e.target.value)}
            >
              <MenuItem value="all">All Data</MenuItem>
              <MenuItem value="departments">Departments Only</MenuItem>
              <MenuItem value="roles">Roles Only</MenuItem>
              <MenuItem value="matrices">Matrices Only</MenuItem>
              <MenuItem value="charts">Charts Only</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleExport}
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : <DownloadIcon />}
          >
            {isProcessing ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Backup Dialog */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)}>
        <DialogTitle>Create Backup</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Create a backup of your current organization structure data.
          </Typography>
          
          <TextField
            fullWidth
            label="Backup Name"
            variant="outlined"
            defaultValue={`Backup ${new Date().toLocaleDateString()}`}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Backups are stored securely in the cloud and can be restored at any time.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleBackup}
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : <BackupIcon />}
          >
            {isProcessing ? 'Creating Backup...' : 'Create Backup'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Restore Dialog */}
      <Dialog 
        open={restoreDialogOpen} 
        onClose={() => setRestoreDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Restore Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Restore your organization structure from a previous backup.
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 2 }}>
            Restoring will replace your current data with the selected backup. This action cannot be undone.
          </Alert>
          
          <List>
            {backups.map((backup) => (
              <ListItem key={backup.id} divider>
                <ListItemIcon>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary={backup.name}
                  secondary={`${formatDate(backup.timestamp)} • ${backup.size}`}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleRestore(backup.id)}
                  disabled={isProcessing}
                  startIcon={isProcessing ? <CircularProgress size={20} /> : <RestoreIcon />}
                >
                  {isProcessing ? 'Restoring...' : 'Restore'}
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataManager;
