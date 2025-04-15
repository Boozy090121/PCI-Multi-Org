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

interface CalculatorFormProps {
  calculator?: any;
  onSubmit: (calculator: any) => void;
  onCancel: () => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ calculator, onSubmit, onCancel }) => {
  const { items: departments } = useSelector((state: RootState) => state.departments);
  
  // Basic information
  const [name, setName] = useState(calculator?.name || '');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState(calculator?.description || '');
  
  // Department allocation
  const [departmentAllocations, setDepartmentAllocations] = useState(
    calculator?.departmentAllocations || 
    departments.map(dept => ({ departmentId: dept.id, percentage: 0 }))
  );
  
  // Default inputs
  const [workOrdersPerDay, setWorkOrdersPerDay] = useState(calculator?.inputs?.workOrdersPerDay || 100);
  const [avgHandlingTime, setAvgHandlingTime] = useState(calculator?.inputs?.avgHandlingTime || 15);
  const [complaintVolume, setComplaintVolume] = useState(calculator?.inputs?.complaintVolume || 20);
  const [complexityFactor, setComplexityFactor] = useState(calculator?.inputs?.complexityFactor || 1.2);
  const [growthRate, setGrowthRate] = useState(calculator?.inputs?.growthRate || 5);
  const [efficiencyFactor, setEfficiencyFactor] = useState(calculator?.inputs?.efficiencyFactor || 0.9);
  const [absencePercentage, setAbsencePercentage] = useState(calculator?.inputs?.absencePercentage || 8);
  const [trainingTime, setTrainingTime] = useState(calculator?.inputs?.trainingTime || 10);
  const [regulatoryOverhead, setRegulatoryOverhead] = useState(calculator?.inputs?.regulatoryOverhead || 5);
  
  // Advanced options
  const [saveAsScenario, setSaveAsScenario] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  
  // Handle department allocation change
  const handleAllocationChange = (departmentId: string, value: number) => {
    setDepartmentAllocations(
      departmentAllocations.map(allocation => 
        allocation.departmentId === departmentId 
          ? { ...allocation, percentage: value } 
          : allocation
      )
    );
  };
  
  // Calculate total allocation percentage
  const totalAllocation = departmentAllocations.reduce(
    (sum, allocation) => sum + allocation.percentage, 
    0
  );
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      setNameError('Calculator name is required');
      return;
    }
    
    if (totalAllocation !== 100) {
      alert('Department allocations must total 100%');
      return;
    }
    
    // Prepare calculator data
    const calculatorData = {
      name,
      description,
      organizationId: 'default', // This would be dynamic in a multi-tenant app
      departmentAllocations,
      inputs: {
        workOrdersPerDay,
        avgHandlingTime,
        complaintVolume,
        complexityFactor,
        growthRate,
        efficiencyFactor,
        absencePercentage,
        trainingTime,
        regulatoryOverhead
      },
      saveAsScenario,
      scenarioName
    };
    
    onSubmit(calculatorData);
  };

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {calculator ? 'Edit Calculator' : 'Create New Calculator'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Calculator Name"
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
            />
          </Box>
          
          <Typography variant="h6" gutterBottom>
            Department Allocations
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Specify how headcount should be allocated across departments (total must equal 100%).
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {departmentAllocations.map((allocation) => {
              const department = departments.find(dept => dept.id === allocation.departmentId);
              if (!department) return null;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={allocation.departmentId}>
                  <TextField
                    label={department.name}
                    type="number"
                    InputProps={{
                      endAdornment: <Typography>%</Typography>,
                    }}
                    fullWidth
                    value={allocation.percentage}
                    onChange={(e) => handleAllocationChange(
                      allocation.departmentId, 
                      Math.max(0, Math.min(100, Number(e.target.value)))
                    )}
                    error={totalAllocation !== 100}
                  />
                </Grid>
              );
            })}
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Total Allocation:</Typography>
                <Typography 
                  color={totalAllocation === 100 ? 'success.main' : 'error.main'}
                  fontWeight="bold"
                >
                  {totalAllocation}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Default Calculator Inputs
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Set default values for calculator inputs. These can be adjusted when running calculations.
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Work Orders Per Day"
                type="number"
                fullWidth
                value={workOrdersPerDay}
                onChange={(e) => setWorkOrdersPerDay(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Avg. Handling Time (min)"
                type="number"
                fullWidth
                value={avgHandlingTime}
                onChange={(e) => setAvgHandlingTime(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Complaint Volume (per day)"
                type="number"
                fullWidth
                value={complaintVolume}
                onChange={(e) => setComplaintVolume(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Complexity Factor"
                type="number"
                fullWidth
                inputProps={{ step: 0.1 }}
                value={complexityFactor}
                onChange={(e) => setComplexityFactor(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Growth Rate (%)"
                type="number"
                fullWidth
                value={growthRate}
                onChange={(e) => setGrowthRate(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Efficiency Factor"
                type="number"
                fullWidth
                inputProps={{ step: 0.1 }}
                value={efficiencyFactor}
                onChange={(e) => setEfficiencyFactor(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Absence Percentage (%)"
                type="number"
                fullWidth
                value={absencePercentage}
                onChange={(e) => setAbsencePercentage(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Training Time (days/year)"
                type="number"
                fullWidth
                value={trainingTime}
                onChange={(e) => setTrainingTime(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Regulatory Overhead (%)"
                type="number"
                fullWidth
                value={regulatoryOverhead}
                onChange={(e) => setRegulatoryOverhead(Number(e.target.value))}
              />
            </Grid>
          </Grid>
          
          {calculator && (
            <>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Scenario Options
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={saveAsScenario}
                    onChange={(e) => setSaveAsScenario(e.target.checked)}
                  />
                }
                label="Save current inputs as a new scenario"
              />
              
              {saveAsScenario && (
                <TextField
                  margin="dense"
                  id="scenarioName"
                  label="Scenario Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  sx={{ mt: 2 }}
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {calculator ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CalculatorForm;
