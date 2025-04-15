import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface MatrixFormProps {
  matrix?: any;
  type: 'responsibility' | 'RACI' | 'interaction';
  onSubmit: (matrix: any) => void;
  onCancel: () => void;
}

interface Row {
  id: string;
  label: string;
  description: string;
}

interface Column {
  id: string;
  roleId: string;
  departmentId: string;
}

const MatrixForm: React.FC<MatrixFormProps> = ({ matrix, type, onSubmit, onCancel }) => {
  const { items: departments } = useSelector((state: RootState) => state.departments);
  const { items: roles } = useSelector((state: RootState) => state.roles);
  
  // Basic information
  const [name, setName] = useState(matrix?.name || '');
  const [nameError, setNameError] = useState('');
  
  // Rows (responsibilities or activities)
  const [rows, setRows] = useState<Row[]>(matrix?.data?.rows || []);
  const [newRowLabel, setNewRowLabel] = useState('');
  const [newRowDescription, setNewRowDescription] = useState('');
  
  // Columns (roles)
  const [columns, setColumns] = useState<Column[]>(matrix?.data?.columns || []);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  // Handle adding a new row
  const handleAddRow = () => {
    if (newRowLabel.trim()) {
      setRows([
        ...rows,
        {
          id: `row-${Date.now()}`,
          label: newRowLabel,
          description: newRowDescription
        }
      ]);
      setNewRowLabel('');
      setNewRowDescription('');
    }
  };
  
  // Handle removing a row
  const handleRemoveRow = (rowId: string) => {
    setRows(rows.filter((row: Row) => row.id !== rowId));
  };
  
  // Handle adding a new column (role)
  const handleAddColumn = () => {
    if (selectedRole) {
      // Check if role is already added
      if (columns.some((col: Column) => col.roleId === selectedRole)) {
        return;
      }
      
      setColumns([
        ...columns,
        {
          id: `col-${Date.now()}`,
          roleId: selectedRole,
          departmentId: selectedDepartment
        }
      ]);
      setSelectedRole('');
    }
  };
  
  // Handle removing a column
  const handleRemoveColumn = (columnId: string) => {
    setColumns(columns.filter((col: Column) => col.id !== columnId));
  };
  
  // Get filtered roles based on selected department
  const getFilteredRoles = () => {
    if (!selectedDepartment) return roles;
    return roles.filter(role => role.departmentId === selectedDepartment);
  };
  
  // Get role title by ID
  const getRoleTitle = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.title : 'Unknown Role';
  };
  
  // Get department name by ID
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      setNameError('Matrix name is required');
      return;
    }
    
    if (rows.length === 0) {
      alert('Please add at least one row');
      return;
    }
    
    if (columns.length === 0) {
      alert('Please add at least one role column');
      return;
    }
    
    // Prepare matrix data
    const matrixData = {
      name,
      type,
      organizationId: 'default', // This would be dynamic in a multi-tenant app
      data: {
        rows,
        columns,
        cells: matrix?.data?.cells || []
      }
    };
    
    onSubmit(matrixData);
  };
  
  // Get title based on matrix type
  const getTypeTitle = () => {
    switch (type) {
      case 'responsibility': return 'Responsibility Matrix';
      case 'RACI': return 'RACI Chart';
      case 'interaction': return 'Interaction Map';
      default: return 'Matrix';
    }
  };

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {matrix ? `Edit ${getTypeTitle()}` : `Create New ${getTypeTitle()}`}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Matrix Name"
              type="text"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) {
                  setNameError('');
                }
              }}
              error={!!nameError}
              helperText={nameError}
              required
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: '48%' } }}>
              <Typography variant="h6" gutterBottom>
                {type === 'RACI' ? 'Activities/Decisions' : 'Responsibilities'}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <TextField
                  margin="dense"
                  id="newRowLabel"
                  label={type === 'RACI' ? 'Activity/Decision Name' : 'Responsibility Name'}
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newRowLabel}
                  onChange={(e) => setNewRowLabel(e.target.value)}
                />
                <TextField
                  margin="dense"
                  id="newRowDescription"
                  label="Description"
                  type="text"
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  value={newRowDescription}
                  onChange={(e) => setNewRowDescription(e.target.value)}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddRow}
                  disabled={!newRowLabel.trim()}
                  sx={{ mt: 1 }}
                >
                  Add {type === 'RACI' ? 'Activity' : 'Responsibility'}
                </Button>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Current {type === 'RACI' ? 'Activities' : 'Responsibilities'}:
              </Typography>
              {rows.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No {type === 'RACI' ? 'activities' : 'responsibilities'} added yet.
                </Typography>
              ) : (
                <List>
                  {rows.map((row) => (
                    <ListItem key={row.id}>
                      <ListItemText 
                        primary={row.label} 
                        secondary={row.description} 
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleRemoveRow(row.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            
            <Box sx={{ width: { xs: '100%', md: '48%' } }}>
              <Typography variant="h6" gutterBottom>
                Roles
              </Typography>
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="department-select-label">Department</InputLabel>
                  <Select
                    labelId="department-select-label"
                    id="department-select"
                    value={selectedDepartment}
                    label="Department"
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setSelectedRole('');
                    }}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="dense">
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={selectedRole}
                    label="Role"
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <MenuItem value="">Select a role</MenuItem>
                    {getFilteredRoles().map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.title} {role.level ? `(${role.level})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddColumn}
                  disabled={!selectedRole}
                  sx={{ mt: 1 }}
                >
                  Add Role
                </Button>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Selected Roles:
              </Typography>
              {columns.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No roles added yet.
                </Typography>
              ) : (
                <List>
                  {columns.map((column) => (
                    <ListItem key={column.id}>
                      <ListItemText 
                        primary={getRoleTitle(column.roleId)} 
                        secondary={getDepartmentName(column.departmentId)} 
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleRemoveColumn(column.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
          
          {type === 'RACI' && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                RACI Legend:
              </Typography>
              <Typography variant="body2">
                <strong>R - Responsible:</strong> Those who do the work to complete the task.
              </Typography>
              <Typography variant="body2">
                <strong>A - Accountable:</strong> The one ultimately answerable for the correct completion of the task.
              </Typography>
              <Typography variant="body2">
                <strong>C - Consulted:</strong> Those whose opinions are sought, typically subject matter experts.
              </Typography>
              <Typography variant="body2">
                <strong>I - Informed:</strong> Those who are kept up-to-date on progress, often only on completion.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {matrix ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MatrixForm;
