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
  Grid,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ChartFormProps {
  chart?: any;
  onSubmit: (chart: any) => void;
  onCancel: () => void;
}

const ChartForm: React.FC<ChartFormProps> = ({ chart, onSubmit, onCancel }) => {
  const { items: departments } = useSelector((state: RootState) => state.departments);
  
  // Basic information
  const [name, setName] = useState(chart?.name || '');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState(chart?.description || '');
  const [organizationName, setOrganizationName] = useState(chart?.organizationName || '');
  
  // Chart options
  const [includeDepartments, setIncludeDepartments] = useState(
    chart?.options?.includeDepartments !== undefined ? chart.options.includeDepartments : true
  );
  const [includeRoles, setIncludeRoles] = useState(
    chart?.options?.includeRoles !== undefined ? chart.options.includeRoles : true
  );
  const [showVacancies, setShowVacancies] = useState(
    chart?.options?.showVacancies !== undefined ? chart.options.showVacancies : true
  );
  const [defaultLayout, setDefaultLayout] = useState<'vertical' | 'horizontal'>(
    chart?.options?.defaultLayout || 'vertical'
  );
  
  // Department selection
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    chart?.departmentIds || departments.map(dept => dept.id)
  );
  
  // Handle department selection change
  const handleDepartmentChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedDepartments(event.target.value as string[]);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      setNameError('Chart name is required');
      return;
    }
    
    if (selectedDepartments.length === 0) {
      alert('Please select at least one department');
      return;
    }
    
    // Prepare chart data
    const chartData = {
      name,
      description,
      organizationName: organizationName || 'Organization',
      organizationId: 'default', // This would be dynamic in a multi-tenant app
      departmentIds: selectedDepartments,
      options: {
        includeDepartments,
        includeRoles,
        showVacancies,
        defaultLayout
      }
    };
    
    onSubmit(chartData);
  };

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {chart ? 'Edit Organizational Chart' : 'Create New Organizational Chart'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Chart Name"
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
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              id="organizationName"
              label="Organization Name"
              type="text"
              fullWidth
              variant="outlined"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Organization"
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Chart Options
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={includeDepartments}
                    onChange={(e) => setIncludeDepartments(e.target.checked)}
                  />
                }
                label="Include Departments"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={includeRoles}
                    onChange={(e) => setIncludeRoles(e.target.checked)}
                  />
                }
                label="Include Roles"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showVacancies}
                    onChange={(e) => setShowVacancies(e.target.checked)}
                    disabled={!includeRoles}
                  />
                }
                label="Show Vacancies"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="layout-select-label">Default Layout</InputLabel>
                <Select
                  labelId="layout-select-label"
                  id="layout-select"
                  value={defaultLayout}
                  label="Default Layout"
                  onChange={(e) => setDefaultLayout(e.target.value as 'vertical' | 'horizontal')}
                >
                  <MenuItem value="vertical">Top to Bottom</MenuItem>
                  <MenuItem value="horizontal">Left to Right</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Departments to Include
          </Typography>
          
          <FormControl fullWidth>
            <InputLabel id="departments-select-label">Select Departments</InputLabel>
            <Select
              labelId="departments-select-label"
              id="departments-select"
              multiple
              value={selectedDepartments}
              label="Select Departments"
              onChange={handleDepartmentChange}
              renderValue={(selected) => {
                const selectedNames = (selected as string[]).map(id => {
                  const dept = departments.find(d => d.id === id);
                  return dept ? dept.name : '';
                }).filter(Boolean);
                
                return selectedNames.join(', ');
              }}
            >
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {chart ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChartForm;
